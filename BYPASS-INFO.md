# 📝 TOMORO Registration System

## 🎯 **Current System: Clean Registration + Auto Referral**

Sistem registrasi bersih tanpa bypass, menampilkan error asli jika API gagal. Tetap mempertahankan auto referral system untuk pengiriman invitation code di latar belakang.

## 🚀 **Registration Flow:**

```
1. Phone Input → Send OTP Request
↓
2. Real API Call → Show Real Error if Failed
↓
3. OTP Verification → Login/Register
↓
4. PIN Setting → Set Password
↓
5. Success Page → Auto Referral (Background)
```

## ✅ **Current Features:**

### **1. Clean API Calls**

- ✅ **Direct API calls** tanpa bypass atau proxy
- ✅ **Real error messages** dari API tomoro
- ✅ **No mock responses** - user melihat status sebenarnya
- ✅ **Simple error handling** - jelas dan transparan

### **2. Auto Referral System**

- ✅ **Background processing** setelah PIN berhasil di-set
- ✅ **Silent operation** - tidak mengganggu user experience
- ✅ **Auto user data generation** - nickname, email, birthday
- ✅ **Error logging** untuk monitoring

## 🔄 **Auto Referral Flow:**

```
PIN Setting Complete → Success Page (Step 4)
↓
setTimeout(2000ms) → Background Process Start
↓
Call modify-data API → Send invitationCode
↓
Success? → Console: "✅ Referral code submitted successfully"
↓
Failed? → Console: "❌ Referral code submission failed" (Silent)
```

## 📋 **API Endpoints:**

### **1. Send OTP - `/api/tomoro/send-otp`**

```javascript
GET /api/tomoro/send-otp?phone=87866276042
// Response: Real API response atau error message
```

### **2. Login/Register - `/api/tomoro/login-register`**

```javascript
POST / api / tomoro / login - register;
Body: {
  phoneNum, otpCode, deviceCode;
}
// Response: Real API response atau error message
```

### **3. Set Password - `/api/tomoro/set-password`**

```javascript
POST / api / tomoro / set - password;
Body: {
  deviceCode, token, password;
}
// Response: Real API response atau error message
```

### **4. Auto Referral - `/api/tomoro/modify-data`**

```javascript
POST / api / tomoro / modify - data;
Body: {
  deviceCode, token, invitationCode, email, nickname, gender, birthday;
}
// Background process - tidak mempengaruhi user flow
```

## 🛠️ **Technical Implementation:**

### **1. Error Handling:**

```javascript
// Real errors tanpa bypass
if (!response.ok) {
  return NextResponse.json(
    {
      success: false,
      msg: data.msg || `Failed: ${response.status} ${response.statusText}`,
    },
    { status: response.status }
  );
}
```

### **2. Auto Referral Background:**

```javascript
// Auto submit setelah PIN success
setTimeout(async () => {
  try {
    const referralResult = await modifyUserData(
      deviceCode,
      token,
      config.invitationCode,
      undefined, // email default
      `User${phoneNum.slice(-4)}`, // nickname
      1, // gender: Male
      "1995-01-01" // birthday
    );
  } catch (error) {
    console.log("❌ Background referral submission error:", error);
  }
}, 2000);
```

### **3. Console Monitoring:**

- 🎯 Background referral process start
- ✅ `Referral code submitted successfully: YOUR_CODE`
- ❌ `Referral code submission failed: error` (silent)

## 📊 **Expected Behavior:**

### **Normal Flow (API Working):**

- ✅ OTP sent successfully → Continue to verification
- ✅ OTP verified → Continue to PIN setting
- ✅ PIN set → Success page + auto referral

### **Error Flow (API Blocked/Failed):**

- ❌ **OTP Error**: Show real error message dari API
- ❌ **Login Error**: Show real error message dari API
- ❌ **PIN Error**: Show real error message dari API
- ❌ **Referral Error**: Silent fail, tidak mengganggu user

## 🎯 **Key Benefits:**

✅ **Transparent** - User tahu status sebenarnya dari API  
✅ **Clean Code** - Tidak ada bypass logic yang kompleks  
✅ **Real Feedback** - Error message asli dari tomoro API  
✅ **Auto Referral** - Tetap functional untuk invitation system  
✅ **Maintainable** - Simple code structure  
✅ **No Dependencies** - Tidak perlu proxy libraries

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

**🎯 Result: Clean Registration System dengan Real Error Handling + Auto Referral Background Process!**
