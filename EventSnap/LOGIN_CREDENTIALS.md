# 🔐 EventSnap Login Credentials

## ✅ All Systems Ready!

- **Backend:** Running on `http://localhost:5000`
- **Frontend:** Running on `http://localhost:3000`
- **Database:** MongoDB connected
- **Login Page:** `http://localhost:3000/login`

---

## 👨‍💼 Admin Login

**Login URL:** `http://localhost:3000/login` → Click **"Admin Login"** tab

```
Email:    dhanushc092@gmail.com
Password: Dhanush123
```

**Redirects to:** `/admin-dashboard`

---

## 🎪 Event Host Login

**Login URL:** `http://localhost:3000/login` → Click **"Event Host Login"** tab

```
Event ID: evt_test_1764589769704
Password: TestPass123
```

**Redirects to:** `/host-dashboard`

---

## 🧪 Testing Steps

### Test Admin Login:
1. Go to `http://localhost:3000/login`
2. Click **"Admin Login"** tab
3. Enter email: `dhanushc092@gmail.com`
4. Enter password: `Dhanush123`
5. Click **"Sign In as Admin"**
6. ✅ Should redirect to Admin Dashboard

### Test Host Login:
1. Go to `http://localhost:3000/login`
2. Click **"Event Host Login"** tab
3. Enter Event ID: `evt_test_1764589769704`
4. Enter password: `TestPass123`
5. Click **"Sign In as Host"**
6. ✅ Should redirect to Host Dashboard
7. ✅ QR Code should be visible in the "QR code" tab

---

## 🔍 Troubleshooting

If login still doesn't work:

1. **Open Browser Console** (F12 → Console tab)
2. **Check for errors** - Look for red error messages
3. **Check Network tab** - See if API calls are being made
4. **Backend logs** - Check the terminal running the backend for error messages

### Common Issues:

- **"Network Error"** → Backend server not running
- **"Invalid credentials"** → Wrong email/password/eventID
- **No redirect after login** → Check browser console for navigation errors

---

## 📝 Notes

- Admin password was just created/reset
- Event Host test event was created
- Both should work now
- Backend logs all login attempts for debugging
