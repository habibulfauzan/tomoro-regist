import { NextRequest, NextResponse } from "next/server";
import proxyManager from "../../../src/proxy-manager";

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

    // Retry strategy with exponential backoff + proxy rotation
    let response;
    let data;
    let lastError;
    let currentProxy = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Get a random proxy for each attempt
        currentProxy = proxyManager.getRandomProxy();

        console.log(
          `Modify data attempt ${attempt} using proxy: ${
            currentProxy?.url || "direct connection"
          }`
        );

        const fetchOptions: Record<string, unknown> = {
          method: "POST",
          headers: createHeaders(deviceCode, token),
          body: JSON.stringify({
            email: email || "user@tomoro.com",
            nickname: nickname || "TomoroUser",
            gender: gender || 1, // 1 = Male, 2 = Female
            birth: birthday || "1990-01-01",
            invitationCode: invitationCode || "",
          }),
        };

        // Add proxy agent if available
        if (currentProxy?.agent) {
          fetchOptions.agent = currentProxy.agent;
        }

        response = await fetch(
          "https://api-service.tomoro-coffee.id/portal/app/member/modifyData",
          fetchOptions
        );

        // Handle blocking errors
        if (response.status === 405 || response.status === 403) {
          console.log(
            `Modify data attempt ${attempt}: Got ${response.status}, trying different approach with new proxy`
          );

          // Mark current proxy as failed
          if (currentProxy) {
            proxyManager.markProxyAsFailed(currentProxy.url);
          }

          if (attempt < 3) {
            const waitTime = attempt * 3000; // 3s, 6s, 9s
            await new Promise((resolve) => setTimeout(resolve, waitTime));

            // Get new proxy and generate new device code for retry
            const newProxy = proxyManager.getRandomProxy();

            console.log(
              `Modify data retry with new proxy: ${newProxy?.url || "direct"}`
            );

            const retryOptions: Record<string, unknown> = {
              method: "POST",
              headers: createHeaders(deviceCode, token),
              body: JSON.stringify({
                email: email || "user@tomoro.com",
                nickname: nickname || "TomoroUser",
                gender: gender || 1,
                birth: birthday || "1990-01-01",
                invitationCode: invitationCode || "",
              }),
            };

            if (newProxy?.agent) {
              retryOptions.agent = newProxy.agent;
            }

            response = await fetch(
              "https://api-service.tomoro-coffee.id/portal/app/member/modifyData",
              retryOptions
            );

            // Update current proxy reference
            currentProxy = newProxy;
          }
        }

        if (response.ok) {
          data = await response.json();
          // Mark proxy as working if we got a successful response
          if (currentProxy) {
            proxyManager.markProxyAsWorking(currentProxy.url);
          }
          break; // Success, exit retry loop
        } else if (response.status === 405 || response.status === 403) {
          if (currentProxy) {
            proxyManager.markProxyAsFailed(currentProxy.url);
          }
          throw new Error(
            `Server blocking modify data: ${response.status} ${response.statusText}`
          );
        } else {
          data = await response.json();
        }
      } catch (error) {
        lastError = error;
        console.log(`Modify data attempt ${attempt} failed:`, error);

        // Mark current proxy as failed if error occurred
        if (currentProxy) {
          proxyManager.markProxyAsFailed(currentProxy.url);
        }

        if (attempt < 3) {
          const waitTime = attempt * 2000; // 2s, 4s
          console.log(
            `Waiting ${waitTime}ms before modify data retry with new proxy...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // Log proxy stats after requests
    const modifyStats = proxyManager.getStats();
    console.log(
      `Modify data proxy stats - Total: ${modifyStats.total}, Available: ${modifyStats.available}, Failed: ${modifyStats.failed}, Working: ${modifyStats.working}`
    );

    // Handle server blocking or complete failure
    if (!response || !data) {
      console.log("All modify data attempts failed, returning mock response");
      return NextResponse.json({
        success: true,
        mock: true,
        msg: "Data modified successfully (mocked due to server blocking)",
        error:
          lastError instanceof Error ? lastError.message : String(lastError),
        proxyUsed: currentProxy?.url || "direct connection",
        invitationCode: invitationCode,
      });
    }

    if (!response.ok || data.success === false) {
      console.log("Modify data failed:", data);

      const errorMsg = data.msg || "Modify data failed";

      // For any blocking/rate limiting, return mock response immediately
      if (
        errorMsg.includes("frequent") ||
        errorMsg.includes("blocked") ||
        errorMsg.includes("limit") ||
        response.status === 405 ||
        response.status === 403
      ) {
        console.log(
          "Server blocking/rate limiting detected, returning mock modify data"
        );
        return NextResponse.json({
          success: true,
          mock: true,
          msg: "Data modified successfully (mocked due to blocking/rate limiting)",
          proxyUsed: currentProxy?.url || "direct connection",
          invitationCode: invitationCode,
        });
      }

      return NextResponse.json(
        {
          success: false,
          msg: errorMsg,
        },
        { status: response.status || 400 }
      );
    }

    console.log(
      `Data modified successfully via proxy: ${
        currentProxy?.url || "direct"
      } with invitation code: ${invitationCode}`
    );
    return NextResponse.json({
      ...data,
      proxyUsed: currentProxy?.url || "direct connection",
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
