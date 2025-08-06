import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNum, otpCode, deviceCode, wToken, userAgent } = body;

    if (!phoneNum || !otpCode || !deviceCode || !wToken || !userAgent) {
      return NextResponse.json(
        {
          success: false,
          msg: "Phone number, OTP code, device code, wToken, and userAgent are required",
        },
        { status: 400 }
      );
    }

    console.log(
      `Login/Register for ${phoneNum} with device: ${deviceCode.substring(
        0,
        8
      )}...`
    );
    console.log(`OTP Code received: "${otpCode}" (length: ${otpCode.length})`);
    console.log(`wToken: ${wToken.substring(0, 20)}...`);
    console.log(`User-Agent: ${userAgent}`);

    const requestBody = {
      phoneArea: "62",
      phone: phoneNum,
      verifyCode: otpCode,
      language: "id",
      deviceCode: "1",
      deviceName: "1",
      channel: "google play",
      revision: "3.0.0",
      type: 2,
      source: "563ZYE",
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      "https://api-service.tomoro-coffee.id/portal/app/member/loginOrRegister",
      {
        method: "POST",
        headers: createHeaders(deviceCode, wToken, userAgent),
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    console.log("API Response Status:", response.status);
    console.log("API Response Data:", JSON.stringify(data, null, 2));

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

    console.log(
      `Login/Register successful for ${phoneNum} with device: ${deviceCode.substring(
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
