import { NextRequest, NextResponse } from "next/server";

// Helper function to create headers for API calls
const createHeaders = (
  deviceCode: string,
  token: string,
  wToken: string,
  userAgent: string
) => {
  return {
    "User-Agent": userAgent,
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
    wToken: wToken,
    token: token,
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, deviceCode, token, wToken, userAgent } = body;

    if (!password || !deviceCode || !token || !wToken || !userAgent) {
      return NextResponse.json(
        {
          success: false,
          msg: "Password, device code, token, wToken, and userAgent are required",
        },
        { status: 400 }
      );
    }

    console.log("Setting password...");

    const response = await fetch(
      "https://api-service.tomoro-coffee.id/portal/app/member/v2/setPassWord",
      {
        method: "POST",
        headers: createHeaders(deviceCode, token, wToken, userAgent),
        body: JSON.stringify({
          password: password,
        }),
      }
    );

    const data = await response.json();

    if (data.success === false) {
      console.log("Failed to set password:", data);
      return NextResponse.json(
        {
          success: false,
          msg: data.msg || "Failed to set PIN",
        },
        { status: 400 }
      );
    }

    console.log("Password set successfully");
    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error setting password:", error);
    return NextResponse.json(
      { success: false, msg: "Internal server error" },
      { status: 500 }
    );
  }
}
