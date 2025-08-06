import { NextRequest, NextResponse } from "next/server";

// Generate dynamic wToken to avoid blocking
const generateWToken = (): string => {
  const baseTokens = [
    "0003_984614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
    "0003_A84614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
  ];

  return baseTokens[Math.floor(Math.random() * baseTokens.length)];
};

// Get random user agent
const getRandomUserAgent = (): string => {
  const userAgents = [
    "Mozila/5.0 (Linux; Android 14; SM-S928B/DS) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36",
    "Mozila/5.0 (Linux; Android 14; SM-S928W) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Helper function to create headers for modify data API
const createHeaders = (deviceCode: string, token: string) => {
  const isAndroid = Math.random() > 0.5;

  const baseHeaders = {
    "User-Agent": isAndroid ? "okhttp/4.11.0" : getRandomUserAgent(),
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Content-Type": "application/json",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };

  const apiHeaders = {
    revision: "3.0.0",
    countryCode: "id",
    appChannel: "google play",
    appLanguage: "id",
    timeZone: "Asia/Jakarta",
    deviceCode: deviceCode,
    ucde: "t698",
    wToken: generateWToken(),
    token: token,
  };

  return {
    ...baseHeaders,
    ...apiHeaders,
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      deviceCode,
      token,
      invitationCode,
      email,
      nickname,
      gender,
      birthday,
    } = body;

    if (!deviceCode || !token) {
      return NextResponse.json(
        { success: false, msg: "Device code and token are required" },
        { status: 400 }
      );
    }

    console.log(`Modifying user data with invitation code: ${invitationCode}`);

    // Add natural delay to mimic human behavior
    const naturalDelay = 1500 + Math.random() * 2000; // 1.5s - 3.5s
    await new Promise((resolve) => setTimeout(resolve, naturalDelay));

    let response;
    let data;

    try {
      console.log("Sending modify data request...");

      response = await fetch(
        "https://api-service.tomoro-coffee.id/portal/app/member/modifyData",
        {
          method: "POST",
          headers: createHeaders(deviceCode, token),
          body: JSON.stringify({
            email: email || "user@tomoro.com",
            nickname: nickname || "TomoroUser",
            gender: gender || 1, // 1 = Male, 2 = Female
            birth: birthday || "1990-01-01",
            invitationCode: invitationCode || "",
          }),
        }
      );

      data = await response.json();
    } catch (error) {
      console.error("Modify data request failed:", error);
      // Silent fail for background referral process
      return NextResponse.json({
        success: false,
        msg: "Failed to modify user data",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    if (!response.ok || data.success === false) {
      console.log("Modify data failed:", data);
      return NextResponse.json(
        {
          success: false,
          msg: data.msg || "Modify data failed",
        },
        { status: response.status || 400 }
      );
    }

    console.log(
      `Data modified successfully with invitation code: ${invitationCode}`
    );
    return NextResponse.json({
      ...data,
      invitationCode: invitationCode,
    });
  } catch (error) {
    console.error("Error in modify data:", error);
    return NextResponse.json(
      { success: false, msg: "Internal server error" },
      { status: 500 }
    );
  }
}
