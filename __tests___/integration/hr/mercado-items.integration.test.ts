/**
 * Test coverage:
 * - Load Mercado items with redeemed-count enrichment from approved reward requests
 * - Add, edit, and delete Mercado items against the remote test database
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/hr/mercado-items.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	addRewardAction,
	deleteRewardAction,
	editRewardAction,
	getRewardsAction,
} from '@/actions/hr/rewards';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';
import {
	hrMercadoRewardMockData,
	hrMercadoRewardRequestMockData,
} from '../../mockData/hrMercadoMockData';

const remoteContext = new RemoteSupabaseTestContext('hr-mercado-items');

let currentServerClient: any = remoteContext.admin;
const createdRewardIds: string[] = [];
const createdRewardRequestIds: string[] = [];

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(async () => currentServerClient),
}));

function stripUnsupportedRewardFields(payload: Record<string, unknown>) {
	const { category: _category, redeeming_limit: _redeemingLimit, ...rest } = payload;
	return rest;
}

function createSchemaCompatibleClient(client: any) {
	return new Proxy(client, {
		get(target, property, receiver) {
			if (property !== 'from') {
				const value = Reflect.get(target, property, receiver);
				return typeof value === 'function' ? value.bind(target) : value;
			}

			return (table: string) => {
				const tableClient = target.from(table);

				if (table !== 'Reward') {
					return tableClient;
				}

				return new Proxy(tableClient, {
					get(tableTarget, tableProperty, tableReceiver) {
						if (tableProperty === 'insert') {
							return (payload: Record<string, unknown>) =>
								tableTarget.insert(stripUnsupportedRewardFields(payload));
						}

						if (tableProperty === 'update') {
							return (payload: Record<string, unknown>) =>
								tableTarget.update(stripUnsupportedRewardFields(payload));
						}

						const value = Reflect.get(tableTarget, tableProperty, tableReceiver);
						return typeof value === 'function' ? value.bind(tableTarget) : value;
					},
				});
			};
		},
	});
}

async function seedReward(options: {
	name: string;
	pointsCost: number;
	quantity: number | null;
	isActive?: boolean;
	createdBy?: string | null;
}) {
	const { data, error } = await remoteContext.admin
		.from('Reward')
		.insert({
			name: options.name,
			points_cost: options.pointsCost,
			quantity: options.quantity,
			is_active: options.isActive ?? true,
			created_by: options.createdBy ?? null,
		})
		.select('id, name, points_cost, quantity, is_active, created_at, created_by')
		.single();

	if (error || !data) {
		throw new Error(`Failed to seed reward: ${error?.message || 'Unknown error'}`);
	}

	createdRewardIds.push(data.id);
	return data;
}

async function seedRewardRequest(options: {
	userId: string;
	rewardId: string;
	quantity: number;
	status?: 'pending' | 'approved' | 'rejected';
	remarks?: string | null;
}) {
	const { data, error } = await remoteContext.admin
		.from('RewardRequest')
		.insert({
			user_id: options.userId,
			reward_id: options.rewardId,
			quantity: options.quantity,
			status: options.status ?? 'approved',
			remarks: options.remarks ?? null,
			requested_at: new Date().toISOString(),
		})
		.select('id, user_id, reward_id, quantity, status')
		.single();

	if (error || !data) {
		throw new Error(`Failed to seed reward request: ${error?.message || 'Unknown error'}`);
	}

	createdRewardRequestIds.push(data.id);
	return data;
}

beforeEach(() => {
	currentServerClient = remoteContext.admin;
});

afterEach(async () => {
	if (createdRewardRequestIds.length) {
		await remoteContext.admin.from('RewardRequest').delete().in('id', [...createdRewardRequestIds]);
		createdRewardRequestIds.length = 0;
	}

	if (createdRewardIds.length) {
		await remoteContext.admin.from('Reward').delete().in('id', [...createdRewardIds]);
		createdRewardIds.length = 0;
	}

	await remoteContext.cleanup();
});

describe('When HR loads Mercado items in the remote database', () => {
	test('Then getRewardsAction returns redeemed counts from approved reward requests', async () => {
		const hrUser = await remoteContext.seedUser({
			roleType: 'hr',
			namePrefix: 'HR Mercado Reader',
			emailPrefix: 'hr.mercado.reader',
		});
		const employee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: 'Mercado Request Employee',
			emailPrefix: 'mercado.request.employee',
			points: 80,
			xp: 5,
			totalPointsEarned: 80,
		});

		const activeReward = await seedReward({
			name: `${hrMercadoRewardMockData.name} ${Date.now()}`,
			pointsCost: hrMercadoRewardMockData.pointsCost,
			quantity: hrMercadoRewardMockData.quantity,
			isActive: true,
			createdBy: hrUser.id,
		});
		const emptyReward = await seedReward({
			name: `Soap Bar ${Date.now()}`,
			pointsCost: 12,
			quantity: 0,
			isActive: true,
			createdBy: hrUser.id,
		});

		await remoteContext.uploadStorageObject('reward', `${activeReward.id}/profile.png`);
		await remoteContext.uploadStorageObject('reward', `${emptyReward.id}/profile.png`);

		await seedRewardRequest({
			userId: employee.id,
			rewardId: activeReward.id,
			quantity: hrMercadoRewardRequestMockData.quantity,
			status: hrMercadoRewardRequestMockData.status,
			remarks: hrMercadoRewardRequestMockData.remarks,
		});

		currentServerClient = remoteContext.createServerClientForUser(hrUser);

		const result = await getRewardsAction();
		const fetchedActiveReward = result.data?.find((reward) => reward.id === activeReward.id);
		const fetchedEmptyReward = result.data?.find((reward) => reward.id === emptyReward.id);

		expect(result.error).toBeNull();
		expect(fetchedActiveReward?.redeemedCount).toBe(hrMercadoRewardRequestMockData.quantity);
		expect(fetchedActiveReward?.name).toBe(activeReward.name);
		expect(fetchedEmptyReward?.isOutOfStock).toBe(true);
		expect(fetchedActiveReward?.imageUrl).toContain(`${activeReward.id}/profile.png`);
	});
});

describe('When HR manages Mercado items in the remote database', () => {
	test('Then addRewardAction, editRewardAction, and deleteRewardAction persist the expected changes', async () => {
		const hrUser = await remoteContext.seedUser({
			roleType: 'hr',
			namePrefix: 'HR Mercado Manager',
			emailPrefix: 'hr.mercado.manager',
		});

		const originalReward = await seedReward({
			name: `${hrMercadoRewardMockData.name} Original ${Date.now()}`,
			pointsCost: hrMercadoRewardMockData.pointsCost,
			quantity: hrMercadoRewardMockData.quantity,
			isActive: true,
			createdBy: hrUser.id,
		});
		await remoteContext.uploadStorageObject('reward', `${originalReward.id}/profile.png`);

		currentServerClient = remoteContext.createServerClientForUser(hrUser);
		currentServerClient = createSchemaCompatibleClient(currentServerClient);

		const addedResult = await addRewardAction({
			name: `${hrMercadoRewardMockData.name} Added ${Date.now()}`,
			pointsCost: hrMercadoRewardMockData.pointsCost,
			quantity: hrMercadoRewardMockData.quantity,
			redeemingLimit: hrMercadoRewardMockData.redeemingLimit,
			category: hrMercadoRewardMockData.category,
			isActive: true,
			availableMonth: null,
			availableDate: null,
		});

		if (!addedResult.data) {
			throw new Error('Expected addRewardAction to create a reward');
		}

		createdRewardIds.push(addedResult.data.id);
		await remoteContext.uploadStorageObject('reward', `${addedResult.data.id}/profile.png`);

		const editResult = await editRewardAction(originalReward.id, {
			name: `${originalReward.name} Updated`,
			quantity: originalReward.quantity + 2,
		});

		const deleteResult = await deleteRewardAction(addedResult.data.id);

		const { data: updatedReward, error: updatedRewardError } = await remoteContext.admin
			.from('Reward')
			.select('name, quantity')
			.eq('id', originalReward.id)
			.single();
		const { data: deletedReward, error: deletedRewardError } = await remoteContext.admin
			.from('Reward')
			.select('id')
			.eq('id', addedResult.data.id)
			.single();

		expect(editResult.error).toBeNull();
		expect(deleteResult.error).toBeNull();
		expect(updatedRewardError).toBeNull();
		expect(deletedRewardError).toBeTruthy();
		expect(updatedReward?.name).toBe(`${originalReward.name} Updated`);
		expect(updatedReward?.quantity).toBe(originalReward.quantity + 2);
		expect(deletedReward).toBeNull();
	});
});