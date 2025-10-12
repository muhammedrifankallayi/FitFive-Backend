# Quick Start Guide 🚀

## Server is Running! ✅

Your Node.js + TypeScript server is live at: **http://localhost:3000**

## Test Your API (3 Easy Ways)

### 1️⃣ Test HTML Page (EASIEST!)
- Open `test-upload.html` in your browser (should have opened automatically)
- Or double-click: `d:\workspace\angular\vestra\test-upload.html`
- Select images and click "Upload Multiple Images" or "Upload Single Image"

### 2️⃣ PowerShell Commands

**Upload Multiple Images:**
```powershell
curl.exe -X POST http://localhost:3000/api/upload/multiple `
  -F "images=@C:\path\to\your\image1.jpg" `
  -F "images=@C:\path\to\your\image2.jpg"
```

**Upload Single Image:**
```powershell
curl.exe -X POST http://localhost:3000/api/upload/single `
  -F "image=@C:\path\to\your\image.jpg"
```

**Get All Uploaded Files:**
```powershell
curl.exe http://localhost:3000/api/upload/files
```

### 3️⃣ Postman
1. POST to `http://localhost:3000/api/upload/multiple`
2. Body → form-data
3. Key: `images` | Type: File (select multiple)
4. Send

## View Uploaded Images
Access uploaded images at: `http://localhost:3000/uploads/filename.jpg`

## Project Commands

```bash
npm run dev      # Start dev server (already running)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter
npm run format   # Format code
```

## File Limits
- Max file size: **5MB** per file
- Max files: **10** files per request
- Allowed types: **JPEG, PNG, JPG, GIF, WebP**

## Architecture Overview

```
📁 src/
  ├── config/        → Environment configuration
  ├── controllers/   → Business logic (upload handling)
  ├── middleware/    → Multer, error handling, logging
  ├── routes/        → API endpoint definitions
  ├── types/         → TypeScript interfaces
  ├── app.ts         → Express app setup
  └── server.ts      → Entry point

📁 uploads/          → Your uploaded images go here
```

## Key Features ✨

✅ Clean Architecture (separation of concerns)
✅ TypeScript for type safety
✅ Multiple image upload support
✅ File validation (type & size)
✅ Security (Helmet, CORS)
✅ Error handling
✅ Request logging
✅ Auto-reload in development

## Need Help?

- Full documentation: `README.md`
- Complete setup guide: `SETUP_COMPLETE.md`
- Configuration: `.env`

---

**🎉 Happy Coding! Your enterprise-grade Node.js server is ready!**
