"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Sidebar, UserProfile, ChangePassword, DashboardLayout } from "../../components";
import type { UserData } from "../../components/UserProfile";
import {
  changePassword,
  clearAuthTokens,
  getAccessToken,
  getMe,
  mapBackendUserToUserData,
  updateMe,
} from "../../services/api";

// Initial Mock User Data
const MOCK_USER_DATA: UserData = {
  avatarUrl: "", // Start with no avatar to test upload functionality
  username: "Vna25112020",
  fullName: "Phan Thanh Tùng",
  dob: "1995-06-01", // YYYY-MM-DD format for input[type="date"]
  gender: "",
  title: "Chuyên viên",
  role: "Quản trị viên",
  email: "phanthanhtung093@gmail.com",
  province: "Thành phố Hồ Chí Minh",
  ward: "Phường Gò Vấp",
  address: "123 Nguyễn Văn Cừ, Phường Gò Vấp",
  isActive: true,
};

export const DepartmentDashboardScreen: React.FC = () => {
  const router = useRouter();

  // State for user data
  const [userData, setUserData] = useState<UserData>(MOCK_USER_DATA);
  // State for restoring data when cancel is pressed
  const [initialUserData, setInitialUserData] = useState<UserData>(MOCK_USER_DATA);
  const [profileResetKey, setProfileResetKey] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Navigation & layout state
  const [activeView, setActiveView] = useState<"profile" | "change-password">("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-dismiss Toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/department/login");
      return;
    }

    getMe()
      .then((response) => {
        const nextUserData = mapBackendUserToUserData(response.data);
        setUserData(nextUserData);
        setInitialUserData(nextUserData);
        setProfileResetKey((current) => current + 1);
      })
      .catch(() => {
        clearAuthTokens();
        router.replace("/department/login");
      })
      .finally(() => setIsLoadingProfile(false));
  }, [router]);

  const showToastMsg = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // Actions
  const handleSaveProfile = async (updatedData: UserData, successMessage?: string) => {
    try {
      const response = await updateMe(updatedData);
      const nextUserData = mapBackendUserToUserData(response.data);
      setUserData(nextUserData);
      setInitialUserData(nextUserData);
      setProfileResetKey((current) => current + 1);
      showToastMsg(successMessage || response.message || "Cap nhat thong tin thanh cong", "success");
    } catch (error) {
      showToastMsg(error instanceof Error ? error.message : "Cap nhat thong tin that bai", "error");
    }
    return;

    setUserData(updatedData);
    setInitialUserData(updatedData);
    showToastMsg(successMessage || "Cập nhật thông tin cá nhân thành công!", "success");
  };

  const handleCancelProfile = () => {
    setUserData({ ...initialUserData });
    setProfileResetKey((current) => current + 1);
    showToastMsg("Đã khôi phục dữ liệu ban đầu.", "success");
  };

  const handleSavePassword = async (currentPw: string, newPw: string) => {
    try {
      const response = await changePassword(currentPw, newPw);
      showToastMsg(response.message || "Doi mat khau thanh cong", "success");
      setShowChangePasswordModal(false);
    } catch (error) {
      showToastMsg(error instanceof Error ? error.message : "Doi mat khau that bai", "error");
    }
    return;

    // In a mock environment, we accept any current password, or verify against a mock "123456"
    // Let's check:
    if (currentPw !== "123456" && currentPw !== "admin") {
      showToastMsg("Mật khẩu cũ không chính xác (Thử '123456' hoặc 'admin').", "error");
      return;
    }

    showToastMsg("Đổi mật khẩu tài khoản thành công!", "success");
    setShowChangePasswordModal(false);
  };

  const handleCancelPassword = () => {
    setShowChangePasswordModal(false);
    showToastMsg("Đã hủy bỏ đổi mật khẩu.", "success");
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    clearAuthTokens();
    showToastMsg("Đang đăng xuất khỏi hệ thống...", "success");
    setTimeout(() => {
      router.push("/department/login");
    }, 1000);
  };

  // Determine active item in sidebar menu based on activeView
  const getActiveItem = () => {
    if (activeView === "profile") return "quan_ly_nguoi_dung";
    return ""; // none active when changing password
  };

  // Sidebar element
  const sidebarElement = (
    <Sidebar
      fullName={userData.fullName}
      avatarUrl={userData.avatarUrl}
      onSelectView={(view) => {
        if (view === "change-password") {
          setShowChangePasswordModal(true);
        } else {
          setActiveView(view);
        }
        setMobileMenuOpen(false);
      }}
      onLogout={handleLogoutClick}
      activeItem={getActiveItem()}
      onCloseMobile={() => setMobileMenuOpen(false)}
    />
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Toast Notification Popover */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border bg-white dark:bg-zinc-900 animate-in slide-in-from-right-5 duration-300
          ${toast.type === "success" ? "border-emerald-200/80 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300" : "border-red-200/80 dark:border-red-900/40 text-red-800 dark:text-red-300"}
        `}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold pr-4">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-600 focus:outline-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setShowLogoutConfirm(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Dialog Panel */}
          <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center gap-6">
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center shadow-lg shadow-red-500/5">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Xác nhận đăng xuất
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản quản trị này không?
              </p>
            </div>

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-semibold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-500/10 active:scale-98 transition-all cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      {isLoadingProfile ? (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-500">
          Dang tai thong tin nguoi dung...
        </div>
      ) : (
        <DashboardLayout
          sidebar={sidebarElement}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        >
          <UserProfile
            key={profileResetKey}
            initialData={userData}
            onSave={handleSaveProfile}
            onCancel={handleCancelProfile}
            showToast={showToastMsg}
          />
        </DashboardLayout>
      )}

      {/* Change Password Modal Popup */}
      {showChangePasswordModal && (
        <ChangePassword
          onSave={handleSavePassword}
          onCancel={handleCancelPassword}
          showToast={showToastMsg}
        />
      )}
    </div>
  );
};
