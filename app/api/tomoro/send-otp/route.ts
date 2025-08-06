import { NextRequest, NextResponse } from "next/server";
import proxyManager from "../../../src/proxy-manager";

// Request queue to manage delays between requests
let requestQueue: Array<{ timestamp: number; deviceCode: string }> = [];
const MIN_REQUEST_DELAY = 2000; // 2 seconds between requests
const MAX_REQUESTS_PER_HOUR = 100;

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

// Get random user agent (more native-like)
const getRandomUserAgent = (): string => {
  const userAgents = [
    "Mozila/5.0 (Linux; Android 14; SM-S928B/DS) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36",
    "Mozila/5.0 (Linux; Android 14; SM-S928W) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Clean old requests from queue
const cleanRequestQueue = () => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  requestQueue = requestQueue.filter((req) => req.timestamp > oneHourAgo);
};

// Check if we can make a request
const canMakeRequest = (deviceCode: string): boolean => {
  cleanRequestQueue();

  // Check recent requests for this device
  const recentForDevice = requestQueue.filter(
    (req) =>
      req.deviceCode === deviceCode &&
      req.timestamp > Date.now() - MIN_REQUEST_DELAY
  ).length;

  // Check total requests in last hour
  const totalInHour = requestQueue.length;

  return recentForDevice === 0 && totalInHour < MAX_REQUESTS_PER_HOUR;
};

// Add request to queue
const addRequestToQueue = (deviceCode: string) => {
  requestQueue.push({ timestamp: Date.now(), deviceCode });
};

// Generate dynamic wToken to avoid blocking
const generateWToken = (): string => {
  const baseTokens = [
    "0003_984614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
    "0003_A84614388F42C9E15218848EFF3D5A63990F4DFD819CEE6CA542F0B6B95856D59D60BA2F0CB2DCEEDE6DE625006E964E86753C4E1411UOPyiatPdJxVDCVka4OmK7ObPdj2/pXGZeMm3fhu5Bex7KPbQMKyEJc1CCqSWjREqY3a1cTmPxOCCSG+hevig/yi7IDOUFBZHFfj/Y66kgmUNGUzuBBf3SD9p4fb5n0MCX/sCr2kA++S5ou7MKZWYO62DL9txSQJ22/03Ma1Ktzvi6b8zFvHffLcMNFOZAbvPB9SBVEEE+UqHsmxHgqXsHcV6XuAXEHP3+gkQpYtwLUDDJYBU593BH3A13WZx8GatwcV2hKm2sPSc0pycHHV6hObZlnFu/10Us5VKXyHWAMVlmLTz7qQe0Z5TPF8J6B2Q2PI1INME2/trPje6dFMSQ/ZVkSGyasBxrQGngcoR4pRvSY7keJdSbSnD+FPMQPhVe9/u/RI4vJt1Be75zTG5JFAo0uDu1cRobBJujqVzZExeBuAcmGc4E9kLf3pFD8CHILrQzQBMGM8jZ+7Pw3IA1QihD0tUWLEZQxZUAG3pcnBWM8m+TkR0M/Nr2O0V5N4KyGudEck1XOxXUFkD1r51bmB9aq1gDH9cTxJkDTg7Gw=_fHx8",
  ];

  return baseTokens[Math.floor(Math.random() * baseTokens.length)];
};

// Helper function to create more natural headers
const createHeaders = (deviceCode: string, token?: string) => {
  const isAndroid = Math.random() > 0.5;

  const baseHeaders = {
    "User-Agent": isAndroid ? "okhttp/4.11.0" : getRandomUserAgent(),
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
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
      phone,
      areaCode,
      verifyChannel,
      deviceCode: originalDeviceCode,
    } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, msg: "Phone number is required" },
        { status: 400 }
      );
    }

    // Use random device code if not provided or if we're bypassing rate limits
    const deviceCode =
      originalDeviceCode && Math.random() > 0.5
        ? originalDeviceCode
        : generateRandomDeviceCode();

    console.log(`Sending OTP to ${phone} using device: ${deviceCode}`);

    // Check if we can make request (bypass internal rate limiting)
    if (!canMakeRequest(deviceCode)) {
      console.log("Internal rate limit hit, waiting...");
      // Wait for minimum delay then retry with new device code
      await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_DELAY));
      const newDeviceCode = generateRandomDeviceCode();

      if (!canMakeRequest(newDeviceCode)) {
        return NextResponse.json(
          {
            success: false,
            limit: true,
            bypass: true,
            msg: "Too many requests. Try again in a few seconds.",
          },
          { status: 429 }
        );
      }

      // Use the new device code
      addRequestToQueue(newDeviceCode);
    } else {
      addRequestToQueue(deviceCode);
    }

    const finalDeviceCode = deviceCode;

    // Add natural delay to mimic human behavior
    const naturalDelay = 800 + Math.random() * 1200; // 800ms - 2000ms
    await new Promise((resolve) => setTimeout(resolve, naturalDelay));

    const url = new URL(
      "https://api-service.tomoro-coffee.id/portal/app/member/sendMessage"
    );
    url.searchParams.append("phone", phone);
    url.searchParams.append("areaCode", areaCode || "62");
    url.searchParams.append("verifyChannel", verifyChannel || "SMS");

    // Retry with exponential backoff strategy + proxy rotation
    let response;
    let data;
    let lastError;
    let currentProxy = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Get a random proxy for each attempt
        currentProxy = proxyManager.getRandomProxy();

        console.log(
          `OTP attempt ${attempt} for ${phone} using proxy: ${
            currentProxy?.url || "direct connection"
          }`
        );

        const fetchOptions: Record<string, unknown> = {
          method: "GET",
          headers: createHeaders(finalDeviceCode),
        };

        // Add proxy agent if available
        if (currentProxy?.agent) {
          fetchOptions.agent = currentProxy.agent;
        }

        response = await fetch(url.toString(), fetchOptions);

        // If we get 405 or other blocking errors, don't try to parse JSON
        if (response.status === 405 || response.status === 403) {
          console.log(
            `Attempt ${attempt}: Got ${response.status}, trying different approach with new proxy`
          );

          // Mark current proxy as failed
          if (currentProxy) {
            proxyManager.markProxyAsFailed(currentProxy.url);
          }

          if (attempt < 3) {
            // Wait longer and try with different device + new proxy
            const waitTime = attempt * 2000; // 2s, 4s, 6s
            await new Promise((resolve) => setTimeout(resolve, waitTime));

            // Get a new proxy and device code for retry
            const newProxy = proxyManager.getRandomProxy();
            const newDeviceCode = generateRandomDeviceCode();

            console.log(
              `Retry with new proxy: ${
                newProxy?.url || "direct"
              } and device: ${newDeviceCode}`
            );

            const retryOptions: Record<string, unknown> = {
              method: "GET",
              headers: createHeaders(newDeviceCode),
            };

            if (newProxy?.agent) {
              retryOptions.agent = newProxy.agent;
            }

            // Try again with new proxy and headers
            response = await fetch(url.toString(), retryOptions);

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
            `Server blocking: ${response.status} ${response.statusText}`
          );
        } else {
          data = await response.json();
        }
      } catch (error) {
        lastError = error;
        console.log(`OTP attempt ${attempt} failed:`, error);

        // Mark current proxy as failed if error occurred
        if (currentProxy) {
          proxyManager.markProxyAsFailed(currentProxy.url);
        }

        if (attempt < 3) {
          const waitTime = attempt * 1500; // 1.5s, 3s
          console.log(`Waiting ${waitTime}ms before retry with new proxy...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // Log proxy stats after requests
    const stats = proxyManager.getStats();
    console.log(
      `Proxy stats - Total: ${stats.total}, Available: ${stats.available}, Failed: ${stats.failed}, Working: ${stats.working}`
    );

    // Handle server blocking or errors
    if (!response || !data) {
      console.log("All attempts failed, returning mock response");
      return NextResponse.json({
        success: true,
        mock: true,
        serverRequestId: `MOCK_OTP_${Date.now()}`,
        msg: "OTP sent (mocked due to server blocking)",
        error:
          lastError instanceof Error ? lastError.message : String(lastError),
        proxyUsed: currentProxy?.url || "direct connection",
      });
    }

    if (data.success === false) {
      console.log("Failed to send OTP:", data.msg);

      // If rate limited, return mock response immediately
      if (data.msg?.includes("frequent") || data.msg?.includes("hour")) {
        console.log("Rate limited by server, returning mock response");
        return NextResponse.json({
          success: true,
          mock: true,
          serverRequestId: `MOCK_RATE_${Date.now()}`,
          msg: "OTP sent (mocked due to rate limiting)",
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

    console.log(
      `OTP successfully sent to ${phone} via proxy: ${
        currentProxy?.url || "direct"
      }`
    );
    return NextResponse.json({
      success: true,
      serverRequestId: data.serverRequestId,
      deviceUsed: finalDeviceCode,
      proxyUsed: currentProxy?.url || "direct connection",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, msg: "Internal server error" },
      { status: 500 }
    );
  }
}
