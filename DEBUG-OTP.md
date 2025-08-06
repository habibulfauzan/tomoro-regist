# 🐛 DEBUG: OTP Selalu Salah

## 📊 **Kemungkinan Penyebab:**

### **1. Session Parameter Mismatch (80% kemungkinan)**

- Device code berbeda antara send-OTP dan login
- wToken tidak consistent
- User-Agent tidak sama

### **2. API Format Issue (15% kemungkinan)**

- Request body format salah
- Headers tidak sesuai ekspektasi API tomoro
- OTP format issue (spaces, encoding)

### **3. Timing Issue (5% kemungkinan)**

- OTP expired sebelum submit
- Session timeout

## 🔧 **Steps untuk Debug:**

### **1. Buka Browser Console**

- Tekan `F12` → Console tab
- Refresh halaman untuk clear logs

### **2. Test Registrasi:**

1. Input nomor HP → Klik "Kirim OTP"
2. **Perhatikan log**: `✅ Session parameters stored:`
3. Input OTP → Klik submit atau auto-submit
4. **Perhatikan log**: `🔄 Auto/Manual OTP Submit - Attempting login with:`

### **3. Periksa Parameter Consistency:**

**Yang HARUS SAMA:**

```
✅ Session parameters stored:
- Device: abc123...
- wToken: 0003_984614...
- User-Agent: okhttp/4.11.0

🔄 OTP Submit - Attempting login with:
- Device: abc123...        ← HARUS SAMA dengan di atas
- wToken: 0003_984614...   ← HARUS SAMA dengan di atas
- User-Agent: okhttp/4.11.0 ← HARUS SAMA dengan di atas
```

**Yang TIDAK BOLEH:**

```
❌ Session parameters stored:
- Device: abc123...

🔄 OTP Submit:
- Device: undefined        ← SALAH! Parameter hilang
- wToken: undefined        ← SALAH! Parameter hilang
```

### **4. Periksa API Response:**

**Di Console, cari log:**

```
API Response Status: 200/400/etc
API Response Data: { ... }
```

**Response Success:**

```json
{
  "success": true,
  "data": {
    "token": "...",
    "accountCode": "..."
  }
}
```

**Response Error:**

```json
{
  "success": false,
  "msg": "验证码错误" // atau pesan error lain
}
```

## 🎯 **Common Issues & Solutions:**

### **Issue 1: Parameter Undefined**

**Log yang terlihat:**

```
🔄 OTP Submit:
- Device: undefined
- wToken: undefined
- User-Agent: undefined
```

**Penyebab:** Send OTP gagal atau parameter tidak tersimpan

**Solusi:**

1. Cek apakah ada error di send-OTP step
2. Pastikan `setDeviceCode`, `setWToken`, `setUserAgent` dipanggil
3. Refresh halaman dan coba lagi

### **Issue 2: Different Device Codes**

**Log yang terlihat:**

```
✅ Session stored: Device: abc123...
🔄 OTP Submit: Device: xyz789...  // BERBEDA!
```

**Penyebab:** Ada bug di state management

**Solusi:** Reset state dan refresh halaman

### **Issue 3: API Error Response**

**Log yang terlihat:**

```
API Response Status: 400
API Response Data: {
  "success": false,
  "msg": "验证码错误"
}
```

**Kemungkinan:**

1. **OTP benar-benar salah** - coba OTP baru
2. **OTP expired** - minta OTP baru
3. **Parameter salah** - cek consistency di atas

## 📋 **Debugging Checklist:**

- [ ] Browser console terbuka
- [ ] Session parameters stored dengan benar setelah send OTP
- [ ] Parameter consistency antara store dan submit
- [ ] OTP format benar (4 digit, hanya angka)
- [ ] API response status dan error message
- [ ] Tidak ada error di Network tab browser

## 🚨 **Immediate Actions:**

1. **Test dengan OTP baru** - minta ulang OTP
2. **Refresh halaman** - clear session dan mulai dari awal
3. **Check console logs** - ikuti debugging steps di atas
4. **Test dengan nomor HP lain** - pastikan bukan issue HP spesifik

## 📞 **Laporan Bug Format:**

Jika masih bermasalah, berikan info:

```
Phone: 087xxxxx
OTP: 1234
Session Device: abc123...
Submit Device: abc123... (same/different?)
API Status: 200/400/etc
API Message: "error message"
Console Logs: [paste relevant logs]
```

**🔍 Ikuti debugging steps di atas dan berikan hasil log-nya untuk analisis lebih lanjut!**
