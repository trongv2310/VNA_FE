"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Eye,
  FileText,
} from "lucide-react";
import { getDepartmentReports, receiveDepartmentReport } from "../services/api";
import { DepartmentReportDetail } from "./DepartmentReportDetail";

interface DepartmentReportsProps {
  showToast: (message: string, type: "success" | "error") => void;
}

interface ReportItem {
  id: number;
  businessName: string;
  taxCode: string;
  periodType: "SIX_MONTHS" | "FULL_YEAR";
  periodLabel: string;
  status: "DRAFT" | "SUBMITTED" | "RECEIVED";
  statusLabel: string;
}

const MOCK_REPORTS: ReportItem[] = [
  {
    id: 1,
    businessName: "CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ VẬN TẢI PHẠM THIÊN ÂN",
    taxCode: "0317118106",
    periodType: "SIX_MONTHS",
    periodLabel: "6 tháng",
    status: "DRAFT",
    statusLabel: "Đang báo cáo",
  },
  {
    id: 2,
    businessName: "CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ VẬN TẢI PHẠM THIÊN ÂN",
    taxCode: "0317118106",
    periodType: "FULL_YEAR",
    periodLabel: "Cả năm",
    status: "RECEIVED",
    statusLabel: "Đã tiếp nhận",
  },
  {
    id: 3,
    businessName: "CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ VẬN TẢI PHẠM THIÊN",
    taxCode: "0317118107",
    periodType: "FULL_YEAR",
    periodLabel: "Cả năm",
    status: "RECEIVED",
    statusLabel: "Đã tiếp nhận",
  },
  {
    id: 4,
    businessName: "CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ VẬN TẢI PHẠM THIÊN",
    taxCode: "0317118106",
    periodType: "FULL_YEAR",
    periodLabel: "Cả năm",
    status: "RECEIVED",
    statusLabel: "Đã tiếp nhận",
  },
];

export const DepartmentReports: React.FC<DepartmentReportsProps> = ({ showToast }) => {
  // Filters & State
  const [year, setYear] = useState("2022");
  const [provinceCity, setProvinceCity] = useState("Hồ Chí Minh");
  const [wardCommune, setWardCommune] = useState("");
  const [businessNameQuery, setBusinessNameQuery] = useState("");
  const [taxCodeQuery, setTaxCodeQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [reports, setReports] = useState<ReportItem[]>(MOCK_REPORTS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(MOCK_REPORTS.length);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // Sync API reports if available, fallback to filtered mock reports
  useEffect(() => {
    let active = true;
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // Query param maps
        const response = await getDepartmentReports({
          page,
          limit,
          year,
          periodType: periodFilter || undefined,
          status: statusFilter || undefined,
          businessName: businessNameQuery || undefined,
          taxCode: taxCodeQuery || undefined,
          provinceCity: provinceCity === "Tất cả" ? undefined : provinceCity,
          wardCommune: wardCommune === "Tất cả" ? undefined : wardCommune,
        });

        if (active && response.success && response.data && response.data.items && response.data.items.length > 0) {
          const items = response.data.items.map((item: any) => ({
            id: item.id,
            businessName: item.business?.businessName || item.businessName || "-",
            taxCode: item.business?.taxCode || item.taxCode || "-",
            periodType: item.reportPeriod?.periodType || item.periodType,
            periodLabel: item.reportPeriod?.periodTypeLabel || (item.reportPeriod?.periodType === "SIX_MONTHS" ? "6 tháng" : "Cả năm"),
            status: item.status,
            statusLabel: item.statusLabel || (item.status === "RECEIVED" ? "Đã tiếp nhận" : item.status === "SUBMITTED" ? "Chờ tiếp nhận" : "Đang báo cáo"),
          }));
          setReports(items);
          setTotalItems(response.data.meta?.totalItems || items.length);
        } else {
          // Fallback to client-side filtering on mock data if API yields no data
          if (active) {
            applyClientSideFilters();
          }
        }
      } catch (error) {
        console.error("Failed to load reports from API, falling back to mock data:", error);
        if (active) {
          applyClientSideFilters();
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    const applyClientSideFilters = () => {
      let filtered = [...MOCK_REPORTS];

      if (businessNameQuery) {
        const query = businessNameQuery.trim().toLowerCase();
        filtered = filtered.filter((r) => r.businessName.toLowerCase().includes(query));
      }

      if (taxCodeQuery) {
        const query = taxCodeQuery.trim();
        filtered = filtered.filter((r) => r.taxCode.includes(query));
      }

      if (periodFilter) {
        filtered = filtered.filter((r) => r.periodType === periodFilter);
      }

      if (statusFilter) {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }

      // Local pagination mock-up
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      setReports(paginated);
      setTotalItems(filtered.length);
    };

    const delayDebounceFn = setTimeout(() => {
      fetchReports();
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [page, limit, year, provinceCity, wardCommune, businessNameQuery, taxCodeQuery, periodFilter, statusFilter]);

  // Selections
  const handleSelectAll = () => {
    if (selectedIds.length === reports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reports.map((r) => r.id));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Actions
  const handleViewReport = (report: ReportItem) => {
    setSelectedReport(report);
  };

  const handleAggregateReport = () => {
    showToast("Tính năng tổng hợp dữ liệu báo cáo đang được xử lý", "success");
  };

  // Pagination bounds
  const startIdx = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const endIdx = Math.min(page * limit, totalItems);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  if (selectedReport) {
    return (
      <DepartmentReportDetail
        report={selectedReport}
        year={year}
        onBack={() => setSelectedReport(null)}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full text-zinc-700 dark:text-zinc-300">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between border-t-4 border-blue-600 bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm border border-zinc-200/60 dark:border-zinc-800/80 select-none">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
          Báo cáo định kỳ Tai nạn lao động
        </h2>
        <div className="flex items-center gap-3">
          {/* Year selector */}
          <div className="relative min-w-[100px]">
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs pl-3 pr-8 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 font-bold appearance-none cursor-pointer focus:border-blue-500 transition-colors"
            >
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          <button
            onClick={handleAggregateReport}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-bold text-xs select-none transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Báo cáo tổng hợp</span>
          </button>
        </div>
      </div>

      {/* Region filter selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm border border-zinc-200/60 dark:border-zinc-800/80">
        {/* Province City */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tỉnh/ thành phố</label>
          <div className="relative">
            <select
              value={provinceCity}
              onChange={(e) => {
                setProvinceCity(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs pl-3 pr-8 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-zinc-50/50 dark:bg-zinc-900/10 cursor-not-allowed appearance-none"
              disabled
            >
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Ward Commune */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Phường/ Xã</label>
          <div className="relative">
            <select
              value={wardCommune}
              onChange={(e) => {
                setWardCommune(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs pl-3 pr-8 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 appearance-none cursor-pointer focus:border-blue-500 transition-colors font-medium"
            >
              <option value="">Tất cả</option>
              <option value="Phường Hiệp Bình Phước">Phường Hiệp Bình Phước</option>
              <option value="Phường Bến Nghé">Phường Bến Nghé</option>
              <option value="Phường 1">Phường 1</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="relative flex-1 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[1px] transition-all">
            <div className="flex flex-col items-center gap-2.5">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 select-none">Đang tải báo cáo...</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {/* Row 1: Header Columns */}
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-zinc-500 dark:text-zinc-400 text-xs font-bold select-none bg-zinc-50/50 dark:bg-zinc-900/10">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={reports.length > 0 && selectedIds.length === reports.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-4 w-24 text-center">Thao tác</th>
                <th className="p-4 min-w-[300px]">Tên doanh nghiệp</th>
                <th className="p-4 min-w-[150px]">Mã số thuế</th>
                <th className="p-4 min-w-[150px]">Kỳ báo cáo</th>
                <th className="p-4 min-w-[150px]">Trạng thái</th>
              </tr>

              {/* Row 2: Search and filtering fields */}
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2">
                  <input
                    type="text"
                    value={businessNameQuery}
                    onChange={(e) => {
                      setBusinessNameQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Tìm tên doanh nghiệp..."
                    className="w-full text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:border-blue-500 transition-colors"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={taxCodeQuery}
                    onChange={(e) => {
                      setTaxCodeQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Tìm mã số thuế..."
                    className="w-full text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:border-blue-500 transition-colors font-mono"
                  />
                </td>
                <td className="p-2 relative">
                  <select
                    value={periodFilter}
                    onChange={(e) => {
                      setPeriodFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full text-xs pl-3 pr-8 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 appearance-none cursor-pointer focus:border-blue-500 transition-colors"
                  >
                    <option value="">Tất cả</option>
                    <option value="SIX_MONTHS">6 tháng</option>
                    <option value="FULL_YEAR">Cả năm</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                </td>
                <td className="p-2 relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full text-xs pl-3 pr-8 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 appearance-none cursor-pointer focus:border-blue-500 transition-colors"
                  >
                    <option value="">Tất cả</option>
                    <option value="DRAFT">Đang báo cáo</option>
                    <option value="RECEIVED">Đã tiếp nhận</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                </td>
              </tr>
            </thead>

            <tbody>
              {reports.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-400 dark:text-zinc-500 font-semibold select-none text-sm">
                    Không tìm thấy dữ liệu báo cáo nào phù hợp.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(report.id)}
                        onChange={() => handleSelectRow(report.id)}
                        className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleViewReport(report)}
                          title="Xem chi tiết báo cáo"
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-600 transition-all cursor-pointer"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100 break-words max-w-[450px]">
                      {report.businessName}
                    </td>
                    <td className="p-4 font-mono text-xs">{report.taxCode}</td>
                    <td className="p-4 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                      {report.periodLabel}
                    </td>
                    <td className="p-4 text-xs font-bold">
                      <span className="inline-flex items-center gap-1.5 select-none">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            report.status === "RECEIVED" ? "bg-blue-500" : "bg-zinc-400"
                          }`}
                        />
                        <span
                          className={
                            report.status === "RECEIVED"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }
                        >
                          {report.statusLabel}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination controls */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-500 select-none gap-6">
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
            {totalItems > 0 ? `${startIdx} - ${endIdx} of ${totalItems}` : "0 - 0 of 0"}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || isLoading}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || isLoading}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
