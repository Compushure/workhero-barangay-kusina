/**
 * Test coverage:
 * - Fetch reward requests with status filtering
 * - Approve a pending reward request
 * - Decline a pending reward request
 * - Verify matching action handlers for HR reward request workflows
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/hr/rewards-requests.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	acceptRedemptionRequestAction,
	declineRedemptionRequestAction,
	getRedemptionRequestsAction,
} from '@/actions/hr/redemptions';
import {
	handleAcceptRedemptionRequestAction,
	handleDeclineRedemptionRequestAction,
	handleGetRedemptionRequestsAction,
} from '@/action-handlers/hr/redemptions';

type CreateClientFn = () => Promise<unknown>;
type InsertNotificationFn = typeof import('@/lib/notifications').insertNotification;
type ToastFn = (message?: unknown) => unknown;

type UserRow = {
	id: string;
	name: string;
	points: number;
};

type RewardRow = {
	id: string;
	name: string;
	points_cost: number;
	quantity: number | null;
	is_active: boolean;
};

type RewardRequestRow = {
	id: string;
	user_id: string;
	reward_id: string;
	quantity: number;
	status: 'pending' | 'approved' | 'rejected';
	approved_by: string | null;
	remarks: string | null;
	requested_at: string;
};

let serverState: {
	adminId: string;
	users: UserRow[];
	rewards: RewardRow[];
	requests: RewardRequestRow[];
	failList?: boolean;
};

let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(),
}));

jest.mock('@/lib/notifications', () => ({
	insertNotification: jest.fn(async () => undefined),
}));

jest.mock('@/lib/utils/safe-action', () => ({
	safeAction: jest.fn(async (fn: () => Promise<unknown>) => {
		try {
			const data = await fn();
			return { success: true, data, error: null };
		} catch (error) {
			return {
				success: false,
				data: null,
				error: error instanceof Error ? error.message : 'Unexpected error',
			};
		}
	}),
}));

jest.mock('sonner', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));

jest.mock('@/lib/supabase/admin', () => ({
	get supabaseAdmin() {
		return {
			from: jest.fn((table: string) => {
				if (table === 'RewardRequest') {
					return {
						select: jest.fn(() => ({
							eq: (_field: string, id: string) => ({
								eq: (_nextField: string, value: string) => ({
									order: async () => ({
										data: serverState.requests
											.filter((row) => row.reward_id === id)
											.filter((row) => row.status === value)
											.map((row) => ({
												...row,
												Reward: {
													points_cost:
														serverState.rewards.find((reward) => reward.id === row.reward_id)
															?.points_cost || 0,
												},
												User: {
													points:
														serverState.users.find((user) => user.id === row.user_id)?.points || 0,
												},
											})),
										error: null,
									}),
								}),
								single: async () => {
									const row = serverState.requests.find((request) => request.id === id);

									if (!row) {
										return { data: null, error: { message: 'Request not found' } };
									}

									const reward = serverState.rewards.find((entry) => entry.id === row.reward_id);
									const user = serverState.users.find((entry) => entry.id === row.user_id);

									return {
										data: {
											...row,
											Reward: {
												points_cost: reward?.points_cost || 0,
												name: reward?.name || 'Unknown Reward',
											},
											User: {
												points: user?.points || 0,
											},
										},
										error: null,
									};
								},
							}),
						})),
						update: (payload: Partial<RewardRequestRow>) => ({
							eq: async (_field: string, requestId: string) => {
								const index = serverState.requests.findIndex((row) => row.id === requestId);
								if (index === -1) {
									return { error: { message: 'Request not found' } };
								}
								serverState.requests[index] = {
									...serverState.requests[index],
									...payload,
								};
								return { error: null };
							},
						}),
					};
				}

				if (table === 'Reward') {
					return {
						select: jest.fn(() => ({
							eq: (_field: string, rewardId: string) => ({
								single: async () => {
									const reward = serverState.rewards.find((row) => row.id === rewardId);
									return reward
										? {
												data: { quantity: reward.quantity, is_active: reward.is_active },
												error: null,
											}
										: { data: null, error: { message: 'Reward not found' } };
								},
							}),
						})),
						update: (payload: Partial<RewardRow>) => ({
							eq: async (_field: string, rewardId: string) => {
								const index = serverState.rewards.findIndex((row) => row.id === rewardId);
								if (index === -1) {
									return { error: { message: 'Reward not found' } };
								}
								serverState.rewards[index] = {
									...serverState.rewards[index],
									...payload,
								};
								return { error: null };
							},
						}),
					};
				}

				if (table === 'User') {
					return {
						select: jest.fn(() => ({
							eq: (_field: string, userId: string) => ({
								single: async () => {
									const user = serverState.users.find((row) => row.id === userId);
									return user
										? { data: { points: user.points }, error: null }
										: { data: null, error: { message: 'User not found' } };
								},
							}),
						})),
						update: (payload: Partial<UserRow>) => ({
							eq: async (_field: string, userId: string) => {
								const index = serverState.users.findIndex((row) => row.id === userId);
								if (index === -1) {
									return { error: { message: 'User not found' } };
								}
								serverState.users[index] = {
									...serverState.users[index],
									...payload,
								};
								return { error: null };
							},
						}),
					};
				}

				throw new Error(`Unexpected admin table ${table}`);
			}),
		};
	},
}));

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
	createClient: jest.MockedFunction<CreateClientFn>;
};
const createClientMock = createClient;

const { insertNotification } = jest.requireMock('@/lib/notifications') as {
	insertNotification: jest.MockedFunction<InsertNotificationFn>;
};
const insertNotificationMock = insertNotification;

const { toast } = jest.requireMock('sonner') as {
	toast: {
		success: jest.MockedFunction<ToastFn>;
		error: jest.MockedFunction<ToastFn>;
	};
};
const toastSuccess = toast.success;
const toastError = toast.error;

beforeEach(() => {
	consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
	toastSuccess.mockReset();
	toastError.mockReset();
	insertNotificationMock.mockClear();

	serverState = {
		adminId: 'hr-1',
		users: [
			{ id: 'hr-1', name: 'HR Admin', points: 0 },
			{ id: 'employee-1', name: 'Employee One', points: 40 },
		],
		rewards: [
			{
				id: 'reward-1',
				name: 'Rice Pack',
				points_cost: 10,
				quantity: 5,
				is_active: true,
			},
		],
		requests: [
			{
				id: 'request-1',
				user_id: 'employee-1',
				reward_id: 'reward-1',
				quantity: 2,
				status: 'pending',
				approved_by: null,
				remarks: null,
				requested_at: '2026-04-09T08:00:00.000Z',
			},
			{
				id: 'request-2',
				user_id: 'employee-1',
				reward_id: 'reward-1',
				quantity: 1,
				status: 'rejected',
				approved_by: 'hr-1',
				remarks: 'Cancelled by employee',
				requested_at: '2026-04-08T08:00:00.000Z',
			},
		],
	};

	createClientMock.mockResolvedValue({
		auth: {
			getUser: jest.fn(async () => ({
				data: {
					user: {
						id: serverState.adminId,
						email: 'hr.admin@example.com',
						app_metadata: { user_role: 'hr' },
					},
				},
				error: null,
			})),
		},
		storage: {
			from: jest.fn(() => ({
				getPublicUrl: (path: string) => ({
					data: { publicUrl: `https://cdn.example.com/${path}` },
				}),
			})),
		},
		from: jest.fn((table: string) => {
			if (table !== 'RewardRequest') {
				throw new Error(`Unexpected server table ${table}`);
			}

			return {
				select: jest.fn(() => {
					const filterState: { status?: string; excludedRemarks: string[] } = {
						excludedRemarks: [],
					};

					const query = {
						order: (_field: string, _order: { ascending: boolean }) => query,
						eq: (field: string, value: string) => {
							if (field === 'status') {
								filterState.status = value;
							}
							return query;
						},
						not: (_field: string, _operator: string, value: string) => {
							const matches = [...value.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
							filterState.excludedRemarks = matches;
							return query;
						},
						get data() {
							if (serverState.failList) {
								return null;
							}

							return serverState.requests
								.filter((row) => (filterState.status ? row.status === filterState.status : true))
								.filter((row) => !filterState.excludedRemarks.includes(row.remarks || ''))
								.map((row) => ({
									id: row.id,
									user_id: row.user_id,
									reward_id: row.reward_id,
									quantity: row.quantity,
									status: row.status,
									approved_by: row.approved_by,
									remarks: row.remarks,
									requested_at: row.requested_at,
									User: {
										name: serverState.users.find((user) => user.id === row.user_id)?.name || 'Unknown User',
										points: serverState.users.find((user) => user.id === row.user_id)?.points || 0,
									},
									Reward: {
										name:
											serverState.rewards.find((reward) => reward.id === row.reward_id)?.name ||
											'Unknown Reward',
										points_cost:
											serverState.rewards.find((reward) => reward.id === row.reward_id)?.points_cost ||
											0,
									},
								}));
						},
						get error() {
							return serverState.failList ? { message: 'list failed' } : null;
						},
					};

					return query;
				}),
				update: (payload: Partial<RewardRequestRow>) => ({
					eq: async (_field: string, requestId: string) => {
						const index = serverState.requests.findIndex((row) => row.id === requestId);
						if (index === -1) {
							return { error: { message: 'Request not found' } };
						}
						serverState.requests[index] = {
							...serverState.requests[index],
							...payload,
						};
						return { error: null };
					},
				}),
			};
		}),
	});
});

afterEach(() => {
	consoleErrorSpy.mockRestore();
});

describe('When HR loads reward requests', () => {
	test('Then getRedemptionRequestsAction returns pending requests with transformed fields', async () => {
		const result = await getRedemptionRequestsAction('pending');

		expect(result.error).toBeNull();
		expect(result.data).toHaveLength(1);
		expect(result.data?.[0]).toEqual(
			expect.objectContaining({
				id: 'request-1',
				userId: 'employee-1',
				rewardId: 'reward-1',
				rewardName: 'Rice Pack',
				status: 'pending',
				quantity: 2,
			})
		);
		expect(result.data?.[0].rewardImageUrl).toContain('reward-1/profile.png');
	});

	test('Then handleGetRedemptionRequestsAction throws when fetch fails', async () => {
		serverState.failList = true;

		await expect(handleGetRedemptionRequestsAction('pending')).rejects.toThrow(
			'Failed to fetch redemption requests: list failed'
		);
	});

	test('Then getRedemptionRequestsAction excludes employee-cancelled rows in rejected filter', async () => {
		const result = await getRedemptionRequestsAction('rejected');

		expect(result.error).toBeNull();
		expect(result.data).toEqual([]);
	});
});

describe('When HR accepts a pending request', () => {
	test('Then acceptRedemptionRequestAction approves the request, deducts stock, and creates a notification', async () => {
		const result = await acceptRedemptionRequestAction('request-1', 'Claim at HR desk');

		expect(result.error).toBeNull();
		expect(serverState.requests.find((request) => request.id === 'request-1')?.status).toBe(
			'approved'
		);
		expect(serverState.requests.find((request) => request.id === 'request-1')?.approved_by).toBe(
			'hr-1'
		);
		expect(serverState.rewards.find((reward) => reward.id === 'reward-1')?.quantity).toBe(3);
		expect(insertNotificationMock).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'employee-1',
				type: 'reward',
			})
		);
	});

	test('Then handleAcceptRedemptionRequestAction returns an error payload and shows a toast when the request is already processed', async () => {
		serverState.requests[0].status = 'approved';

		const result = await handleAcceptRedemptionRequestAction({ id: 'request-1' });

		expect(result.error).toBe('This request has already been processed');
		expect(toastError).toHaveBeenCalled();
	});
});

describe('When HR declines a pending request', () => {
	test('Then declineRedemptionRequestAction rejects the request, refunds points, restores stock, and creates a notification', async () => {
		serverState.users[1].points = 20;
		serverState.rewards[0].quantity = 1;
		serverState.rewards[0].is_active = false;

		const result = await declineRedemptionRequestAction('request-1', 'Insufficient paperwork');

		expect(result.error).toBeNull();
		expect(serverState.requests.find((request) => request.id === 'request-1')?.status).toBe(
			'rejected'
		);
		expect(serverState.users.find((user) => user.id === 'employee-1')?.points).toBe(40);
		expect(serverState.rewards.find((reward) => reward.id === 'reward-1')?.quantity).toBe(3);
		expect(serverState.rewards.find((reward) => reward.id === 'reward-1')?.is_active).toBe(true);
		expect(insertNotificationMock).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'employee-1',
				type: 'reward',
			})
		);
	});

	test('Then handleDeclineRedemptionRequestAction returns success and shows the success toast with remarks', async () => {
		const result = await handleDeclineRedemptionRequestAction({
			id: 'request-1',
			remarks: 'Please re-apply next month',
		});

		expect(result.error).toBeNull();
		expect(toastSuccess).toHaveBeenCalledWith('Redemption request declined with remarks.');
	});
});
