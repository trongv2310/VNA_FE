"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/libs/core/components/Button";
import { Card, CardBody } from "@/libs/core/components/Card";
import { Alert } from "@/libs/core/components/Alert";
import {
  requestForgotPassword,
  resetPassword,
  verifyForgotPasswordOtp,
} from "../../services/api";

type Step = "REQUEST" | "VERIFY_OTP" | "RESET_PASSWORD" | "SUCCESS";

export const DepartmentForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("REQUEST");
  const [email, setEmail] = useState("Phanthanhtung093@gmail.com");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Step 2: OTP State
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: Password State
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [pwdErrors, setPwdErrors] = useState<{ new?: string; confirm?: string }>({});
  // Step 4: Redirect Count
  const [redirectCount, setRedirectCount] = useState(5);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "VERIFY_OTP" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const pwdStrength = useMemo(() => {
    if (!passwordNew) {
      return { score: 0, label: "Rất yếu", color: "bg-red-500" };
    }

    let score = 0;
    if (passwordNew.length >= 6) score += 1;
    if (passwordNew.length >= 10) score += 1;
    if (/[A-Z]/.test(passwordNew)) score += 1;
    if (/[0-9]/.test(passwordNew)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordNew)) score += 1;

    const map = [
      { score: 1, label: "Rất yếu", color: "bg-red-500 w-1/5" },
      { score: 2, label: "Yếu", color: "bg-orange-500 w-2/5" },
      { score: 3, label: "Trung bình", color: "bg-yellow-500 w-3/5" },
      { score: 4, label: "Mạnh", color: "bg-emerald-500 w-4/5" },
      { score: 5, label: "Rất mạnh", color: "bg-blue-500 w-full" },
    ];

    return map.find((m) => m.score === score) || map[0];
  }, [passwordNew]);

  // Success Auto-Redirect Count
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "SUCCESS" && redirectCount > 0) {
      interval = setInterval(() => {
        setRedirectCount((prev) => {
          if (prev <= 1) {
            router.push("/department/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, redirectCount, router]);

  // Handle Step 1: Send Request
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setAlertMsg(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Vui lòng nhập địa chỉ email.");
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Định dạng email không hợp lệ.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestForgotPassword(email.trim());
      setStep("VERIFY_OTP");
      setTimer(response.data.expiresInSeconds || 300);
      setOtp(Array(6).fill(""));
      setAlertMsg({
        type: "success",
        text: response.data.devOtp
          ? `Mã OTP thử nghiệm (development): ${response.data.devOtp}`
          : response.message || "Mã OTP đã được gửi về email của bạn.",
      });
    } catch (error) {
      setAlertMsg({
        type: "error",
        text: error instanceof Error ? error.message : "Không thể tạo mã OTP.",
      });
    } finally {
      setIsLoading(false);
    }
    return;

    setTimeout(() => {
      setIsLoading(false);
      if (email === "admin@so.edu.vn" || email === "Phanthanhtung093@gmail.com") {
        setStep("VERIFY_OTP");
        setTimer(60);
        setAlertMsg({
          type: "success",
          text: "Mã OTP đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư.",
        });
      } else {
        setAlertMsg({
          type: "error",
          text: "Địa chỉ email này chưa được đăng ký trong hệ thống.",
        });
      }
    }, 1500);
  };

  // Handle Step 2: OTP inputs
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setAlertMsg(null);

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setOtpError("Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số.");
      return;
    }

    setIsLoading(true);
    try {
      await verifyForgotPasswordOtp(email.trim(), otpCode);
      setStep("RESET_PASSWORD");
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Mã OTP không hợp lệ.");
    } finally {
      setIsLoading(false);
    }
    return;

    setTimeout(() => {
      setIsLoading(false);
      if (otpCode === "123456") {
        setStep("RESET_PASSWORD");
      } else {
        setOtpError("Mã OTP không chính xác hoặc đã hết hạn.");
      }
    }, 1200);
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    try {
      const response = await requestForgotPassword(email.trim());
      setTimer(response.data.expiresInSeconds || 300);
      setOtp(Array(6).fill(""));
      setAlertMsg({
        type: "success",
        text: response.data.devOtp
          ? `Mã OTP thử nghiệm (development): ${response.data.devOtp}`
          : response.message || "Mã OTP mới đã được gửi lại.",
      });
    } catch (error) {
      setAlertMsg({
        type: "error",
        text: error instanceof Error ? error.message : "Không thể gửi lại mã OTP.",
      });
    } finally {
      setIsLoading(false);
    }
    return;

    setTimer(60);
    setOtp(Array(6).fill(""));
    setAlertMsg({
      type: "success",
      text: "Mã OTP mới đã được gửi lại vào email của bạn.",
    });
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErrors({});
    setAlertMsg(null);

    const errors: typeof pwdErrors = {};
    if (!passwordNew) {
      errors.new = "Vui lòng nhập mật khẩu mới.";
    } else if (passwordNew.length < 6) {
      errors.new = "Mật khẩu phải chứa ít nhất 6 ký tự.";
    }

    if (!passwordConfirm) {
      errors.confirm = "Vui lòng xác nhận mật khẩu mới.";
    } else if (passwordNew !== passwordConfirm) {
      errors.confirm = "Mật khẩu xác nhận không khớp.";
    }

    if (Object.keys(errors).length > 0) {
      setPwdErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email.trim(), otp.join(""), passwordNew);
      setStep("SUCCESS");
    } catch (error) {
      setAlertMsg({
        type: "error",
        text: error instanceof Error ? error.message : "Không thể đặt lại mật khẩu.",
      });
    } finally {
      setIsLoading(false);
    }
    return;

    setTimeout(() => {
      setIsLoading(false);
      setStep("SUCCESS");
    }, 1500);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative font-sans"
      style={{
        backgroundImage: "url('/images/marina-lobato-kG7pOXbBfNs-unsplash.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>

      <div className="w-full max-w-[500px] z-10 animate-fade-in">
        <Card
          glassmorphism={false}
          className="!rounded-3xl border border-zinc-200/80 dark:border-zinc-200/80 shadow-2xl !bg-white !text-zinc-900"
        >
          <CardBody className="p-8 md:p-10 flex flex-col gap-6 items-center">

            {/* Vietnamese National Emblem Image from public/icons */}
            <div className="w-24 h-24 flex items-center justify-center select-none animate-pulse-subtle">
              <img
                src="/icons/Emblem_of_Vietnam.svg"
                alt="Emblem of Vietnam"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title corresponding to current wizard step */}
            <h1 className="text-xl font-bold text-center text-[#2563eb] uppercase select-none tracking-tight">
              {step === "REQUEST" && "QUÊN MẬT KHẨU"}
              {step === "VERIFY_OTP" && "XÁC THỰC TÀI KHOẢN"}
              {step === "RESET_PASSWORD" && "ĐẶT LẠI MẬT KHẨU"}
              {step === "SUCCESS" && "KHÔI PHỤC THÀNH CÔNG"}
            </h1>

            {/* Alert Message Box */}
            {alertMsg && (
              <Alert variant={alertMsg.type} className="w-full" onClose={() => setAlertMsg(null)}>
                {alertMsg.text}
              </Alert>
            )}

            {/* STEP 1: REQUEST EMAIL */}
            {step === "REQUEST" && (
              <form onSubmit={handleSendRequest} className="w-full flex flex-col gap-5">

                {/* Subtitle matching image */}
                <div className="flex flex-col items-center pb-1">
                  <p className="text-sm font-semibold text-zinc-700 text-center select-none">
                    Vui lòng nhập email đã đăng ký tài khoản
                  </p>
                </div>

                {/* Email Input Field */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold !text-zinc-500 select-none">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative flex items-center w-full rounded-md border !bg-white transition-all duration-200 shadow-sm
                    ${emailError ? "border-red-500 focus-within:ring-1 focus-within:ring-red-500" : "border-zinc-300 focus-within:border-[#3b82f6] focus-within:ring-1 focus-within:ring-[#3b82f6]"}
                  `}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm !text-zinc-950 outline-none bg-transparent placeholder-zinc-400 font-medium"
                      placeholder="Nhập địa chỉ email"
                      required
                    />
                  </div>
                  {emailError && (
                    <span className="text-xs text-red-500 font-medium pl-1">{emailError}</span>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full !rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 font-bold shadow-md shadow-blue-500/10 active:scale-99 transition-all text-sm cursor-pointer"
                >
                  Gửi xác thực
                </Button>

                {/* Footer linking back to login */}
                <div className="flex justify-center text-xs font-semibold text-zinc-500 select-none mt-2">
                  <span>
                    Bạn đã có tài khoản?{" "}
                    <Link
                      href="/department/login"
                      className="text-[#2563eb] hover:underline font-bold transition-colors ml-1"
                    >
                      Đăng nhập
                    </Link>
                  </span>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFY OTP CODE */}
            {step === "VERIFY_OTP" && (
              <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-5">

                <div className="flex flex-col items-center pb-1">
                  <p className="text-sm font-semibold text-zinc-700 text-center select-none leading-relaxed">
                    Nhập mã OTP gồm 6 số đã được gửi qua email <br />
                    <strong className="text-zinc-900 font-bold">{email}</strong>
                  </p>
                </div>

                {/* Segmented OTP Fields */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpRefs.current[idx] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border !bg-white focus:outline-none focus:ring-2 transition-all duration-200 !text-zinc-950
                          ${otpError
                            ? "border-red-500 focus:ring-red-500"
                            : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                          }
                        `}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <span className="text-xs text-red-500 font-semibold pl-1 text-center animate-pulse">
                      {otpError}
                    </span>
                  )}
                </div>

                {/* Resend OTP countdown */}
                <div className="flex flex-col items-center gap-1 text-xs select-none">
                  {timer > 0 ? (
                    <span className="text-zinc-500 font-medium">
                      Gửi lại mã xác nhận sau: <strong className="text-blue-600 font-bold">{timer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-blue-600 hover:underline font-bold transition-all cursor-pointer"
                    >
                      Gửi lại mã OTP xác nhận
                    </button>
                  )}
                  <span className="text-[10px] text-zinc-400 font-semibold mt-1">Mã OTP mặc định để kiểm tra: 123456</span>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full !rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 font-bold shadow-md shadow-blue-500/10 active:scale-99 transition-all text-sm cursor-pointer"
                  >
                    Xác thực tài khoản
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("REQUEST");
                      setOtp(Array(6).fill(""));
                      setOtpError("");
                    }}
                    className="w-full py-2.5 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50 active:scale-99 transition-all text-sm font-bold bg-transparent cursor-pointer"
                  >
                    Thay đổi Email
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === "RESET_PASSWORD" && (
              <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-5">

                <div className="flex flex-col items-center pb-1">
                  <p className="text-sm font-semibold text-zinc-700 text-center select-none">
                    Thiết lập mật khẩu mới bảo mật cho tài khoản của bạn
                  </p>
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold !text-zinc-500 select-none">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative flex items-center w-full rounded-md border !bg-white transition-all duration-200 shadow-sm
                    ${pwdErrors.new ? "border-red-500 focus-within:ring-1 focus-within:ring-red-500" : "border-zinc-300 focus-within:border-[#3b82f6] focus-within:ring-1 focus-within:ring-[#3b82f6]"}
                  `}>
                    <input
                      type="password"
                      value={passwordNew}
                      onChange={(e) => setPasswordNew(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm !text-zinc-950 outline-none bg-transparent placeholder-zinc-400 font-medium tracking-wide"
                      placeholder="Nhập mật khẩu mới"
                      required
                    />
                  </div>
                  {pwdErrors.new && (
                    <span className="text-xs text-red-500 font-medium pl-1">{pwdErrors.new}</span>
                  )}
                </div>

                {/* Password strength meter bar */}
                {passwordNew && (
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className="text-zinc-500">Độ mạnh mật khẩu:</span>
                      <span className={`
                        ${pwdStrength.score <= 2 ? "text-red-500" : pwdStrength.score === 3 ? "text-yellow-500" : "text-emerald-500"}
                      `}>
                        {pwdStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${pwdStrength.color}`}></div>
                    </div>
                  </div>
                )}

                {/* Confirm Password field */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold !text-zinc-500 select-none">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative flex items-center w-full rounded-md border !bg-white transition-all duration-200 shadow-sm
                    ${pwdErrors.confirm ? "border-red-500 focus-within:ring-1 focus-within:ring-red-500" : "border-zinc-300 focus-within:border-[#3b82f6] focus-within:ring-1 focus-within:ring-[#3b82f6]"}
                  `}>
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm !text-zinc-950 outline-none bg-transparent placeholder-zinc-400 font-medium tracking-wide"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                  </div>
                  {pwdErrors.confirm && (
                    <span className="text-xs text-red-500 font-medium pl-1">{pwdErrors.confirm}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full !rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 font-bold shadow-md shadow-blue-500/10 active:scale-99 transition-all text-sm cursor-pointer"
                >
                  Cập nhật mật khẩu
                </Button>
              </form>
            )}

            {/* STEP 4: SUCCESS LANDING */}
            {step === "SUCCESS" && (
              <div className="flex flex-col items-center text-center gap-5 py-4 w-full">

                {/* Checkmark Icon */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75"></div>
                  <div className="relative w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-bold text-zinc-900">
                    KHÔI PHỤC MẬT KHẨU THÀNH CÔNG!
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed px-4">
                    Mật khẩu của bạn đã được cập nhật thành công. Vui lòng quay lại màn hình đăng nhập.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3 mt-2 select-none">
                  <Link href="/department/login" className="w-full">
                    <Button className="w-full !rounded-md bg-[#2563eb] text-sm py-2.5 font-bold shadow-md shadow-blue-500/10">Đăng nhập ngay</Button>
                  </Link>

                  <span className="text-[10px] text-zinc-400 font-semibold">
                    Tự động chuyển hướng sau: <strong className="text-blue-600 font-bold">{redirectCount}s</strong>
                  </span>
                </div>

              </div>
            )}

          </CardBody>
        </Card>
      </div>
    </div>
  );
};
