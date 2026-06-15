"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  X,
  Save,
  Trash2,
} from "lucide-react";
import { getUsers, updateUserAdmin, createUser, type UserListItem, type UserListMeta } from "../services/api";
import { CreateUser } from "./CreateUser";

interface UserManagementProps {
  showToast: (message: string, type: "success" | "error") => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ showToast }) => {
  // State for list & metadata
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [meta, setMeta] = useState<UserListMeta>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Query/Filters state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    fullName: "",
    username: "",
    email: "",
    role: "",
    position: "",
    isActive: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals state
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<UserListItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load user data on filter/pagination changes
  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const response = await getUsers({
          page,
          limit,
          fullName: filters.fullName,
          username: filters.username,
          email: filters.email,
          role: filters.role,
          position: filters.position,
          isActive: filters.isActive,
        });

        if (active && response.success && response.data) {
          setUsers(response.data.items);
          setMeta(response.data.meta);
        }
      } catch (error) {
        if (active) {
          showToast(error instanceof Error ? error.message : "Không thể tải danh sách người dùng", "error");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    const delayDebounceFn = setTimeout(() => {
      loadUsers();
    }, 400);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [page, limit, filters, showToast]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  // Toggle Single Checkbox Selection
  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle All Checkboxes
  const handleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  // Toggle User Status Switch
  const handleToggleActive = async (user: UserListItem) => {
    const originalUsers = [...users];
    // Optimistic Update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
    );

    try {
      const response = await updateUserAdmin(user.id, {
        isActive: !user.isActive,
      });
      if (response.success) {
        showToast("Cập nhật trạng thái người dùng thành công", "success");
      } else {
        throw new Error("Cập nhật thất bại");
      }
    } catch (error) {
      // Revert if error
      setUsers(originalUsers);
      showToast(error instanceof Error ? error.message : "Cập nhật trạng thái thất bại", "error");
    }
  };

  const handleSaveEdit = () => {
    setEditingUser(null);
    setPage(1); // Refresh list
  };

  const handleSavePasswordReset = () => {
    setPasswordResetUser(null);
  };

  const handleDeleteSelected = () => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} người dùng đã chọn không?`);
    if (!confirmDelete) return;

    setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
    showToast("Xóa danh sách người dùng thành công", "success");
    setSelectedIds([]);
  };

  const handleSaveCreate = async (formData: any) => {
    try {
      const response = await createUser({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        gender: formData.gender,
        dateOfBirth: formData.dob,
        position: formData.title,
        roleCode: formData.role,
        isActive: formData.isActive,
        avatar: formData.avatarUrl,
        provinceCity: formData.province,
        wardCommune: formData.ward,
        address: formData.address,
      });

      if (response.success && response.data) {
        const backendUser = response.data;
        const newUser: UserListItem = {
          id: Number(backendUser.id),
          fullName: backendUser.fullName || "",
          username: backendUser.username || "",
          email: backendUser.email || "",
          avatar: backendUser.avatar || null,
          position: backendUser.position || "",
          isActive: backendUser.isActive ?? true,
          statusLabel: backendUser.isActive ? "Đang hoạt động" : "Đang khóa",
          roles: (backendUser.roles || []).map((r: any, idx: number) => ({
            id: typeof r === "object" ? r.id || idx : idx,
            code: typeof r === "object" ? r.code : r,
            name: typeof r === "object" ? r.name : r,
          })),
          roleCodes: (backendUser.roles || []).map((r: any) => typeof r === "object" ? r.code : r),
          roleNames: (backendUser.roles || []).map((r: any) => typeof r === "object" ? r.name : r),
          roleDisplay: (backendUser.roles || []).map((r: any) => typeof r === "object" ? r.name : r).join(", ") || "Người dùng",
          createdAt: backendUser.createdAt || new Date().toISOString(),
          updatedAt: backendUser.updatedAt || new Date().toISOString(),
        };
        setUsers((prev) => [newUser, ...prev]);
        showToast("Thêm mới người dùng thành công", "success");
        setIsAddingNew(false);
      } else {
        throw new Error(response.message || "Tạo người dùng thất bại");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Thêm mới người dùng thất bại", "error");
    }
  };

  if (isAddingNew) {
    return (
      <CreateUser
        onSave={handleSaveCreate}
        onCancel={() => setIsAddingNew(false)}
        showToast={showToast}
      />
    );
  }

  const startIdx = (meta.page - 1) * meta.limit + 1;
  const endIdx = Math.min(meta.page * meta.limit, meta.totalItems);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between border-t-4 border-emerald-600 bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm border border-zinc-200/60 dark:border-zinc-800/80">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 select-none">
          Danh sách người dùng
        </h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold text-xs select-none transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button 
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {/* Row 1: Header Titles */}
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-zinc-500 dark:text-zinc-400 text-xs font-bold select-none bg-zinc-50/50 dark:bg-zinc-900/10">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-4 w-24 text-center">Tác vụ</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Tài khoản</th>
                <th className="p-4">Email</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Chức danh</th>
                <th className="p-4 text-center">Trạng thái</th>
              </tr>
              {/* Row 2: Inline Column Filters */}
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:border-blue-500 transition-colors"
                    placeholder="Tìm họ tên"
                    value={filters.fullName}
                    onChange={(e) => handleFilterChange("fullName", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:border-blue-500 transition-colors"
                    placeholder="Tìm tài khoản"
                    value={filters.username}
                    onChange={(e) => handleFilterChange("username", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:border-blue-500 transition-colors"
                    placeholder="Tìm email"
                    value={filters.email}
                    onChange={(e) => handleFilterChange("email", e.target.value)}
                  />
                </td>
                <td className="p-2 relative min-w-[130px]">
                  <select
                    className="w-full text-xs pl-3 pr-8 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 appearance-none cursor-pointer focus:border-blue-500 transition-colors"
                    value={filters.role}
                    onChange={(e) => handleFilterChange("role", e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="USER">Người dùng</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:border-blue-500 transition-colors"
                    placeholder="Tìm chức danh"
                    value={filters.position}
                    onChange={(e) => handleFilterChange("position", e.target.value)}
                  />
                </td>
                <td className="p-2 relative min-w-[130px]">
                  <select
                    className="w-full text-xs pl-3 pr-8 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 appearance-none cursor-pointer focus:border-blue-500 transition-colors"
                    value={filters.isActive}
                    onChange={(e) => handleFilterChange("isActive", e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Đang khóa</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                </td>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-zinc-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <span className="text-sm font-semibold select-none">Đang tải danh sách người dùng...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-zinc-400 dark:text-zinc-500 font-semibold select-none text-sm">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => handleSelectRow(user.id)}
                        className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => setEditingUser(user)}
                          title="Sửa thông tin"
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer group"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] text-slate-400 group-hover:text-blue-600 transition-colors">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M21.178 7.178a2 2 0 1 1 2.822 2.822L17.5 16.5l-2.5.5.5-2.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setPasswordResetUser(user)}
                          title="Đổi mật khẩu"
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer group"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] text-slate-400 group-hover:text-amber-600 transition-colors">
                            <path d="M21 2L12.7 10.3" />
                            <path d="M15 5.5l3 3" />
                            <path d="M11 9.5l2 2" />
                            <circle cx="7.5" cy="16.5" r="4.5" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">{user.fullName || "-"}</td>
                    <td className="p-4 font-mono text-xs">{user.username}</td>
                    <td className="p-4 text-zinc-500 dark:text-zinc-400 text-xs">{user.email || "-"}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                        {user.roleDisplay || "Người dùng"}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{user.position || "-"}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer
                          ${user.isActive ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"}
                        `}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm
                            ${user.isActive ? "translate-x-6" : "translate-x-1"}
                          `}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-500 select-none">
          <button 
            onClick={() => showToast("Chức năng xuất dữ liệu đang được phát triển", "success")}
            className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <select
                className="px-2 py-1 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 outline-none text-zinc-700 dark:text-zinc-300 cursor-pointer"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span>
              {meta.totalItems > 0 ? `${startIdx} - ${endIdx} of ${meta.totalItems}` : "0 - 0 of 0"}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!meta.hasPreviousPage || isLoading}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                disabled={!meta.hasNextPage || isLoading}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal Dialog */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleSaveEdit}
          onCancel={() => setEditingUser(null)}
          showToast={showToast}
        />
      )}

      {/* Reset Password Modal Dialog */}
      {passwordResetUser && (
        <ResetPasswordModal
          user={passwordResetUser}
          onSave={handleSavePasswordReset}
          onCancel={() => setPasswordResetUser(null)}
          showToast={showToast}
        />
      )}

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex items-center justify-between overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 dark:border-zinc-800 dark:bg-zinc-900 -translate-x-1/2">
          <div className="flex items-center">
            <div className="flex min-w-[40px] h-10 items-center justify-center bg-blue-600 px-3 text-sm font-bold text-white">
              {selectedIds.length}
            </div>
            <span className="px-3.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 select-none">
              dữ liệu được chọn
            </span>
          </div>
          <div className="flex items-center gap-3 pr-3">
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs px-3.5 py-1.5 flex items-center gap-1.5 transition-all shadow-md shadow-red-500/10 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
              </svg>
              <span>Xoá</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title="Bỏ chọn"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Edit User Modal Component
// ==========================================
interface EditUserModalProps {
  user: UserListItem;
  onSave: () => void;
  onCancel: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onSave, onCancel, showToast }) => {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [position, setPosition] = useState(user.position || "");
  const [roleCode, setRoleCode] = useState(user.roleCodes[0] || "USER");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Vui lòng nhập họ và tên", "error");
      return;
    }
    if (!username.trim()) {
      showToast("Vui lòng nhập tên đăng nhập", "error");
      return;
    }
    if (!email.trim()) {
      showToast("Vui lòng nhập email", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateUserAdmin(user.id, {
        fullName,
        username,
        email,
        position,
        roleCode,
      });

      if (response.success) {
        showToast("Cập nhật thông tin người dùng thành công", "success");
        onSave();
      } else {
        throw new Error(response.message || "Cập nhật thất bại");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Cập nhật người dùng thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={isSubmitting ? undefined : onCancel} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[20px] w-full max-w-[460px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
      >
        <div className="bg-blue-600 dark:bg-blue-700 text-white py-4 text-center font-bold text-base select-none tracking-wide">
          Sửa thông tin người dùng
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Full Name */}
          <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950">
            <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Username */}
          <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950">
            <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950">
            <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Position */}
          <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950">
            <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
              Chức danh
            </label>
            <input
              type="text"
              className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          {/* Role selection */}
          <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950">
            <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center justify-between w-full pt-2 pb-0.5">
              <select
                className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold appearance-none cursor-pointer focus:ring-0 pr-8"
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value)}
              >
                <option value="ADMIN">Quản trị viên</option>
                <option value="USER">Người dùng</option>
              </select>
              <ChevronDown className="absolute right-0 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-5 px-6 pb-6 select-none font-bold text-sm">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// Reset Password Modal Component
// ==========================================
interface ResetPasswordModalProps {
  user: UserListItem;
  onSave: () => void;
  onCancel: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onSave, onCancel, showToast }) => {
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showToast("Vui lòng nhập mật khẩu mới", "error");
      return;
    }
    if (newPassword.trim().length < 6) {
      showToast("Mật khẩu mới phải từ 6 ký tự trở lên", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateUserAdmin(user.id, {
        password: newPassword.trim(),
      });

      if (response.success) {
        showToast("Đặt lại mật khẩu thành công", "success");
        onSave();
      } else {
        throw new Error(response.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={isSubmitting ? undefined : onCancel} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[20px] w-full max-w-[420px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
      >
        <div className="bg-blue-600 dark:bg-blue-700 text-white py-4 text-center font-bold text-lg select-none tracking-wide">
          Xác nhận
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-zinc-850 dark:text-zinc-150 text-sm font-semibold select-none">
            Khởi tạo mật khẩu cho tài khoản <strong className="font-extrabold">{user.username}</strong>
          </p>

          <input
            type="password"
            className="w-full text-xs px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:border-blue-500 transition-colors"
            placeholder="Nhập mật khẩu mới mong muốn"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-5 px-6 pb-6 select-none text-xs font-bold">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer focus:outline-none"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <path d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
            <span>{isSubmitting ? "Đang lưu..." : "Lưu"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
