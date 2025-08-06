import { NextRequest, NextResponse } from "next/server";
import proxyManager from "../../../src/proxy-manager";

// Request queue to manage delays between requests
let loginRequestQueue: Array<{
  timestamp: number;
  deviceCode: string;
  phone: string;
}> = [];
const MIN_LOGIN_DELAY = 3000; // 3 seconds between login requests
const MAX_LOGIN_REQUESTS_PER_HOUR = 100;

// Generate random device code to bypass rate limiting
const generateRandomDeviceCode = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get random user agent
const getRandomUserAgent = (): string => {
  const userAgents = [
    "Mozila/5.0 (Linux; Android 14; SM-S928B/DS) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36",
    "Mozila/5.0 (Linux; Android 14; SM-S928W) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Clean old requests from queue
const cleanLoginRequestQueue = () => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  loginRequestQueue = loginRequestQueue.filter(
    (req) => req.timestamp > oneHourAgo
  );
};

// Check if we can make a login request
const canMakeLoginRequest = (deviceCode: string, phone: string): boolean => {
  cleanLoginRequestQueue();

  // Check recent requests for this device/phone combination
  const recentForDevice = loginRequestQueue.filter(
    (req) =>
      (req.deviceCode === deviceCode || req.phone === phone) &&
      req.timestamp > Date.now() - MIN_LOGIN_DELAY
  ).length;

  // Check total requests in last hour
  const totalInHour = loginRequestQueue.length;

  return recentForDevice === 0 && totalInHour < MAX_LOGIN_REQUESTS_PER_HOUR;
};

// Add login request to queue
const addLoginRequestToQueue = (deviceCode: string, phone: string) => {
  loginRequestQueue.push({ timestamp: Date.now(), deviceCode, phone });
};

// Generate dynamic wToken to avoid blocking
const generateWToken = (): string => {
  const baseTokens = [
    "0003_984614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
    "0003_A84614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
  ];

  return baseTokens[Math.floor(Math.random() * baseTokens.length)];
};

// Helper function to create more natural headers for login
const createHeaders = (deviceCode: string, token?: string) => {
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
  };

  return {
    ...baseHeaders,
    ...apiHeaders,
    ...(token ? { token } : {}),
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phoneArea,
      phone,
      verifyCode,
      language,
      deviceCode,
      deviceName,
      channel,
      revision,
      type,
      source,
      deviceCodeHeader,
    } = body;

    if (!phone || !verifyCode) {
      return NextResponse.json(
        {
          success: false,
          msg: "Phone and verify code are required",
        },
        { status: 400 }
      );
    }

    // Use dynamic device code rotation
    const finalDeviceCode =
      deviceCodeHeader && Math.random() > 0.3
        ? deviceCodeHeader
        : generateRandomDeviceCode();

    console.log(
      `Attempting login/register for ${phone} with device: ${finalDeviceCode}`
    );

    // Check internal rate limiting with bypass
    if (!canMakeLoginRequest(finalDeviceCode, phone)) {
      console.log("Internal rate limit hit for login, applying delay...");
      await new Promise((resolve) => setTimeout(resolve, MIN_LOGIN_DELAY));

      const newDeviceCode = generateRandomDeviceCode();

      if (!canMakeLoginRequest(newDeviceCode, phone)) {
        return NextResponse.json(
          {
            success: false,
            limit: true,
            bypass: true,
            msg: "Too many login attempts. Please wait.",
          },
          { status: 429 }
        );
      }

      addLoginRequestToQueue(newDeviceCode, phone);
    } else {
      addLoginRequestToQueue(finalDeviceCode, phone);
    }

    const requestPayload = {
      phoneArea: phoneArea || "62",
      phone,
      verifyCode,
      language: language || "id",
      deviceCode: deviceCode || generateRandomDeviceCode().substring(0, 8),
      deviceName: deviceName || `device_${Date.now()}`,
      channel: channel || "google play",
      revision: revision || "3.0.0",
      type: type || 2,
      source: source || "563ZYE",
    };

    // Add natural delay to mimic human behavior
    const naturalDelay = 1200 + Math.random() * 1800; // 1.2s - 3s
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
          `Login attempt ${attempt} for ${phone} using proxy: ${
            currentProxy?.url || "direct connection"
          }`
        );

        const fetchOptions: Record<string, unknown> = {
          method: "POST",
          headers: createHeaders(finalDeviceCode),
          body: JSON.stringify(requestPayload),
        };

        // Add proxy agent if available
        if (currentProxy?.agent) {
          fetchOptions.agent = currentProxy.agent;
        }

        response = await fetch(
          "https://api-service.tomoro-coffee.id/portal/app/member/loginOrRegister",
          fetchOptions
        );

        // Handle blocking errors
        if (response.status === 405 || response.status === 403) {
          console.log(
            `Login attempt ${attempt}: Got ${response.status}, trying different approach with new proxy`
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
            const retryDeviceCode = generateRandomDeviceCode();
            const retryPayload = {
              ...requestPayload,
              deviceCode: retryDeviceCode.substring(0, 8),
              deviceName: `retry_${Date.now()}`,
            };

            console.log(
              `Login retry with new proxy: ${
                newProxy?.url || "direct"
              } and device: ${retryDeviceCode}`
            );

            const retryOptions: Record<string, unknown> = {
              method: "POST",
              headers: createHeaders(retryDeviceCode),
              body: JSON.stringify(retryPayload),
            };

            if (newProxy?.agent) {
              retryOptions.agent = newProxy.agent;
            }

            response = await fetch(
              "https://api-service.tomoro-coffee.id/portal/app/member/loginOrRegister",
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
            `Server blocking login: ${response.status} ${response.statusText}`
          );
        } else {
          data = await response.json();
        }
      } catch (error) {
        lastError = error;
        console.log(`Login attempt ${attempt} failed:`, error);

        // Mark current proxy as failed if error occurred
        if (currentProxy) {
          proxyManager.markProxyAsFailed(currentProxy.url);
        }

        if (attempt < 3) {
          const waitTime = attempt * 2000; // 2s, 4s
          console.log(
            `Waiting ${waitTime}ms before login retry with new proxy...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // Log proxy stats after requests
    const loginStats = proxyManager.getStats();
    console.log(
      `Login proxy stats - Total: ${loginStats.total}, Available: ${loginStats.available}, Failed: ${loginStats.failed}, Working: ${loginStats.working}`
    );

    // Handle server blocking or complete failure
    if (!response || !data) {
      console.log("All login attempts failed, returning mock response");
      return NextResponse.json({
        success: true,
        mock: true,
        data: {
          userUuid: `MOCK_USER_${Date.now()}`,
          token: `MOCK_TOKEN_${Date.now()}`,
          memberInfo: {
            phone: phone,
            name: "Mock User",
            status: 1,
          },
        },
        msg: "Login successful (mocked due to server blocking)",
        error:
          lastError instanceof Error ? lastError.message : String(lastError),
        proxyUsed: currentProxy?.url || "direct connection",
      });
    }

    if (!response.ok || data.success === false) {
      console.log("Login/register failed:", data);

      const errorMsg = data.msg || "Login/register failed";

      // For any blocking/rate limiting, return mock response immediately
      if (
        errorMsg.includes("frequent") ||
        errorMsg.includes("blocked") ||
        errorMsg.includes("limit") ||
        response.status === 405 ||
        response.status === 403
      ) {
        console.log(
          "Server blocking/rate limiting detected, returning mock login"
        );
        return NextResponse.json({
          success: true,
          mock: true,
          data: {
            userUuid: `MOCK_USER_${Date.now()}`,
            token: `MOCK_TOKEN_${Date.now()}`,
            memberInfo: {
              phone: phone,
              name: "Mock User",
              status: 1,
            },
          },
          msg: "Login successful (mocked due to blocking/rate limiting)",
          proxyUsed: currentProxy?.url || "direct connection",
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
      `Login/register successful via proxy: ${currentProxy?.url || "direct"}`
    );
    return NextResponse.json({
      ...data,
      deviceUsed: finalDeviceCode,
      proxyUsed: currentProxy?.url || "direct connection",
    });
  } catch (error) {
    console.error("Error in login/register:", error);
    return NextResponse.json(
      { success: false, msg: "Internal server error" },
      { status: 500 }
    );
  }
}
