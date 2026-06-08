import type { UserData } from "../components/UserProfile";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const ACCESS_TOKEN_KEY = "vna_access_token";
const REFRESH_TOKEN_KEY = "vna_refresh_token";
const USER_ID_KEY = "vna_user_id";

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  errors: unknown;
  timestamp: string;
}

export interface BackendUser {
  id?: number | string;
  username?: string;
  fullName?: string;
  email?: string;
  avatar?: string | null;
  dateOfBirth?: string;
  gender?: string;
  position?: string;
  provinceCity?: string;
  wardCommune?: string;
  address?: string;
  isActive?: boolean;
  roles?: Array<string | { code?: string; name?: string }>;
}

interface LoginPayload {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  user: BackendUser;
}

interface ForgotPasswordPayload {
  email: string;
  expiresInSeconds: number;
  devOtp?: string;
}

const REMEMBER_ME_KEY = "vna_remember_me";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getUserId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY) || sessionStorage.getItem(USER_ID_KEY);
}

export function setAuthTokens(
  accessToken: string,
  refreshToken: string,
  userId?: string | number,
  rememberMe: boolean = true
) {
  if (typeof window === "undefined") return;

  if (rememberMe) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (userId !== undefined && userId !== null) {
      localStorage.setItem(USER_ID_KEY, String(userId));
    }
    localStorage.setItem(REMEMBER_ME_KEY, "true");

    // Clear session storage to avoid duplicate/stale tokens
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_ID_KEY);
  } else {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (userId !== undefined && userId !== null) {
      sessionStorage.setItem(USER_ID_KEY, String(userId));
    }
    localStorage.setItem(REMEMBER_ME_KEY, "false");

    // Clear local storage to avoid duplicate/stale tokens
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }
}

export function clearAuthTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
}

export function mapBackendUserToUserData(user: BackendUser): UserData {
  // Store the user id as a side-effect based on rememberMe preference
  if (user.id !== undefined && user.id !== null && typeof window !== "undefined") {
    const isRemembered = localStorage.getItem(REMEMBER_ME_KEY) !== "false";
    if (isRemembered) {
      localStorage.setItem(USER_ID_KEY, String(user.id));
    } else {
      sessionStorage.setItem(USER_ID_KEY, String(user.id));
    }
  }

  const role = (user.roles || [])
    .map((item) => (typeof item === "string" ? item : item.code || item.name || ""))
    .filter(Boolean)
    .join(", ");

  return {
    avatarUrl: user.avatar || "",
    username: user.username || "",
    fullName: user.fullName || "",
    dob: user.dateOfBirth || "",
    gender: user.gender || "",
    title: user.position || "",
    role: role || "USER",
    email: user.email || "",
    province: user.provinceCity || "",
    ward: user.wardCommune || "",
    address: user.address || "",
    isActive: user.isActive ?? true,
  };
}

// Helper to convert base64 image URL (from FileReader) to File object for FormData upload
export function dataURLtoFile(dataurl: string, filename: string): File | null {
  if (!dataurl.startsWith("data:")) return null;
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) return null;
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function mapUserDataToUpdateMe(data: UserData): FormData {
  const formData = new FormData();
  if (data.fullName) formData.append("fullName", data.fullName);
  if (data.email) formData.append("email", data.email);
  if (data.gender) formData.append("gender", data.gender);
  if (data.dob) formData.append("dateOfBirth", data.dob);
  if (data.title) formData.append("position", data.title);
  if (data.province) formData.append("provinceCity", data.province);
  if (data.ward) formData.append("wardCommune", data.ward);
  if (data.address) formData.append("address", data.address);
  formData.append("isActive", String(data.isActive ?? true));

  if (data.avatarUrl) {
    if (data.avatarUrl.startsWith("data:")) {
      const file = dataURLtoFile(data.avatarUrl, "avatar.png");
      if (file) {
        formData.append("avatar", file);
      }
    }
  }
  return formData;
}

export async function login(username: string, password: string, rememberMe: boolean = true) {
  const response = await request<LoginPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, rememberMe }),
  });
  if (response.success && response.data?.user?.id !== undefined && response.data?.user?.id !== null) {
    if (typeof window !== "undefined") {
      if (rememberMe) {
        localStorage.setItem(USER_ID_KEY, String(response.data.user.id));
        localStorage.setItem(REMEMBER_ME_KEY, "true");
      } else {
        sessionStorage.setItem(USER_ID_KEY, String(response.data.user.id));
        localStorage.setItem(REMEMBER_ME_KEY, "false");
      }
    }
  }
  return response;
}

export async function getMe() {
  return request<BackendUser>("/users/me", {
    headers: authHeaders(),
  });
}

export async function updateMe(data: UserData) {
  const userId = getUserId() || "1";
  return request<BackendUser>(`/users/${userId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: mapUserDataToUpdateMe(data),
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
  confirmPassword: string,
) {
  return request<null>("/auth/forgot-password/reset", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
  });
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };

  // If the body is FormData, the browser will automatically set the Content-Type
  // including the boundary. Setting it manually to application/json or anything else will break it.
  if (!(init.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
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
