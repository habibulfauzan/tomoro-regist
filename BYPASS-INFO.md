# 📝 TOMORO Registration System

## 🎯 **Current System: Consistent Session Rotation + Auto Referral**

Sistem registrasi dengan rotation parameters yang konsisten per session. Setiap flow registrasi (dari awal sampai selesai) menggunakan Device Code, wToken, dan User-Agent yang sama, tapi setiap session baru akan generate parameter berbeda.

## 🚀 **Registration Flow:**

```
1. Phone Input → Generate Session Parameters (deviceCode, wToken, userAgent)
   ↓
2. Send OTP → Use Session Parameters
   ↓
3. OTP Verification → Use Same Session Parameters
   ↓
4. PIN Setting → Use Same Session Parameters
   ↓
5. Success Page → Auto Referral with Same Session Parameters (Background)
```

## ✅ **Current Features:**

### **1. Consistent Session Rotation**

- ✅ **Device Code**: Generated once di send-otp, digunakan sampai flow selesai
- ✅ **wToken**: Generated once di send-otp, digunakan sampai flow selesai
- ✅ **User-Agent**: Generated once di send-otp, digunakan sampai flow selesai
- ✅ **Session persistence**: Parameters tetap sama dari OTP → Login → PIN → Referral

### **2. Parameter Generation**

- ✅ **Device Code**: Random 16-char hex string
- ✅ **wToken**: Random selection dari 3 base tokens
- ✅ **User-Agent**: Random selection dari 5 browser signatures (okhttp, Chrome Android variants)

### **3. API Detection Avoidance**

- ✅ **Per-session consistency**: API melihat 1 aplikasi yang sama dalam 1 flow
- ✅ **Cross-session variation**: Setiap registrasi baru = aplikasi berbeda
- ✅ **Natural headers**: Browser-like signatures
- ✅ **Proper timing**: Natural delays antar request

### **4. Auto Referral System**

- ✅ **Background processing** setelah PIN berhasil di-set
- ✅ **Same session parameters** untuk consistency
- ✅ **Silent operation** - tidak mengganggu user experience
- ✅ **Auto user data generation** - nickname, email, birthday

## 🔄 **Session Rotation Strategy:**

### **Per Session (Consistent):**

```
Session 1:
- Device: "abc123def456", wToken: "0003_984614...", User-Agent: "okhttp/4.11.0"
- Send OTP → Login → PIN → Referral (semua menggunakan parameter yang sama)

Session 2 (refresh/baru):
- Device: "xyz789ghi012", wToken: "0003_A84614...", User-Agent: "Chrome Android"
- Send OTP → Login → PIN → Referral (parameter baru, konsisten dalam session)
```

### **Detection Avoidance:**

- ✅ **70% Impact**: Device Code rotation (primary identifier)
- ✅ **20% Impact**: User-Agent rotation (device signature)
- ✅ **10% Impact**: wToken rotation (session token)

## 📋 **API Endpoints:**

### **1. Send OTP - `/api/tomoro/send-otp`**

```javascript
GET /api/tomoro/send-otp?phone=87866276042
Response: {
  success: true,
  deviceCode: "abc123def456",    // Generated for this session
  wToken: "0003_984614...",      // Generated for this session
  userAgent: "okhttp/4.11.0"     // Generated for this session
}
```

### **2. Login/Register - `/api/tomoro/login-register`**

```javascript
POST /api/tomoro/login-register
Body: {
  phoneNum: "87866276042",
  otpCode: "1234",
  deviceCode: "abc123def456",    // Same from send-otp
  wToken: "0003_984614...",      // Same from send-otp
  userAgent: "okhttp/4.11.0"     // Same from send-otp
}
```

### **3. Set Password - `/api/tomoro/set-password`**

```javascript
POST / api / tomoro / set - password;
Body: {
  deviceCode, token, password;
}
// Uses deviceCode from session
```

### **4. Auto Referral - `/api/tomoro/modify-data`**

```javascript
POST /api/tomoro/modify-data
Body: {
  deviceCode: "abc123def456",    // Same from session
  token: "user_token",
  wToken: "0003_984614...",      // Same from session
  userAgent: "okhttp/4.11.0",    // Same from session
  invitationCode: "invitation_code"
}
```

## 🛠️ **Technical Implementation:**

### **1. Session Management:**

```javascript
// Frontend state management
const [deviceCode, setDeviceCode] = useState("");
const [wToken, setWToken] = useState("");
const [userAgent, setUserAgent] = useState("");

// Set once from send-OTP response, used throughout flow
const result = await sendOtp(phoneNum);
setDeviceCode(result.deviceCode);
setWToken(result.wToken);
setUserAgent(result.userAgent);
```

### **2. Parameter Generation:**

```javascript
// Backend - send-otp/route.ts
const deviceCode = generateRandomDeviceCode(); // Random 16-char hex
const wToken = generateWToken(); // 1 of 3 base tokens
const userAgent = generateUserAgent(); // 1 of 5 user agents

// All subsequent API calls use these same values
```

### **3. Consistent Headers:**

```javascript
// Same headers structure across all endpoints
const createHeaders = (deviceCode, wToken, userAgent) => ({
  "User-Agent": userAgent,
  deviceCode: deviceCode,
  wToken: wToken,
  // ... other tomoro headers
});
```

## 📊 **Expected Behavior:**

### **Normal Registration Flow:**

1. ✅ **Send OTP**: Generate new session parameters → API success
2. ✅ **Login**: Use same parameters → API sees consistent "device"
3. ✅ **Set PIN**: Use same parameters → Continuation of same session
4. ✅ **Auto Referral**: Use same parameters → Background completion

### **New Registration (Refresh/New User):**

1. ✅ **New Session**: Generate completely new parameters
2. ✅ **API Detection**: Appears as different "application/device"
3. ✅ **No Tracking**: Can't be linked to previous registration

### **API Perspective:**

- **Per Session**: Consistent legitimate app behavior
- **Cross Sessions**: Multiple different apps/devices
- **No Pattern**: Can't detect automation/scripting

## 🎯 **Key Benefits:**

✅ **Session Consistency** - Natural app behavior per registration flow  
✅ **Cross-Session Variation** - Each registration appears as different device  
✅ **Real API Detection Avoidance** - Proper device fingerprinting  
✅ **Auto Referral Persistence** - Background process uses same session  
✅ **Clean Architecture** - Simple state management  
✅ **Maintainable Code** - Clear parameter flow

## 📦 **Dependencies:**

```json
{
  "crypto-js": "^4.2.0",
  "input-otp": "^1.4.2",
  "next": "15.4.5",
  "react": "19.1.0",
  "react-dom": "19.1.0"
}
```

## 🔧 **Usage:**

```bash
npm install  # Install dependencies
npm run dev  # Start development server
```

**🎯 Result: Consistent Session Rotation untuk Bypassing API Detection + Auto Referral Background Process!**
