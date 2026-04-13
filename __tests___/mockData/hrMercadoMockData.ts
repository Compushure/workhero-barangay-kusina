import type { RedemptionRequest, Reward } from '@/types';

export const hrMercadoRewardMockData = {
	name: 'Rice Pack',
	pointsCost: 25,
	quantity: 10,
	redeemingLimit: 3,
	category: 'food',
	isActive: true,
	availableMonth: null,
	availableDate: null,
};

export const hrMercadoRewardRequestMockData = {
	quantity: 2,
	status: 'approved' as const,
	remarks: 'Approved for pickup',
};

export const hrMercadoRewardSummaryMockData: Reward = {
	id: 'reward-mock-1',
	name: 'Rice Pack',
	pointsCost: 25,
	quantity: 10,
	redeemingLimit: 3,
	category: 'food',
	isActive: true,
	availableDate: null,
	availableMonth: null,
	createdAt: '2026-04-10T08:00:00.000Z',
	createdBy: 'hr-mock-1',
	imageUrl: 'https://cdn.example.com/reward-mock-1/profile.png',
	redeemedCount: 2,
	isOutOfStock: false,
};

export const hrMercadoRewardRequestSummaryMockData: RedemptionRequest = {
	id: 'request-mock-1',
	userId: 'employee-mock-1',
	userName: 'Mock Employee',
	userPoints: 60,
	rewardId: 'reward-mock-1',
	rewardName: 'Rice Pack',
	rewardImageUrl: 'https://cdn.example.com/reward-mock-1/profile.png',
	pointsCost: 25,
	quantity: 2,
	status: 'approved',
	approvedBy: 'hr-mock-1',
	remarks: 'Approved for pickup',
	requestedAt: '2026-04-10T09:00:00.000Z',
	requestedItem: 'Rice Pack',
};