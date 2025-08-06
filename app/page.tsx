"use client";

import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";

// Configuration
const config = {
  invitationCode: "593WNU",
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

// API functions
const sendOtp = async (phoneNum: string, deviceCode: string) => {
  const response = await fetch("/api/tomoro/send-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: phoneNum,
      areaCode: "62",
      verifyChannel: "SMS",
      deviceCode,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send OTP");
  }

  return response.json();
};

const loginOrRegister = async (
  phoneNum: string,
  verifyCode: string,
  deviceCode: string
) => {
  const response = await fetch("/api/tomoro/login-register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneArea: "62",
      phone: phoneNum,
      verifyCode: verifyCode,
      language: "id",
      deviceCode: "1",
      deviceName: "1",
      channel: "google play",
      revision: "3.0.0",
      type: 2,
      source: "563ZYE",
      deviceCodeHeader: deviceCode,
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
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to set password");
  }

  return response.json();
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

  // Form data
  const [phoneNum, setPhoneNum] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pinCode, setPinCode] = useState("");

  // Registration data
  const [deviceCode, setDeviceCode] = useState("");
  const [token, setToken] = useState("");
  const [accountCode, setAccountCode] = useState("");

  // Generate device code on client side only to prevent hydration mismatch
  useEffect(() => {
    setDeviceCode(generateRandomString());
  }, []);

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
      await sendOtp(phoneNum, deviceCode);
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

    try {
      const result = await loginOrRegister(phoneNum, otpCode, deviceCode);

      if (result.success === false) {
        throw new Error(result.msg || "Login/register failed");
      }

      setToken(result.data.token);
      setAccountCode(result.data.accountCode);
      setStep(3);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setError("Kode OTP salah atau sudah expired. Silakan coba lagi.");
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
      await setPassword(deviceCode, token, md5pass);

      const result: RegistrationResult = {
        phoneNum,
        pin: pinCode,
        timestamp: Math.floor(Date.now() / 1000),
        accountCode,
      };

      setSuccess(result);
      setStep(4);
    } catch (error) {
      console.error("PIN Setting Error:", error);
      setError("Gagal mengatur PIN. Silakan coba lagi.");
    } finally {
      setLoading(false);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">
            Tomoro Register
          </h1>
          {/* <p className="text-gray-600">Daftar akun baru dengan mudah</p>
          {deviceCode && (
            <div className="mt-4 text-sm text-gray-500">
              Device Code: <span className="font-mono">{deviceCode}</span>
            </div>
          )} */}
          {config.invitationCode && (
            <div className="text-sm text-green-600">
              Invitation Code:{" "}
              <span className="font-mono">{config.invitationCode}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span className={step >= 1 ? "text-amber-600 font-medium" : ""}>
              Phone
            </span>
            <span className={step >= 2 ? "text-amber-600 font-medium" : ""}>
              OTP
            </span>
            <span className={step >= 3 ? "text-amber-600 font-medium" : ""}>
              PIN
            </span>
            <span className={step >= 4 ? "text-green-600 font-medium" : ""}>
              Done
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500">✗</span>
              </div>
              <div className="ml-3">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  +62
                </span>
                <input
                  type="tel"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  placeholder="8123456789"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-700"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Masukkan nomor tanpa awalan 62
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Mengirim OTP...
                </div>
              ) : (
                "Kirim OTP"
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode OTP
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-lg tracking-widest text-gray-700"
                required
                disabled={loading}
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan kode OTP yang dikirim ke +62{phoneNum}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verifikasi"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Set PIN */}
        {step === 3 && (
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN (6 digit)
              </label>
              <input
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-lg tracking-widest text-gray-700"
                required
                disabled={loading}
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan PIN 6 digit untuk keamanan akun
              </p>
            </div>
            {accountCode && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Account Code:</span>{" "}
                  {accountCode}
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Setting PIN...
                  </div>
                ) : (
                  "Set PIN"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && success && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Registrasi Berhasil!
              </h3>
              <p className="text-gray-600">Akun Tomoro berhasil dibuat</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-3">Detail Akun:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-mono text-gray-700">
                    +62{success.phoneNum}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PIN:</span>
                  <span className="font-mono text-gray-700">{success.pin}</span>
                </div>
                {success.accountCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Code:</span>
                    <span className="font-mono text-gray-700">
                      {success.accountCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="font-mono text-gray-700">
                    {success.timestamp}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200"
            >
              Daftar Akun Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
