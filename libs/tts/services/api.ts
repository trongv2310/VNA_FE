import type { UserData } from "../components/UserProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const ACCESS_TOKEN_KEY = "vna_access_token";
const REFRESH_TOKEN_KEY = "vna_refresh_token";
const USER_ID_KEY = "vna_user_id";
const USER_DATA_KEY = "vna_user_data";
const REMEMBER_ME_KEY = "vna_remember_me";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  error?: string;
  timestamp: string;
  path: string;
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
  createdAt?: string;
  updatedAt?: string;
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
  mailMode?: string;
  messageId?: string | null;
}

type ChangeGmailOtpPayload = ForgotPasswordPayload;

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getUserId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY) || sessionStorage.getItem(USER_ID_KEY);
}

export function getStoredBackendUser(): BackendUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_DATA_KEY) || sessionStorage.getItem(USER_DATA_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as BackendUser;
  } catch {
    localStorage.removeItem(USER_DATA_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
    return null;
  }
}

export function setAuthTokens(
  accessToken: string,
  refreshToken: string,
  userId?: string | number,
  rememberMe: boolean = true,
) {
  if (typeof window === "undefined") return;

  if (rememberMe) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (userId !== undefined && userId !== null) {
      localStorage.setItem(USER_ID_KEY, String(userId));
    }
    localStorage.setItem(REMEMBER_ME_KEY, "true");

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

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }
}

export function setStoredBackendUser(user: BackendUser, rememberMe?: boolean) {
  if (typeof window === "undefined") return;

  const shouldRemember =
    rememberMe ?? localStorage.getItem(REMEMBER_ME_KEY) !== "false";

  if (user.id !== undefined && user.id !== null) {
    if (shouldRemember) {
      localStorage.setItem(USER_ID_KEY, String(user.id));
      sessionStorage.removeItem(USER_ID_KEY);
    } else {
      sessionStorage.setItem(USER_ID_KEY, String(user.id));
      localStorage.removeItem(USER_ID_KEY);
    }
  }

  const serialized = JSON.stringify(user);
  if (shouldRemember) {
    localStorage.setItem(USER_DATA_KEY, serialized);
    sessionStorage.removeItem(USER_DATA_KEY);
  } else {
    sessionStorage.setItem(USER_DATA_KEY, serialized);
    localStorage.removeItem(USER_DATA_KEY);
  }
}

export function clearAuthTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
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

  if (data.avatarUrl?.startsWith("data:")) {
    const file = dataURLtoFile(data.avatarUrl, "avatar.png");
    if (file) {
      formData.append("avatar", file);
    }
  }

  return formData;
}

export async function login(username: string, password: string, rememberMe: boolean = true) {
  const response = await request<LoginPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, rememberMe }),
  });

  if (response.data?.accessToken && response.data?.refreshToken) {
    setAuthTokens(
      response.data.accessToken,
      response.data.refreshToken,
      response.data.user?.id,
      rememberMe,
    );
    if (response.data.user) {
      setStoredBackendUser(response.data.user, rememberMe);
    }
  }

  return response;
}

export function getStoredUserData() {
  const user = getStoredBackendUser();
  return user ? mapBackendUserToUserData(user) : null;
}

export async function getProfile() {
  const response = await request<BackendUser>("/users/me", {
    method: "GET",
    headers: authHeaders(),
  });

  if (response.data) {
    setStoredBackendUser(response.data);
  }

  return response;
}

export async function updateMe(data: UserData) {
  const userId = getUserId();
  if (!userId) {
    throw new Error("Không tìm thấy user id. Vui lòng đăng nhập lại.");
  }

  const response = await request<BackendUser>(`/users/${userId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: mapUserDataToUpdateMe(data),
  });

  if (response.data) {
    setStoredBackendUser(response.data);
  }

  return response;
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  return request<null>("/auth/change-password", {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
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

export async function sendChangeGmailOtp() {
  return request<ChangeGmailOtpPayload>("/auth/change-gmail/send-otp", {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function verifyChangeGmailOtp(otp: string) {
  return request<null>("/auth/change-gmail/verify-otp", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ otp }),
  });
}

export async function updateChangeGmail(newEmail: string) {
  const response = await request<BackendUser>("/auth/change-gmail/update", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ newEmail }),
  });

  if (response.data) {
    setStoredBackendUser(response.data);
  }

  return response;
}

export interface UserListMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserListItem {
  id: number;
  fullName: string;
  username: string;
  email: string;
  avatar: string | null;
  position: string;
  isActive: boolean;
  statusLabel: string;
  roles: Array<{ id: number; code: string; name: string }>;
  roleCodes: string[];
  roleNames: string[];
  roleDisplay: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  items: UserListItem[];
  meta: UserListMeta;
}

export async function getUsers(query?: {
  page?: number | string;
  limit?: number | string;
  keyword?: string;
  fullName?: string;
  username?: string;
  email?: string;
  role?: string;
  position?: string;
  isActive?: string;
}) {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, String(val));
      }
    });
  }
  const queryString = params.toString();
  const path = `/users${queryString ? `?${queryString}` : ""}`;
  return request<UserListResponse>(path, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function updateUserAdmin(
  id: number | string,
  data: Partial<BackendUser> & { roleCode?: string; password?: string },
) {
  const formData = new FormData();
  if (data.username !== undefined) formData.append("username", data.username);
  if (data.password !== undefined) formData.append("password", data.password);
  if (data.fullName !== undefined) formData.append("fullName", data.fullName);
  if (data.email !== undefined) formData.append("email", data.email);
  if (data.gender !== undefined) formData.append("gender", data.gender);
  if (data.dateOfBirth !== undefined) formData.append("dateOfBirth", data.dateOfBirth);
  if (data.position !== undefined) formData.append("position", data.position);
  if (data.roleCode !== undefined) formData.append("roleCode", data.roleCode);
  if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
  
  if (data.avatar?.startsWith("data:")) {
    const file = dataURLtoFile(data.avatar, "avatar.png");
    if (file) {
      formData.append("avatar", file);
    }
  } else if (data.avatar === null) {
    formData.append("removeAvatar", "true");
  }

  return request<BackendUser>(`/users/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: formData,
  });
}

export async function createUser(
  data: Partial<BackendUser> & { roleCode?: string; password?: string; provinceCity?: string; wardCommune?: string },
) {
  const formData = new FormData();
  if (data.username !== undefined) formData.append("username", data.username);
  if (data.password !== undefined) formData.append("password", data.password);
  if (data.fullName !== undefined) formData.append("fullName", data.fullName);
  if (data.email !== undefined) formData.append("email", data.email);
  if (data.gender !== undefined) formData.append("gender", data.gender);
  if (data.dateOfBirth !== undefined) formData.append("dateOfBirth", data.dateOfBirth);
  if (data.position !== undefined) formData.append("position", data.position);
  if (data.roleCode !== undefined) formData.append("roleCode", data.roleCode);
  if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
  if (data.provinceCity !== undefined) formData.append("provinceCity", data.provinceCity);
  if (data.wardCommune !== undefined) formData.append("wardCommune", data.wardCommune);
  if (data.address !== undefined) formData.append("address", data.address);
  
  if (data.avatar?.startsWith("data:")) {
    const file = dataURLtoFile(data.avatar, "avatar.png");
    if (file) {
      formData.append("avatar", file);
    }
  }

  return request<BackendUser>("/users", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function joinApiPath(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function normalizeMessage(message: unknown) {
  if (Array.isArray(message)) {
    return message.filter(Boolean).join("\n");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return null;
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };

  if (!(init.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(joinApiPath(API_BASE_URL, path), {
      ...init,
      headers,
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ. Kiểm tra backend và cấu hình API.");
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    const message =
      normalizeMessage(payload?.message) ||
      normalizeMessage(payload?.error) ||
      `May chu tra ve loi ${response.status}`;
    throw new Error(message);
  }

  return {
    ...payload,
    message: normalizeMessage(payload.message) || "Thành công",
  };
}
