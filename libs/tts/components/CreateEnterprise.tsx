"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  ChevronDown,
  Upload,
  Eye,
  Trash2,
  X,
  ArrowRight,
  Check,
  Loader2,
  FileText,
} from "lucide-react";
import { createBusiness, getBusinessDetail, updateBusiness, deleteBusinessAttachment, getBusinesses, getUsers } from "../services/api";
import { IndustrySearchSelect } from "./IndustrySearchSelect";
import { SearchSelect } from "./SearchSelect";


const PROVINCE_DATA: Record<string, string[]> = {
  "Thành phố Hồ Chí Minh": [
    "Phường Hiệp Bình Phước",
    "Phường Bến Nghé",
    "Phường Bến Thành",
    "Phường Cô Giang",
    "Phường Cầu Kho",
    "Phường Nguyễn Cư Trinh",
    "Phường Đa Kao",
    "Phường Tân Định",
    "Phường Phạm Ngũ Lão",
    "Phường Nguyễn Thái Bình",
    "Phường Cầu Ông Lãnh",
  ],
  "Thành phố Hà Nội": ["Phường Hàng Bạc", "Phường Tràng Tiền", "Phường Dịch Vọng", "Phường Mỹ Đình"],
  "Thành phố Đà Nẵng": ["Phường Hải Châu I", "Phường Thạch Thang", "Phường Hòa Cường Bắc"],
  "Thành phố Cần Thơ": ["Phường Ninh Kiều", "Phường An Khánh", "Phường Hưng Lợi"],
};

export interface CreateEnterpriseProps {
  businessTypes: string[];
  onSave: () => void;
  onCancel: () => void;
  showToast: (message: string, type: "success" | "error") => void;
  mode?: "create" | "edit" | "view";
  enterpriseId?: number;
}

interface AttachmentState {
  file: File | null;
  name: string;
  url: string;
  id?: number;
}

export const CreateEnterprise: React.FC<CreateEnterpriseProps> = ({
  businessTypes,
  onSave,
  onCancel,
  showToast,
  mode = "create",
  enterpriseId,
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountModalData, setAccountModalData] = useState<{ username: string; password: string } | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const isReadOnly = mode === "view";

  // Form Fields State
  const [formData, setFormData] = useState({
    businessName: "",
    taxCode: "",
    businessType: "",
    industryCode: "",
    industryName: "",
    licenseIssueDate: "",
    provinceCity: "",
    wardCommune: "",
    address: "",
    foreignName: "",
    email: "",
    agencyPhone: "",
    operatingProvinceCity: "",
    operatingWardCommune: "",
    businessLocation: "",
    representativeName: "",
    representativePhone: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountUserId, setAccountUserId] = useState<number | null>(null);

  // Attachments State
  const [attachments, setAttachments] = useState<Record<string, AttachmentState>>({
    gpkd: { file: null, name: "", url: "" },
    gtk: { file: null, name: "", url: "" },
  });

  useEffect(() => {
    if ((mode === "edit" || mode === "view") && enterpriseId) {
      const fetchDetails = async () => {
        setIsLoadingDetails(true);
        try {
          const res = await getBusinessDetail(enterpriseId);
          if (res.success && res.data) {
            const ent = res.data;
            setFormData({
              businessName: ent.businessName || "",
              taxCode: ent.taxCode || "",
              businessType: ent.businessType || "",
              industryCode: ent.industryCode || "",
              industryName: ent.industryName || "",
              licenseIssueDate: ent.licenseIssueDate || "",
              provinceCity: ent.provinceCity || "",
              wardCommune: ent.wardCommune || "",
              address: ent.address || "",
              foreignName: ent.foreignName || "",
              email: ent.email || "",
              agencyPhone: ent.agencyPhone || "",
              operatingProvinceCity: ent.operatingProvinceCity || ent.provinceCity || "",
              operatingWardCommune: ent.operatingWardCommune || ent.wardCommune || "",
              businessLocation: ent.businessLocation || "",
              representativeName: ent.representativeName || "",
              representativePhone: ent.representativePhone || "",
              isActive: ent.isActive ?? true,
            });
            if (ent.accountUserId) {
              setAccountUserId(ent.accountUserId);
            }

            // Map attachments
            const nextAttachments: Record<string, AttachmentState> = {
              gpkd: { file: null, name: "", url: "" },
              gtk: { file: null, name: "", url: "" },
            };

            if (ent.attachments && ent.attachments.length > 0) {
              ent.attachments.forEach((att) => {
                if (att.displayName === "Giấy phép kinh doanh") {
                  nextAttachments.gpkd = {
                    file: null,
                    name: att.originalName,
                    url: att.fileUrl,
                    id: att.id,
                  };
                } else if (att.displayName === "Giấy tờ khác") {
                  nextAttachments.gtk = {
                    file: null,
                    name: att.originalName,
                    url: att.fileUrl,
                    id: att.id,
                  };
                }
              });
            }
            setAttachments(nextAttachments);
          } else {
            showToast("Không thể tải chi tiết doanh nghiệp", "error");
          }
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Tải chi tiết thất bại", "error");
        } finally {
          setIsLoadingDetails(false);
        }
      };

      fetchDetails();
    }
  }, [mode, enterpriseId]);

  // File Upload Reference and Target
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  // Date input Ref
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal State
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Realtime validation for specific fields
    if (name === "taxCode") {
      const val = value.replace(/\s/g, "");
      if (!val) {
        setErrors((prev) => ({ ...prev, taxCode: "Ma so thue khong duoc de trong" }));
      } else if (!/^\d{10}(-\d{3})?$/.test(val)) {
        setErrors((prev) => ({ ...prev, taxCode: "Ma so thue phai gom 10 so hoac dang 10 so-3 so" }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.taxCode;
          return next;
        });
      }
    } else {
      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Cascading ward changes when province changes
      if (name === "provinceCity") {
        next.wardCommune = "";
      } else if (name === "operatingProvinceCity") {
        next.operatingWardCommune = "";
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleDateClick = () => {
    if (isReadOnly) return;
    try {
      dateInputRef.current?.showPicker();
    } catch {
      dateInputRef.current?.focus();
    }
  };

  // Upload trigger
  const handleUploadClick = (key: string) => {
    setUploadTarget(key);
    fileInputRef.current?.click();
  };

  // Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadTarget) return;

    const file = files[0];
    const validMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!validMimeTypes.includes(file.type)) {
      showToast("Chỉ được phép tải lên file PDF, Word hoặc hình ảnh.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("Kích thước tệp đính kèm vượt quá giới hạn 10 MB.", "error");
      return;
    }

    const url = URL.createObjectURL(file);
    setAttachments((prev) => ({
      ...prev,
      [uploadTarget]: {
        file,
        name: file.name,
        url,
      },
    }));
    showToast(`Tải lên tệp ${file.name} thành công!`, "success");
    setUploadTarget(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete attachment
  const handleDeleteAttachment = async (key: string) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa tệp đính kèm này không?");
    if (!confirmDelete) return;

    const att = attachments[key];
    if (att.id && mode === "edit" && enterpriseId) {
      try {
        const response = await deleteBusinessAttachment(enterpriseId, att.id);
        if (response.success) {
          showToast("Đã xóa tệp đính kèm khỏi máy chủ.", "success");
        } else {
          showToast(response.message || "Xóa tệp thất bại", "error");
          return;
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Xóa tệp thất bại", "error");
        return;
      }
    }

    setAttachments((prev) => ({
      ...prev,
      [key]: { file: null, name: "", url: "", id: undefined },
    }));
    if (!att.id) {
      showToast("Đã xóa tệp đính kèm.", "success");
    }
  };

  // Open Preview
  const handlePreviewClick = (key: string) => {
    const item = attachments[key];
    if (item.file) {
      setPreviewFile({
        name: item.name,
        url: item.url,
        type: item.file.type,
      });
    } else if (item.url) {
      let type = "application/pdf";
      const ext = item.name.split(".").pop()?.toLowerCase();
      if (["jpg", "jpeg", "png"].includes(ext || "")) {
        type = `image/${ext === "jpg" ? "jpeg" : ext}`;
      } else if (["doc", "docx"].includes(ext || "")) {
        type = "application/msword";
      }
      setPreviewFile({
        name: item.name,
        url: item.url,
        type,
      });
    }
  };

  // Step 1 Validation & Proceed
  const handleNextStep = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Tên doanh nghiệp không được để trống";
    }

    const txCode = formData.taxCode.replace(/\s/g, "");
    if (!txCode) {
      newErrors.taxCode = "Mã số thuế không được để trống";
    } else if (!/^\d{10}(-\d{3})?$/.test(txCode)) {
      newErrors.taxCode = "Mã số thuế phải gồm 10 chữ số, hoặc mã đơn vị phụ thuộc dạng 10 số - 3 số. Ví dụ: 0100109106-001";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Vui lòng chọn loại hình kinh doanh";
    }

    if (!formData.industryCode) {
      newErrors.industryCode = "Vui lòng chọn ngành nghề kinh doanh chính";
    }

    if (!formData.licenseIssueDate) {
      newErrors.licenseIssueDate = "Vui lòng chọn ngày cấp GPKD";
    } else {
      const d = new Date(formData.licenseIssueDate);
      if (d.getTime() > Date.now()) {
        newErrors.licenseIssueDate = "Ngày cấp GPKD không được lớn hơn ngày hiện tại";
      }
    }

    if (!formData.provinceCity) {
      newErrors.provinceCity = "Vui lòng chọn tỉnh/thành phố ĐKKD";
    }

    if (!formData.wardCommune) {
      newErrors.wardCommune = "Vui lòng chọn phường/xã ĐKKD";
    }

    const email = formData.email.trim();
    if (!email) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    const agencyPhone = formData.agencyPhone.trim();
    if (agencyPhone && !/^(0|\+84)(\d{9,10})$/.test(agencyPhone.replace(/\s/g, ""))) {
      newErrors.agencyPhone = "Số điện thoại cơ quan không hợp lệ";
    }

    const representativePhone = formData.representativePhone.trim();
    if (representativePhone && !/^(0|\+84)(\d{9,10})$/.test(representativePhone.replace(/\s/g, ""))) {
      newErrors.representativePhone = "Số điện thoại liên hệ người đứng đầu không hợp lệ";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, "error");
      return;
    }

    // Check tax code uniqueness on backend when creating new business
    if (mode === "create") {
      try {
        const checkRes = await getBusinesses({ taxCode: txCode });
        if (checkRes.success && checkRes.data && checkRes.data.items) {
          const isDuplicate = checkRes.data.items.some(
            (item) => item.taxCode.toLowerCase() === txCode.toLowerCase()
          );
          if (isDuplicate) {
            setErrors((prev) => ({ ...prev, taxCode: "Mã số thuế đã tồn tại" }));
            showToast("Mã số thuế đã tồn tại", "error");
            return;
          }
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Kiểm tra mã số thuế thất bại", "error");
        return;
      }
    }

    // Check email uniqueness on backend (for both create and edit modes)
    try {
      const checkEmailRes = await getUsers({ email });
      if (checkEmailRes.success && checkEmailRes.data && checkEmailRes.data.items) {
        const duplicateUser = checkEmailRes.data.items.find(
          (item) => item.email.toLowerCase() === email.toLowerCase()
        );
        if (duplicateUser) {
          if (mode !== "edit" || duplicateUser.id !== accountUserId) {
            setErrors((prev) => ({ ...prev, email: "Email đã được sử dụng bởi một doanh nghiệp khác." }));
            showToast("Email đã được sử dụng bởi một doanh nghiệp khác.", "error");
            return;
          }
        }
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Kiểm tra email thất bại", "error");
      return;
    }

    setStep(2);
  };

  // Step 2 Submission to Backend API
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("businessName", formData.businessName.trim());
      fd.append("taxCode", formData.taxCode.replace(/\s/g, ""));
      fd.append("businessType", formData.businessType);
      fd.append("industryCode", formData.industryCode);
      fd.append("industryName", formData.industryName);
      fd.append("licenseIssueDate", formData.licenseIssueDate);
      fd.append("provinceCity", formData.provinceCity);
      fd.append("wardCommune", formData.wardCommune);
      fd.append("address", formData.address.trim());
      fd.append("foreignName", formData.foreignName.trim());
      fd.append("email", formData.email.trim());
      fd.append("agencyPhone", formData.agencyPhone.trim());
      fd.append("operatingProvinceCity", formData.operatingProvinceCity);
      fd.append("operatingWardCommune", formData.operatingWardCommune);
      fd.append("businessLocation", formData.businessLocation.trim());
      fd.append("representativeName", formData.representativeName.trim());
      fd.append("representativePhone", formData.representativePhone.trim());
      fd.append("isActive", String(formData.isActive));

      // Build attachments list and names metadata
      const filesToSend: File[] = [];
      const namesToSend: string[] = [];

      if (attachments.gpkd.file) {
        filesToSend.push(attachments.gpkd.file);
        namesToSend.push("Giấy phép kinh doanh");
      }
      if (attachments.gtk.file) {
        filesToSend.push(attachments.gtk.file);
        namesToSend.push("Giấy tờ khác");
      }

      filesToSend.forEach((file) => {
        fd.append("attachments", file);
      });

      if (namesToSend.length > 0) {
        fd.append("attachmentNames", JSON.stringify(namesToSend));
      }

      if (mode === "edit" && enterpriseId) {
        const response = await updateBusiness(enterpriseId, fd);
        if (response.success) {
          showToast("Cập nhật doanh nghiệp thành công", "success");
          onSave();
        } else {
          throw new Error(response.message || "Cập nhật doanh nghiệp thất bại");
        }
      } else {
        const response = await createBusiness(fd);
        if (response.success) {
          const accInfo = response.data?.accountInfo || {
            username: formData.taxCode.replace(/\s/g, ""),
            password: "12345678",
          };
          setAccountModalData(accInfo);
        } else {
          throw new Error(response.message || "Tạo doanh nghiệp thất bại");
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "";
      showToast(errorMsg || (mode === "edit" ? "Cập nhật doanh nghiệp thất bại" : "Thêm mới doanh nghiệp thất bại"), "error");

      const newErrors: Record<string, string> = {};
      if (errorMsg.includes("Mã số thuế") || errorMsg.toLowerCase().includes("taxcode") || errorMsg.includes("đăng nhập")) {
        newErrors.taxCode = errorMsg;
        setStep(1);
      } else if (errorMsg.includes("Email") || errorMsg.toLowerCase().includes("email")) {
        newErrors.email = errorMsg;
        setStep(2);
      } else if (errorMsg.includes("Tên doanh nghiệp") || errorMsg.toLowerCase().includes("businessname")) {
        newErrors.businessName = errorMsg;
        setStep(1);
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between border-t-4 border-emerald-600 bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm border border-zinc-200/60 dark:border-zinc-800/80">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-50 select-none">
          {mode === "view" ? "Chi tiết doanh nghiệp" : mode === "edit" ? "Chỉnh sửa doanh nghiệp" : "Thêm mới doanh nghiệp"}
        </h2>
      </div>

      {/* Wizard Step Indicator */}
      {mode !== "view" && (
        <div className="flex items-center w-full gap-4 py-4 select-none bg-transparent border-0 shadow-none">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">
              {step > 1 ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "1"}
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Thông tin doanh nghiệp
            </span>
          </div>

          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 2 ? "bg-blue-600 text-white" : "bg-slate-400 dark:bg-zinc-800 text-white"
            }`}>
              2
            </div>
            <span className={`text-xs font-bold ${
              step === 2 ? "text-zinc-800 dark:text-zinc-200" : "text-slate-400 dark:text-zinc-500"
            }`}>
              Xác nhận đăng ký
            </span>
          </div>

          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>
      )}

      {step === 1 ? (
        /* =======================================================
           STEP 1: INPUT INFORMATION
           ======================================================= */
        <div className="flex flex-col gap-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
          />

          {/* Section 1: Thông tin doanh nghiệp */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-[#1e3a8a] dark:text-[#93c5fd] uppercase tracking-wider select-none border-b border-zinc-50 dark:border-zinc-900 pb-2 mb-4">
              Thông tin doanh nghiệp
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* Tên doanh nghiệp */}
              <div className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${errors.businessName ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-800"
                } ${isReadOnly ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${errors.businessName ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                  Tên doanh nghiệp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                  placeholder={isReadOnly ? "" : "Nhập tên doanh nghiệp"}
                />
              </div>

              {/* Mã số thuế */}
              <div className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${errors.taxCode ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-800"
                } ${(mode === "edit" || isReadOnly) ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${errors.taxCode ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                  Mã số thuế <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="taxCode"
                  value={formData.taxCode}
                  onChange={handleInputChange}
                  disabled={mode === "edit" || isReadOnly}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 font-mono disabled:cursor-not-allowed"
                  placeholder={isReadOnly ? "" : "Nhập mã số thuế"}
                />
              </div>

              {/* Loại hình kinh doanh */}
              <SearchSelect
                label="Loại hình kinh doanh"
                value={formData.businessType}
                options={businessTypes.map((t) => ({ value: t, label: t }))}
                placeholder="Chọn loại hình"
                onChange={(val) => handleSelectChange("businessType", val)}
                error={!!errors.businessType}
                required
                disabled={isReadOnly}
              />

              {/* Ngành nghề kinh doanh chính */}
              <div className="w-full">
                <IndustrySearchSelect
                  value={formData.industryCode}
                  error={!!errors.industryCode}
                  disabled={isReadOnly}
                  onChange={(code: string, name: string) => {
                    setFormData((prev) => ({ ...prev, industryCode: code, industryName: name }));
                    if (errors.industryCode) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.industryCode;
                        return next;
                      });
                    }
                  }}
                />
              </div>

              {/* Ngày cấp GPKD */}
              <div
                onClick={handleDateClick}
                className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${errors.licenseIssueDate ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-800"
                  } ${isReadOnly ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : "cursor-pointer"}`}
              >
                <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold pointer-events-none ${errors.licenseIssueDate ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                  Ngày cấp GPKD <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center justify-between w-full pt-2 pb-0.5">
                  <input
                    ref={dateInputRef}
                    type="date"
                    name="licenseIssueDate"
                    value={formData.licenseIssueDate}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold focus:ring-0 ${isReadOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
                  />
                  <Calendar className="absolute right-0 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Tỉnh/Thành phố ĐKKD */}
              <SearchSelect
                label="Tỉnh/Thành phố ĐKKD"
                value={formData.provinceCity}
                options={Object.keys(PROVINCE_DATA).map((p) => ({ value: p, label: p }))}
                placeholder="Chọn Tỉnh/Thành phố"
                onChange={(val) => handleSelectChange("provinceCity", val)}
                error={!!errors.provinceCity}
                required
                disabled={isReadOnly}
              />

              {/* Phường/Xã ĐKKD */}
              <SearchSelect
                label="Phường/Xã ĐKKD"
                value={formData.wardCommune}
                options={(!formData.provinceCity ? [] : (PROVINCE_DATA[formData.provinceCity] || []).map((w) => ({ value: w, label: w })))}
                placeholder={!formData.provinceCity ? "Vui lòng chọn Tỉnh/Thành phố trước" : "Chọn phường/xã"}
                onChange={(val) => handleSelectChange("wardCommune", val)}
                error={!!errors.wardCommune}
                required
                disabled={!formData.provinceCity || isReadOnly}
              />

              {/* Địa chỉ đăng ký */}
              <div className={`relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 md:col-span-2 xl:col-span-2 ${isReadOnly ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                  placeholder={isReadOnly ? "" : "Nhập địa chỉ trụ sở đăng ký"}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin liên hệ */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-[#1e3a8a] dark:text-[#93c5fd] uppercase tracking-wider select-none border-b border-zinc-50 dark:border-zinc-900 pb-2 mb-4">
              Thông tin liên hệ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* Tên tiếng nước ngoài */}
              <div className={`relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 ${isReadOnly ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
                  Tên viết bằng tiếng nước ngoài
                </label>
                <input
                  type="text"
                  name="foreignName"
                  value={formData.foreignName}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                  placeholder={isReadOnly ? "" : "Nhập tên viết bằng tiếng nước ngoài"}
                />
              </div>

              {/* Email */}
              <div className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-800"
                } ${isReadOnly ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${errors.email ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                  placeholder={isReadOnly ? "" : "vna@gmail.com"}
                />
              </div>

              {/* Số điện thoại cơ quan */}
              <div className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${errors.agencyPhone ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-800"
                } ${isReadOnly ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${errors.agencyPhone ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                  Số điện thoại cơ quan
                </label>
                <input
                  type="text"
                  name="agencyPhone"
                  value={formData.agencyPhone}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 font-mono disabled:cursor-not-allowed"
                  placeholder={isReadOnly ? "" : "Nhập số điện thoại cơ quan"}
                />
              </div>

              {/* Tỉnh/TP hoạt động KD */}
              <SearchSelect
                label="Tỉnh/TP hoạt động KD"
                value={formData.operatingProvinceCity}
                options={Object.keys(PROVINCE_DATA).map((p) => ({ value: p, label: p }))}
                placeholder="Chọn Tỉnh/Thành phố"
                onChange={(val) => handleSelectChange("operatingProvinceCity", val)}
                disabled={isReadOnly}
              />

              {/* Phường/Xã hoạt động KD */}
              <SearchSelect
                label="Phường/xã hoạt động KD"
                value={formData.operatingWardCommune}
                options={(!formData.operatingProvinceCity ? [] : (PROVINCE_DATA[formData.operatingProvinceCity] || []).map((w) => ({ value: w, label: w })))}
                placeholder={!formData.operatingProvinceCity ? "Vui lòng chọn Tỉnh/Thành phố trước" : "Chọn phường/xã"}
                onChange={(val) => handleSelectChange("operatingWardCommune", val)}
                disabled={!formData.operatingProvinceCity || isReadOnly}
              />

              {/* Địa điểm kinh doanh */}
              <div className={`relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 ${isReadOnly ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
                  Địa điểm kinh doanh
                </label>
                <input
                  type="text"
                  name="businessLocation"
                  value={formData.businessLocation}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                  placeholder={isReadOnly ? "" : "Nhập địa điểm hoạt động kinh doanh"}
                />
              </div>

              {/* Người đứng đầu doanh nghiệp */}
              <div className={`relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 ${isReadOnly ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-bold">
                  Người đứng đầu doanh nghiệp
                </label>
                <input
                  type="text"
                  name="representativeName"
                  value={formData.representativeName}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                  placeholder={isReadOnly ? "" : "Nhập tên người đứng đầu"}
                />
              </div>

              {/* SĐT liên hệ người đứng đầu */}
              <div className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${errors.representativePhone ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-800"
                } ${isReadOnly ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${errors.representativePhone ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                  SĐT liên hệ người đứng đầu
                </label>
                <input
                  type="text"
                  name="representativePhone"
                  value={formData.representativePhone}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 font-mono disabled:cursor-not-allowed"
                  placeholder={isReadOnly ? "" : "Nhập số điện thoại"}
                />
              </div>
            </div>
          </div>

          {/* Section 3: File đính kèm */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#1e3a8a] dark:text-[#93c5fd] uppercase tracking-wider select-none border-b border-zinc-50 dark:border-zinc-900 pb-2 mb-4">
              File đính kèm
            </h3>

            <div className="overflow-x-auto border border-zinc-150 dark:border-zinc-850 rounded-xl">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/10 border-b border-zinc-150 dark:border-zinc-800 select-none text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                    <th className="p-3.5">Tên file</th>
                    <th className="p-3.5">Thông tin file</th>
                    <th className="p-3.5 w-32 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {/* GPKD File Row */}
                  <tr className="border-b border-zinc-100 dark:border-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                    <td className="p-3.5 font-bold">Giấy phép kinh doanh</td>
                    <td className="p-3.5 font-mono text-zinc-500">
                      {attachments.gpkd.name || "Chưa tải lên file"}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => (attachments.gpkd.file || attachments.gpkd.url) && handlePreviewClick("gpkd")}
                          disabled={!attachments.gpkd.file && !attachments.gpkd.url}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-green-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
                          title="Xem file"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        {mode !== "view" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUploadClick("gpkd")}
                              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-blue-600 cursor-pointer transition-all"
                              title="Tải lên file"
                            >
                              <Upload className="w-4.5 h-4.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => (attachments.gpkd.file || attachments.gpkd.url) && handleDeleteAttachment("gpkd")}
                              disabled={!attachments.gpkd.file && !attachments.gpkd.url}
                              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
                              title="Xóa file"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* GTK File Row */}
                  <tr className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                    <td className="p-3.5 font-bold">Giấy tờ khác</td>
                    <td className="p-3.5 font-mono text-zinc-500">
                      {attachments.gtk.name || "Chưa tải lên file"}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => (attachments.gtk.file || attachments.gtk.url) && handlePreviewClick("gtk")}
                          disabled={!attachments.gtk.file && !attachments.gtk.url}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-green-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
                          title="Xem file"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        {mode !== "view" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUploadClick("gtk")}
                              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-blue-600 cursor-pointer transition-all"
                              title="Tải lên file"
                            >
                              <Upload className="w-4.5 h-4.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => (attachments.gtk.file || attachments.gtk.url) && handleDeleteAttachment("gtk")}
                              disabled={!attachments.gtk.file && !attachments.gtk.url}
                              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
                              title="Xóa file"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex items-center justify-end gap-6 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm select-none font-bold text-sm">
            {mode === "view" ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                Đóng
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Tiếp tục</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* =======================================================
           STEP 2: CONFIRM INFORMATION
           ======================================================= */
        <div className="flex flex-col gap-6">
          {/* Card Thông tin hồ sơ */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-bold text-[#1e3a8a] dark:text-[#93c5fd] uppercase tracking-wider select-none border-b border-zinc-50 dark:border-zinc-900 pb-2 mb-4">
              Thông tin hồ sơ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-y-4 gap-x-10 text-sm">
              <div className="font-semibold text-[#333333] dark:text-zinc-300">Mã số thuế :</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">{formData.taxCode}</div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">Tên doanh nghiệp :</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">{formData.businessName}</div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">Tên viết bằng tiếng nước ngoài :</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">{formData.foreignName || "-"}</div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">Ngày cấp GPKD:</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">
                {formData.licenseIssueDate ? formData.licenseIssueDate.split("-").reverse().join("/") : "-"}
              </div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">Email</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">{formData.email}</div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">Loại hình kinh doanh:</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">{formData.businessType}</div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">Ngành nghề kinh doanh</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">
                {formData.industryCode ? `${formData.industryCode} - ${formData.industryName}` : "-"}
              </div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">Địa chỉ đăng ký giấy phép kinh doanh :</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">
                {[formData.address, formData.wardCommune, formData.provinceCity].filter(Boolean).join(", ")}
              </div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">Địa điểm kinh doanh :</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">
                {[formData.businessLocation, formData.operatingWardCommune || formData.wardCommune, formData.operatingProvinceCity || formData.provinceCity].filter(Boolean).join(", ")}
              </div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">Người đứng đầu doanh nghiệp</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">{formData.representativeName || "-"}</div>

              <div className="font-semibold text-[#333333] dark:text-zinc-300">SĐT người đứng đầu</div>
              <div className="font-medium text-[#333333] dark:text-zinc-200">{formData.representativePhone || "-"}</div>
            </div>
          </div>

          {/* Attachments Preview List */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="overflow-x-auto border border-zinc-150 dark:border-zinc-850 rounded-xl">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/10 border-b border-zinc-150 dark:border-zinc-800 select-none text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                    <th className="p-3.5">Tên file</th>
                    <th className="p-3.5">Thông tin file</th>
                    <th className="p-3.5 w-24 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                    <td className="p-3.5 font-bold">Giấy phép kinh doanh</td>
                    <td className="p-3.5 font-mono text-zinc-500">{attachments.gpkd.name || "Không đính kèm"}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => (attachments.gpkd.file || attachments.gpkd.url) && handlePreviewClick("gpkd")}
                          disabled={!attachments.gpkd.file && !attachments.gpkd.url}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-green-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
                          title="Xem file"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                    <td className="p-3.5 font-bold">Giấy tờ khác</td>
                    <td className="p-3.5 font-mono text-zinc-500">{attachments.gtk.name || "Không đính kèm"}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => (attachments.gtk.file || attachments.gtk.url) && handlePreviewClick("gtk")}
                          disabled={!attachments.gtk.file && !attachments.gtk.url}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-green-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
                          title="Xem file"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex items-center justify-end gap-6 bg-transparent p-0 select-none font-bold text-sm">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Trở về
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xác nhận</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preview File Dialog Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div onClick={() => setPreviewFile(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[20px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
            <div className="bg-blue-600 dark:bg-blue-700 text-white py-4.5 px-6 font-bold text-base flex items-center justify-between">
              <span className="truncate max-w-[80%]">Xem trước tài liệu: {previewFile.name}</span>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/10 p-6 overflow-hidden flex items-center justify-center">
              {previewFile.type.startsWith("image/") ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800"
                />
              ) : previewFile.type === "application/pdf" ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-full rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center select-none bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm max-w-md">
                  <FileText className="w-16 h-16 text-blue-600 mb-4" />
                  <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{previewFile.name}</p>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                    Tài liệu định dạng Word hoặc kiểu tệp này không thể hiển thị trực tiếp. Vui lòng tải xuống để xem.
                  </p>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 active:scale-98 transition-all"
                  >
                    Tải xuống tệp tin
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {accountModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[20px] w-full max-w-[420px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Header màu xanh */}
            <div className="bg-blue-600 dark:bg-blue-700 text-white py-4 text-center font-bold text-lg select-none tracking-wide">
              Thông tin tài khoản
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 bg-white dark:bg-zinc-950">
              <ul className="flex flex-col gap-3 text-sm text-zinc-700 dark:text-zinc-350">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <span>Tài khoản: <strong className="text-zinc-900 dark:text-white font-extrabold">{accountModalData.username}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <span>Mật khẩu: <strong className="text-zinc-900 dark:text-white font-extrabold">{accountModalData.password}</strong></span>
                </li>
              </ul>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalData(null);
                    onSave(); // Đóng popup và đóng màn hình đăng ký quay lại danh sách
                  }}
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalData(null);
                    showToast("Khai báo thành công", "success");
                    onSave(); // Đóng popup, đóng màn hình và refresh danh sách
                  }}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Lưu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
