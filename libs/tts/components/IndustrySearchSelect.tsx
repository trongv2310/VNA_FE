"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface IndustryLevel4 {
  code: string;
  name: string;
}

export const MOCK_INDUSTRIES_LEVEL4: IndustryLevel4[] = [
  { code: "0111", name: "Trồng lúa" },
  { code: "0112", name: "Trồng ngô và cây lương thực có hạt khác" },
  { code: "0113", name: "Trồng cây lấy củ có chất bột" },
  { code: "0114", name: "Trồng cây mía" },
  { code: "0115", name: "Trồng cây thuốc lá, thuốc lào" },
  { code: "0116", name: "Trồng cây lấy sợi" },
  { code: "0117", name: "Trồng cây có hạt chứa dầu" },
  { code: "0118", name: "Trồng rau, đậu các loại và trồng hoa" },
  { code: "0121", name: "Trồng cây ăn quả" },
  { code: "0122", name: "Trồng cây lấy quả chứa dầu" },
  { code: "0123", name: "Trồng cây điều" },
  { code: "0124", name: "Trồng cây tiêu" },
  { code: "0125", name: "Trồng cây cao su" },
  { code: "0126", name: "Trồng cây cà phê" },
  { code: "0127", name: "Trồng cây chè" },
  { code: "0128", name: "Trồng cây gia vị, cây dược liệu" },
  { code: "0129", name: "Trồng cây công nghiệp lâu năm khác" },
  { code: "0141", name: "Chăn nuôi trâu, bò" },
  { code: "0142", name: "Chăn nuôi ngựa, lừa, la" },
  { code: "0144", name: "Chăn nuôi dê, cừu" },
];

interface IndustrySearchSelectProps {
  value: string;
  onChange: (code: string, name: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export const IndustrySearchSelect: React.FC<IndustrySearchSelectProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedIndustry = MOCK_INDUSTRIES_LEVEL4.find((ind) => ind.code === value);
  const displayValue = selectedIndustry ? `${selectedIndustry.code} - ${selectedIndustry.name}` : "";

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const filtered = MOCK_INDUSTRIES_LEVEL4.filter(
    (ind) =>
      ind.code.includes(searchTerm) ||
      ind.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <div
        className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center bg-white dark:bg-zinc-950 transition-all focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600
          ${error ? "border-red-500 ring-1 ring-red-500" : "border-zinc-200 dark:border-zinc-800"}
          ${disabled ? "opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/40" : ""}
        `}
      >
        <label className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold transition-colors
          ${error ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"}
        `}>
          Ngành nghề kinh doanh <span className="text-red-500">*</span>
        </label>
        
        <div className="relative flex items-center justify-between w-full pt-2 pb-0.5">
          <input
            type="text"
            readOnly
            disabled={disabled}
            className={`w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pr-8 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            placeholder={disabled ? "" : "Chọn ngành nghề kinh doanh"}
            value={isOpen ? searchTerm : displayValue}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (!disabled) setIsOpen(true);
            }}
            onClick={() => {
              if (!disabled) setIsOpen(true);
            }}
          />
          <ChevronDown
            className={`absolute right-0 w-4 h-4 text-zinc-400 pointer-events-none transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xl z-50 py-1 select-none animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-1.5 border-b border-zinc-150 dark:border-zinc-850">
              <input
                type="text"
                autoFocus
                className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:border-blue-500 transition-colors"
                placeholder="Tìm mã hoặc tên ngành..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-zinc-400">
                Không tìm thấy ngành nghề phù hợp
              </div>
            ) : (
              filtered.map((ind) => (
                <button
                  key={ind.code}
                  type="button"
                  onClick={() => {
                    onChange(ind.code, ind.name);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 flex items-center justify-between font-medium transition-colors
                    ${value === ind.code ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold" : ""}
                  `}
                >
                  <span>{ind.code} - {ind.name}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
