"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  Save,
  Printer,
  Send
} from "lucide-react";

interface TnldTheoHdldProps {
  showToast: (message: string, type: "success" | "error") => void;
}

interface AccidentDetailBlock {
  id: number;
  causeCategory: string;
  factorCategory: string;
  jobCategory: string;
  
  // Nhóm 1: Thống kê số vụ & nạn nhân
  tongSoVu: string;
  soVuCoNguoiChet: string;
  soVuHaiNguoiTroLen: string;
  tongSoNguoiBiNan: string;
  soLaoDongNuBiNan: string;
  soNguoiChet: string;
  soNguoiThuongNang: string;
  soNguoiBiNanKhongQL: string;
  laoDongNuBiNanKhongQL: string;
  soNguoiChetKhongQL: string;
  soNguoiThuongNangKhongQL: string;

  // Nhóm 2: Thiệt hại chi phí
  chiPhiYTe: string;
  chiPhiLuong: string;
  chiPhiBoiThuong: string;
  tongChiPhi: string;
  soNgayNghi: string;
  thietHaiTaiSan: string;
}

interface ReportData {
  id: number;
  year: number;
  period: string; // "6 tháng" | "Cả năm"
  status: "Đang báo cáo" | "Đã tiếp nhận";
  enterpriseName: string;
  taxCode: string;
  businessType: string;
  industry: string;
  
  // Section 1: Thông tin doanh nghiệp
  laoDongCoSo: string;
  laoDongNu: string;
  quyLuong: string; // đơn vị: 1.000đ

  // Section 2: 1. Tai nạn lao động
  // Nhóm 1: Tổng số vụ & số nạn nhân
  tongSoVu: string;
  soVuCoNguoiChet: string;
  soVuHaiNguoiTroLen: string;
  tongSoNguoiBiNan: string;
  soLaoDongNuBiNan: string;
  soNguoiChet: string;
  soNguoiThuongNang: string;
  soNguoiBiNanKhongQL: string;
  laoDongNuBiNanKhongQL: string;
  soNguoiChetKhongQL: string;
  soNguoiThuongNangKhongQL: string;

  // Nhóm 2: Thiệt hại do tai nạn lao động
  chiPhiYTe: string;
  chiPhiLuong: string;
  chiPhiBoiThuong: string;
  tongChiPhi: string;
  soNgayNghi: string;
  thietHaiTaiSan: string;

  // Tab 2: Khối chi tiết động
  details: AccidentDetailBlock[];

  // Section 3: 2. Tai nạn lao động được hưởng trợ cấp (Chứa 17 trường giống Section 1)
  tc_tongSoVu: string;
  tc_soVuCoNguoiChet: string;
  tc_soVuHaiNguoiTroLen: string;
  tc_tongSoNguoiBiNan: string;
  tc_soLaoDongNuBiNan: string;
  tc_soNguoiChet: string;
  tc_soNguoiThuongNang: string;
  tc_soNguoiBiNanKhongQL: string;
  tc_laoDongNuBiNanKhongQL: string;
  tc_soNguoiChetKhongQL: string;
  tc_soNguoiThuongNangKhongQL: string;

  tc_chiPhiYTe: string;
  tc_chiPhiLuong: string;
  tc_chiPhiBoiThuong: string;
  tc_tongChiPhi: string;
  tc_soNgayNghi: string;
  tc_thietHaiTaiSan: string;
}

const DEFAULT_REPORT_LIST: ReportData[] = [
  {
    id: 1,
    year: 2022,
    period: "6 tháng",
    status: "Đang báo cáo",
    enterpriseName: "CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ VẬN TẢI PHẠM THIÊN ÂN",
    taxCode: "0317118106",
    businessType: "Công ty trách nhiệm hữu hạn tư nhân",
    industry: "Sản xuất cơ khí hàng tiêu dùng",
    laoDongCoSo: "10",
    laoDongNu: "5",
    quyLuong: "10.2",
    tongSoVu: "1",
    soVuCoNguoiChet: "1",
    soVuHaiNguoiTroLen: "1",
    tongSoNguoiBiNan: "10",
    soLaoDongNuBiNan: "5",
    soNguoiChet: "5",
    soNguoiThuongNang: "10",
    soNguoiBiNanKhongQL: "0",
    laoDongNuBiNanKhongQL: "0",
    soNguoiChetKhongQL: "0",
    soNguoiThuongNangKhongQL: "0",
    chiPhiYTe: "10.000.000",
    chiPhiLuong: "10.000.000",
    chiPhiBoiThuong: "10.000.000",
    tongChiPhi: "30.000.000",
    soNgayNghi: "20",
    thietHaiTaiSan: "10.000.000",
    details: [
      {
        id: 1,
        causeCategory: "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn",
        factorCategory: "Thiết bị nâng",
        jobCategory: "Nhà lãnh đạo cơ quan Đảng Cộng sản Việt nam cấp Trung ương",
        tongSoVu: "1",
        soVuCoNguoiChet: "1",
        soVuHaiNguoiTroLen: "1",
        tongSoNguoiBiNan: "10",
        soLaoDongNuBiNan: "5",
        soNguoiChet: "5",
        soNguoiThuongNang: "10",
        soNguoiBiNanKhongQL: "0",
        laoDongNuBiNanKhongQL: "0",
        soNguoiChetKhongQL: "0",
        soNguoiThuongNangKhongQL: "0",
        chiPhiYTe: "10.000.000",
        chiPhiLuong: "10.000.000",
        chiPhiBoiThuong: "10.000.000",
        tongChiPhi: "30.000.000",
        soNgayNghi: "20",
        thietHaiTaiSan: "10.000.000"
      }
    ],
    tc_tongSoVu: "2",
    tc_soVuCoNguoiChet: "1",
    tc_soVuHaiNguoiTroLen: "1",
    tc_tongSoNguoiBiNan: "10",
    tc_soLaoDongNuBiNan: "5",
    tc_soNguoiChet: "5",
    tc_soNguoiThuongNang: "10",
    tc_soNguoiBiNanKhongQL: "0",
    tc_laoDongNuBiNanKhongQL: "0",
    tc_soNguoiChetKhongQL: "0",
    tc_soNguoiThuongNangKhongQL: "0",
    tc_chiPhiYTe: "10.000.000",
    tc_chiPhiLuong: "10.000.000",
    tc_chiPhiBoiThuong: "10.000.000",
    tc_tongChiPhi: "30.000.000",
    tc_soNgayNghi: "20",
    tc_thietHaiTaiSan: "10.000.000"
  },
  {
    id: 2,
    year: 2022,
    period: "Cả năm",
    status: "Đã tiếp nhận",
    enterpriseName: "CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ VẬN TẢI PHẠM THIÊN ÂN",
    taxCode: "0317118106",
    businessType: "Công ty trách nhiệm hữu hạn tư nhân",
    industry: "Sản xuất cơ khí hàng tiêu dùng",
    laoDongCoSo: "12",
    laoDongNu: "6",
    quyLuong: "24.5",
    tongSoVu: "0",
    soVuCoNguoiChet: "0",
    soVuHaiNguoiTroLen: "0",
    tongSoNguoiBiNan: "0",
    soLaoDongNuBiNan: "0",
    soNguoiChet: "0",
    soNguoiThuongNang: "0",
    soNguoiBiNanKhongQL: "0",
    laoDongNuBiNanKhongQL: "0",
    soNguoiChetKhongQL: "0",
    soNguoiThuongNangKhongQL: "0",
    chiPhiYTe: "0",
    chiPhiLuong: "0",
    chiPhiBoiThuong: "0",
    tongChiPhi: "0",
    soNgayNghi: "0",
    thietHaiTaiSan: "0",
    details: [],
    tc_tongSoVu: "0",
    tc_soVuCoNguoiChet: "0",
    tc_soVuHaiNguoiTroLen: "0",
    tc_tongSoNguoiBiNan: "0",
    tc_soLaoDongNuBiNan: "0",
    tc_soNguoiChet: "0",
    tc_soNguoiThuongNang: "0",
    tc_soNguoiBiNanKhongQL: "0",
    tc_laoDongNuBiNanKhongQL: "0",
    tc_soNguoiChetKhongQL: "0",
    tc_soNguoiThuongNangKhongQL: "0",
    tc_chiPhiYTe: "0",
    tc_chiPhiLuong: "0",
    tc_chiPhiBoiThuong: "0",
    tc_tongChiPhi: "0",
    tc_soNgayNghi: "0",
    tc_thietHaiTaiSan: "0"
  }
];

const CAUSE_CATEGORIES = [
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

const FACTOR_CATEGORIES = [
  "Thiết bị nâng",
  "Máy gia công cắt gọt kim loại, gỗ",
  "Điện giật",
  "Ngã từ trên cao",
  "Vật rơi, vật văng bắn",
  "Nhiệt độ cao, bỏng lửa",
  "Khác"
];

const JOB_CATEGORIES = [
  "Nhà lãnh đạo cơ quan Đảng Cộng sản Việt nam cấp Trung ương",
  "Công nhân",
  "Nhà quản lý, điều hành doanh nghiệp",
  "Kỹ sư, kỹ thuật viên chuyên nghiệp",
  "Thợ vận hành máy và thiết bị",
  "Lao động thủ công giản đơn",
  "Khác"
];

export const TnldTheoHdld: React.FC<TnldTheoHdldProps> = ({ showToast }) => {
  const [reports, setReports] = useState<ReportData[]>(DEFAULT_REPORT_LIST);
  const [viewMode, setViewMode] = useState<"list" | "declaration">("list");
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  // Year Filter in List
  const [selectedYearFilter, setSelectedYearFilter] = useState<number>(2022);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Sections navigation state
  type ReportSection = "enterprise-info" | "accident-stats" | "accident-benefits" | "general-view";
  const [currentSection, setCurrentSection] = useState<ReportSection>("enterprise-info");
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);

  // Tab state in Section 1
  const [activeTab, setActiveTab] = useState<"totals" | "details">("totals");

  // Main editable form data
  const [formData, setFormData] = useState<ReportData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Collapsible state for dynamic blocks in Tab 2
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>({});
  // Block errors
  const [blockErrors, setBlockErrors] = useState<Record<number, Record<string, string>>>({});
  
  // Modals state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Format Helper with dots
  const formatNumberWithDots = (val: string | number) => {
    if (val === undefined || val === null || val === "") return "";
    const clean = String(val).replace(/\D/g, "");
    if (!clean) return "";
    return Number(clean).toLocaleString("vi-VN");
  };

  const parseDotsToNumber = (formattedStr: string) => {
    if (!formattedStr) return 0;
    const cleanStr = String(formattedStr).replace(/\./g, "");
    return cleanStr ? Number(cleanStr) : 0;
  };

  // Synchronize reports list from localStorage on mount
  useEffect(() => {
    const storedReports = localStorage.getItem("vna_reports_list");
    if (storedReports) {
      try {
        setReports(JSON.parse(storedReports));
      } catch (e) {
        console.error("Lỗi parse danh sách báo cáo từ localStorage", e);
      }
    }
  }, []);

  // Update reports list helper
  const updateReportsList = (nextReports: ReportData[]) => {
    setReports(nextReports);
    localStorage.setItem("vna_reports_list", JSON.stringify(nextReports));
  };

  // Load temporary session state if editing/viewing
  const handleEditClick = (report: ReportData, readOnly: boolean = false) => {
    setSelectedReport(report);
    setIsReadOnly(readOnly);
    setCurrentSection(readOnly ? "general-view" : "enterprise-info");
    setActiveTab("totals");
    setErrors({});
    setBlockErrors({});
    
    // Check session cache first
    const cached = sessionStorage.getItem(`vna_report_form_${report.id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setFormData(parsed);
        if (parsed.details && parsed.details.length > 0) {
          setExpandedBlocks({ 1: true });
        }
      } catch (e) {
        setFormData({ ...report });
      }
    } else {
      setFormData({ ...report });
      if (report.details && report.details.length > 0) {
        setExpandedBlocks({ 1: true });
      }
    }
    
    setViewMode("declaration");
  };

  // Keep state saved temporarily in sessionStorage on every formData change
  useEffect(() => {
    if (formData) {
      sessionStorage.setItem(`vna_report_form_${formData.id}`, JSON.stringify(formData));
    }
  }, [formData]);

  // Handle Text inputs
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData || isReadOnly) return;
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);

    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Handle count fields (statistical integers)
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData || isReadOnly) return;
    const { name, value } = e.target;
    
    const digitsOnly = value.replace(/\D/g, "");
    
    setFormData(prev => {
      if (!prev) return null;
      let updated = { ...prev, [name]: digitsOnly };

      // DYNAMIC ACCIDENT BLOCKS SYNCHRONIZATION
      if (name === "tongSoVu") {
        const count = Number(digitsOnly || 0);
        const nextDetails = [...(prev.details || [])];
        
        if (nextDetails.length < count) {
          // Add missing blocks
          for (let i = nextDetails.length; i < count; i++) {
            nextDetails.push({
              id: i + 1,
              causeCategory: CAUSE_CATEGORIES[0],
              factorCategory: FACTOR_CATEGORIES[0],
              jobCategory: JOB_CATEGORIES[0],
              tongSoVu: "1",
              soVuCoNguoiChet: "0",
              soVuHaiNguoiTroLen: "0",
              tongSoNguoiBiNan: "0",
              soLaoDongNuBiNan: "0",
              soNguoiChet: "0",
              soNguoiThuongNang: "0",
              soNguoiBiNanKhongQL: "0",
              laoDongNuBiNanKhongQL: "0",
              soNguoiChetKhongQL: "0",
              soNguoiThuongNangKhongQL: "0",
              chiPhiYTe: "0",
              chiPhiLuong: "0",
              chiPhiBoiThuong: "0",
              tongChiPhi: "0",
              soNgayNghi: "0",
              thietHaiTaiSan: "0"
            });
            setExpandedBlocks(ex => ({ ...ex, [i + 1]: true }));
          }
        } else if (nextDetails.length > count) {
          // Remove excess blocks
          nextDetails.splice(count);
        }
        
        updated.details = nextDetails;
      }

      return updated;
    });

    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Handle Money changes
  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData || isReadOnly) return;
    const { name, value } = e.target;
    
    const formatted = formatNumberWithDots(value);
    
    setFormData(prev => {
      if (!prev) return null;
      const updated = { ...prev, [name]: formatted };

      // Autocalculate total costs inside Nhóm 2 Section 1
      if (name === "chiPhiYTe" || name === "chiPhiLuong" || name === "chiPhiBoiThuong") {
        const yte = parseDotsToNumber(name === "chiPhiYTe" ? formatted : prev.chiPhiYTe);
        const luong = parseDotsToNumber(name === "chiPhiLuong" ? formatted : prev.chiPhiLuong);
        const boithuong = parseDotsToNumber(name === "chiPhiBoiThuong" ? formatted : prev.chiPhiBoiThuong);
        updated.tongChiPhi = formatNumberWithDots(yte + luong + boithuong);
      }

      // Autocalculate total costs inside Section 2 (Trợ cấp)
      if (name === "tc_chiPhiYTe" || name === "tc_chiPhiLuong" || name === "tc_chiPhiBoiThuong") {
        const yte = parseDotsToNumber(name === "tc_chiPhiYTe" ? formatted : prev.tc_chiPhiYTe);
        const luong = parseDotsToNumber(name === "tc_chiPhiLuong" ? formatted : prev.tc_chiPhiLuong);
        const boithuong = parseDotsToNumber(name === "tc_chiPhiBoiThuong" ? formatted : prev.tc_chiPhiBoiThuong);
        updated.tc_tongChiPhi = formatNumberWithDots(yte + luong + boithuong);
      }

      return updated;
    });

    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // DYNAMIC BLOCK INPUT CHANGES
  const handleBlockTextChange = (blockIdx: number, field: keyof AccidentDetailBlock, val: string) => {
    if (!formData || isReadOnly) return;
    
    setFormData(prev => {
      if (!prev) return null;
      const nextDetails = (prev.details || []).map((b, idx) => {
        if (idx === blockIdx) {
          const updated = { ...b, [field]: val };
          
          if (field === "chiPhiYTe" || field === "chiPhiLuong" || field === "chiPhiBoiThuong") {
            const yte = parseDotsToNumber(field === "chiPhiYTe" ? val : b.chiPhiYTe);
            const luong = parseDotsToNumber(field === "chiPhiLuong" ? val : b.chiPhiLuong);
            const boithuong = parseDotsToNumber(field === "chiPhiBoiThuong" ? val : b.chiPhiBoiThuong);
            updated.tongChiPhi = formatNumberWithDots(yte + luong + boithuong);
          }
          return updated;
        }
        return b;
      });
      return { ...prev, details: nextDetails };
    });

    // Clear specific block field error
    if (blockErrors[blockIdx] && blockErrors[blockIdx][field]) {
      setBlockErrors(prev => {
        const next = { ...prev };
        const blockErrs = { ...next[blockIdx] };
        delete blockErrs[field];
        if (Object.keys(blockErrs).length === 0) {
          delete next[blockIdx];
        } else {
          next[blockIdx] = blockErrs;
        }
        return next;
      });
    }
  };

  const handleBlockCountChange = (blockIdx: number, field: keyof AccidentDetailBlock, val: string) => {
    const digitsOnly = val.replace(/\D/g, "");
    handleBlockTextChange(blockIdx, field, digitsOnly);
  };

  const handleBlockMoneyChange = (blockIdx: number, field: keyof AccidentDetailBlock, val: string) => {
    const formatted = formatNumberWithDots(val);
    handleBlockTextChange(blockIdx, field, formatted);
  };

  // Section 2 specific fields change
  const handleTcCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData || isReadOnly) return;
    const { name, value } = e.target;
    const digitsOnly = value.replace(/\D/g, "");
    setFormData(prev => prev ? ({ ...prev, [name]: digitsOnly }) : null);

    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Block expansion toggler
  const toggleBlock = (blockId: number) => {
    setExpandedBlocks(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  // Validation function for current step
  const validateSection = (sec: ReportSection): boolean => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};

    if (sec === "enterprise-info") {
      if (!formData.laoDongCoSo) newErrors.laoDongCoSo = "Vui lòng nhập tổng số lao động";
      if (!formData.laoDongNu) newErrors.laoDongNu = "Vui lòng nhập tổng số lao động nữ";
      if (!formData.quyLuong) newErrors.quyLuong = "Vui lòng nhập tổng quỹ lương";

      const total = Number(formData.laoDongCoSo || 0);
      const nu = Number(formData.laoDongNu || 0);
      if (nu > total) {
        newErrors.laoDongNu = "Số lao động nữ không được vượt quá tổng số lao động";
      }
    } else if (sec === "accident-stats") {
      // 1. Validate general statistics (Tab 1 fields)
      const countFields = [
        "tongSoVu", "soVuCoNguoiChet", "soVuHaiNguoiTroLen", "tongSoNguoiBiNan",
        "soLaoDongNuBiNan", "soNguoiChet", "soNguoiThuongNang", "soNguoiBiNanKhongQL",
        "laoDongNuBiNanKhongQL", "soNguoiChetKhongQL", "soNguoiThuongNangKhongQL"
      ];
      countFields.forEach(f => {
        if (!formData[f as keyof ReportData]) {
          newErrors[f] = "Bắt buộc";
        }
      });

      const costFields = ["chiPhiYTe", "chiPhiLuong", "chiPhiBoiThuong", "soNgayNghi"];
      costFields.forEach(f => {
        if (!formData[f as keyof ReportData]) {
          newErrors[f] = "Bắt buộc";
        }
      });

      const tongVu = Number(formData.tongSoVu || 0);
      const vuChet = Number(formData.soVuCoNguoiChet || 0);
      if (vuChet > tongVu) {
        newErrors.soVuCoNguoiChet = "Số vụ có người chết không thể lớn hơn tổng số vụ";
      }

      // 2. Validate dynamic accident detail blocks if tongSoVu > 0
      if (tongVu > 0) {
        let blockHasError = false;
        const newBlockErrors: Record<number, Record<string, string>> = {};

        (formData.details || []).forEach((block, idx) => {
          const blockErrs: Record<string, string> = {};
          
          countFields.forEach(f => {
            if (!block[f as keyof AccidentDetailBlock]) {
              blockErrs[f] = "Bắt buộc";
              blockHasError = true;
            }
          });

          costFields.forEach(f => {
            if (!block[f as keyof AccidentDetailBlock]) {
              blockErrs[f] = "Bắt buộc";
              blockHasError = true;
            }
          });

          if (Object.keys(blockErrs).length > 0) {
            newBlockErrors[idx] = blockErrs;
            setExpandedBlocks(prev => ({ ...prev, [idx + 1]: true }));
          }
        });

        if (blockHasError) {
          setBlockErrors(newBlockErrors);
          showToast("Vui lòng nhập đầy đủ thông tin chi tiết các vụ tai nạn lao động trước khi tiếp tục.", "error");
          setActiveTab("details");
          return false;
        }
      }
    } else if (sec === "accident-benefits") {
      const tcFields = [
        "tc_tongSoVu", "tc_soVuCoNguoiChet", "tc_soVuHaiNguoiTroLen", "tc_tongSoNguoiBiNan",
        "tc_soLaoDongNuBiNan", "tc_soNguoiChet", "tc_soNguoiThuongNang", "tc_soNguoiBiNanKhongQL",
        "tc_laoDongNuBiNanKhongQL", "tc_soNguoiChetKhongQL", "tc_soNguoiThuongNangKhongQL",
        "tc_chiPhiYTe", "tc_chiPhiLuong", "tc_chiPhiBoiThuong", "tc_soNgayNghi"
      ];
      tcFields.forEach(f => {
        if (!formData[f as keyof ReportData]) {
          newErrors[f] = "Bắt buộc";
        }
      });
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast("Vui lòng kiểm tra lại các trường thông tin lỗi đỏ", "error");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (isReadOnly) {
      if (currentSection === "enterprise-info") {
        setCurrentSection("accident-stats");
      } else if (currentSection === "accident-stats") {
        setCurrentSection("accident-benefits");
      } else if (currentSection === "accident-benefits") {
        setCurrentSection("general-view");
      }
      return;
    }

    if (validateSection(currentSection)) {
      if (currentSection === "enterprise-info") {
        setCurrentSection("accident-stats");
        setActiveTab("totals");
      } else if (currentSection === "accident-stats") {
        setCurrentSection("accident-benefits");
      } else if (currentSection === "accident-benefits") {
        setCurrentSection("general-view");
      }
    }
  };

  const handleSectionSelect = (sec: ReportSection) => {
    setShowSectionDropdown(false);
    
    if (isReadOnly) {
      setCurrentSection(sec);
      return;
    }

    const order: ReportSection[] = ["enterprise-info", "accident-stats", "accident-benefits", "general-view"];
    const currIdx = order.indexOf(currentSection);
    const targetIdx = order.indexOf(sec);

    if (targetIdx > currIdx) {
      for (let i = currIdx; i < targetIdx; i++) {
        if (!validateSection(order[i])) {
          setCurrentSection(order[i]);
          return;
        }
      }
    }

    setCurrentSection(sec);
  };

  // Submit and update the state
  const handleSave = () => {
    if (!formData || isReadOnly) return;

    if (!validateSection("enterprise-info")) {
      setCurrentSection("enterprise-info");
      return;
    }
    if (!validateSection("accident-stats")) {
      setCurrentSection("accident-stats");
      return;
    }
    if (!validateSection("accident-benefits")) {
      setCurrentSection("accident-benefits");
      return;
    }

    // Save final report data to reports list and store in local database (localStorage)
    const updated = reports.map(r => 
      r.id === formData.id ? { ...formData, status: "Đã tiếp nhận" as const } : r
    );
    updateReportsList(updated);
    
    // Clear session cache
    sessionStorage.removeItem(`vna_report_form_${formData.id}`);

    showToast("Lưu báo cáo tai nạn lao động thành công!", "success");
    setViewMode("list");
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    if (formData) {
      sessionStorage.removeItem(`vna_report_form_${formData.id}`);
    }
    setViewMode("list");
    showToast("Đã hủy bỏ khai báo báo cáo.", "success");
  };

  // Actions in General View
  const handlePrint = () => {
    showToast("Đang kết xuất in file báo cáo tình hình tai nạn lao động...", "success");
  };

  const handleSubmitReport = () => {
    if (!formData || isReadOnly) return;
    const updated = reports.map(r => 
      r.id === formData.id ? { ...formData, status: "Đã tiếp nhận" as const } : r
    );
    updateReportsList(updated);
    sessionStorage.removeItem(`vna_report_form_${formData.id}`);
    showToast("Báo cáo tình hình tai nạn lao động đã được gửi thành công!", "success");
    setViewMode("list");
  };

  // Dynamic Aggregation sums for General View Table
  const sumBlocks = (field: keyof AccidentDetailBlock) => {
    if (!formData || !formData.details) return 0;
    return formData.details.reduce((sum, block) => {
      const val = block[field];
      return sum + (field === "chiPhiYTe" || field === "chiPhiLuong" || field === "chiPhiBoiThuong" || field === "thietHaiTaiSan"
        ? parseDotsToNumber(String(val))
        : Number(val || 0));
    }, 0);
  };

  const sumBlocksByCause = (cause: string, field: keyof AccidentDetailBlock) => {
    if (!formData || !formData.details) return 0;
    return formData.details
      .filter(block => block.causeCategory === cause)
      .reduce((sum, block) => {
        const val = block[field];
        return sum + (field === "chiPhiYTe" || field === "chiPhiLuong" || field === "chiPhiBoiThuong" || field === "thietHaiTaiSan"
          ? parseDotsToNumber(String(val))
          : Number(val || 0));
      }, 0);
  };

  const sumBlocksByFactor = (factor: string, field: keyof AccidentDetailBlock) => {
    if (!formData || !formData.details) return 0;
    return formData.details
      .filter(block => block.factorCategory === factor)
      .reduce((sum, block) => {
        const val = block[field];
        return sum + (field === "chiPhiYTe" || field === "chiPhiLuong" || field === "chiPhiBoiThuong" || field === "thietHaiTaiSan"
          ? parseDotsToNumber(String(val))
          : Number(val || 0));
      }, 0);
  };

  const sumBlocksByJob = (job: string, field: keyof AccidentDetailBlock) => {
    if (!formData || !formData.details) return 0;
    return formData.details
      .filter(block => block.jobCategory === job)
      .reduce((sum, block) => {
        const val = block[field];
        return sum + (field === "chiPhiYTe" || field === "chiPhiLuong" || field === "chiPhiBoiThuong" || field === "thietHaiTaiSan"
          ? parseDotsToNumber(String(val))
          : Number(val || 0));
      }, 0);
  };

  const sumCol = (field1: keyof AccidentDetailBlock, field2: keyof ReportData) => {
    if (!formData) return 0;
    const val1 = sumBlocks(field1);
    const rawVal2 = formData[field2];
    const val2 = typeof rawVal2 === "string" || typeof rawVal2 === "number"
      ? parseDotsToNumber(String(rawVal2))
      : 0;
    return val1 + val2;
  };

  // Helper row renderer for general cause view
  const renderCauseRow = (title: string, code: string) => {
    return (
      <tr key={code} className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        <td className="p-3 text-left pl-8">{title}</td>
        <td className="p-3 text-center bg-zinc-50/50 dark:bg-zinc-900/10 font-bold">{code}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "tongSoVu")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "soVuCoNguoiChet")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "soVuHaiNguoiTroLen")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "tongSoNguoiBiNan")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "soNguoiBiNanKhongQL")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "soLaoDongNuBiNan")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "laoDongNuBiNanKhongQL")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "soNguoiChet")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "soNguoiChetKhongQL")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "soNguoiThuongNang")}</td>
        <td className="p-3 text-center">{sumBlocksByCause(title, "soNguoiThuongNangKhongQL")}</td>
      </tr>
    );
  };

  // Render Job codes
  const getJobCode = (job: string) => {
    const idx = JOB_CATEGORIES.indexOf(job);
    return idx !== -1 ? String(102 + idx) : "108";
  };

  // Render Factor codes
  const getFactorCode = (factor: string) => {
    const idx = FACTOR_CATEGORIES.indexOf(factor);
    return idx !== -1 ? String(101 + idx) : "107";
  };

  // Dropdown list label mapping
  const getSectionLabel = (sec: ReportSection) => {
    switch (sec) {
      case "enterprise-info":
        return "Thông tin doanh nghiệp";
      case "accident-stats":
        return "1. Tai nạn lao động";
      case "accident-benefits":
        return "2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ";
      case "general-view":
        return "Xem tổng quan báo cáo tai nạn lao động";
    }
  };

  if (viewMode === "list") {
    const filteredReports = reports.filter(r => r.year === selectedYearFilter);

    return (
      <div className="flex flex-col gap-6 h-full select-none">
        {/* Banner with year dropdown */}
        <div className="flex items-center justify-between border-t-4 border-[#0b2868] bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm border border-zinc-200/60 dark:border-zinc-800/80">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
            Báo cáo định kỳ Tai nạn lao động
          </h2>
          <div className="relative">
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold text-sm transition-colors cursor-pointer"
            >
              <span>{selectedYearFilter}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>
            {showYearDropdown && (
              <div className="absolute right-0 mt-1.5 w-28 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {[2022, 2023, 2024, 2025].map(year => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYearFilter(year);
                      setShowYearDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 font-semibold ${
                      selectedYearFilter === year
                        ? "text-[#0b2868] bg-blue-50/40 dark:bg-blue-950/20 dark:text-blue-400"
                        : "text-zinc-650 dark:text-zinc-400"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-zinc-500 dark:text-zinc-400 text-xs font-bold bg-zinc-50/50 dark:bg-zinc-900/10">
                  <th className="p-4 w-28 text-center">Thao tác</th>
                  <th className="p-4">Tên doanh nghiệp</th>
                  <th className="p-4 w-44">Mã số thuế</th>
                  <th className="p-4 w-44">Kỳ báo cáo</th>
                  <th className="p-4 w-40 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-400 dark:text-zinc-500 font-semibold text-sm">
                      Không tìm thấy báo cáo nào cho năm {selectedYearFilter}.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(rep => (
                    <tr
                      key={rep.id}
                      className="border-b border-zinc-200/50 dark:border-zinc-800/80 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3.5">
                          <button
                            onClick={() => handleEditClick(rep, true)}
                            title="Xem chi tiết"
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer group"
                          >
                            <Eye className="h-[18px] w-[18px] text-zinc-400 group-hover:text-green-600 transition-colors" />
                          </button>
                          {rep.status === "Đang báo cáo" && (
                            <button
                              onClick={() => handleEditClick(rep, false)}
                              title="Chỉnh sửa khai báo"
                              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer group"
                            >
                              <Pencil className="h-[18px] w-[18px] text-zinc-400 group-hover:text-blue-600 transition-colors" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {rep.enterpriseName}
                      </td>
                      <td className="p-4 font-mono text-xs text-zinc-655 dark:text-zinc-345">
                        {rep.taxCode}
                      </td>
                      <td className="p-4 text-zinc-800 dark:text-zinc-200">
                        {rep.period}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-50 dark:bg-zinc-900 select-none">
                          <span className={`w-2 h-2 rounded-full ${
                            rep.status === "Đang báo cáo"
                              ? "bg-gray-400"
                              : "bg-blue-600 animate-pulse"
                          }`} />
                          <span className={
                            rep.status === "Đang báo cáo" ? "text-zinc-550" : "text-blue-600"
                          }>
                            {rep.status}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-500">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select className="px-1.5 py-1 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300">
                  <option value={10}>10</option>
                </select>
              </div>
              <span>1 - {filteredReports.length} of {filteredReports.length}</span>
              <div className="flex items-center gap-1">
                <button className="p-1 text-zinc-300 cursor-not-allowed" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 text-zinc-300 cursor-not-allowed" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Declaration View Screen
  return (
    <div className="flex flex-col gap-6 h-full pb-8 select-none">
      {/* Top Banner Control Panel */}
      <div className="flex items-center justify-between border-t-4 border-[#0b2868] bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm border border-zinc-200/60 dark:border-zinc-800/80">
        <h2 className="text-md font-bold text-zinc-850 dark:text-zinc-100 flex items-center gap-2">
          <span>Báo cáo định kỳ Tai nạn lao động</span>
        </h2>
        <div className="flex items-center gap-3.5">
          {isReadOnly ? (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-5 py-2 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50/20 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In báo cáo</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <span>Đóng</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-zinc-550 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-bold text-sm transition-all cursor-pointer"
              >
                Huỷ bỏ
              </button>
              
              {/* Action buttons inside General View */}
              {currentSection === "general-view" ? (
                <>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-5 py-2 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50/20 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In báo cáo</span>
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi báo cáo</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleContinue}
                    className="flex items-center gap-1.5 px-5 py-2 border border-[#0b2868] bg-white hover:bg-blue-50/20 text-[#0b2868] rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-6 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Select Report Section Dropdown (Hover Color: System Blue) */}
      {!isReadOnly && (
        <div className="relative w-full">
          <div className="relative w-full border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all">
            <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
              Chọn mục báo cáo
            </label>
            <button
              onClick={() => setShowSectionDropdown(!showSectionDropdown)}
              className="w-full flex items-center justify-between bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-bold pt-2.5 pb-0.5 text-left cursor-pointer"
            >
              <span>{getSectionLabel(currentSection)}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {showSectionDropdown && (
            <div className="absolute left-0 mt-2 w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl z-50 p-1.5 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1.5 duration-150">
              {(["enterprise-info", "accident-stats", "accident-benefits", "general-view"] as ReportSection[]).map(sec => (
                <button
                  key={sec}
                  onClick={() => handleSectionSelect(sec)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-all rounded-xl cursor-pointer ${
                    currentSection === sec
                      ? "text-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:text-blue-400"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700 dark:hover:text-white"
                  }`}
                >
                  {getSectionLabel(sec)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER DECLARATION PAGE PANELS */}
      {formData && (
        <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
          {/* ========================================== */}
          {/* SECTION 1: THÔNG TIN DOANH NGHIỆP */}
          {/* ========================================== */}
          {currentSection === "enterprise-info" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-zinc-150/70 dark:border-zinc-800 pb-3 flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  1. Thông tin công ty
                </h3>
                <p className="text-xs font-bold text-red-500 leading-normal">
                  *** Lưu ý: nhập tổng quỹ lương 6 tháng khi khai báo TNLĐ 6 tháng hoặc tổng quỹ lương 12 tháng khi khai báo TNLĐ cả năm
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                {/* Tên công ty (disabled) */}
                <div className="relative border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center bg-zinc-50 dark:bg-zinc-900/40 opacity-70">
                  <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
                    Tên công ty
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-transparent border-0 outline-none text-zinc-650 dark:text-zinc-355 text-sm font-semibold pt-2 pb-0.5 cursor-not-allowed"
                    value={formData.enterpriseName}
                  />
                </div>

                {/* Loại hình công ty (disabled) */}
                <div className="relative border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center bg-zinc-50 dark:bg-zinc-900/40 opacity-70">
                  <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
                    Loại hình công ty
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-transparent border-0 outline-none text-zinc-650 dark:text-zinc-355 text-sm font-semibold pt-2 pb-0.5 cursor-not-allowed"
                    value={formData.businessType}
                  />
                </div>

                {/* Ngành nghề kinh doanh (disabled) */}
                <div className="relative border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center bg-zinc-50 dark:bg-zinc-900/40 opacity-70">
                  <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
                    Ngành nghề kinh doanh
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-transparent border-0 outline-none text-zinc-655 dark:text-zinc-355 text-sm font-semibold pt-2 pb-0.5 cursor-not-allowed"
                    value={formData.industry}
                  />
                </div>

                {/* Tổng số lao động của cơ sở */}
                <div className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-955 transition-all ${
                  errors.laoDongCoSo ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-850"
                } ${isReadOnly ? "opacity-70 bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                  <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${
                    errors.laoDongCoSo ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                    Tổng số lao động của cơ sở {!isReadOnly && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="laoDongCoSo"
                    value={formData.laoDongCoSo}
                    onChange={handleCountChange}
                    disabled={isReadOnly}
                    className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                  {errors.laoDongCoSo && (
                    <span className="text-[10px] text-red-500 mt-1 font-semibold">{errors.laoDongCoSo}</span>
                  )}
                </div>

                {/* Tổng số lao động nữ */}
                <div className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-955 transition-all ${
                  errors.laoDongNu ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-850"
                } ${isReadOnly ? "opacity-70 bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                  <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${
                    errors.laoDongNu ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                    Tổng số lao động nữ {!isReadOnly && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="laoDongNu"
                    value={formData.laoDongNu}
                    onChange={handleCountChange}
                    disabled={isReadOnly}
                    className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                  {errors.laoDongNu && (
                    <span className="text-[10px] text-red-500 mt-1 font-semibold">{errors.laoDongNu}</span>
                  )}
                </div>

                {/* Tổng quỹ lương */}
                <div className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-955 transition-all ${
                  errors.quyLuong ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-850"
                } ${isReadOnly ? "opacity-70 bg-zinc-50 dark:bg-zinc-900/40" : ""}`}>
                  <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${
                    errors.quyLuong ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                    Tổng quỹ lương {!isReadOnly && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative flex items-center justify-between w-full pt-2 pb-0.5">
                    <input
                      type="text"
                      name="quyLuong"
                      value={formData.quyLuong}
                      onChange={handleTextChange}
                      disabled={isReadOnly}
                      className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold disabled:cursor-not-allowed pr-14"
                      placeholder="0.0"
                    />
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 select-none pr-1 pointer-events-none">
                      (1.000đ)
                    </span>
                  </div>
                  {errors.quyLuong && (
                    <span className="text-[10px] text-red-500 mt-1 font-semibold">{errors.quyLuong}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SECTION 2: 1. TAI NẠN LAO ĐỘNG (TAB INDICATORS) */}
          {/* ========================================== */}
          {currentSection === "accident-stats" && (
            <div className="flex flex-col gap-5">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-0 flex flex-col gap-1.5">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 select-none leading-normal">
                  **** Doanh nghiệp xảy ra tai nạn lao động vui lòng nhập theo từng bước
                </p>
                
                {/* Active Tab Indicators: Standard blue/gray highlights with borders */}
                <div className="flex items-center gap-2 mt-3 -mb-px">
                  <button
                    type="button"
                    onClick={() => setActiveTab("totals")}
                    className={`px-5 py-3 text-xs font-bold relative transition-all cursor-pointer rounded-t-xl border-t border-x ${
                      activeTab === "totals"
                        ? "text-white bg-blue-600 border-blue-600 dark:bg-blue-700 dark:border-blue-700"
                        : "text-zinc-500 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-800 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-850"
                    }`}
                  >
                    (1) Tổng số vụ tai nạn lao động
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className={`px-5 py-3 text-xs font-bold relative transition-all cursor-pointer rounded-t-xl border-t border-x ${
                      activeTab === "details"
                        ? "text-white bg-blue-600 border-blue-600 dark:bg-blue-700 dark:border-blue-700"
                        : "text-zinc-500 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-800 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-850"
                    }`}
                  >
                    (2) Chi tiết các vụ tai nạn lao động
                  </button>
                </div>
              </div>

              {/* Info banner showing the current active sub-section */}
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50/30 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-400 select-none animate-in fade-in duration-200">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span>
                  Bạn đang ở mục: {activeTab === "totals" ? "(1) Tổng số vụ tai nạn lao động" : "(2) Chi tiết các vụ tai nạn lao động"}
                </span>
              </div>

              {/* TAB 1: TOTAL COUNTS & DAMAGES */}
              {activeTab === "totals" && (
                <div className="flex flex-col gap-6 mt-1">
                  {/* Nhóm 1: Tổng số vụ & số nạn nhân */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      1. Tổng số vụ tai nạn lao động & số nạn nhân tai nạn lao động
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[
                        { label: "Tổng số vụ", name: "tongSoVu" },
                        { label: "Tổng số vụ có người chết", name: "soVuCoNguoiChet" },
                        { label: "Tổng số vụ có từ 2 người bị nạn trở lên", name: "soVuHaiNguoiTroLen" },
                        { label: "Tổng số người bị nạn", name: "tongSoNguoiBiNan" },
                        { label: "Tổng số lao động nữ bị nạn", name: "soLaoDongNuBiNan" },
                        { label: "Tổng số người bị chết", name: "soNguoiChet" },
                        { label: "Tổng số người bị thương nặng", name: "soNguoiThuongNang" },
                        { label: "Số người bị nạn không QL", name: "soNguoiBiNanKhongQL" },
                        { label: "Lao động nữ bị nạn không QL", name: "laoDongNuBiNanKhongQL" },
                        { label: "Số người chết không QL", name: "soNguoiChetKhongQL" },
                        { label: "Người bị thương nặng không QL", name: "soNguoiThuongNangKhongQL" },
                      ].map(field => (
                        <div
                          key={field.name}
                          className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${
                            errors[field.name] ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-850"
                          } ${isReadOnly ? "opacity-70 bg-zinc-50 dark:bg-zinc-900/40" : ""}`}
                        >
                          <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${
                            errors[field.name] ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                          }`}>
                            {field.label} {!isReadOnly && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            name={field.name}
                            value={formData[field.name as keyof ReportData] as string}
                            onChange={handleCountChange}
                            disabled={isReadOnly}
                            className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                            placeholder="0"
                          />
                          {errors[field.name] && (
                            <span className="text-[10px] text-red-500 mt-1 font-semibold">{errors[field.name]}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm 2: Thiệt hại */}
                  <div className="flex flex-col gap-4 mt-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      2. Thiệt hại do tai nạn lao động
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[
                        { label: "Chi phí y tế", name: "chiPhiYTe", isMoney: true },
                        { label: "Chi phí trả lương trong thời gian điều trị", name: "chiPhiLuong", isMoney: true },
                        { label: "Chi phí bồi thường trợ cấp", name: "chiPhiBoiThuong", isMoney: true },
                        { label: "Tổng số tiền chi phí", name: "tongChiPhi", isMoney: true, isReadOnlyOverride: true },
                        { label: "Tổng số ngày nghỉ vì TNLĐ", name: "soNgayNghi" },
                        { label: "Thiệt hại tài sản", name: "thietHaiTaiSan", isMoney: true, isOptional: true },
                      ].map(field => {
                        const showAsterisk = !isReadOnly && !field.isOptional;
                        const inputReadOnly = isReadOnly || field.isReadOnlyOverride;

                        return (
                          <div
                            key={field.name}
                            className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${
                              errors[field.name] ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-850"
                            } ${inputReadOnly ? "opacity-70 bg-zinc-50 dark:bg-zinc-900/40" : ""}`}
                          >
                            <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${
                              errors[field.name] ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                            }`}>
                              {field.label} {showAsterisk && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative flex items-center justify-between w-full pt-2 pb-0.5">
                              <input
                                type="text"
                                name={field.name}
                                value={formData[field.name as keyof ReportData] as string}
                                onChange={field.isMoney ? handleMoneyChange : handleCountChange}
                                disabled={inputReadOnly}
                                className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold disabled:cursor-not-allowed pr-14"
                                placeholder="0"
                              />
                              {field.isMoney && (
                                <span className="text-xs text-zinc-400 dark:text-zinc-500 select-none pr-1 pointer-events-none">
                                  (1.000đ)
                                </span>
                              )}
                            </div>
                            {errors[field.name] && (
                              <span className="text-[10px] text-red-500 mt-1 font-semibold">{errors[field.name]}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DYNAMIC ACCIDENT BLOCKS */}
              {activeTab === "details" && (
                <div className="flex flex-col gap-6 mt-1 select-none animate-in fade-in duration-200">
                  {Number(formData.tongSoVu || 0) === 0 ? (
                    <div className="border border-zinc-200 dark:border-zinc-850 rounded-2xl p-12 text-center bg-zinc-50/30 dark:bg-zinc-900/10">
                      <p className="text-zinc-450 dark:text-zinc-550 font-bold text-sm">
                        Không có dữ liệu chi tiết tai nạn lao động do Tổng số vụ = 0
                      </p>
                    </div>
                  ) : (
                    (formData.details || []).map((block, idx) => {
                      const blockId = block.id;
                      const isExpanded = expandedBlocks[blockId] ?? true;
                      const hasBlockErrors = !!blockErrors[idx];

                      return (
                        <div
                          key={blockId}
                          className={`border rounded-2xl bg-white dark:bg-zinc-950 shadow-sm overflow-hidden transition-all ${
                            hasBlockErrors ? "border-red-400" : "border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleBlock(blockId)}
                            className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50/50 dark:bg-zinc-900/30 text-left border-b border-zinc-150 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          >
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              <ChevronDown className={`w-4 h-4 text-zinc-450 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                              <span>Chi tiết vụ tai nạn số {blockId}</span>
                            </span>
                            {hasBlockErrors && (
                              <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Chưa hoàn thành</span>
                              </span>
                            )}
                          </button>

                          {isExpanded && (
                            <div className="p-6 flex flex-col gap-6">
                              {/* 3 Classification Dropdowns */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Dropdown 1: Nguyên nhân */}
                                <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center bg-white dark:bg-zinc-950">
                                  <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold text-zinc-450 dark:text-zinc-550">
                                    1. Phân theo nguyên nhân xảy ra TNLĐ
                                  </label>
                                  <select
                                    disabled={isReadOnly}
                                    value={block.causeCategory}
                                    onChange={e => handleBlockTextChange(idx, "causeCategory", e.target.value)}
                                    className="w-full bg-transparent border-0 outline-none text-zinc-850 dark:text-zinc-150 text-sm font-bold pt-2.5 pb-0.5 cursor-pointer appearance-none disabled:cursor-not-allowed"
                                  >
                                    {CAUSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none mt-1" />
                                </div>

                                {/* Dropdown 2: Yếu tố gây chấn thương */}
                                <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center bg-white dark:bg-zinc-950">
                                  <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold text-zinc-450 dark:text-zinc-550">
                                    2. Phân theo yếu tố gây chấn thương
                                  </label>
                                  <select
                                    disabled={isReadOnly}
                                    value={block.factorCategory}
                                    onChange={e => handleBlockTextChange(idx, "factorCategory", e.target.value)}
                                    className="w-full bg-transparent border-0 outline-none text-zinc-855 dark:text-zinc-150 text-sm font-bold pt-2.5 pb-0.5 cursor-pointer appearance-none disabled:cursor-not-allowed"
                                  >
                                    {FACTOR_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none mt-1" />
                                </div>

                                {/* Dropdown 3: Nghề nghiệp */}
                                <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex flex-col justify-center bg-white dark:bg-zinc-950 md:col-span-2">
                                  <label className="absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold text-zinc-450 dark:text-zinc-550">
                                    3. Phân theo nghề nghiệp
                                  </label>
                                  <select
                                    disabled={isReadOnly}
                                    value={block.jobCategory}
                                    onChange={e => handleBlockTextChange(idx, "jobCategory", e.target.value)}
                                    className="w-full bg-transparent border-0 outline-none text-zinc-855 dark:text-zinc-150 text-sm font-bold pt-2.5 pb-0.5 cursor-pointer appearance-none disabled:cursor-not-allowed"
                                  >
                                    {JOB_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none mt-1" />
                                </div>
                              </div>

                              {/* Group 4: Chi tiết */}
                              <div className="flex flex-col gap-4 border-t border-zinc-150 dark:border-zinc-800 pt-5">
                                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-150">
                                  4. Chi tiết vụ tai nạn số {blockId}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                  {[
                                    { label: "Tổng số vụ", name: "tongSoVu" },
                                    { label: "Tổng số vụ có người chết", name: "soVuCoNguoiChet" },
                                    { label: "Tổng số vụ có từ 2 người bị nạn trở lên", name: "soVuHaiNguoiTroLen" },
                                    { label: "Tổng số người bị nạn", name: "tongSoNguoiBiNan" },
                                    { label: "Tổng số lao động nữ bị nạn", name: "soLaoDongNuBiNan" },
                                    { label: "Tổng số người bị chết", name: "soNguoiChet" },
                                    { label: "Tổng số người bị thương nặng", name: "soNguoiThuongNang" },
                                    { label: "Số người bị nạn không QL", name: "soNguoiBiNanKhongQL" },
                                    { label: "Lao động nữ bị nạn không QL", name: "laoDongNuBiNanKhongQL" },
                                    { label: "Số người chết không QL", name: "soNguoiChetKhongQL" },
                                    { label: "Người bị thương nặng không QL", name: "soNguoiThuongNangKhongQL" },
                                  ].map(f => {
                                    const fieldErr = blockErrors[idx] && blockErrors[idx][f.name];
                                    return (
                                      <div
                                        key={f.name}
                                        className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${
                                          fieldErr ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-850"
                                        } ${isReadOnly ? "opacity-70 bg-zinc-50 dark:bg-zinc-900/40" : ""}`}
                                      >
                                        <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${
                                          fieldErr ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                                        }`}>
                                          {f.label} {!isReadOnly && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                          type="text"
                                          value={block[f.name as keyof AccidentDetailBlock] as string}
                                          onChange={e => handleBlockCountChange(idx, f.name as keyof AccidentDetailBlock, e.target.value)}
                                          disabled={isReadOnly}
                                          className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                                          placeholder="0"
                                        />
                                        {fieldErr && (
                                          <span className="text-[10px] text-red-500 mt-1 font-semibold">{fieldErr}</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Group 5: Thiệt hại */}
                              <div className="flex flex-col gap-4 border-t border-zinc-150 dark:border-zinc-800 pt-5">
                                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-150">
                                  5. Thiệt hại do tai nạn lao động số {blockId}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                  {[
                                    { label: "Chi phí y tế", name: "chiPhiYTe", isMoney: true },
                                    { label: "Chi phí trả lương trong thời gian điều trị", name: "chiPhiLuong", isMoney: true },
                                    { label: "Chi phí bồi thường trợ cấp", name: "chiPhiBoiThuong", isMoney: true },
                                    { label: "Tổng số tiền chi phí", name: "tongChiPhi", isMoney: true, isReadOnlyOverride: true },
                                    { label: "Tổng số ngày nghỉ vì TNLĐ", name: "soNgayNghi" },
                                    { label: "Thiệt hại tài sản", name: "thietHaiTaiSan", isMoney: true, isOptional: true },
                                  ].map(f => {
                                    const fieldErr = blockErrors[idx] && blockErrors[idx][f.name];
                                    const inputReadOnly = isReadOnly || f.isReadOnlyOverride;
                                    const showAsterisk = !isReadOnly && !f.isOptional;

                                    return (
                                      <div
                                        key={f.name}
                                        className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-955 transition-all ${
                                          fieldErr ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-850"
                                        } ${inputReadOnly ? "opacity-70 bg-zinc-50 dark:bg-zinc-900/40" : ""}`}
                                      >
                                        <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${
                                          fieldErr ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                                        }`}>
                                          {f.label} {showAsterisk && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="relative flex items-center justify-between w-full pt-2 pb-0.5">
                                          <input
                                            type="text"
                                            value={block[f.name as keyof AccidentDetailBlock] as string}
                                            onChange={e => f.isMoney ? handleBlockMoneyChange(idx, f.name as keyof AccidentDetailBlock, e.target.value) : handleBlockCountChange(idx, f.name as keyof AccidentDetailBlock, e.target.value)}
                                            disabled={inputReadOnly}
                                            className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold disabled:cursor-not-allowed pr-14"
                                            placeholder="0"
                                          />
                                          {f.isMoney && (
                                            <span className="text-xs text-zinc-400 dark:text-zinc-500 select-none pr-1 pointer-events-none">
                                              (1.000đ)
                                            </span>
                                          )}
                                        </div>
                                        {fieldErr && (
                                          <span className="text-[10px] text-red-500 mt-1 font-semibold">{fieldErr}</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* SECTION 3: 2. TAI NẠN ĐƯỢC TRỢ CẤP (MIRROR SECTION 1) */}
          {/* ========================================== */}
          {currentSection === "accident-benefits" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-zinc-150/70 dark:border-zinc-800 pb-3 flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ
                </h3>
              </div>

              {/* Nhóm 1: Tổng số vụ & số nạn nhân trợ cấp */}
              <div className="flex flex-col gap-4 mt-2">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  1. Tổng số vụ tai nạn lao động & số nạn nhân tai nạn lao động
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[
                    { label: "Tổng số vụ", name: "tc_tongSoVu" },
                    { label: "Tổng số vụ có người chết", name: "tc_soVuCoNguoiChet" },
                    { label: "Tổng số vụ có từ 2 người bị nạn trở lên", name: "tc_soVuHaiNguoiTroLen" },
                    { label: "Tổng số người bị nạn", name: "tc_tongSoNguoiBiNan" },
                    { label: "Tổng số lao động nữ bị nạn", name: "tc_soLaoDongNuBiNan" },
                    { label: "Tổng số người bị chết", name: "tc_soNguoiChet" },
                    { label: "Tổng số người bị thương nặng", name: "tc_soNguoiThuongNang" },
                    { label: "Số người bị nạn không QL", name: "tc_soNguoiBiNanKhongQL" },
                    { label: "Lao động nữ bị nạn không QL", name: "tc_laoDongNuBiNanKhongQL" },
                    { label: "Số người chết không QL", name: "tc_soNguoiChetKhongQL" },
                    { label: "Người bị thương nặng không QL", name: "tc_soNguoiThuongNangKhongQL" },
                  ].map(f => (
                    <div
                      key={f.name}
                      className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${
                        errors[f.name] ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-850"
                      } ${isReadOnly ? "opacity-70 bg-zinc-50 dark:bg-zinc-900/40" : ""}`}
                    >
                      <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${
                        errors[f.name] ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                      }`}>
                        {f.label} {!isReadOnly && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        name={f.name}
                        value={formData[f.name as keyof ReportData] as string}
                        onChange={handleTcCountChange}
                        disabled={isReadOnly}
                        className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5 disabled:cursor-not-allowed"
                        placeholder="0"
                      />
                      {errors[f.name] && (
                        <span className="text-[10px] text-red-500 mt-1 font-semibold">{errors[f.name]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhóm 2: Thiệt hại chi phí trợ cấp */}
              <div className="flex flex-col gap-4 border-t border-zinc-150 dark:border-zinc-800 pt-5 mt-2">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  2. Thiệt hại do tai nạn lao động
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[
                    { label: "Chi phí y tế", name: "tc_chiPhiYTe", isMoney: true },
                    { label: "Chi phí trả lương trong thời gian điều trị", name: "tc_chiPhiLuong", isMoney: true },
                    { label: "Chi phí bồi thường trợ cấp", name: "tc_chiPhiBoiThuong", isMoney: true },
                    { label: "Tổng số tiền chi phí", name: "tc_tongChiPhi", isMoney: true, isReadOnlyOverride: true },
                    { label: "Tổng số ngày nghỉ vì TNLĐ", name: "tc_soNgayNghi" },
                    { label: "Thiệt hại tài sản", name: "tc_thietHaiTaiSan", isMoney: true, isOptional: true },
                  ].map(f => {
                    const showAsterisk = !isReadOnly && !f.isOptional;
                    const inputReadOnly = isReadOnly || f.isReadOnlyOverride;

                    return (
                      <div
                        key={f.name}
                        className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 bg-white dark:bg-zinc-950 transition-all ${
                          errors[f.name] ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-850"
                        } ${inputReadOnly ? "opacity-70 bg-zinc-50 dark:bg-zinc-900/40" : ""}`}
                      >
                        <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold ${
                          errors[f.name] ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                        }`}>
                          {f.label} {showAsterisk && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative flex items-center justify-between w-full pt-2 pb-0.5">
                          <input
                            type="text"
                            name={f.name}
                            value={formData[f.name as keyof ReportData] as string}
                            onChange={f.isMoney ? handleMoneyChange : handleTcCountChange}
                            disabled={inputReadOnly}
                            className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold disabled:cursor-not-allowed pr-14"
                            placeholder="0"
                          />
                          {f.isMoney && (
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 select-none pr-1 pointer-events-none">
                              (1.000đ)
                            </span>
                          )}
                        </div>
                        {errors[f.name] && (
                          <span className="text-[10px] text-red-500 mt-1 font-semibold">{errors[f.name]}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SECTION 4: REDESIGNED GENERAL VIEW TABLES */}
          {/* ========================================== */}
          {currentSection === "general-view" && (
            <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200">
              {/* Header Title */}
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-150">
                  Báo cáo tổng hợp tình hình tai nạn lao động - Kỳ báo cáo: {formData.period} năm {formData.year}
                </h3>
              </div>

              {/* Red file attachment note */}
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 flex-wrap">
                <span className="text-red-500 font-extrabold text-sm">**</span>
                <span className="text-red-500">Vui lòng đính kèm báo cáo TNLĐ có dấu mộc công ty:</span>
                <button
                  type="button"
                  onClick={() => showToast("Mở chọn tệp tải lên...", "success")}
                  className="text-blue-600 hover:text-blue-700 underline font-bold cursor-pointer transition-colors"
                >
                  Tại đây
                </button>
                <span className="text-blue-500 font-semibold ml-2 hover:underline cursor-pointer">baocaoTNLĐ.pdf</span>
              </div>

              {/* TABLE I: 13-COLUMN COMPLEX ACCIDENT STATISTICS */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-sm bg-white dark:bg-zinc-950">
                  <table className="w-full border-collapse text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    <thead>
                      {/* Row 1 headers */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/20 text-zinc-550 dark:text-zinc-400 font-bold select-none text-center">
                        <th rowSpan={3} className="p-3 border-r border-zinc-200 dark:border-zinc-800 text-left min-w-[280px]">
                          Tên chỉ tiêu thống kê
                        </th>
                        <th rowSpan={3} className="p-3 border-r border-zinc-200 dark:border-zinc-800 w-16">
                          Mã số
                        </th>
                        <th colSpan={11} className="p-2.5">
                          Phân loại TNLĐ theo mức độ thương tật
                        </th>
                      </tr>
                      {/* Row 2 headers */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/20 text-zinc-550 dark:text-zinc-400 font-bold select-none text-center">
                        <th colSpan={3} className="p-2 border-r border-zinc-200 dark:border-zinc-800">
                          Số vụ (Vụ)
                        </th>
                        <th colSpan={8} className="p-2">
                          Số người bị nạn (Người)
                        </th>
                      </tr>
                      {/* Row 3 headers */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/20 text-zinc-550 dark:text-zinc-400 font-bold select-none text-center">
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-16">Tổng số</th>
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-20">Số vụ có người chết</th>
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-24">Số vụ có từ 2 người bị nạn trở lên</th>
                        
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-16">Tổng số</th>
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-24">NN không thuộc quyền quản lý</th>
                        
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-16">Tổng số</th>
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-24">NN không thuộc quyền quản lý</th>
                        
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-16">Tổng số</th>
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-24">NN không thuộc quyền quản lý</th>
                        
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-16">Tổng số</th>
                        <th className="p-2 w-24">NN không thuộc quyền quản lý</th>
                      </tr>
                      {/* Spanned Sub-Header descriptors (Số LD nữ, Số người bị chết, Số người thương nặng) */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 text-[9px] text-zinc-400 font-bold text-center">
                        <th className="p-1 border-r border-zinc-200 dark:border-zinc-800"></th>
                        <th className="p-1 border-r border-zinc-200 dark:border-zinc-800"></th>
                        <th colSpan={3} className="p-1 border-r border-zinc-200 dark:border-zinc-800"></th>
                        <th colSpan={2} className="p-1 border-r border-zinc-200 dark:border-zinc-800">Tổng số</th>
                        <th colSpan={2} className="p-1 border-r border-zinc-200 dark:border-zinc-800">Số LD nữ</th>
                        <th colSpan={2} className="p-1 border-r border-zinc-200 dark:border-zinc-800">Số người bị chết</th>
                        <th colSpan={2} className="p-1">Số người bị thương nặng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row 1: Tai nạn lao động */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/5 font-bold text-zinc-900 dark:text-zinc-100">
                        <td colSpan={13} className="p-2.5 text-left text-zinc-800 dark:text-zinc-200">
                          1. Tai nạn lao động
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300">
                        <td className="p-3 text-left pl-8">Tai nạn lao động</td>
                        <td className="p-3 text-center bg-zinc-50/50 dark:bg-zinc-900/10"></td>
                        <td className="p-3 text-center">{sumBlocks("tongSoVu")}</td>
                        <td className="p-3 text-center">{sumBlocks("soVuCoNguoiChet")}</td>
                        <td className="p-3 text-center">{sumBlocks("soVuHaiNguoiTroLen")}</td>
                        <td className="p-3 text-center">{sumBlocks("tongSoNguoiBiNan")}</td>
                        <td className="p-3 text-center">{sumBlocks("soNguoiBiNanKhongQL")}</td>
                        <td className="p-3 text-center">{sumBlocks("soLaoDongNuBiNan")}</td>
                        <td className="p-3 text-center">{sumBlocks("laoDongNuBiNanKhongQL")}</td>
                        <td className="p-3 text-center">{sumBlocks("soNguoiChet")}</td>
                        <td className="p-3 text-center">{sumBlocks("soNguoiChetKhongQL")}</td>
                        <td className="p-3 text-center">{sumBlocks("soNguoiThuongNang")}</td>
                        <td className="p-3 text-center">{sumBlocks("soNguoiThuongNangKhongQL")}</td>
                      </tr>

                      {/* Row 2: 1.1 Phân theo nguyên nhân xảy ra TNLĐ */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/5 font-bold">
                        <td colSpan={13} className="p-2.5 text-left text-zinc-800 dark:text-zinc-200">
                          1.1 Phân theo nguyên nhân xảy ra TNLĐ
                        </td>
                      </tr>
                      {/* Sub Category: a. Do người sử dụng lao động */}
                      <tr className="border-b border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/10 dark:bg-zinc-900/2 font-bold text-zinc-500 text-[10px]">
                        <td colSpan={13} className="p-2 text-left pl-6">
                          a. Do người sử dụng lao động
                        </td>
                      </tr>
                      {renderCauseRow(CAUSE_CATEGORIES[0], "1")}
                      {renderCauseRow(CAUSE_CATEGORIES[1], "2")}
                      {renderCauseRow(CAUSE_CATEGORIES[2], "3")}
                      {renderCauseRow(CAUSE_CATEGORIES[3], "4")}
                      {renderCauseRow(CAUSE_CATEGORIES[4], "5")}
                      {renderCauseRow(CAUSE_CATEGORIES[5], "6")}
                      
                      {/* Sub Category: b. Do người lao động */}
                      <tr className="border-b border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/10 dark:bg-zinc-900/2 font-bold text-zinc-500 text-[10px]">
                        <td colSpan={13} className="p-2 text-left pl-6">
                          b. Do người lao động
                        </td>
                      </tr>
                      {renderCauseRow(CAUSE_CATEGORIES[6], "7")}
                      {renderCauseRow(CAUSE_CATEGORIES[7], "8")}
                      {renderCauseRow(CAUSE_CATEGORIES[8], "9")}

                      {/* Row 3: 1.2 Phân theo yếu tố gây chấn thương */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/5 font-bold">
                        <td colSpan={13} className="p-2.5 text-left text-zinc-800 dark:text-zinc-200">
                          1.2 Phân theo yếu tố gây chấn thương
                        </td>
                      </tr>
                      {FACTOR_CATEGORIES.map((factor, index) => {
                        const code = getFactorCode(factor);
                        return (
                          <tr key={code} className="border-b border-zinc-150 dark:border-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            <td className="p-3 text-left pl-8">{factor}</td>
                            <td className="p-3 text-center bg-zinc-50/50 dark:bg-zinc-900/10 font-bold">{code}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "tongSoVu")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "soVuCoNguoiChet")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "soVuHaiNguoiTroLen")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "tongSoNguoiBiNan")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "soNguoiBiNanKhongQL")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "soLaoDongNuBiNan")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "laoDongNuBiNanKhongQL")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "soNguoiChet")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "soNguoiChetKhongQL")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "soNguoiThuongNang")}</td>
                            <td className="p-3 text-center">{sumBlocksByFactor(factor, "soNguoiThuongNangKhongQL")}</td>
                          </tr>
                        );
                      })}

                      {/* Row 4: 1.3 Phân theo nghề nghiệp */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/5 font-bold">
                        <td colSpan={13} className="p-2.5 text-left text-zinc-800 dark:text-zinc-200">
                          1.3 Phân theo nghề nghiệp
                        </td>
                      </tr>
                      {JOB_CATEGORIES.map((job, index) => {
                        const code = getJobCode(job);
                        return (
                          <tr key={code} className="border-b border-zinc-150 dark:border-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            <td className="p-3 text-left pl-8">{job}</td>
                            <td className="p-3 text-center bg-zinc-50/50 dark:bg-zinc-900/10 font-bold">{code}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "tongSoVu")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "soVuCoNguoiChet")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "soVuHaiNguoiTroLen")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "tongSoNguoiBiNan")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "soNguoiBiNanKhongQL")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "soLaoDongNuBiNan")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "laoDongNuBiNanKhongQL")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "soNguoiChet")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "soNguoiChetKhongQL")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "soNguoiThuongNang")}</td>
                            <td className="p-3 text-center">{sumBlocksByJob(job, "soNguoiThuongNangKhongQL")}</td>
                          </tr>
                        );
                      })}

                      {/* Row 5: 2. Tai nạn được hưởng trợ cấp theo Luật ATVSLĐ */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/5 font-bold text-zinc-900 dark:text-zinc-100">
                        <td colSpan={13} className="p-2.5 text-left text-zinc-800 dark:text-zinc-200">
                          2. Tai nạn được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <td className="p-3 text-left pl-8"></td>
                        <td className="p-3 text-center bg-zinc-50/50 dark:bg-zinc-900/10 font-bold">10</td>
                        <td className="p-3 text-center">{Number(formData.tc_tongSoVu || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_soVuCoNguoiChet || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_soVuHaiNguoiTroLen || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_tongSoNguoiBiNan || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_soNguoiBiNanKhongQL || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_soLaoDongNuBiNan || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_laoDongNuBiNanKhongQL || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_soNguoiChet || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_soNguoiChetKhongQL || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_soNguoiThuongNang || 0)}</td>
                        <td className="p-3 text-center">{Number(formData.tc_soNguoiThuongNangKhongQL || 0)}</td>
                      </tr>

                      {/* Row 6: 3. Tổng số */}
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/5 font-bold">
                        <td colSpan={13} className="p-2.5 text-left text-zinc-800 dark:text-zinc-200">
                          3. Tổng số
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-950 dark:text-zinc-50">
                        <td className="p-3 text-left">Tổng số (3=1+2)</td>
                        <td className="p-3 text-center bg-zinc-50/50 dark:bg-zinc-900/10 font-bold">-</td>
                        <td className="p-3 text-center">{sumCol("tongSoVu", "tc_tongSoVu")}</td>
                        <td className="p-3 text-center">{sumCol("soVuCoNguoiChet", "tc_soVuCoNguoiChet")}</td>
                        <td className="p-3 text-center">{sumCol("soVuHaiNguoiTroLen", "tc_soVuHaiNguoiTroLen")}</td>
                        <td className="p-3 text-center">{sumCol("tongSoNguoiBiNan", "tc_tongSoNguoiBiNan")}</td>
                        <td className="p-3 text-center">{sumCol("soNguoiBiNanKhongQL", "tc_soNguoiBiNanKhongQL")}</td>
                        <td className="p-3 text-center">{sumCol("soLaoDongNuBiNan", "tc_soLaoDongNuBiNan")}</td>
                        <td className="p-3 text-center">{sumCol("laoDongNuBiNanKhongQL", "tc_laoDongNuBiNanKhongQL")}</td>
                        <td className="p-3 text-center">{sumCol("soNguoiChet", "tc_soNguoiChet")}</td>
                        <td className="p-3 text-center">{sumCol("soNguoiChetKhongQL", "tc_soNguoiChetKhongQL")}</td>
                        <td className="p-3 text-center">{sumCol("soNguoiThuongNang", "tc_soNguoiThuongNang")}</td>
                        <td className="p-3 text-center">{sumCol("soNguoiThuongNangKhongQL", "tc_soNguoiThuongNangKhongQL")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLE II: DAMAGES SUMMARY TABLE */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-1">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                    II. Thiệt hại do tai nạn lao động
                  </h4>
                </div>
                <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-sm bg-white dark:bg-zinc-950">
                  <table className="w-full border-collapse text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/20 text-zinc-550 dark:text-zinc-400 font-bold select-none text-center">
                        <th rowSpan={3} className="p-3 border-r border-zinc-200 dark:border-zinc-800 text-left min-w-[280px]">
                          Tổng số ngày nghỉ vì tai nạn lao động (kể cả ngày nghỉ chế độ)
                        </th>
                        <th colSpan={4} className="p-2 border-r border-zinc-200 dark:border-zinc-800">
                          Tổng số ngày nghỉ vì TNLĐ (1.000đ)
                        </th>
                        <th rowSpan={3} className="p-3 w-44">
                          Thiệt hại tài sản (1.000đ)
                        </th>
                      </tr>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/20 text-zinc-550 dark:text-zinc-400 font-bold select-none text-center text-[10px]">
                        <th rowSpan={2} className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-24">Tổng số</th>
                        <th colSpan={3} className="p-2 border-r border-zinc-200 dark:border-zinc-800">Khoảng chi cụ thể của cơ sở</th>
                      </tr>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/20 text-zinc-550 dark:text-zinc-400 font-bold select-none text-center text-[10px]">
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-24">Y tế</th>
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-36">Trả lương trong thời gian điều trị</th>
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-28">Bồi thường trợ cấp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center font-bold text-zinc-800 dark:text-zinc-200">
                        <td className="p-3.5 border-r border-zinc-200 dark:border-zinc-800 text-center">{formData.soNgayNghi || "0"}</td>
                        <td className="p-3.5 border-r border-zinc-200 dark:border-zinc-800 text-blue-600 text-center">{formData.tongChiPhi || "0"}</td>
                        <td className="p-3.5 border-r border-zinc-200 dark:border-zinc-800 text-center">{formData.chiPhiYTe || "0"}</td>
                        <td className="p-3.5 border-r border-zinc-200 dark:border-zinc-800 text-center">{formData.chiPhiLuong || "0"}</td>
                        <td className="p-3.5 border-r border-zinc-200 dark:border-zinc-800 text-center">{formData.chiPhiBoiThuong || "0"}</td>
                        <td className="p-3.5 text-center">{formData.thietHaiTaiSan || "0"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* POPUP CANCEL CONFIRM */}
      {/* ========================================== */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowCancelConfirm(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[20px] w-full max-w-[460px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="bg-[#2563eb] text-white py-4 text-center font-bold text-lg select-none tracking-wide flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Cảnh báo</span>
            </div>

            <div className="p-6 text-center">
              <p className="text-zinc-700 dark:text-zinc-350 font-semibold text-sm leading-relaxed">
                Dữ liệu báo cáo đã nhập sẽ không được lưu lại
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 pb-6 select-none font-bold text-sm">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-5 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-zinc-550 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="px-6 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
