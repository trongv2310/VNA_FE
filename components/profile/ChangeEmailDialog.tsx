"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/libs/core/components/Alert";

const MOCK_OTP = "123456";

interface ChangeEmailDialogProps {
  currentEmail: string;
  onSave: (newEmail: string) => void;
  onCancel: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

export const ChangeEmailDialog: React.FC<ChangeEmailDialogProps> = ({
  currentEmail,
  onSave,
  onCancel,
  showToast,
}) => {
  const [step, setStep] = useState<"otp" | "newEmail">("otp");
  const [otp, setOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [errorMsg, setErrorMsg] = useState("");

  // Countdown timer logic for Step 1
  useEffect(() => {
    if (step !== "otp") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Format timeLeft (e.g. 60 -> "01:00", 59 -> "00:59")
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Resend OTP Action
  const handleResendOtp = () => {
    setTimeLeft(60);
    setOtp("");
    setErrorMsg("");
    showToast("Mã OTP mới đã được gửi", "success");
  };

  // Step 1: Submit OTP Verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setErrorMsg("Vui lòng nhập mã OTP");
      return;
    }

    if (otp !== MOCK_OTP) {
      setErrorMsg("Mã OTP không hợp lệ");
      return;
    }

    // Success -> transition to next step
    setErrorMsg("");
    setStep("newEmail");
  };

  // Step 2: Submit New Email Input
  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      setErrorMsg("Vui lòng nhập email mới");
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg("Email không hợp lệ");
      return;
    }

    if (trimmedEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setErrorMsg("Email mới phải khác email hiện tại");
      return;
    }

    // Success -> close and trigger parent handlers
    onSave(trimmedEmail);
    showToast("Thay đổi email thành công", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Step 1: OTP Popup */}
      {step === "otp" && (
        <form
          onSubmit={handleVerifyOtp}
          className="relative bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[20px] w-full max-w-[420px] shadow-2xl p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase select-none">
              THAY ĐỔI EMAIL
            </h3>
            <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Chúng tôi đã gửi mã xác minh qua email cũ
              <span className="block font-bold text-zinc-800 dark:text-zinc-200 my-1">
                {currentEmail}
              </span>
              Bạn vui lòng kiểm tra và điền mã xác thực
            </div>
          </div>

          {/* Validation Alert */}
          {errorMsg && (
            <Alert variant="login" className="py-2.5 px-3.5" onClose={() => setErrorMsg("")}>
              {errorMsg}
            </Alert>
          )}

          {/* OTP input field */}
          <div
            className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center bg-white dark:bg-zinc-950 transition-all w-full
              ${
                errorMsg && (errorMsg.includes("OTP") || errorMsg.includes("mã"))
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-zinc-200 dark:border-zinc-800 focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600"
              }`}
          >
            <label
              className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold transition-colors
                ${
                  errorMsg && (errorMsg.includes("OTP") || errorMsg.includes("mã"))
                    ? "text-red-500"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
            >
              OTP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrorMsg("");
              }}
              placeholder="Ví dụ: 122456"
              className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5"
            />
          </div>

          {/* Countdown timer & Resend code */}
          <div className="flex flex-col items-center gap-1.5 select-none">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-base">
              {formatTime(timeLeft)}
            </span>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Chưa nhận được mã?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer focus:outline-none"
              >
                Gửi lại
              </button>
            </div>
          </div>

          {/* Confirm and Cancel Buttons */}
          <div className="flex flex-col gap-3.5 mt-1">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer focus:outline-none select-none text-center"
            >
              Xác nhận
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-350 font-bold text-sm transition-colors cursor-pointer focus:outline-none select-none text-center"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      )}

      {/* Step 2: New Email Popup */}
      {step === "newEmail" && (
        <form
          onSubmit={handleSaveEmail}
          className="relative bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[20px] w-full max-w-[420px] shadow-2xl p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase select-none">
              THAY ĐỔI EMAIL
            </h3>
            <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Vui lòng nhập email mới
            </div>
          </div>

          {/* Validation Alert */}
          {errorMsg && (
            <Alert variant="login" className="py-2.5 px-3.5" onClose={() => setErrorMsg("")}>
              {errorMsg}
            </Alert>
          )}

          {/* Email input field */}
          <div
            className={`relative border rounded-xl px-4 py-2 flex flex-col justify-center bg-white dark:bg-zinc-950 transition-all w-full
              ${
                errorMsg && errorMsg.includes("email")
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-zinc-200 dark:border-zinc-800 focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600"
              }`}
          >
            <label
              className={`absolute -top-2.5 left-3 bg-white dark:bg-zinc-950 px-1.5 text-[11px] font-bold transition-colors
                ${
                  errorMsg && errorMsg.includes("email")
                    ? "text-red-500"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setErrorMsg("");
              }}
              placeholder="Ví dụ: phanthanhtung094@gmail.com"
              className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 text-sm font-semibold pt-2 pb-0.5"
            />
          </div>

          {/* Save and Cancel Buttons */}
          <div className="flex flex-col gap-3.5 mt-1">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer focus:outline-none select-none text-center"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-350 font-bold text-sm transition-colors cursor-pointer focus:outline-none select-none text-center"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
