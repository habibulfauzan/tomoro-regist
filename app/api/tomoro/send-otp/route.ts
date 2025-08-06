import { NextRequest, NextResponse } from "next/server";

// Helper function to create headers for API calls
const createHeaders = (deviceCode: string, token?: string) => {
  return {
    "User-Agent": "okhttp/4.11.0",
    Connection: "Keep-Alive",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/json",
    revision: "3.0.0",
    countryCode: "id",
    appChannel: "google play",
    appLanguage: "en",
    timeZone: "Asia/Jakarta",
    deviceCode: deviceCode,
    ucde: "t698",
    wToken:
      "0003_984614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
    ...(token ? { token } : {}),
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, areaCode, verifyChannel, deviceCode } = body;

    if (!phone || !deviceCode) {
      return NextResponse.json(
        { success: false, msg: "Phone number and device code are required" },
        { status: 400 }
      );
    }

    console.log(`Sending OTP to ${phone}`);

    const url = new URL(
      "https://api-service.tomoro-coffee.id/portal/app/member/sendMessage"
    );
    url.searchParams.append("phone", phone);
    url.searchParams.append("areaCode", areaCode || "62");
    url.searchParams.append("verifyChannel", verifyChannel || "SMS");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: createHeaders(deviceCode),
    });

    const data = await response.json();

    if (data.success === false) {
      console.log("Failed to send OTP:", data.msg);
      if (data.msg === "Request too frequent. Please try again in 1 hour") {
        return NextResponse.json({
          success: false,
          limit: true,
          msg: data.msg,
        });
      }
      return NextResponse.json(
        {
          success: false,
          msg: data.msg,
        },
        { status: 400 }
      );
    }

    console.log(`OTP successfully sent to ${phone}`);
    return NextResponse.json({
      success: true,
      serverRequestId: data.serverRequestId,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, msg: "Internal server error" },
      { status: 500 }
    );
  }
}
