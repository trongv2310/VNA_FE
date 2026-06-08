import type { UserData } from "../components/UserProfile";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api/v1";

const ACCESS_TOKEN_KEY = "vna_access_token";
const REFRESH_TOKEN_KEY = "vna_refresh_token";

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  errors: unknown;
  timestamp: string;
}

export interface BackendUser {
  id?: string;
  username?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  dob?: string;
  gender?: string;
  title?: string;
  province?: string;
  ward?: string;
  address?: string;
  isActive?: boolean;
  roles?: Array<string | { code?: string; name?: string }>;
}

interface LoginPayload {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}

interface ForgotPasswordPayload {
  email: string;
  expiresInSeconds: number;
  devOtp?: string;
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function mapBackendUserToUserData(user: BackendUser): UserData {
  const role = (user.roles || [])
    .map((item) => (typeof item === "string" ? item : item.code || item.name || ""))
    .filter(Boolean)
    .join(", ");

  return {
    avatarUrl: user.avatar || "",
    username: user.username || "",
    fullName: user.fullName || "",
    dob: user.dob || "",
    gender: user.gender || "",
    title: user.title || "",
    role: role || "USER",
    email: user.email || "",
    province: user.province || "",
    ward: user.ward || "",
    address: user.address || "",
    isActive: user.isActive ?? true,
  };
}

export function mapUserDataToUpdateMe(data: UserData) {
  return {
    fullName: data.fullName,
    email: data.email,
    avatar: data.avatarUrl,
    dob: data.dob || undefined,
    gender: data.gender || undefined,
    title: data.title || undefined,
    province: data.province || undefined,
    ward: data.ward || undefined,
    address: data.address || undefined,
  };
}

export async function login(username: string, password: string) {
  return request<LoginPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getMe() {
  return request<BackendUser>("/users/me", {
    headers: authHeaders(),
  });
}

export async function updateMe(data: UserData) {
  return request<BackendUser>("/users/me", {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(mapUserDataToUpdateMe(data)),
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  return request<null>("/users/me/password", {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function requestForgotPassword(email: string) {
  return request<ForgotPasswordPayload>("/auth/forgot-password/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyForgotPasswordOtp(email: string, otp: string) {
  return request<null>("/auth/forgot-password/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
) {
  return request<null>("/auth/forgot-password/reset", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.success) {
    const message =
      payload?.message ||
      (typeof payload?.errors === "string" ? payload.errors : null) ||
      "Khong the ket noi den may chu";
    throw new Error(message);
  }

  return payload;
}
