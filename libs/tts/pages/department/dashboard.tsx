"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, LogOut, X } from "lucide-react";
import { ChangePassword, DashboardLayout, Sidebar, UserProfile } from "../../components";
import type { UserData } from "../../components/UserProfile";
import {
  changePassword,
  clearAuthTokens,
  getAccessToken,
  getStoredUserData,
  mapBackendUserToUserData,
  updateMe,
} from "../../services/api";

const EMPTY_USER_DATA: UserData = {
  avatarUrl: "",
  username: "",
  fullName: "",
  dob: "",
  gender: "",
  title: "",
  role: "",
  email: "",
  province: "",
  ward: "",
  address: "",
  isActive: true,
};

export const DepartmentDashboardScreen: React.FC = () => {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData>(EMPTY_USER_DATA);
  const [initialUserData, setInitialUserData] = useState<UserData>(EMPTY_USER_DATA);
  const [profileResetKey, setProfileResetKey] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeView, setActiveView] = useState<"profile" | "change-password">("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/department/login");
      return;
    }

    const storedUserData = getStoredUserData();
    if (!storedUserData) {
      clearAuthTokens();
      router.replace("/department/login");
      return;
    }

    const timer = window.setTimeout(() => {
      setUserData(storedUserData);
      setInitialUserData(storedUserData);
      setProfileResetKey((current) => current + 1);
      setIsLoadingProfile(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const showToastMsg = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleSaveProfile = async (updatedData: UserData, successMessage?: string) => {
    try {
      const response = await updateMe(updatedData);
      const nextUserData = mapBackendUserToUserData(response.data);
      setUserData(nextUserData);
      setInitialUserData(nextUserData);
      setProfileResetKey((current) => current + 1);
      showToastMsg(String(successMessage || response.message || "Cập nhật thông tin thành công"), "success");
    } catch (error) {
      showToastMsg(error instanceof Error ? error.message : "Cập nhật thông tin thất bại", "error");
    }
  };

  const handleCancelProfile = () => {
    setUserData({ ...initialUserData });
    setProfileResetKey((current) => current + 1);
    showToastMsg("Đã khôi phục dữ liệu ban đầu.", "success");
  };

  const handleSavePassword = async (
    currentPw: string,
    newPw: string,
    confirmPw: string,
  ) => {
    try {
      const response = await changePassword(currentPw, newPw, confirmPw);
      showToastMsg(String(response.message || "Đổi mật khẩu thành công"), "success");
      setShowChangePasswordModal(false);
    } catch (error) {
      showToastMsg(error instanceof Error ? error.message : "Đổi mật khẩu thất bại", "error");
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    clearAuthTokens();
    showToastMsg("Đang đăng xuất khỏi hệ thống...", "success");
    window.setTimeout(() => {
      router.push("/department/login");
    }, 700);
  };

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
      onLogout={() => setShowLogoutConfirm(true)}
      activeItem={activeView === "profile" ? "quan_ly_nguoi_dung" : ""}
      onCloseMobile={() => setMobileMenuOpen(false)}
    />
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border bg-white px-5 py-4 text-sm font-semibold shadow-2xl dark:bg-zinc-900 ${
            toast.type === "success"
              ? "border-emerald-200/80 text-emerald-800 dark:border-emerald-900/40 dark:text-emerald-300"
              : "border-red-200/80 text-red-800 dark:border-red-900/40 dark:text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          )}
          <span className="pr-4">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowLogoutConfirm(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
              <LogOut className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Xác nhận đăng xuất</h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?
              </p>
            </div>
            <div className="mt-2 flex w-full items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/10 transition-all hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoadingProfile ? (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-500">
          Đang tải thông tin người dùng...
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

      {showChangePasswordModal && (
        <ChangePassword
          onSave={handleSavePassword}
          onCancel={() => {
            setShowChangePasswordModal(false);
            showToastMsg("Đã hủy bỏ đổi mật khẩu.", "success");
          }}
          showToast={showToastMsg}
        />
      )}
    </div>
  );
};
