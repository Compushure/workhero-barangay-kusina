/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Load remote reward requests for HR with joined user and reward details
 * - Approve a pending reward request and validate status, stock, and notification effects
 * - Decline a pending reward request and validate status, point refund, stock restore, and notification effects
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/hr/reward-requests.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	handleAcceptRedemptionRequestAction,
	handleDeclineRedemptionRequestAction,
	handleGetRedemptionRequestsAction,
} from '@/action-handlers/hr/redemptions';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';

let currentServerClient: any;

const toastSuccess = jest.fn();
const toastError = jest.fn();
const remoteContext = new RemoteSupabaseTestContext('hr-reward-requests');

const trackedRewardIds = new Set<string>();
const trackedRewardRequestIds = new Set<string>();

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('sonner', () => ({
	toast: {
		success: (...args: unknown[]) => toastSuccess(...args),
		error: (...args: unknown[]) => toastError(...args),
	},
}));

async function seedReward(options: {
	namePrefix: string;
	pointsCost: number;
	quantity: number | null;
	isActive?: boolean;
	createdBy?: string | null;
}) {
	const { data, error } = await remoteContext.admin
		.from('Reward')
		.insert({
			name: `${options.namePrefix} ${Date.now()}`,
			points_cost: options.pointsCost,
			quantity: options.quantity,
			is_active: options.isActive ?? true,
			created_by: options.createdBy ?? null,
		})
		.select('id, name, points_cost, quantity, is_active')
		.single();

	if (error || !data) {
		throw new Error(`Failed to seed reward: ${error?.message || 'Unknown error'}`);
	}

	trackedRewardIds.add(data.id);
	return data;
}

async function seedRewardRequest(options: {
	userId: string;
	rewardId: string;
	quantity: number;
	status?: 'pending' | 'approved' | 'rejected';
}) {
	const { data, error } = await remoteContext.admin
		.from('RewardRequest')
		.insert({
			user_id: options.userId,
			reward_id: options.rewardId,
			quantity: options.quantity,
			status: options.status ?? 'pending',
			requested_at: new Date().toISOString(),
		})
		.select('id, user_id, reward_id, quantity, status')
		.single();

	if (error || !data) {
		throw new Error(`Failed to seed reward request: ${error?.message || 'Unknown error'}`);
	}

	trackedRewardRequestIds.add(data.id);
	return data;
}

beforeEach(() => {
	// Reset toast assertions before each HR reward-request scenario.
	toastSuccess.mockReset();
	toastError.mockReset();
});

afterEach(async () => {
	if (trackedRewardRequestIds.size) {
		await remoteContext.admin.from('RewardRequest').delete().in('id', [...trackedRewardRequestIds]);
		trackedRewardRequestIds.clear();
	}

	if (trackedRewardIds.size) {
		await remoteContext.admin.from('Reward').delete().in('id', [...trackedRewardIds]);
		trackedRewardIds.clear();
	}

	// Remove seeded users and related rows created through the remote context.
	await remoteContext.cleanup();
});

describe('When HR loads remote reward requests', () => {
	test('Then the reward-request handler returns the seeded pending request with user and reward details', async () => {
		const hr = await remoteContext.seedUser({
			roleType: 'hr',
			namePrefix: 'HR Reward Request Viewer',
			emailPrefix: 'hr.reward.viewer',
		});
		const employee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: 'Reward Request Employee',
			emailPrefix: 'reward.request.employee',
			points: 120,
			xp: 5,
			totalPointsEarned: 120,
		});
		const reward = await seedReward({
			namePrefix: 'Coffee Voucher',
			pointsCost: 30,
			quantity: 10,
			createdBy: hr.id,
		});
		const request = await seedRewardRequest({
			userId: employee.id,
			rewardId: reward.id,
			quantity: 2,
			status: 'pending',
		});

		currentServerClient = remoteContext.createServerClientForUser(hr);

		const pendingRequests = await handleGetRedemptionRequestsAction('pending');
		const fetched = pendingRequests.find((entry) => entry.id === request.id);

		expect(fetched).toBeTruthy();
		expect(fetched?.status).toBe('pending');
		expect(fetched?.quantity).toBe(2);
		expect(fetched?.userId).toBe(employee.id);
		expect(fetched?.userName).toBe(employee.name);
		expect(fetched?.rewardId).toBe(reward.id);
		expect(fetched?.rewardName).toBe(reward.name);
		expect(fetched?.pointsCost).toBe(30);
	});
});

describe('When HR accepts a pending reward request', () => {
	test('Then the request is approved, stock is deducted, and the employee receives a notification', async () => {
		const hr = await remoteContext.seedUser({
			roleType: 'hr',
			namePrefix: 'HR Reward Approver',
			emailPrefix: 'hr.reward.approver',
		});
		const employee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: 'Approve Reward Employee',
			emailPrefix: 'approve.reward.employee',
			points: 80,
			xp: 4,
			totalPointsEarned: 80,
		});
		const reward = await seedReward({
			namePrefix: 'Rice Pack',
			pointsCost: 20,
			quantity: 5,
			createdBy: hr.id,
		});
		const request = await seedRewardRequest({
			userId: employee.id,
			rewardId: reward.id,
			quantity: 2,
			status: 'pending',
		});

		currentServerClient = remoteContext.createServerClientForUser(hr);

		const result = await handleAcceptRedemptionRequestAction({
			id: request.id,
			remarks: 'Claim at HR office after lunch',
		});

		const { data: requestAfterAccept, error: requestReloadError } = await remoteContext.admin
			.from('RewardRequest')
			.select('status, approved_by, remarks')
			.eq('id', request.id)
			.single();
		const { data: rewardAfterAccept, error: rewardReloadError } = await remoteContext.admin
			.from('Reward')
			.select('quantity, is_active')
			.eq('id', reward.id)
			.single();
		const { data: notificationRows, error: notificationError } = await remoteContext.admin
			.from('Notification')
			.select('id, message, metadata')
			.eq('user_id', employee.id)
			.eq('type', 'reward');

		expect(result.error).toBeNull();
		expect(requestReloadError).toBeNull();
		expect(rewardReloadError).toBeNull();
		expect(notificationError).toBeNull();
		expect(requestAfterAccept?.status).toBe('approved');
		expect(requestAfterAccept?.approved_by).toBe(hr.id);
		expect(requestAfterAccept?.remarks).toBe('Claim at HR office after lunch');
		expect(rewardAfterAccept?.quantity).toBe(3);
		expect(rewardAfterAccept?.is_active).toBe(true);
		expect(notificationRows?.some((row) => row.message.includes('approved'))).toBe(true);
		expect(toastSuccess).toHaveBeenCalledWith('Redemption request accepted with remarks.');
	});
});

describe('When HR declines a pending reward request', () => {
	test('Then the request is rejected, points are refunded, stock is restored, and the employee receives a notification', async () => {
		const hr = await remoteContext.seedUser({
			roleType: 'hr',
			namePrefix: 'HR Reward Decliner',
			emailPrefix: 'hr.reward.decliner',
		});
		const employee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: 'Decline Reward Employee',
			emailPrefix: 'decline.reward.employee',
			points: 50,
			xp: 3,
			totalPointsEarned: 50,
		});
		const reward = await seedReward({
			namePrefix: 'Cooking Oil',
			pointsCost: 10,
			quantity: 2,
			isActive: false,
			createdBy: hr.id,
		});
		const request = await seedRewardRequest({
			userId: employee.id,
			rewardId: reward.id,
			quantity: 2,
			status: 'pending',
		});

		currentServerClient = remoteContext.createServerClientForUser(hr);

		const result = await handleDeclineRedemptionRequestAction({
			id: request.id,
			remarks: 'Please submit a new request next cycle',
		});

		const { data: requestAfterDecline, error: requestReloadError } = await remoteContext.admin
			.from('RewardRequest')
			.select('status, approved_by, remarks')
			.eq('id', request.id)
			.single();
		const { data: employeeAfterDecline, error: employeeReloadError } = await remoteContext.admin
			.from('User')
			.select('points')
			.eq('id', employee.id)
			.single();
		const { data: rewardAfterDecline, error: rewardReloadError } = await remoteContext.admin
			.from('Reward')
			.select('quantity, is_active')
			.eq('id', reward.id)
			.single();
		const { data: notificationRows, error: notificationError } = await remoteContext.admin
			.from('Notification')
			.select('id, message')
			.eq('user_id', employee.id)
			.eq('type', 'reward');

		expect(result.error).toBeNull();
		expect(requestReloadError).toBeNull();
		expect(employeeReloadError).toBeNull();
		expect(rewardReloadError).toBeNull();
		expect(notificationError).toBeNull();
		expect(requestAfterDecline?.status).toBe('rejected');
		expect(requestAfterDecline?.approved_by).toBe(hr.id);
		expect(requestAfterDecline?.remarks).toBe('Please submit a new request next cycle');
		expect(employeeAfterDecline?.points).toBe(70);
		expect(rewardAfterDecline?.quantity).toBe(4);
		expect(rewardAfterDecline?.is_active).toBe(true);
		expect(notificationRows?.some((row) => row.message.includes('rejected'))).toBe(true);
		expect(toastSuccess).toHaveBeenCalledWith('Redemption request declined with remarks.');
	});
});
