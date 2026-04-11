/**
 * Test coverage:
 * - Fetch Mercado items with redeemed-count enrichment
 * - Add, edit, delete, and hide Mercado items
 * - Upload Mercado item pictures
 * - Verify matching action handlers for HR Mercado workflows
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/hr/mercado-items.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	addRewardAction,
	deleteRewardAction,
	editRewardAction,
	getRewardsAction,
	hideRewardAction,
	uploadRewardPicture,
} from '@/actions/hr/rewards';
import {
	handleAddRewardAction,
	handleDeleteRewardAction,
	handleEditRewardAction,
	handleGetRewardsAction,
	handleHideRewardAction,
	handleUploadRewardPicture,
} from '@/action-handlers/hr/rewards';

type CreateClientFn = () => Promise<unknown>;
type ToastFn = (message?: unknown) => unknown;

type RewardRow = {
	id: string;
	name: string;
	points_cost: number;
	quantity: number | null;
	redeeming_limit: number | null;
	category: string | null;
	is_active: boolean;
	availability_interval: string | null;
	availability_anchor_date: string | null;
	created_at: string;
	created_by: string | null;
};

type RewardRequestRow = {
	id: string;
	reward_id: string;
	quantity: number;
	status: 'pending' | 'approved' | 'rejected';
};

let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

let rewardState: {
	rewards: RewardRow[];
	requests: RewardRequestRow[];
	failRewardList?: boolean;
	failRewardInsert?: boolean;
	failRewardUpdate?: boolean;
	failRewardDelete?: boolean;
	failStorageDelete?: boolean;
	failUpload?: boolean;
};

jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(),
}));

jest.mock('@/lib/supabase/admin', () => ({
	supabaseAdmin: {},
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

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
	createClient: jest.MockedFunction<CreateClientFn>;
};
const createClientMock = createClient;

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

	rewardState = {
		rewards: [
			{
				id: 'reward-1',
				name: 'Rice Pack',
				points_cost: 25,
				quantity: 10,
				redeeming_limit: 3,
				category: 'food',
				is_active: true,
				availability_interval: null,
				availability_anchor_date: null,
				created_at: '2026-04-09T08:00:00.000Z',
				created_by: 'hr-1',
			},
			{
				id: 'reward-2',
				name: 'Cooking Oil',
				points_cost: 15,
				quantity: 0,
				redeeming_limit: 1,
				category: 'kitchen',
				is_active: true,
				availability_interval: null,
				availability_anchor_date: null,
				created_at: '2026-04-09T07:00:00.000Z',
				created_by: 'hr-1',
			},
		],
		requests: [
			{ id: 'rr-1', reward_id: 'reward-1', quantity: 2, status: 'approved' },
			{ id: 'rr-2', reward_id: 'reward-1', quantity: 1, status: 'approved' },
			{ id: 'rr-3', reward_id: 'reward-2', quantity: 1, status: 'pending' },
		],
	};

	createClientMock.mockResolvedValue({
		auth: {
			getUser: jest.fn(async () => ({
				data: {
					user: {
						id: 'hr-1',
						email: 'hr@example.com',
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
				remove: async (_paths: string[]) => ({
					data: null,
					error: rewardState.failStorageDelete ? { message: 'remove failed' } : null,
				}),
				upload: async (_path: string, _file: File, _options: Record<string, unknown>) => ({
					data: rewardState.failUpload ? null : { path: 'reward-1/profile.png' },
					error: rewardState.failUpload ? { message: 'upload failed' } : null,
				}),
			})),
		},
		from: jest.fn((table: string) => {
			if (table === 'Reward') {
				return {
					select: jest.fn((columns?: string) => {
						if (columns?.includes('quantity, redeeming_limit')) {
							return {
								eq: (_field: string, id: string) => ({
									single: async () => {
										const found = rewardState.rewards.find((row) => row.id === id);
										return found
											? {
													data: {
														quantity: found.quantity,
														redeeming_limit: found.redeeming_limit,
													},
													error: null,
												}
											: { data: null, error: { message: 'Reward not found' } };
									},
								}),
							};
						}

						const filters: { isActive?: boolean; interval?: string | null } = {};
						const query = {
							eq: (field: string, value: unknown) => {
								if (field === 'is_active') {
									filters.isActive = Boolean(value);
								}
								if (field === 'availability_interval') {
									filters.interval = value as string;
								}
								return query;
							},
							order: async () => {
								if (rewardState.failRewardList) {
									return { data: null, error: { message: 'reward list failed' } };
								}

								const rows = rewardState.rewards
									.filter((row) =>
										filters.isActive === undefined ? true : row.is_active === filters.isActive
									)
									.filter((row) =>
										filters.interval === undefined ? true : row.availability_interval === filters.interval
									)
									.map((row) => ({ ...row }));

								return { data: rows, error: null };
							},
						};

						return query;
					}),
					insert: (payload: Partial<RewardRow>) => ({
						select: () => ({
							single: async () => {
								if (rewardState.failRewardInsert) {
									return { data: null, error: { message: 'insert failed' } };
								}

								const created: RewardRow = {
									id: `reward-${rewardState.rewards.length + 1}`,
									name: payload.name || 'Unnamed Reward',
									points_cost: Number(payload.points_cost || 0),
									quantity: payload.quantity ?? null,
									redeeming_limit: payload.redeeming_limit ?? null,
									category: (payload.category as string) ?? null,
									is_active: payload.is_active ?? true,
									availability_interval: (payload.availability_interval as string) ?? null,
									availability_anchor_date: (payload.availability_anchor_date as string) ?? null,
									created_at: '2026-04-09T09:00:00.000Z',
									created_by: 'hr-1',
								};

								rewardState.rewards.push(created);
								return { data: created, error: null };
							},
						}),
					}),
					update: (payload: Partial<RewardRow>) => ({
						eq: (_field: string, id: string) => {
							if (rewardState.failRewardUpdate) {
								return {
									error: { message: 'update failed' },
									select: () => ({
										single: async () => ({ data: null, error: { message: 'update failed' } }),
									}),
								};
							}

							const index = rewardState.rewards.findIndex((row) => row.id === id);
							if (index === -1) {
								return {
									error: { message: 'not found' },
									select: () => ({
										single: async () => ({ data: null, error: { message: 'not found' } }),
									}),
								};
							}

							rewardState.rewards[index] = {
								...rewardState.rewards[index],
								...payload,
							};

							return {
								error: null,
								select: () => ({
									single: async () => ({ data: rewardState.rewards[index], error: null }),
								}),
							};
						},
					}),
					delete: () => ({
						eq: async (_field: string, id: string) => {
							if (rewardState.failRewardDelete) {
								return { error: { message: 'delete failed' } };
							}

							rewardState.rewards = rewardState.rewards.filter((row) => row.id !== id);
							return { error: null };
						},
					}),
				};
			}

			if (table === 'RewardRequest') {
				return {
					select: jest.fn(() => {
						const filterState: { status?: string; rewardIds?: string[] } = {};

						const query = {
							eq: (field: string, value: string) => {
								if (field === 'status') {
									filterState.status = value;
								}
								return query;
							},
							in: (field: string, values: string[]) => {
								if (field === 'reward_id') {
									filterState.rewardIds = values;
								}
								return query;
							},
							get data() {
								return rewardState.requests
									.filter((row) => (filterState.status ? row.status === filterState.status : true))
									.filter((row) =>
										filterState.rewardIds ? filterState.rewardIds.includes(row.reward_id) : true
									)
									.map((row) => ({ reward_id: row.reward_id, quantity: row.quantity }));
							},
							get error() {
								return null;
							},
						};

						return query;
					}),
				};
			}

			throw new Error(`Unexpected table ${table}`);
		}),
	});
});

afterEach(() => {
	consoleErrorSpy.mockRestore();
});

describe('When HR loads Mercado items', () => {
	test('Then getRewardsAction returns transformed items with redeemed counts and stock flags', async () => {
		const result = await getRewardsAction();

		expect(result.error).toBeNull();
		expect(result.data).toHaveLength(2);
		expect(result.data?.find((row) => row.id === 'reward-1')?.redeemedCount).toBe(3);
		expect(result.data?.find((row) => row.id === 'reward-2')?.isOutOfStock).toBe(true);
		expect(result.data?.[0].imageUrl).toContain('profile.png');
	});

	test('Then handleGetRewardsAction throws when reward loading fails', async () => {
		rewardState.failRewardList = true;

		await expect(handleGetRewardsAction()).rejects.toThrow('Failed to fetch items: reward list failed');
	});
});

describe('When HR adds and edits Mercado items', () => {
	test('Then addRewardAction creates a new item with normalized fields', async () => {
		const result = await addRewardAction({
			name: 'Laundry Soap',
			pointsCost: 20,
			quantity: 12,
			redeemingLimit: 2,
			category: 'home',
			isActive: true,
			availableMonth: null,
			availableDate: null,
		});

		expect(result.error).toBeNull();
		expect(result.data?.id).toBeTruthy();
		expect(result.data?.name).toBe('Laundry Soap');
		expect(rewardState.rewards.some((row) => row.name === 'Laundry Soap')).toBe(true);
	});

	test('Then handleAddRewardAction returns the new item and shows a success toast', async () => {
		const result = await handleAddRewardAction({
			name: 'Laundry Soap',
			pointsCost: 20,
			quantity: 12,
			redeemingLimit: 2,
			category: 'home',
			isActive: true,
			availableMonth: null,
			availableDate: null,
		});

		expect(result?.name).toBe('Laundry Soap');
		expect(toastSuccess).toHaveBeenCalledWith('Item added successfully to Mercado');
	});

	test('Then handleAddRewardAction returns null and shows a toast for invalid redeeming limit', async () => {
		const result = await handleAddRewardAction({
			name: 'Sugar Pack',
			pointsCost: 10,
			quantity: 2,
			redeemingLimit: 5,
			category: 'food',
			isActive: true,
			availableMonth: null,
			availableDate: null,
		});

		expect(result).toBeNull();
		expect(toastError).toHaveBeenCalled();
	});

	test('Then editRewardAction updates an existing item and preserves the reward record', async () => {
		const result = await editRewardAction('reward-1', {
			name: 'Updated Rice Pack',
			quantity: 11,
		});

		expect(result.error).toBeNull();
		expect(result.data?.name).toBe('Updated Rice Pack');
		expect(rewardState.rewards.find((row) => row.id === 'reward-1')?.quantity).toBe(11);
	});

	test('Then handleEditRewardAction returns the updated item and shows a success toast', async () => {
		const result = await handleEditRewardAction('reward-1', {
			name: 'Updated Rice Pack',
		});

		expect(result?.name).toBe('Updated Rice Pack');
		expect(toastSuccess).toHaveBeenCalledWith('Item updated successfully');
	});

	test('Then handleEditRewardAction returns null and shows a toast when validation fails', async () => {
		const result = await handleEditRewardAction('reward-1', {
			redeemingLimit: 999,
		});

		expect(result).toBeNull();
		expect(toastError).toHaveBeenCalled();
	});

	test('Then editRewardAction blocks redeeming limit above current quantity when quantity is not included', async () => {
		const result = await editRewardAction('reward-1', {
			redeemingLimit: 999,
		});

		expect(result.error).toBe('Redeeming limit cannot be greater than current quantity');
	});
});

describe('When HR updates Mercado item visibility and lifecycle', () => {
	test('Then hideRewardAction marks an item as hidden', async () => {
		const result = await hideRewardAction('reward-1', false);

		expect(result.error).toBeNull();
		expect(rewardState.rewards.find((row) => row.id === 'reward-1')?.is_active).toBe(false);
	});

	test('Then handleHideRewardAction returns true and shows a success toast on unhide', async () => {
		const result = await handleHideRewardAction('reward-1', true);

		expect(result).toBe(true);
		expect(toastSuccess).toHaveBeenCalledWith('Item unhidden successfully');
	});

	test('Then deleteRewardAction removes the item and its storage picture', async () => {
		const result = await deleteRewardAction('reward-1');

		expect(result.error).toBeNull();
		expect(rewardState.rewards.find((row) => row.id === 'reward-1')).toBeUndefined();
	});

	test('Then handleDeleteRewardAction returns true and shows a success toast', async () => {
		const result = await handleDeleteRewardAction('reward-2');

		expect(result).toBe(true);
		expect(toastSuccess).toHaveBeenCalledWith('Item deleted successfully');
	});

	test('Then handleDeleteRewardAction returns false and shows a toast when delete fails', async () => {
		rewardState.failRewardDelete = true;

		const result = await handleDeleteRewardAction('reward-2');

		expect(result).toBe(false);
		expect(toastError).toHaveBeenCalled();
	});
});

describe('When HR uploads Mercado item pictures', () => {
	test('Then uploadRewardPicture returns a public URL for a valid image', async () => {
		const file = new File([new Uint8Array([1, 2, 3])], 'reward.png', { type: 'image/png' });

		const result = await uploadRewardPicture('reward-1', file);

		expect(result.error).toBeNull();
		expect(result.data?.publicUrl).toContain('reward-1/profile.png');
	});

	test('Then handleUploadRewardPicture rejects oversized images before upload', async () => {
		const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', {
			type: 'image/png',
		});

		const result = await handleUploadRewardPicture('reward-1', oversized, 'Rice Pack');

		expect(result).toBeNull();
		expect(toastError).toHaveBeenCalledWith('Image size must be less than 5MB');
	});
});
