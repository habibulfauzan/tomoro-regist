import { NextRequest, NextResponse } from "next/server";

// Generate random device code
const generateRandomDeviceCode = (): string => {
  return Math.random().toString(16).substring(2, 18);
};

// Generate random wToken
const generateWToken = (): string => {
  const baseTokens = [
    "0003_984614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
    "0003_A84614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
    "0003_B84614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
  ];
  return baseTokens[Math.floor(Math.random() * baseTokens.length)];
};

// Generate random user agent
const generateUserAgent = (): string => {
  const userAgents = [
    "okhttp/4.11.0",
    "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-A536E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.193 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 14; SM-S928W) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.164 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.112 Mobile Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Helper function to create headers
const createHeaders = (
  deviceCode: string,
  wToken: string,
  userAgent: string
) => {
  return {
    "User-Agent": userAgent,
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    Connection: "Keep-Alive",
    "Accept-Encoding": "gzip",
    revision: "3.0.0",
    countryCode: "id",
    appChannel: "google play",
    appLanguage: "en",
    timeZone: "Asia/Jakarta",
    deviceCode: deviceCode,
    ucde: "t698",
    wToken: wToken,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, msg: "Phone number is required" },
        { status: 400 }
      );
    }

    // Generate session identifiers - consistent per registration flow
    const deviceCode = generateRandomDeviceCode();
    const wToken = generateWToken();
    const userAgent = generateUserAgent();

    console.log(
      `Sending OTP to ${phone} with device: ${deviceCode.substring(0, 8)}...`
    );

    const url = new URL(
      "https://api-service.tomoro-coffee.id/portal/app/member/sendMessage"
    );
    url.searchParams.append("phone", phone);
    url.searchParams.append("areaCode", "62");
    url.searchParams.append("verifyChannel", "SMS");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: createHeaders(deviceCode, wToken, userAgent),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OTP API Error:", data);
      return NextResponse.json(
        {
          success: false,
          msg:
            data.msg ||
            `Failed to send OTP: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    if (data.success === false) {
      console.error("OTP failed:", data);
      return NextResponse.json(
        { success: false, msg: data.msg || "Failed to send OTP" },
        { status: 400 }
      );
    }

    console.log(
      `OTP sent successfully to ${phone} with device: ${deviceCode.substring(
        0,
        8
      )}...`
    );
    return NextResponse.json({
      ...data,
      deviceCode: deviceCode,
      wToken: wToken,
      userAgent: userAgent,
    });
  } catch (error) {
    console.error("Error in send OTP:", error);
    return NextResponse.json(
      {
        success: false,
        msg: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
