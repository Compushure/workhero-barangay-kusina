/**
 * Test coverage:
 * - Combine employee Mercado rewards, pending requests, and points into page data
 * - Order Mercado items through employee redemption handlers
 * - Cancel Mercado item requests through employee redemption handlers
 * - Respect includeRewards toggle for the Mercado page hook
 * - Preserve loading and error states from the underlying queries
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/employee/employee-mercado.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	handleCancelMyRedemptionRequestAction,
	handleCreateRedemptionRequestAction,
} from '@/action-handlers/employee/redemptions';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';

// Keep useMemo synchronous in tests to simplify hook assertions.
jest.mock('react', () => ({
	...((jest.requireActual('react') as typeof import('react'))),
	useMemo: (factory: () => unknown) => factory(),
}));

// Query/action mocks used to simulate Mercado backend and cache hooks.
const mockUseGetEmployeePoints = jest.fn();
const mockUseGetAvailableRewards = jest.fn();
const mockUseGetMyRedemptionRequests = jest.fn();
const mockCreateRedemptionRequestAction = jest.fn();
const mockCancelMyRedemptionRequestAction = jest.fn();
const mockFetchMyRedemptionRequestsAction = jest.fn();

const toastError = jest.fn();

// Capture toast calls so tests can verify user-facing error feedback.
jest.mock('sonner', () => ({
	toast: {
		error: (...args: unknown[]) => toastError(...args),
		success: jest.fn(),
	},
}));

jest.mock('@/actions/employee/redemptions', () => ({
	createRedemptionRequestAction: (...args: unknown[]) => mockCreateRedemptionRequestAction(...args),
	cancelMyRedemptionRequestAction: (...args: unknown[]) => mockCancelMyRedemptionRequestAction(...args),
	getMyRedemptionRequestsAction: (...args: unknown[]) => mockFetchMyRedemptionRequestsAction(...args),
}));

jest.mock('@/hooks/tanstack/queries/employeeQueries', () => ({
	useGetEmployeePoints: () => mockUseGetEmployeePoints(),
}));

jest.mock('@/hooks/tanstack/queries/rewardQueries', () => ({
	useGetAvailableRewards: (options?: { enabled?: boolean }) => mockUseGetAvailableRewards(options),
}));

jest.mock('@/hooks/tanstack/queries/redemptionQueries', () => ({
	useGetMyRedemptionRequests: (status?: string) => mockUseGetMyRedemptionRequests(status),
}));

// Minimal shapes needed for this suite's assertions.
type MockReward = {
	id: string;
	name: string;
	pointsCost: number;
	isActive: boolean;
};

type MockRequest = {
	id: string;
	rewardId: string;
	quantity: number;
	status: 'pending' | 'approved' | 'rejected';
};

let activeRewards: MockReward[];
let pendingRequests: MockRequest[];

beforeEach(() => {
	// Seed default Mercado data for the happy path.
	activeRewards = [
		{ id: 'reward-1', name: 'Rice Pack', pointsCost: 25, isActive: true },
		{ id: 'reward-2', name: 'Cooking Oil', pointsCost: 15, isActive: true },
	];
	pendingRequests = [
		{ id: 'request-1', rewardId: 'reward-1', quantity: 2, status: 'pending' },
		{ id: 'request-2', rewardId: 'reward-2', quantity: 1, status: 'pending' },
	];

	mockUseGetAvailableRewards.mockReturnValue({
		data: activeRewards,
		isLoading: false,
		error: null,
	});
	mockUseGetMyRedemptionRequests.mockReturnValue({
		data: pendingRequests,
		isLoading: false,
		error: null,
	});
	mockUseGetEmployeePoints.mockReturnValue({
		data: { points: 80, deductedPoints: 5 },
		isLoading: false,
		error: null,
	});

	mockCreateRedemptionRequestAction.mockImplementation(async () => ({ error: null }));
	mockCancelMyRedemptionRequestAction.mockImplementation(async () => ({ error: null }));
	mockFetchMyRedemptionRequestsAction.mockImplementation(
		async () => ({ error: null, data: pendingRequests })
	);
	// Start each test with no error toast calls recorded.
	toastError.mockReset();
});

afterEach(() => {
	// Reset all mocks so tests remain isolated from one another.
	mockUseGetEmployeePoints.mockReset();
	mockUseGetAvailableRewards.mockReset();
	mockUseGetMyRedemptionRequests.mockReset();
	mockCreateRedemptionRequestAction.mockReset();
	mockCancelMyRedemptionRequestAction.mockReset();
	mockFetchMyRedemptionRequestsAction.mockReset();
	toastError.mockReset();
});

describe('When the employee loads Mercado page data', () => {
	test('Then useMercadoPageData returns available rewards, pending requests, and points', () => {
		// Verifies the composed hook returns merged data from all dependent queries.
		const result = useMercadoPageData();

		expect(result.activeRewards).toEqual(activeRewards);
		expect(result.pendingRequests).toEqual(pendingRequests);
		expect(result.userPoints).toBe(80);
		expect(result.deductedPoints).toBe(5);
		expect(result.isLoading).toBe(false);
		expect(result.error).toBeNull();
		expect(mockUseGetAvailableRewards).toHaveBeenCalledWith({ enabled: true });
		expect(mockUseGetMyRedemptionRequests).toHaveBeenCalledWith('pending');
		expect(mockUseGetEmployeePoints).toHaveBeenCalled();
	});

	test('Then useMercadoPageData disables reward loading when includeRewards is false', () => {
		// Verifies optional behavior when reward cards are intentionally skipped.
		const result = useMercadoPageData({ includeRewards: false });

		expect(result.activeRewards).toEqual(activeRewards);
		expect(result.error).toBeNull();
		expect(mockUseGetAvailableRewards).toHaveBeenCalledWith({ enabled: false });
	});

	test('Then useMercadoPageData surfaces loading when any underlying query is loading', () => {
		// Verifies top-level loading state bubbles up from dependencies.
		mockUseGetAvailableRewards.mockReturnValue({
			data: [],
			isLoading: true,
			error: null,
		});

		const result = useMercadoPageData();

		expect(result.isLoading).toBe(true);
	});

	test('Then useMercadoPageData preserves reward query errors only when rewards are included', () => {
		// Verifies includeRewards controls whether reward errors should be shown.
		mockUseGetAvailableRewards.mockReturnValue({
			data: [],
			isLoading: false,
			error: new Error('reward load failed'),
		});

		const withRewards = useMercadoPageData();
		const withoutRewards = useMercadoPageData({ includeRewards: false });

		expect(withRewards.error?.message).toBe('reward load failed');
		expect(withoutRewards.error).toBeNull();
	});
});

describe('When the employee orders and cancels Mercado items', () => {
	test('Then handleCreateRedemptionRequestAction returns true when the order request succeeds', async () => {
		// Success path for creating a pending redemption request.
		const result = await handleCreateRedemptionRequestAction('reward-1', 2);

		expect(result).toBe(true);
		expect(mockCreateRedemptionRequestAction).toHaveBeenCalledWith('reward-1', 2);
		expect(toastError).not.toHaveBeenCalled();
	});

	test('Then handleCreateRedemptionRequestAction returns false and shows an error toast when ordering fails', async () => {
		// Failure path should return false and surface an error message to the user.
		mockCreateRedemptionRequestAction.mockImplementationOnce(async () => ({
			error: 'Insufficient points',
		}));

		const result = await handleCreateRedemptionRequestAction('reward-1', 2);

		expect(result).toBe(false);
		expect(toastError).toHaveBeenCalledWith(
			'Failed to create redemption request: Insufficient points'
		);
	});

	test('Then handleCancelMyRedemptionRequestAction returns true when cancellation succeeds', async () => {
		// Success path for employee cancellation of a pending request.
		const result = await handleCancelMyRedemptionRequestAction('request-1');

		expect(result).toBe(true);
		expect(mockCancelMyRedemptionRequestAction).toHaveBeenCalledWith('request-1');
		expect(toastError).not.toHaveBeenCalled();
	});

	test('Then handleCancelMyRedemptionRequestAction returns false and shows an error toast when cancellation fails', async () => {
		// Failure path should keep return false and show cancellation error.
		mockCancelMyRedemptionRequestAction.mockImplementationOnce(async () => ({
			error: 'Only pending requests can be cancelled',
		}));

		const result = await handleCancelMyRedemptionRequestAction('request-1');

		expect(result).toBe(false);
		expect(toastError).toHaveBeenCalledWith(
			'Failed to cancel redemption request: Only pending requests can be cancelled'
		);
	});
});
