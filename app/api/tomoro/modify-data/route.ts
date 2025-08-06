import { NextRequest, NextResponse } from "next/server";

// Helper function to create headers for modify data API
const createHeaders = (
  deviceCode: string,
  token: string,
  wToken: string,
  userAgent: string
) => {
  const baseHeaders = {
    "User-Agent": userAgent,
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
    wToken: wToken,
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
      wToken,
      userAgent,
      invitationCode,
      email,
      nickname,
      gender,
      birthday,
    } = body;

    if (!deviceCode || !token || !wToken || !userAgent) {
      return NextResponse.json(
        {
          success: false,
          msg: "Device code, token, wToken, and userAgent are required",
        },
        { status: 400 }
      );
    }

    console.log(
      `Modifying user data with invitation code: ${invitationCode} using device: ${deviceCode.substring(
        0,
        8
      )}...`
    );

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
          headers: createHeaders(deviceCode, token, wToken, userAgent),
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
