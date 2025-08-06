"use client";

import { useState, useEffect, useCallback } from "react";
import CryptoJS from "crypto-js";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Copy } from "lucide-react";

// Configuration
const config = {
  invitationCode: "KWU75Y",
};

// Helper function to generate random device code (browser-compatible)
const generateRandomString = () => {
  const chars = "0123456789abcdef";
  let result = "";
  const randomArray = new Uint8Array(16);
  crypto.getRandomValues(randomArray);

  for (let i = 0; i < 16; i++) {
    result += chars[randomArray[i] % 16];
  }

  return result;
};

// Helper function to create MD5 hash (browser-compatible)
const createMD5Hash = (input: string): string => {
  return CryptoJS.MD5(input).toString();
};

// Helper function to generate random email
const generateRandomEmail = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const names = [
    "john",
    "jane",
    "alex",
    "sarah",
    "mike",
    "lisa",
    "david",
    "emma",
  ];

  let randomChars = "";
  for (let i = 0; i < 6; i++) {
    randomChars += chars[Math.floor(Math.random() * chars.length)];
  }

  const randomName = names[Math.floor(Math.random() * names.length)];
  return `${randomChars}_${randomName}@gmail.com`;
};

// Helper function to generate random nickname
const generateRandomNickname = (): string => {
  const randomNumber = Math.floor(Math.random() * 99999) + 1;
  return `User${randomNumber}`;
};

// Helper function to generate birthday (random year 2001-2009, +7 days from account creation)
const generateBirthday = (): string => {
  const randomYear = Math.floor(Math.random() * 9) + 2001; // 2001-2009

  // Get current date + 7 days for month and day
  const now = new Date();
  now.setDate(now.getDate() + 7); // Add 7 days

  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is 0-based
  const day = now.getDate().toString().padStart(2, "0");

  return `${randomYear}-${month}-${day}`; // Format as YYYY-MM-DD
};

// API functions
const sendOtp = async (phoneNum: string, deviceCode: string) => {
  const response = await fetch(
    `/api/tomoro/send-otp?phone=${phoneNum}&deviceCode=${deviceCode}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send OTP");
  }

  return response.json();
};

const loginOrRegister = async (
  phoneNum: string,
  otpCode: string,
  deviceCode: string,
  wToken: string,
  userAgent: string
) => {
  const response = await fetch("/api/tomoro/login-register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNum,
      otpCode,
      deviceCode,
      wToken,
      userAgent,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to login/register");
  }

  return response.json();
};

const setPassword = async (
  deviceCode: string,
  token: string,
  wToken: string,
  userAgent: string,
  md5pass: string
) => {
  const response = await fetch("/api/tomoro/set-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: md5pass,
      deviceCode,
      token,
      wToken,
      userAgent,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to set password");
  }

  return response.json();
};

const modifyUserData = async (
  deviceCode: string,
  token: string,
  wToken: string,
  userAgent: string,
  invitationCode: string,
  email?: string,
  nickname?: string,
  gender?: number,
  birthday?: string
) => {
  try {
    const response = await fetch("/api/tomoro/modify-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceCode,
        token,
        wToken,
        userAgent,
        invitationCode,
        email: email || generateRandomEmail(),
        nickname: nickname || generateRandomNickname(),
        gender: gender || 1, // 1 = Male, 2 = Female
        birthday: birthday || generateBirthday(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to modify user data");
    }

    return response.json();
  } catch (error) {
    console.log("Auto referral submission failed:", error);
    // Don't throw error, just log it as this is background process
    return { success: false, error: error };
  }
};

interface RegistrationResult {
  phoneNum: string;
  pin: string;
  timestamp: number;
  accountCode?: string;
}

export default function TomoroRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RegistrationResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Form data
  const [phoneNum, setPhoneNum] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pinCode, setPinCode] = useState("");

  // Registration data
  const [deviceCode, setDeviceCode] = useState("");
  const [wToken, setWToken] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [token, setToken] = useState("");
  const [accountCode, setAccountCode] = useState("");

  // Generate device code once on client side only to prevent hydration mismatch
  useEffect(() => {
    // Only generate if deviceCode is empty (prevents regeneration on re-mount)
    if (!deviceCode) {
      const newDeviceCode = generateRandomString();
      setDeviceCode(newDeviceCode);
      console.log(
        `🎯 Initial device code generated: ${newDeviceCode.substring(0, 8)}...`
      );
    }
  }, [deviceCode]);

  // Auto-submit functions
  const handleOtpAutoSubmit = useCallback(async () => {
    if (otpCode.length !== 4 || !/^[0-9]+$/.test(otpCode)) {
      setError("Kode OTP harus tepat 4 digit dan hanya berisi angka");
      return;
    }

    setLoading(true);
    setError("");

    // console.log("🔄 Auto OTP Submit - Attempting login with:");
    // console.log(`- Phone: ${phoneNum}`);
    // console.log(`- OTP: "${otpCode}" (length: ${otpCode.length})`);
    // console.log(
    //   `- Device: ${
    //     deviceCode ? deviceCode.substring(0, 8) + "..." : "undefined"
    //   }`
    // );
    // console.log(
    //   `- wToken: ${wToken ? wToken.substring(0, 20) + "..." : "undefined"}`
    // );
    // console.log(`- User-Agent: ${userAgent || "undefined"}`);

    try {
      const result = await loginOrRegister(
        phoneNum,
        otpCode,
        deviceCode,
        wToken,
        userAgent
      );

      if (result.success === false) {
        throw new Error(result.msg || "Login/register failed");
      }

      setToken(result.data.token);
      setAccountCode(result.data.accountCode);
      setStep(3);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setError("Kode OTP salah atau sudah expired. Silakan input OTP baru.");
      // Reset OTP field so user must input new OTP for auto submit
      setOtpCode("");
    } finally {
      setLoading(false);
    }
  }, [otpCode, phoneNum, deviceCode, wToken, userAgent]);

  const handlePinAutoSubmit = useCallback(async () => {
    if (pinCode.length !== 6 || !/^[0-9]+$/.test(pinCode)) {
      setError("PIN harus tepat 6 digit dan hanya berisi angka");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const md5pass = createMD5Hash(pinCode);
      await setPassword(deviceCode, token, wToken, userAgent, md5pass);

      const result: RegistrationResult = {
        phoneNum,
        pin: pinCode,
        timestamp: Math.floor(Date.now() / 1000),
        accountCode,
      };

      setSuccess(result);
      setStep(4);

      // Auto submit referral code in background after successful PIN setting (Auto Submit)
      // console.log(
      //   "🎯 Auto submitting referral code in background... (Auto Submit)"
      // );
      setTimeout(async () => {
        // console.log(
        //   "🔄 Starting referral code submission timeout... (Auto Submit)"
        // );
        try {
          const referralResult = await modifyUserData(
            deviceCode,
            token,
            wToken,
            userAgent,
            config.invitationCode,
            generateRandomEmail(), // random email
            generateRandomNickname(), // random nickname
            1, // gender: 1 = Male
            generateBirthday() // +7 days from account creation
          );

          console.log(
            // "📥 Referral API response (Auto Submit):",
            referralResult
          );

          // if (referralResult.success) {
          //   console.log(
          //     "✅ Referral code submitted successfully (Auto Submit):",
          //     config.invitationCode
          //   );
          // } else if (referralResult.mock) {
          //   console.log(
          //     "🔧 Referral code submitted (mocked) (Auto Submit):",
          //     config.invitationCode
          //   );
          // } else {
          //   console.log(
          //     "❌ Referral code submission failed (Auto Submit):",
          //     referralResult.error || referralResult
          //   );
          // }
        } catch (error) {
          console.log(error);
        }
      }, 1000); // 1 second delay to let PIN setting complete
    } catch (error) {
      console.error("PIN Setting Error:", error);
      setError("Gagal mengatur PIN. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [pinCode, deviceCode, token, wToken, userAgent, phoneNum, accountCode]);

  // Auto-submit OTP when complete
  useEffect(() => {
    if (
      step === 2 &&
      otpCode.length === 4 &&
      /^[0-9]+$/.test(otpCode) &&
      !loading
    ) {
      const timer = setTimeout(() => {
        handleOtpAutoSubmit();
      }, 500); // 500ms delay for better UX
      return () => clearTimeout(timer);
    }
  }, [otpCode, step, loading, handleOtpAutoSubmit]);

  // Auto-submit PIN when complete
  useEffect(() => {
    if (
      step === 3 &&
      pinCode.length === 6 &&
      /^[0-9]+$/.test(pinCode) &&
      !loading
    ) {
      const timer = setTimeout(() => {
        handlePinAutoSubmit();
      }, 500); // 500ms delay for better UX
      return () => clearTimeout(timer);
    }
  }, [pinCode, step, loading, handlePinAutoSubmit]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNum.length < 10 || !/^[0-9]+$/.test(phoneNum)) {
      setError("Nomor telepon harus minimal 10 digit dan hanya berisi angka");
      return;
    }

    if (!deviceCode) {
      setError("Device code belum siap. Silakan tunggu sebentar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await sendOtp(phoneNum, deviceCode);

      if (result.success === false) {
        throw new Error(result.msg || "Failed to send OTP");
      }

      // Store wToken and userAgent for this session (deviceCode stays the same)
      setWToken(result.wToken);
      setUserAgent(result.userAgent);

      // console.log("✅ Session parameters stored:");
      // console.log(`- Device: ${result.deviceCode.substring(0, 8)}...`);
      // console.log(`- wToken: ${result.wToken.substring(0, 20)}...`);
      // console.log(`- User-Agent: ${result.userAgent}`);

      setStep(2);
    } catch (error) {
      console.error("OTP Error:", error);
      setError("Gagal mengirim OTP. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4 || !/^[0-9]+$/.test(otpCode)) {
      setError("Kode OTP harus minimal 4 digit dan hanya berisi angka");
      return;
    }

    setLoading(true);
    setError("");

    // console.log("🔄 Manual OTP Submit - Attempting login with:");
    // console.log(`- Phone: ${phoneNum}`);
    // console.log(`- OTP: "${otpCode}" (length: ${otpCode.length})`);
    // console.log(
    //   `- Device: ${
    //     deviceCode ? deviceCode.substring(0, 8) + "..." : "undefined"
    //   }`
    // );
    // console.log(
    //   `- wToken: ${wToken ? wToken.substring(0, 20) + "..." : "undefined"}`
    // );
    // console.log(`- User-Agent: ${userAgent || "undefined"}`);

    try {
      const result = await loginOrRegister(
        phoneNum,
        otpCode,
        deviceCode,
        wToken,
        userAgent
      );

      if (result.success === false) {
        throw new Error(result.msg || "Login/register failed");
      }

      setToken(result.data.token);
      setAccountCode(result.data.accountCode);
      setStep(3);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setError("Kode OTP salah atau sudah expired. Silakan input OTP baru.");
      // Reset OTP field so user must input new OTP for auto submit
      setOtpCode("");
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length !== 6 || !/^[0-9]+$/.test(pinCode)) {
      setError("PIN harus tepat 6 digit dan hanya berisi angka");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const md5pass = createMD5Hash(pinCode);
      await setPassword(deviceCode, token, wToken, userAgent, md5pass);

      const result: RegistrationResult = {
        phoneNum,
        pin: pinCode,
        timestamp: Math.floor(Date.now() / 1000),
        accountCode,
      };

      setSuccess(result);
      setStep(4);

      // Auto submit referral code in background after successful PIN setting
      console.log("🎯 Auto submitting referral code in background...");
      setTimeout(async () => {
        console.log("🔄 Starting referral code submission timeout...");
        try {
          const referralResult = await modifyUserData(
            deviceCode,
            token,
            wToken,
            userAgent,
            config.invitationCode,
            generateRandomEmail(), // random email
            generateRandomNickname(), // random nickname
            1, // gender: 1 = Male
            generateBirthday() // +7 days from account creation
          );

          console.log("📥 Referral API response:", referralResult);

          if (referralResult.success) {
            console.log(
              "✅ Referral code submitted successfully:",
              config.invitationCode
            );
          } else if (referralResult.mock) {
            console.log(
              "🔧 Referral code submitted (mocked):",
              config.invitationCode
            );
          } else {
            console.log(
              "❌ Referral code submission failed:",
              referralResult.error || referralResult
            );
          }
        } catch (error) {
          console.log("❌ Background referral submission error:", error);
        }
      }, 1000); // 1 second delay to let PIN setting complete
    } catch (error) {
      console.error("PIN Setting Error:", error);
      setError("Gagal mengatur PIN. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    // 1. Membuat teks yang akan disalin dengan cara yang lebih rapi
    const lines = [`Phone: +62${success?.phoneNum}`, `PIN: ${success?.pin}`];

    if (success?.accountCode) {
      lines.push(`Account Code: ${success?.accountCode}`);
    }

    lines.push(`Timestamp: ${success?.timestamp}`);

    const details = lines.join("\n");

    // 2. Menggunakan async/await untuk menyalin ke clipboard
    try {
      await navigator.clipboard.writeText(details);
      setIsCopied(true); // 3. Update state, bukan DOM langsung

      // Reset ikon/teks setelah 2 detik
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Gagal menyalin: ", err);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPhoneNum("");
    setOtpCode("");
    setPinCode("");
    setError("");
    setSuccess(null);
    setToken("");
    setAccountCode("");
    setIsCopied(false);

    // Generate new session parameters like page refresh
    const newDeviceCode = generateRandomString();
    setDeviceCode(newDeviceCode);
    setWToken("");
    setUserAgent("");

    // console.log("🔄 New session started:");
    // console.log(`- New Device: ${newDeviceCode.substring(0, 8)}...`);
    // console.log("- wToken & User-Agent will be generated on next OTP request");
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-white">
            T****O Auto Register
          </CardTitle>
          {deviceCode && (
            <div className="mt-4 text-sm text-white/70">
              Device Code:{" "}
              <span className="font-mono text-white/90">{deviceCode}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm text-white/50">
              <span className={step >= 1 ? "text-white font-medium" : ""}>
                Phone
              </span>
              <span className={step >= 2 ? "text-white font-medium" : ""}>
                OTP
              </span>
              <span className={step >= 3 ? "text-white font-medium" : ""}>
                PIN
              </span>
              <span className={step >= 4 ? "text-emerald-400 font-medium" : ""}>
                Done
              </span>
            </div>
            <Progress
              value={(step / 4) * 100}
              className="w-full bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-indigo-400 [&>div]:to-purple-400"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/90 font-medium">
                  Nomor Telepon
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/60">
                    +62
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    placeholder="8123456789"
                    className="pl-12 bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-300"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-white/60">
                  Masukkan nomor tanpa awalan 62
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white/20 backdrop-blur border-0 text-white hover:bg-white/30 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengirim OTP...
                  </>
                ) : (
                  "Kirim OTP"
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-center font-medium text-white/90">
                  Kode OTP
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    className="text-white/90"
                    maxLength={4}
                    value={otpCode}
                    onChange={(value) => {
                      setOtpCode(value);
                      // Clear error when user starts typing new OTP
                      if (error && value.length > 0) {
                        setError("");
                      }
                    }}
                    disabled={loading}
                  >
                    <InputOTPGroup className="text-white/90">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-white/60 text-center">
                  Masukkan kode OTP 4 digit yang dikirim ke +62{phoneNum}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-white/30 text-purple-800/90 hover:bg-white/10 hover:text-white"
                  disabled={loading}
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-white/20 backdrop-blur border-0 text-white hover:bg-white/30 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verifikasi"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Set PIN */}
          {step === 3 && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-center font-medium text-white/90">
                  PIN (6 digit)
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    className="text-white/90"
                    maxLength={6}
                    value={pinCode}
                    onChange={(value) => setPinCode(value)}
                    disabled={loading}
                    data-slot="password"
                  >
                    <InputOTPGroup className="text-white/90">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-white/60 text-center">
                  Masukkan PIN 6 digit untuk keamanan akun
                </p>
              </div>
              {accountCode && (
                <Alert className="bg-white/10 border-white/30 backdrop-blur">
                  <AlertDescription className="text-white/90">
                    <span className="font-medium">Account Code:</span>{" "}
                    {accountCode}
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 border-white/30 text-purple-800/90 hover:bg-white/10 hover:text-white"
                  disabled={loading}
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-white/20 backdrop-blur border-0 text-white hover:bg-white/30 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Setting PIN...
                    </>
                  ) : (
                    "Set PIN"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && success && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-emerald-400 text-3xl font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Registrasi Berhasil!
                </h3>
                <p className="text-white/70">Akun Tomoro berhasil dibuat</p>
              </div>

              <Card className="text-left border border-white/30 bg-white/10 backdrop-blur">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-white/90">
                    Detail Akun:
                  </CardTitle>
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 border-white/30 text-white/90 p-2 h-8 w-8"
                  >
                    {isCopied ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Phone:</span>
                    <span className="font-mono text-white/90">
                      +62{success.phoneNum}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">PIN:</span>
                    <span className="font-mono text-white/90">
                      {success.pin}
                    </span>
                  </div>
                  {success.accountCode && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Account Code:</span>
                      <span className="font-mono text-white/90">
                        {success.accountCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/60">Timestamp:</span>
                    <span className="font-mono text-white/90">
                      {success.timestamp}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={resetForm}
                className="w-full bg-white/20 backdrop-blur border-0 text-white hover:bg-white/30 transition-all duration-300"
              >
                🔄 Daftar Akun Baru
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
