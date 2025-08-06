import { NextRequest, NextResponse } from "next/server";

// Helper function to create headers
const createHeaders = (deviceCode: string) => {
  return {
    "User-Agent": "okhttp/4.11.0",
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
    wToken:
      "0003_984614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNum, otpCode, deviceCode } = body;

    if (!phoneNum || !otpCode || !deviceCode) {
      return NextResponse.json(
        {
          success: false,
          msg: "Phone number, OTP code, and device code are required",
        },
        { status: 400 }
      );
    }

    console.log(`Login/Register for ${phoneNum} with OTP: ${otpCode}`);

    const requestBody = {
      phone: phoneNum,
      areaCode: "62",
      code: otpCode,
      verifyChannel: "SMS",
    };

    const response = await fetch(
      "https://api-service.tomoro-coffee.id/portal/app/member/loginOrRegister",
      {
        method: "POST",
        headers: createHeaders(deviceCode),
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Login/Register API Error:", data);
      return NextResponse.json(
        {
          success: false,
          msg:
            data.msg ||
            `Login/Register failed: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    if (data.success === false) {
      console.error("Login/Register failed:", data);
      return NextResponse.json(
        { success: false, msg: data.msg || "Login/Register failed" },
        { status: 400 }
      );
    }

    console.log(`Login/Register successful for ${phoneNum}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in login/register:", error);
    return NextResponse.json(
      {
        success: false,
        msg: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
