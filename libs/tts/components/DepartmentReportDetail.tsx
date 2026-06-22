"use client";

import React from "react";
import { ArrowLeft, Printer, AlertCircle } from "lucide-react";

interface ReportDetailProps {
  report: {
    id: number;
    businessName: string;
    taxCode: string;
    periodLabel: string;
    status: string;
    statusLabel: string;
  };
  year: string;
  onBack: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

interface TableRowData {
  title: string;
  code?: string;
  isBoldHeader?: boolean;
  isSubHeader?: boolean;
  data?: (number | string)[];
}

const PART_I_DATA: TableRowData[] = [
  {
    title: "1. Tai nạn lao động",
    isBoldHeader: true,
  },
  {
    title: "Tai nạn lao động",
    code: "",
    data: [2, 1, 1, 10, 0, 5, 0, 5, 0, 10, 0],
  },
  {
    title: "1.1 Phân theo nguyên nhân xảy ra TNLĐ",
    isSubHeader: true,
  },
  {
    title: "a. Do người sử dụng lao động",
    isSubHeader: true,
  },
  {
    title: "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn",
    code: "1",
    data: [1, 1, 1, 5, 0, 5, 0, 5, 0, 5, 0],
  },
  {
    title: "Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt",
    code: "2",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: "Tổ chức lao động không hợp lý",
    code: "3",
    data: [1, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0],
  },
  {
    title: "Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ",
    code: "4",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: "Không có quy trình an toàn hoặc biện pháp làm việc an toàn",
    code: "5",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: "Điều kiện làm việc không tốt",
    code: "6",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: "b. Do người lao động",
    isSubHeader: true,
  },
  {
    title: "Quy phạm nội quy, quy trình, quy chuẩn, biện pháp làm việc an toàn",
    code: "7",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: "Không sử dụng phương tiện bảo vệ cá nhân",
    code: "8",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: "Khách quan khó tránh/ Nguyên nhân chưa kể đến",
    code: "9",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: "1.2. Phân theo yếu tố gây chấn thương",
    isSubHeader: true,
  },
  {
    title: "Thiết bị nâng",
    code: "101",
    data: [2, 1, 1, 10, 0, 5, 0, 5, 0, 10, 0],
  },
  {
    title: "1.3 Phân theo nghề nghiệp",
    isSubHeader: true,
  },
  {
    title: "Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương",
    code: "102",
    data: [1, 1, 1, 5, 0, 5, 0, 5, 0, 5, 0],
  },
  {
    title: "Công nhân",
    code: "103",
    data: [1, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0],
  },
  {
    title: "2. Tai nạn được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ",
    isBoldHeader: true,
  },
  {
    title: "Tai nạn được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ",
    code: "10",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: "3. Tổng số",
    isBoldHeader: true,
  },
  {
    title: "Tổng số (3=1+2)",
    code: "",
    data: [2, 1, 1, 10, 0, 5, 0, 5, 0, 10, 0],
  },
];

export const DepartmentReportDetail: React.FC<ReportDetailProps> = ({
  report,
  year,
  onBack,
  showToast,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAttachment = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast("Tải tài liệu đính kèm baocaoTNLĐ.pdf thành công", "success");
  };

  return (
    <div className="flex flex-col gap-6 h-full text-zinc-700 dark:text-zinc-300">
      {/* CSS style block for browser print settings */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Reset parent heights and overflows to enable full page printing */
          html, body, #__next, .h-screen, .overflow-hidden, main, .overflow-y-auto, [class*="h-screen"], [class*="overflow-hidden"], [class*="overflow-y-auto"] {
            height: auto !important;
            overflow: visible !important;
            position: static !important;
          }
          /* Hide Sidebar, Header, Layout elements */
          body * {
            visibility: hidden;
          }
          /* Show print container and everything in it */
          .printable-report-wrapper,
          .printable-report-wrapper * {
            visibility: visible;
          }
          .printable-report-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 0px !important;
            margin: 0px !important;
          }
          /* Remove borders & scrollbars in print */
          .no-print {
            display: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #000 !important;
            font-size: 10px !important;
            padding: 4px !important;
          }
        }
      `}} />

      {/* Top Banner Header - Hidden during print */}
      <div className="flex items-center justify-between border-t-4 border-blue-600 bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-sm border border-zinc-200/60 dark:border-zinc-800/80 no-print select-none">
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          Báo cáo định kỳ Tai nạn lao động
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold text-xs select-none transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Main Body Report Content */}
      <div className="printable-report-wrapper flex-1 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm p-6 overflow-y-auto flex flex-col gap-6">
        {/* Title details */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex flex-col gap-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            Báo cáo tổng hợp tình hình tai nạn lao động - Kỳ báo cáo: {report.periodLabel} năm {year}
          </h3>
          <div className="no-print flex items-center gap-2 text-xs">
            <span className="font-semibold text-red-500 flex items-center gap-1">
              **Vui lòng đính kèm báo cáo TNLĐ có dấu mộc công ty:
            </span>
            <a
              href="#download"
              onClick={handleDownloadAttachment}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
            >
              baocaoTNLĐ.pdf
            </a>
          </div>
        </div>

        {/* Section 1: Detailed Accidents Table */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            I. Tai nạn lao động
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 border-collapse min-w-[1200px]">
              <thead>
                {/* Header Row 1 */}
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th
                    rowSpan={3}
                    className="p-3 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 w-[20%]"
                  >
                    Tên chỉ tiêu thống kê
                  </th>
                  <th
                    rowSpan={3}
                    className="p-3 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 text-center w-[6%]"
                  >
                    Mã số
                  </th>
                  <th
                    colSpan={11}
                    className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 text-center"
                  >
                    Phân loại TNLĐ theo mức độ thương tật
                  </th>
                </tr>

                {/* Header Row 2 */}
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th
                    colSpan={3}
                    className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 text-center"
                  >
                    Số vụ (Vụ)
                  </th>
                  <th
                    colSpan={8}
                    className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 text-center"
                  >
                    Số người bị nạn (Người)
                  </th>
                </tr>

                {/* Header Row 3 */}
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-center">
                  {/* Under Số vụ */}
                  <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400">
                    Tổng số
                  </th>
                  <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400">
                    Số vụ có người chết
                  </th>
                  <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400">
                    Số vụ có từ 2 người bị nạn trở lên
                  </th>
                  {/* Under Số người */}
                  <th
                    colSpan={2}
                    className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400"
                  >
                    Tổng số
                  </th>
                  <th
                    colSpan={2}
                    className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400"
                  >
                    Số LĐ nữ
                  </th>
                  <th
                    colSpan={2}
                    className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400"
                  >
                    Số người bị chết
                  </th>
                  <th
                    colSpan={2}
                    className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400"
                  >
                    Số người bị thương nặng
                  </th>
                </tr>

                {/* Header Row 4 */}
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-center text-[10px] text-zinc-500 dark:text-zinc-400">
                  <th className="p-2 border-r border-zinc-200 dark:border-zinc-800"></th>
                  <th className="p-2 border-r border-zinc-200 dark:border-zinc-800"></th>
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800"></th>
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800"></th>
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800"></th>
                  {/* Under Số người - Tổng số */}
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800 font-bold">Tổng số</th>
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800 font-bold">NN không thuộc quyền quản lý</th>
                  {/* Under Số người - Số LĐ nữ */}
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800 font-bold">Tổng số</th>
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800 font-bold">NN không thuộc quyền quản lý</th>
                  {/* Under Số người - Số người bị chết */}
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800 font-bold">Tổng số</th>
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800 font-bold">NN không thuộc quyền quản lý</th>
                  {/* Under Số người - Số người bị thương nặng */}
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800 font-bold">Tổng số</th>
                  <th className="p-1 border-r border-zinc-200 dark:border-zinc-800 font-bold">NN không thuộc quyền quản lý</th>
                </tr>
              </thead>

              <tbody>
                {PART_I_DATA.map((row, idx) => {
                  if (row.isBoldHeader) {
                    return (
                      <tr
                        key={idx}
                        className="bg-zinc-100/40 dark:bg-zinc-900/30 font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800"
                      >
                        <td className="p-3 pl-4" colSpan={13}>
                          {row.title}
                        </td>
                      </tr>
                    );
                  }

                  if (row.isSubHeader) {
                    return (
                      <tr
                        key={idx}
                        className="bg-zinc-50/20 dark:bg-zinc-900/10 font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 text-[11px]"
                      >
                        <td className="p-2.5 pl-6" colSpan={13}>
                          {row.title}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={idx}
                      className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-55/20 dark:hover:bg-zinc-900/10 transition-colors"
                    >
                      <td className="p-3 pl-8 text-zinc-700 dark:text-zinc-300 font-medium">
                        {row.title}
                      </td>
                      <td className="p-3 border-l border-r border-zinc-200 dark:border-zinc-800 text-center font-mono font-bold text-zinc-500">
                        {row.code || "-"}
                      </td>
                      {row.data?.map((val, subIdx) => (
                        <td
                          key={subIdx}
                          className="p-3 border-r border-zinc-200 dark:border-zinc-800 text-center font-semibold font-mono"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Damage Summary Table */}
        <div className="flex flex-col gap-3 mt-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            II. Thiệt hại do tai nạn lao động
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-center font-bold text-zinc-700 dark:text-zinc-300">
                  <th
                    rowSpan={3}
                    className="p-3 border-r border-zinc-200 dark:border-zinc-800 w-[35%] text-left"
                  >
                    Tổng số ngày nghỉ vì tai nạn lao động (kể cả ngày nghỉ chế độ)
                  </th>
                  <th
                    colSpan={5}
                    className="p-2 border-r border-zinc-200 dark:border-zinc-800"
                  >
                    Tổng số tiền chi phí (1.000đ)
                  </th>
                  <th
                    rowSpan={3}
                    className="p-3 border-r border-zinc-200 dark:border-zinc-800 w-[20%]"
                  >
                    Thiệt hại tài sản (1.000đ)
                  </th>
                </tr>

                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-center font-bold text-zinc-600 dark:text-zinc-400">
                  <th rowSpan={2} className="p-2 border-r border-zinc-200 dark:border-zinc-800 w-[15%]">
                    Tổng số
                  </th>
                  <th colSpan={3} className="p-2 border-r border-zinc-200 dark:border-zinc-800">
                    Khoản chi cụ thể của cơ sở
                  </th>
                </tr>

                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-center font-bold text-zinc-500 dark:text-zinc-400 text-[10px]">
                  <th className="p-2 border-r border-zinc-200 dark:border-zinc-800">Y tế</th>
                  <th className="p-2 border-r border-zinc-200 dark:border-zinc-800">Trả lương trong thời gian điều trị</th>
                  <th className="p-2 border-r border-zinc-200 dark:border-zinc-800">Bồi thường trợ cấp</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-center font-semibold font-mono text-sm">
                  <td className="p-4 border-r border-zinc-200 dark:border-zinc-800 text-left font-bold text-zinc-900 dark:text-zinc-100">
                    20
                  </td>
                  <td className="p-4 border-r border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 font-bold">
                    6.000.000
                  </td>
                  <td className="p-4 border-r border-zinc-200 dark:border-zinc-800">
                    2.000.000
                  </td>
                  <td className="p-4 border-r border-zinc-200 dark:border-zinc-800">
                    2.000.000
                  </td>
                  <td className="p-4 border-r border-zinc-200 dark:border-zinc-800">
                    2.000.000
                  </td>
                  <td className="p-4 border-r border-zinc-200 dark:border-zinc-800 text-red-600 dark:text-red-400 font-bold">
                    20.000.000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
