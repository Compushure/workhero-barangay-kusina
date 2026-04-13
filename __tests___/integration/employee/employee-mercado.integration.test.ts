/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Fetch remote employee Mercado rewards with approved redemption counts
 * - Fetch the current employee redemption requests with status filtering
 * - Create and cancel a remote employee redemption request with point updates
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/employee/employee-mercado.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	cancelMyRedemptionRequestAction,
	createRedemptionRequestAction,
	getMyRedemptionRequestsAction,
	getRewardsAction,
} from '@/actions/employee/redemptions';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';
import {
	employeeMercadoCancelRequestSeed,
	employeeMercadoCreateRequestSeed,
	employeeMercadoIntegrationNames,
	employeeMercadoRewardSeed,
} from '../../mockData/employeeMercadoMockData';

const remoteContext = new RemoteSupabaseTestContext('employee-mercado');

let currentServerClient: typeof remoteContext.admin = remoteContext.admin;

const createdRewardIds: string[] = [];
const createdRequestIds: string[] = [];

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(async () => currentServerClient),
}));

async function seedReward(options: {
	createdBy: string;
	namePrefix: string;
	pointsCost: number;
	quantity: number;
	isActive: boolean;
}) {
	const { data, error } = await remoteContext.admin
		.from('Reward')
		.insert({
			name: `${options.namePrefix} ${Date.now()}`,
			points_cost: options.pointsCost,
			quantity: options.quantity,
			is_active: options.isActive,
			created_by: options.createdBy,
		})
		.select('id, name, points_cost, quantity, is_active')
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
	status: 'pending' | 'approved' | 'rejected';
	remarks?: string | null;
}) {
	const { data, error } = await remoteContext.admin
		.from('RewardRequest')
		.insert({
			user_id: options.userId,
			reward_id: options.rewardId,
			quantity: options.quantity,
			status: options.status,
			remarks: options.remarks ?? null,
			requested_at: new Date().toISOString(),
		})
		.select('id, user_id, reward_id, quantity, status')
		.single();

	if (error || !data) {
		throw new Error(`Failed to seed reward request: ${error?.message || 'Unknown error'}`);
	}

	createdRequestIds.push(data.id);
	return data;
}

beforeEach(() => {
	currentServerClient = remoteContext.admin;
});

afterEach(async () => {
	if (createdRequestIds.length) {
		await remoteContext.admin.from('RewardRequest').delete().in('id', [...createdRequestIds]);
		createdRequestIds.length = 0;
	}

	if (createdRewardIds.length) {
		await remoteContext.admin.from('Reward').delete().in('id', [...createdRewardIds]);
		createdRewardIds.length = 0;
	}

	await remoteContext.cleanup();
});

describe('When an employee loads Mercado rewards', () => {
	test('Then getRewardsAction returns the seeded reward with approved redeemed count', async () => {
		const hr = await remoteContext.seedUser({
			roleType: 'hr',
			namePrefix: employeeMercadoIntegrationNames.hrCreator.namePrefix,
			emailPrefix: employeeMercadoIntegrationNames.hrCreator.emailPrefix,
		});
		const employee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: employeeMercadoIntegrationNames.employee.namePrefix,
			emailPrefix: employeeMercadoIntegrationNames.employee.emailPrefix,
			points: 100,
			xp: 5,
			totalPointsEarned: 100,
		});

		const reward = await seedReward({
			createdBy: hr.id,
			namePrefix: employeeMercadoRewardSeed.namePrefix,
			pointsCost: employeeMercadoRewardSeed.pointsCost,
			quantity: employeeMercadoRewardSeed.quantity,
			isActive: employeeMercadoRewardSeed.isActive,
		});
		await remoteContext.uploadStorageObject('reward', `${reward.id}/profile.png`);

		await seedRewardRequest({
			userId: employee.id,
			rewardId: reward.id,
			quantity: employeeMercadoCreateRequestSeed.quantity,
			status: 'approved',
		});

		currentServerClient = remoteContext.createServerClientForUser(employee);

		const result = await getRewardsAction();
		const seededReward = result.data?.find((entry) => entry.id === reward.id);

		expect(result.error).toBeNull();
		expect(seededReward?.name).toBe(reward.name);
		expect(seededReward?.redeemedCount).toBe(employeeMercadoCreateRequestSeed.quantity);
		expect(seededReward?.imageUrl).toContain(`${reward.id}/profile.png`);
	});
});

describe('When an employee loads own Mercado redemption requests', () => {
	test('Then getMyRedemptionRequestsAction returns only the current employee pending requests', async () => {
		const hr = await remoteContext.seedUser({
			roleType: 'hr',
			namePrefix: `${employeeMercadoIntegrationNames.hrCreator.namePrefix} Requests`,
			emailPrefix: `${employeeMercadoIntegrationNames.hrCreator.emailPrefix}.requests`,
		});
		const employee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: `${employeeMercadoIntegrationNames.employee.namePrefix} Requests`,
			emailPrefix: `${employeeMercadoIntegrationNames.employee.emailPrefix}.requests`,
			points: 90,
			xp: 3,
			totalPointsEarned: 90,
		});
		const otherEmployee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: employeeMercadoIntegrationNames.otherEmployee.namePrefix,
			emailPrefix: employeeMercadoIntegrationNames.otherEmployee.emailPrefix,
			points: 75,
			xp: 2,
			totalPointsEarned: 75,
		});

		const reward = await seedReward({
			createdBy: hr.id,
			namePrefix: `${employeeMercadoRewardSeed.namePrefix} Requests`,
			pointsCost: employeeMercadoRewardSeed.pointsCost,
			quantity: employeeMercadoRewardSeed.quantity,
			isActive: employeeMercadoRewardSeed.isActive,
		});

		const employeeRequest = await seedRewardRequest({
			userId: employee.id,
			rewardId: reward.id,
			quantity: employeeMercadoCreateRequestSeed.quantity,
			status: 'pending',
			remarks: employeeMercadoCreateRequestSeed.remarks,
		});
		await seedRewardRequest({
			userId: otherEmployee.id,
			rewardId: reward.id,
			quantity: 1,
			status: 'pending',
			remarks: 'Other user pending request',
		});

		currentServerClient = remoteContext.createServerClientForUser(employee);

		const result = await getMyRedemptionRequestsAction('pending');

		expect(result.error).toBeNull();
		expect(result.data?.some((entry) => entry.id === employeeRequest.id)).toBe(true);
		expect(result.data?.every((entry) => entry.userId === employee.id)).toBe(true);
		expect(result.data?.every((entry) => entry.status === 'pending')).toBe(true);
	});
});

describe('When an employee creates and cancels Mercado redemption requests', () => {
	test('Then createRedemptionRequestAction deducts points and cancelMyRedemptionRequestAction restores them', async () => {
		const hr = await remoteContext.seedUser({
			roleType: 'hr',
			namePrefix: `${employeeMercadoIntegrationNames.hrCreator.namePrefix} Lifecycle`,
			emailPrefix: `${employeeMercadoIntegrationNames.hrCreator.emailPrefix}.lifecycle`,
		});
		const employee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: `${employeeMercadoIntegrationNames.employee.namePrefix} Lifecycle`,
			emailPrefix: `${employeeMercadoIntegrationNames.employee.emailPrefix}.lifecycle`,
			points: 120,
			xp: 6,
			totalPointsEarned: 120,
		});

		const reward = await seedReward({
			createdBy: hr.id,
			namePrefix: `${employeeMercadoRewardSeed.namePrefix} Lifecycle`,
			pointsCost: employeeMercadoRewardSeed.pointsCost,
			quantity: employeeMercadoRewardSeed.quantity,
			isActive: employeeMercadoRewardSeed.isActive,
		});

		currentServerClient = remoteContext.createServerClientForUser(employee);

		const createResult = await createRedemptionRequestAction(
			reward.id,
			employeeMercadoCancelRequestSeed.quantity
		);

		const { data: pendingRequest, error: pendingRequestError } = await remoteContext.admin
			.from('RewardRequest')
			.select('id, status, user_id, reward_id, quantity')
			.eq('user_id', employee.id)
			.eq('reward_id', reward.id)
			.eq('status', 'pending')
			.single();
		if (pendingRequest?.id) {
			createdRequestIds.push(pendingRequest.id);
		}

		const { data: employeeAfterCreate, error: employeeAfterCreateError } = await remoteContext.admin
			.from('User')
			.select('points')
			.eq('id', employee.id)
			.single();

		expect(createResult.error).toBeNull();
		expect(pendingRequestError).toBeNull();
		expect(employeeAfterCreateError).toBeNull();
		expect(employeeAfterCreate?.points).toBe(
			120 - employeeMercadoRewardSeed.pointsCost * employeeMercadoCancelRequestSeed.quantity
		);

		const cancelResult = await cancelMyRedemptionRequestAction(pendingRequest!.id);

		const { data: requestAfterCancel, error: requestAfterCancelError } = await remoteContext.admin
			.from('RewardRequest')
			.select('status, remarks')
			.eq('id', pendingRequest!.id)
			.single();
		const { data: employeeAfterCancel, error: employeeAfterCancelError } = await remoteContext.admin
			.from('User')
			.select('points')
			.eq('id', employee.id)
			.single();

		expect(cancelResult.error).toBeNull();
		expect(requestAfterCancelError).toBeNull();
		expect(employeeAfterCancelError).toBeNull();
		expect(requestAfterCancel?.status).toBe('rejected');
		expect(requestAfterCancel?.remarks).toBe(employeeMercadoCancelRequestSeed.cancelRemarks);
		expect(employeeAfterCancel?.points).toBe(120);
	});
});