// services/userApi.ts
import { API_ENDPOINT } from "../config/api";

// Request interfaces
export interface UpdateAssetBalanceRequest {
  userId: string;
  platformAssetId?: string;
  balance: number;
}

export interface UpdateSignalBalanceRequest {
  userId: string;
  signalId?: string;
  stakings: number;
  strength: number;
}

export interface UpdateSubscriptionBalanceRequest {
  userId: string;
  subscriptionBalance: number;
}

// Add to your Request interfaces
export interface UpdateStakingBalanceRequest {
  userId: string;
  stakeId?: string; 
  totalBalance: number;
  activeBalance: number;
}

export interface UpdateUserRequest {
  fullName?: string;
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
  withdrawalType?:"AUTO" | "DEPOSIT" | "PASSCODE" ;
  kycStatus?: "VERIFIED" | "PENDING" | "REJECTED" | "UNVERIFIED";
  withdrawalPercentage?:number
}

// Response interfaces
export interface ApiResponse<T> {
  data?: T;
  message: string;
  status: number;
}

export interface BalanceUpdateResponse {
  id: string;
  userId: string;
  updatedAt: string;
}

export class UserApiService {
  static async updateAssetBalance(requestData: UpdateAssetBalanceRequest): Promise<ApiResponse<BalanceUpdateResponse>> {
    return this.makePatchRequest<BalanceUpdateResponse>(API_ENDPOINT.ADMIN.UPDATE_ASSET_BALANCE, requestData);
  }

  static async updateSignalBalance(requestData: UpdateSignalBalanceRequest): Promise<ApiResponse<BalanceUpdateResponse>> {
    return this.makePatchRequest<BalanceUpdateResponse>(API_ENDPOINT.ADMIN.UPDATE_SIGNAL_BALANCE, requestData);
  }

  static async updateSubscriptionBalance(requestData: UpdateSubscriptionBalanceRequest): Promise<ApiResponse<BalanceUpdateResponse>> {
    return this.makePatchRequest<BalanceUpdateResponse>(API_ENDPOINT.ADMIN.UPDATE_SUBSCRIPTION_BALANCE, requestData);
  }

  static async updateUser(userId: string, requestData: UpdateUserRequest): Promise<ApiResponse<BalanceUpdateResponse>> {
    const endpoint = API_ENDPOINT.ADMIN.UPDATE_USER.replace('{id}', userId);
    return this.makePatchRequest<BalanceUpdateResponse>(endpoint, requestData);
  } 
  static async updateStakingBalance(requestData: UpdateStakingBalanceRequest): Promise<ApiResponse<BalanceUpdateResponse>> {
    return this.makePatchRequest<BalanceUpdateResponse>(API_ENDPOINT.ADMIN.UPDATE_STAKING_BALANCE, requestData);
  }

  private static async makePatchRequest<T>(endpoint: string, data: UpdateAssetBalanceRequest | UpdateSignalBalanceRequest | UpdateSubscriptionBalanceRequest |  UpdateUserRequest | UpdateStakingBalanceRequest): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
}


