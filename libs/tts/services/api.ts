import type { UserData } from "../components/UserProfile";
import { STATIC_BUSINESS_TYPES, STATIC_INDUSTRIES_LEVEL4 } from "./mockData";

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
  if (data.provinceCity !== undefined) formData.append("provinceCity", data.provinceCity);
  if (data.wardCommune !== undefined) formData.append("wardCommune", data.wardCommune);
  if (data.address !== undefined) formData.append("address", data.address);

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

export async function getUserDetail(id: number | string) {
  return request<BackendUser>(`/users/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function deleteUser(id: number | string) {
  return request<{ id: number }>(`/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
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
  const url = joinApiPath(API_BASE_URL, path);
  try {
    response = await fetch(url, {
      ...init,
      headers,
    });
  } catch (error) {
    console.error("Fetch API error:", { url, error });
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

export interface BusinessAttachment {
  id: number;
  displayName: string;
  originalName: string;
  fileUrl: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export interface BusinessListItem {
  id: number;
  businessName: string;
  foreignName?: string | null;
  taxCode: string;
  businessType: string;
  industryCode: string;
  industryName: string;
  industryDisplay: string;
  licenseIssueDate?: string | null;
  provinceCity: string;
  wardCommune: string;
  address?: string | null;
  email?: string | null;
  agencyPhone?: string | null;
  operatingProvinceCity?: string | null;
  operatingWardCommune?: string | null;
  businessLocation?: string | null;
  representativeName?: string | null;
  representativePhone?: string | null;
  isActive: boolean;
  statusLabel: string;
  attachments: BusinessAttachment[];
  createdAt: string;
  updatedAt: string;
  accountUserId?: number | null;
  accountUsername?: string | null;
  accountInfo?: {
    username: string;
    password: string;
  };
}

export interface BusinessListMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BusinessListResponse {
  items: BusinessListItem[];
  meta: BusinessListMeta;
}

export interface BusinessOptionsResponse {
  businessTypes: string[];
  taxCodeRules: {
    format: string;
    examples: string[];
  };
  industryLevel: number;
  industryCodeRule: string;
}

export async function getBusinesses(query?: {
  page?: number | string;
  limit?: number | string;
  keyword?: string;
  businessName?: string;
  taxCode?: string;
  businessType?: string;
  industryCode?: string;
  industryName?: string;
  wardCommune?: string;
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
  const path = `/businesses${queryString ? `?${queryString}` : ""}`;
  return request<BusinessListResponse>(path, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getBusinessOptions(): Promise<ApiResponse<BusinessOptionsResponse>> {
  return {
    success: true,
    statusCode: 200,
    message: "Lấy danh mục doanh nghiệp thành công",
    data: {
      businessTypes: [...STATIC_BUSINESS_TYPES],
      taxCodeRules: {
        format: "10 digits or 10 digits-3 digits",
        examples: ["9100008882", "0100109106-001"],
      },
      industryLevel: 4,
      industryCodeRule: "Mã ngành nghề cấp 4 gồm 4 chữ số theo VSIC",
    },
    timestamp: new Date().toISOString(),
    path: "/businesses/options",
  };
}

export async function getIndustries(): Promise<ApiResponse<Array<{ code: string; name: string }>>> {
  return {
    success: true,
    statusCode: 200,
    message: "Lấy danh sách ngành nghề thành công",
    data: [...STATIC_INDUSTRIES_LEVEL4],
    timestamp: new Date().toISOString(),
    path: "/businesses/industries",
  };
}


export async function getBusinessDetail(id: number | string) {
  return request<BusinessListItem>(`/businesses/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function createBusiness(formData: FormData) {
  return request<BusinessListItem>("/businesses", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
}

export async function updateBusiness(id: number | string, formData: FormData) {
  return request<BusinessListItem>(`/businesses/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: formData,
  });
}

export async function updateBusinessStatus(id: number | string, isActive: boolean) {
  return request<BusinessListItem>(`/businesses/${id}/status`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  });
}

export async function deleteBusiness(id: number | string) {
  return request<{ id: number }>(`/businesses/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function deleteBusinessAttachment(businessId: number | string, attachmentId: number | string) {
  return request<{ id: number }>(`/businesses/${businessId}/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function getRegistrationOptions(): Promise<ApiResponse<{ businessTypes: string[] }>> {
  return {
    success: true,
    statusCode: 200,
    message: "Thành công",
    data: {
      businessTypes: [...STATIC_BUSINESS_TYPES],
    },
    timestamp: new Date().toISOString(),
    path: "/businesses/register/options",
  };
}

export async function sendRegistrationOtp(body: { email: string }) {
  return request<{ email: string; expiresInSeconds: number }>("/businesses/register/send-otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function verifyRegistrationOtp(body: { email: string; otp: string }) {
  return request<{ email: string; verified: boolean }>("/businesses/register/verify-otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function confirmRegistration(formData: FormData) {
  return request<any>("/businesses/register/confirm", {
    method: "POST",
    body: formData,
  });
}

export async function getMyBusinessProfile() {
  return request<BusinessListItem>("/businesses/me", {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function sendBusinessProfileEmailOtp() {
  return request<any>("/businesses/me/email/send-otp", {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function verifyBusinessProfileEmailOtp(otp: string) {
  return request<any>("/businesses/me/email/verify-otp", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ otp }),
  });
}

export async function updateMyBusinessProfile(formData: FormData) {
  return request<BusinessListItem>("/businesses/me", {
    method: "PATCH",
    headers: authHeaders(),
    body: formData,
  });
}

export interface ListDepartmentReportsQuery {
  page?: number | string;
  limit?: number | string;
  year?: string;
  periodType?: string;
  status?: string;
  reportPeriodId?: string;
  businessName?: string;
  taxCode?: string;
  provinceCity?: string;
  wardCommune?: string;
}

function getCatalogName(type: string, id: number): string {
  let categories: string[] = [];
  if (type === "ACCIDENT_CAUSE") {
    categories = [
      "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn",
      "Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt",
      "Tổ chức lao động không hợp lý",
      "Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ",
      "Không có quy trình an toàn hoặc biện pháp làm việc an toàn",
      "Điều kiện làm việc không tốt",
      "Vi phạm nội quy, quy trình, biện pháp làm việc an toàn",
      "Không sử dụng phương tiện bảo vệ cá nhân",
      "Khách quan khó tránh/ Nguyên nhân chưa kể đến"
    ];
  } else if (type === "INJURY_FACTOR") {
    categories = [
      "Thiết bị nâng",
      "Máy gia công cắt gọt kim loại, gỗ",
      "Điện giật",
      "Ngã từ trên cao",
      "Vật rơi, vật văng bắn",
      "Nhiệt độ cao, bỏng lửa",
      "Khác"
    ];
  } else if (type === "OCCUPATION") {
    categories = [
      "Nhà lãnh đạo cơ quan Đảng Cộng sản Việt nam cấp Trung ương",
      "Công nhân",
      "Nhà quản lý, điều hành doanh nghiệp",
      "Kỹ sư, kỹ thuật viên chuyên nghiệp",
      "Thợ vận hành máy và thiết bị",
      "Lao động thủ công giản đơn",
      "Khác"
    ];
  }
  return categories[id - 1] || "";
}

function getStoredLaborAccidentReports(): any[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("vna_mock_labor_accident_reports");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

function saveStoredLaborAccidentReports(reports: any[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("vna_mock_labor_accident_reports", JSON.stringify(reports));
  }
}

export async function getDepartmentReports(query?: ListDepartmentReportsQuery) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  let reports = getStoredLaborAccidentReports();

  // Self-healing for admin: if any report is missing businessName/taxCode/business, fetch the first available business and attach it
  const hasMissing = reports.some(r => (!r.businessName || r.businessName === "-") && (!r.taxCode || r.taxCode === "-"));
  if (hasMissing) {
    try {
      const bizRes = await getBusinesses({ limit: 1 });
      if (bizRes.success && bizRes.data && bizRes.data.items && bizRes.data.items.length > 0) {
        const defaultBiz = bizRes.data.items[0];
        let updated = false;
        reports = reports.map(r => {
          if ((!r.businessName || r.businessName === "-") && (!r.taxCode || r.taxCode === "-")) {
            r.businessName = defaultBiz.businessName;
            r.taxCode = defaultBiz.taxCode;
            r.provinceCity = defaultBiz.provinceCity;
            r.wardCommune = defaultBiz.wardCommune;
            r.business = defaultBiz;
            updated = true;
          }
          return r;
        });
        if (updated) {
          saveStoredLaborAccidentReports(reports);
        }
      }
    } catch (e) {
      console.error("Failed to run self-healing in getDepartmentReports:", e);
    }
  }

  if (query) {
    const { year, periodType, status, businessName, taxCode, provinceCity, wardCommune } = query;
    if (year) {
      reports = reports.filter((r) => String(r.reportPeriod?.year) === String(year));
    }
    if (periodType) {
      reports = reports.filter((r) => r.reportPeriod?.periodType === periodType);
    }
    if (status) {
      reports = reports.filter((r) => r.status === status);
    }
    if (businessName) {
      const q = businessName.toLowerCase();
      reports = reports.filter((r) => (r.businessName || "").toLowerCase().includes(q) || (r.business?.businessName || "").toLowerCase().includes(q));
    }
    if (taxCode) {
      const q = taxCode.toLowerCase();
      reports = reports.filter((r) => (r.taxCode || "").toLowerCase().includes(q) || (r.business?.taxCode || "").toLowerCase().includes(q));
    }
    if (provinceCity) {
      reports = reports.filter((r) => r.provinceCity === provinceCity || r.business?.provinceCity === provinceCity);
    }
    if (wardCommune) {
      reports = reports.filter((r) => r.wardCommune === wardCommune || r.business?.wardCommune === wardCommune);
    }
  }

  const page = query?.page ? Number(query.page) : 1;
  const limit = query?.limit ? Number(query.limit) : 10;
  const startIndex = (page - 1) * limit;
  const items = reports.slice(startIndex, startIndex + limit);

  return {
    success: true,
    statusCode: 200,
    message: "Thành công",
    data: {
      items,
      meta: {
        totalItems: reports.length,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(reports.length / limit),
        currentPage: page,
      }
    }
  };
}

export async function receiveDepartmentReport(id: number | string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const reports = getStoredLaborAccidentReports();
  const reportIndex = reports.findIndex((r) => String(r.id) === String(id));

  if (reportIndex === -1) {
    return {
      success: false,
      statusCode: 404,
      message: "Không tìm thấy báo cáo",
      data: null
    };
  }

  reports[reportIndex].status = "RECEIVED";
  reports[reportIndex].updatedAt = new Date().toISOString();
  saveStoredLaborAccidentReports(reports);

  return {
    success: true,
    statusCode: 200,
    message: "Tiếp nhận báo cáo thành công",
    data: reports[reportIndex]
  };
}

export async function getMyLaborAccidentReports(query?: {
  page?: number | string;
  limit?: number | string;
  year?: string;
  periodType?: string;
  status?: string;
}) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  let reports = getStoredLaborAccidentReports();

  // Self-healing: If any report in local storage is missing business name or tax code, fetch current business profile and update
  let currentTaxCode = "";
  try {
    const profileRes = await getMyBusinessProfile();
    if (profileRes.success && profileRes.data) {
      const profile = profileRes.data;
      currentTaxCode = profile.taxCode;
      let updated = false;
      reports = reports.map(r => {
        if ((!r.businessName || r.businessName === "-") && (!r.taxCode || r.taxCode === "-")) {
          r.businessName = profile.businessName;
          r.taxCode = profile.taxCode;
          r.provinceCity = profile.provinceCity;
          r.wardCommune = profile.wardCommune;
          r.business = profile;
          updated = true;
        }
        return r;
      });
      if (updated) {
        saveStoredLaborAccidentReports(reports);
      }
    }
  } catch (e) {
    console.error("Failed to run self-healing in getMyLaborAccidentReports:", e);
  }

  if (currentTaxCode) {
    reports = reports.filter((r) => r.taxCode === currentTaxCode);
  }

  if (query) {
    const { year, periodType, status } = query;
    if (year) {
      reports = reports.filter((r) => String(r.reportPeriod?.year) === String(year));
    }
    if (periodType) {
      reports = reports.filter((r) => r.reportPeriod?.periodType === periodType);
    }
    if (status) {
      reports = reports.filter((r) => r.status === status);
    }
  }

  const page = query?.page ? Number(query.page) : 1;
  const limit = query?.limit ? Number(query.limit) : 10;
  const startIndex = (page - 1) * limit;
  const items = reports.slice(startIndex, startIndex + limit);

  return {
    success: true,
    statusCode: 200,
    message: "Thành công",
    data: {
      items,
      meta: {
        totalItems: reports.length,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(reports.length / limit),
        currentPage: page,
      }
    }
  };
}

export async function getMyLaborAccidentReportDetail(id: number | string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  let reports = getStoredLaborAccidentReports();
  const reportIndex = reports.findIndex((r) => String(r.id) === String(id));

  if (reportIndex === -1) {
    return {
      success: false,
      statusCode: 404,
      message: "Không tìm thấy báo cáo",
      data: null
    };
  }

  let report = reports[reportIndex];
  if ((!report.businessName || report.businessName === "-") && (!report.taxCode || report.taxCode === "-")) {
    try {
      const profileRes = await getMyBusinessProfile();
      if (profileRes.success && profileRes.data) {
        const profile = profileRes.data;
        report.businessName = profile.businessName;
        report.taxCode = profile.taxCode;
        report.provinceCity = profile.provinceCity;
        report.wardCommune = profile.wardCommune;
        report.business = profile;
        reports[reportIndex] = report;
        saveStoredLaborAccidentReports(reports);
      }
    } catch (e) {
      console.error("Failed to run self-healing in getMyLaborAccidentReportDetail:", e);
    }
  }

  // Check permission
  let currentTaxCode = "";
  try {
    const profileRes = await getMyBusinessProfile();
    if (profileRes.success && profileRes.data) {
      currentTaxCode = profileRes.data.taxCode;
    }
  } catch (e) { }

  if (currentTaxCode && report.taxCode && report.taxCode !== currentTaxCode) {
    return {
      success: false,
      statusCode: 403,
      message: "Không có quyền truy cập báo cáo này",
      data: null
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Thành công",
    data: report
  };
}

export async function saveLaborAccidentReportDraft(body: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const reports = getStoredLaborAccidentReports();

  let businessProfile: BusinessListItem | null = null;
  try {
    const profileRes = await getMyBusinessProfile();
    if (profileRes.success && profileRes.data) {
      businessProfile = profileRes.data;
    }
  } catch (e) {
    console.error("Failed to fetch business profile during save draft:", e);
  }

  const reportPeriodId = Number(body.get("reportPeriodId"));
  const totalEmployees = Number(body.get("totalEmployees") || 0);
  const femaleEmployees = Number(body.get("femaleEmployees") || 0);
  const totalPayroll = Number(body.get("totalPayroll") || 0);
  const totalAccidents = Number(body.get("totalAccidents") || 0);
  const fatalAccidents = Number(body.get("fatalAccidents") || 0);
  const accidentsWithTwoOrMoreVictims = Number(body.get("accidentsWithTwoOrMoreVictims") || 0);
  const totalVictims = Number(body.get("totalVictims") || 0);
  const femaleVictims = Number(body.get("femaleVictims") || 0);
  const deathVictims = Number(body.get("deathVictims") || 0);
  const severeInjuryVictims = Number(body.get("severeInjuryVictims") || 0);
  const victimsNotUnderManagement = Number(body.get("victimsNotUnderManagement") || 0);
  const femaleVictimsNotUnderManagement = Number(body.get("femaleVictimsNotUnderManagement") || 0);
  const deathVictimsNotUnderManagement = Number(body.get("deathVictimsNotUnderManagement") || 0);
  const severeInjuryVictimsNotUnderManagement = Number(body.get("severeInjuryVictimsNotUnderManagement") || 0);
  const medicalCost = Number(body.get("medicalCost") || 0);
  const salaryPaymentCost = Number(body.get("salaryPaymentCost") || 0);
  const allowanceCost = Number(body.get("allowanceCost") || 0);
  const totalCost = Number(body.get("totalCost") || 0);
  const totalDaysOff = Number(body.get("totalDaysOff") || 0);
  const propertyDamage = Number(body.get("propertyDamage") || 0);

  const detailsRaw = body.get("details");
  let details: any[] = [];
  if (typeof detailsRaw === "string") {
    try {
      details = JSON.parse(detailsRaw);
    } catch (e) {
      console.error("Error parsing details JSON:", e);
    }
  }

  // Find if draft for this period already exists
  let reportIndex = reports.findIndex((r) => r.reportPeriodId === reportPeriodId);
  let reportId: number;

  const periods = getStoredReportPeriods();
  const reportPeriod = periods.find((p) => p.id === reportPeriodId);

  const newReportData: any = {
    reportPeriodId,
    reportPeriod,
    totalEmployees,
    femaleEmployees,
    totalPayroll,
    totalAccidents,
    fatalAccidents,
    accidentsWithTwoOrMoreVictims,
    totalVictims,
    femaleVictims,
    deathVictims,
    severeInjuryVictims,
    victimsNotUnderManagement,
    femaleVictimsNotUnderManagement,
    deathVictimsNotUnderManagement,
    severeInjuryVictimsNotUnderManagement,
    medicalCost,
    salaryPaymentCost,
    allowanceCost,
    totalCost,
    totalDaysOff,
    propertyDamage,
    details: details.map((d: any) => {
      return {
        ...d,
        accidentCauseCatalog: d.accidentCauseCatalogId ? { id: d.accidentCauseCatalogId, name: getCatalogName("ACCIDENT_CAUSE", d.accidentCauseCatalogId) } : null,
        injuryFactorCatalog: d.injuryFactorCatalogId ? { id: d.injuryFactorCatalogId, name: getCatalogName("INJURY_FACTOR", d.injuryFactorCatalogId) } : null,
        occupationCatalog: d.occupationCatalogId ? { id: d.occupationCatalogId, name: getCatalogName("OCCUPATION", d.occupationCatalogId) } : null,
      };
    }),
    status: "DRAFT",
    updatedAt: new Date().toISOString()
  };

  if (businessProfile) {
    newReportData.businessName = businessProfile.businessName;
    newReportData.taxCode = businessProfile.taxCode;
    newReportData.provinceCity = businessProfile.provinceCity;
    newReportData.wardCommune = businessProfile.wardCommune;
    newReportData.business = businessProfile;
  }

  if (reportIndex !== -1) {
    reportId = reports[reportIndex].id;
    reports[reportIndex] = {
      ...reports[reportIndex],
      ...newReportData,
    };
  } else {
    reportId = reports.reduce((max, r) => (r.id > max ? r.id : max), 0) + 1;
    reports.push({
      id: reportId,
      ...newReportData,
      createdAt: new Date().toISOString()
    });
  }

  saveStoredLaborAccidentReports(reports);

  return {
    success: true,
    statusCode: 200,
    message: "Lưu nháp thành công",
    data: reports.find((r) => r.id === reportId)
  };
}

export async function submitLaborAccidentReport(id: number | string, body: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const reports = getStoredLaborAccidentReports();
  const reportIndex = reports.findIndex((r) => String(r.id) === String(id));

  if (reportIndex === -1) {
    return {
      success: false,
      statusCode: 404,
      message: "Không tìm thấy báo cáo",
      data: null
    };
  }

  reports[reportIndex].status = "SUBMITTED";
  reports[reportIndex].updatedAt = new Date().toISOString();

  let businessProfile: BusinessListItem | null = null;
  try {
    const profileRes = await getMyBusinessProfile();
    if (profileRes.success && profileRes.data) {
      businessProfile = profileRes.data;
    }
  } catch (e) {
    console.error("Failed to fetch business profile during submit report:", e);
  }

  if (businessProfile) {
    reports[reportIndex].businessName = businessProfile.businessName;
    reports[reportIndex].taxCode = businessProfile.taxCode;
    reports[reportIndex].provinceCity = businessProfile.provinceCity;
    reports[reportIndex].wardCommune = businessProfile.wardCommune;
    reports[reportIndex].business = businessProfile;
  }

  const attachmentNamesRaw = body.get("attachmentNames");
  if (typeof attachmentNamesRaw === "string") {
    try {
      const names = JSON.parse(attachmentNamesRaw);
      if (names && names.length > 0) {
        const file = body.get("attachments");
        let fileUrl = "#";
        if (file && typeof window !== "undefined") {
          try {
            if ((file as any) instanceof Blob) {
              fileUrl = URL.createObjectURL(file as any);
            }
          } catch (e) {
            console.error("Failed to create object URL:", e);
          }
        }
        reports[reportIndex].attachments = [
          {
            id: 1,
            displayName: names[0],
            originalName: names[0],
            fileUrl: fileUrl,
            mimetype: "application/pdf",
            size: 1024 * 1024,
            createdAt: new Date().toISOString()
          }
        ];
      }
    } catch (e) {
      console.error(e);
    }
  }

  saveStoredLaborAccidentReports(reports);

  return {
    success: true,
    statusCode: 200,
    message: "Gửi báo cáo thành công",
    data: reports[reportIndex]
  };
}

export async function getCatalogOptions(type?: string) {
  let categories: string[] = [];
  if (type === "ACCIDENT_CAUSE") {
    categories = [
      "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn",
      "Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt",
      "Tổ chức lao động không hợp lý",
      "Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ",
      "Không có quy trình an toàn hoặc biện pháp làm việc an toàn",
      "Điều kiện làm việc không tốt",
      "Vi phạm nội quy, quy trình, biện pháp làm việc an toàn",
      "Không sử dụng phương tiện bảo vệ cá nhân",
      "Khách quan khó tránh/ Nguyên nhân chưa kể đến"
    ];
  } else if (type === "INJURY_FACTOR") {
    categories = [
      "Thiết bị nâng",
      "Máy gia công cắt gọt kim loại, gỗ",
      "Điện giật",
      "Ngã từ trên cao",
      "Vật rơi, vật văng bắn",
      "Nhiệt độ cao, bỏng lửa",
      "Khác"
    ];
  } else if (type === "OCCUPATION") {
    categories = [
      "Nhà lãnh đạo cơ quan Đảng Cộng sản Việt nam cấp Trung ương",
      "Công nhân",
      "Nhà quản lý, điều hành doanh nghiệp",
      "Kỹ sư, kỹ thuật viên chuyên nghiệp",
      "Thợ vận hành máy và thiết bị",
      "Lao động thủ công giản đơn",
      "Khác"
    ];
  }

  const data = categories.map((name, index) => ({
    id: index + 1,
    name,
    type,
    code: `${type}_${index + 1}`
  }));

  return {
    success: true,
    statusCode: 200,
    message: "Thành công",
    data
  };
}

export async function getDepartmentReportDetail(id: number | string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  let reports = getStoredLaborAccidentReports();
  const reportIndex = reports.findIndex((r) => String(r.id) === String(id));

  if (reportIndex === -1) {
    return {
      success: false,
      statusCode: 404,
      message: "Không tìm thấy báo cáo",
      data: null
    };
  }

  let report = reports[reportIndex];
  if ((!report.businessName || report.businessName === "-") && (!report.taxCode || report.taxCode === "-")) {
    try {
      const bizRes = await getBusinesses({ limit: 1 });
      if (bizRes.success && bizRes.data && bizRes.data.items && bizRes.data.items.length > 0) {
        const defaultBiz = bizRes.data.items[0];
        report.businessName = defaultBiz.businessName;
        report.taxCode = defaultBiz.taxCode;
        report.provinceCity = defaultBiz.provinceCity;
        report.wardCommune = defaultBiz.wardCommune;
        report.business = defaultBiz;
        reports[reportIndex] = report;
        saveStoredLaborAccidentReports(reports);
      }
    } catch (e) {
      console.error("Failed to run self-healing in getDepartmentReportDetail:", e);
    }
  }

  return {
    success: true,
    statusCode: 200,
    message: "Thành công",
    data: report
  };
}

const DEFAULT_REPORT_PERIODS = [
  {
    id: 1,
    reportName: "Báo cáo tai nạn lao động 6 tháng đầu năm 2026",
    year: 2026,
    periodType: "SIX_MONTHS",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    isActive: true,
  },
  {
    id: 2,
    reportName: "Báo cáo tai nạn lao động cả năm 2026",
    year: 2026,
    periodType: "FULL_YEAR",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    isActive: true,
  },
];

function getStoredReportPeriods(): any[] {
  if (typeof window === "undefined") return DEFAULT_REPORT_PERIODS;
  const stored = localStorage.getItem("vna_mock_report_periods");
  if (!stored) {
    localStorage.setItem("vna_mock_report_periods", JSON.stringify(DEFAULT_REPORT_PERIODS));
    return DEFAULT_REPORT_PERIODS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_REPORT_PERIODS;
  }
}

function saveStoredReportPeriods(periods: any[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("vna_mock_report_periods", JSON.stringify(periods));
  }
}

export async function getReportPeriods(query?: {
  page?: number | string;
  limit?: number | string;
  year?: string;
  reportName?: string;
  periodType?: string;
  startDate?: string;
  endDate?: string;
  isActive?: string | boolean;
}) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  let periods = getStoredReportPeriods();

  if (query) {
    const { year, reportName, periodType, startDate, endDate, isActive } = query;

    if (year !== undefined && year !== null && year !== "") {
      periods = periods.filter((p) => String(p.year) === String(year));
    }

    if (reportName !== undefined && reportName !== null && reportName !== "") {
      const searchName = String(reportName).toLowerCase();
      periods = periods.filter((p) =>
        p.reportName.toLowerCase().includes(searchName)
      );
    }

    if (periodType !== undefined && periodType !== null && periodType !== "") {
      periods = periods.filter((p) => p.periodType === periodType);
    }

    if (startDate !== undefined && startDate !== null && startDate !== "") {
      periods = periods.filter((p) => p.startDate >= startDate);
    }

    if (endDate !== undefined && endDate !== null && endDate !== "") {
      periods = periods.filter((p) => p.endDate <= endDate);
    }

    if (isActive !== undefined && isActive !== null && isActive !== "") {
      const activeBool = isActive === true || isActive === "true";
      periods = periods.filter((p) => p.isActive === activeBool);
    }
  }

  const page = query?.page ? Number(query.page) : 1;
  const limit = query?.limit ? Number(query.limit) : 10;
  const startIndex = (page - 1) * limit;
  const items = periods.slice(startIndex, startIndex + limit);

  return {
    success: true,
    statusCode: 200,
    message: "Thành công",
    data: {
      items,
      meta: {
        totalItems: periods.length,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(periods.length / limit),
        currentPage: page,
      },
    },
  };
}

export async function createReportPeriod(body: {
  reportName: string;
  year: number | string;
  periodType: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const periods = getStoredReportPeriods();
  console.log("createReportPeriod call - body:", body, "periods:", periods);

  const duplicate = periods.find(
    (p) => Number(p.year) === Number(body.year) && p.periodType === body.periodType
  );
  if (duplicate) {
    console.warn("createReportPeriod duplicate found:", duplicate);
    return {
      success: false,
      statusCode: 400,
      message: `Kỳ báo cáo ${body.periodType === "SIX_MONTHS" ? "6 tháng" : "Cả năm"} của năm ${body.year} đã tồn tại!`,
      data: null,
    };
  }

  const maxId = periods.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const newItem = {
    id: maxId + 1,
    reportName: body.reportName,
    year: Number(body.year),
    periodType: body.periodType,
    startDate: body.startDate,
    endDate: body.endDate,
    isActive: body.isActive !== undefined ? body.isActive : true,
  };

  periods.push(newItem);
  saveStoredReportPeriods(periods);

  return {
    success: true,
    statusCode: 201,
    message: "Tạo kỳ báo cáo thành công",
    data: newItem,
  };
}

export async function updateReportPeriod(id: number | string, body: {
  reportName?: string;
  year?: number | string;
  periodType?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const periods = getStoredReportPeriods();
  const itemIndex = periods.findIndex((p) => String(p.id) === String(id));

  if (itemIndex === -1) {
    return {
      success: false,
      statusCode: 404,
      message: "Không tìm thấy kỳ báo cáo",
      data: null,
    };
  }

  console.log("updateReportPeriod call - id:", id, "body:", body, "periods:", periods);
  const targetYear = body.year !== undefined ? Number(body.year) : periods[itemIndex].year;
  const targetPeriodType = body.periodType !== undefined ? body.periodType : periods[itemIndex].periodType;

  const duplicate = periods.find(
    (p) => String(p.id) !== String(id) && Number(p.year) === Number(targetYear) && p.periodType === targetPeriodType
  );
  if (duplicate) {
    console.warn("updateReportPeriod duplicate found:", duplicate);
    return {
      success: false,
      statusCode: 400,
      message: `Kỳ báo cáo ${targetPeriodType === "SIX_MONTHS" ? "6 tháng" : "Cả năm"} của năm ${targetYear} đã tồn tại!`,
      data: null,
    };
  }

  const updatedItem = {
    ...periods[itemIndex],
    ...(body.reportName !== undefined && { reportName: body.reportName }),
    ...(body.year !== undefined && { year: Number(body.year) }),
    ...(body.periodType !== undefined && { periodType: body.periodType }),
    ...(body.startDate !== undefined && { startDate: body.startDate }),
    ...(body.endDate !== undefined && { endDate: body.endDate }),
    ...(body.isActive !== undefined && { isActive: body.isActive }),
  };

  periods[itemIndex] = updatedItem;
  saveStoredReportPeriods(periods);

  return {
    success: true,
    statusCode: 200,
    message: "Cập nhật kỳ báo cáo thành công",
    data: updatedItem,
  };
}

export async function updateReportPeriodStatus(id: number | string, isActive: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const periods = getStoredReportPeriods();
  const itemIndex = periods.findIndex((p) => String(p.id) === String(id));

  if (itemIndex === -1) {
    return {
      success: false,
      statusCode: 404,
      message: "Không tìm thấy kỳ báo cáo",
      data: null,
    };
  }

  periods[itemIndex].isActive = isActive;
  saveStoredReportPeriods(periods);

  return {
    success: true,
    statusCode: 200,
    message: "Cập nhật trạng thái thành công",
    data: periods[itemIndex],
  };
}


