# Vestra Backend

A production-ready Node.js REST API server built with TypeScript, Express, and Multer for handling multiple image uploads. This project follows clean architecture principles with a well-organized folder structure.

## 🚀 Features

- ✅ **TypeScript** - Type-safe development
- ✅ **Express.js** - Fast, minimalist web framework
- ✅ **Multer** - Multi-image upload support
- ✅ **Clean Architecture** - Well-organized folder structure
- ✅ **Error Handling** - Global error handler with custom error classes
- ✅ **Security** - Helmet, CORS, and file validation
- ✅ **Logging** - Request logging with Morgan
- ✅ **Environment Config** - Dotenv for environment variables
- ✅ **File Management** - Upload, list, and delete files

## 📁 Project Structure

```
vestra/
├── src/
│   ├── config/           # Configuration files
│   │   └── index.ts      # Environment configuration
│   ├── controllers/      # Request handlers
│   │   └── upload.controller.ts
│   ├── middleware/       # Custom middleware
│   │   ├── upload.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   ├── routes/           # API routes
│   │   ├── index.ts
│   │   └── upload.routes.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── uploads/              # Uploaded files directory
├── .env.example          # Environment variables example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

1. **Clone the repository** (or navigate to the project folder):
```bash
cd d:\workspace\angular\vestra
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
```bash
copy .env.example .env
```

4. **Update `.env` file** with your configuration:
```env
NODE_ENV=development
PORT=3000
HOST=localhost
MAX_FILE_SIZE=5242880
MAX_FILES=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/gif,image/webp
CORS_ORIGIN=*
```

## 🎯 Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

### Upload Multiple Images
```http
POST /api/upload/multiple
Content-Type: multipart/form-data

Body:
  images: [file1, file2, file3, ...]
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully uploaded 3 file(s)",
  "data": [
    {
      "fieldname": "images",
      "originalname": "photo1.jpg",
      "encoding": "7bit",
      "mimetype": "image/jpeg",
      "destination": "uploads/",
      "filename": "photo1-1234567890-uuid.jpg",
      "path": "uploads/photo1-1234567890-uuid.jpg",
      "size": 524288,
      "url": "/uploads/photo1-1234567890-uuid.jpg"
    }
  ]
}
```

### Upload Single Image
```http
POST /api/upload/single
Content-Type: multipart/form-data

Body:
  image: file
```

### Get All Files
```http
GET /api/upload/files
```

### Delete File
```http
DELETE /api/upload/file/:filename
```

## 🧪 Testing with cURL

### Upload Multiple Images
```bash
curl -X POST http://localhost:3000/api/upload/multiple \
  -F "images=@path/to/image1.jpg" \
  -F "images=@path/to/image2.jpg" \
  -F "images=@path/to/image3.jpg"
```

### Upload Single Image
```bash
curl -X POST http://localhost:3000/api/upload/single \
  -F "image=@path/to/image.jpg"
```

### Get All Files
```bash
curl http://localhost:3000/api/upload/files
```

### Delete File
```bash
curl -X DELETE http://localhost:3000/api/upload/file/filename.jpg
```

## 🧪 Testing with Postman

1. **Upload Multiple Images:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/upload/multiple`
   - Body: Select `form-data`
   - Add key: `images` (type: File)
   - Select multiple files

2. **Upload Single Image:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/upload/single`
   - Body: Select `form-data`
   - Add key: `image` (type: File)
   - Select one file

## ⚙️ Configuration

### File Upload Settings

- **Max File Size**: 5MB (configurable in `.env`)
- **Max Files**: 10 files per request (configurable)
- **Allowed Types**: JPEG, PNG, JPG, GIF, WebP (configurable)

### Security Features

- Helmet.js for security headers
- CORS protection
- File type validation
- File size limits
- Sanitized filenames with UUID

## 🏗️ Architecture Highlights

### Clean Architecture
- **Config**: Centralized configuration management
- **Controllers**: Business logic separation
- **Middleware**: Reusable middleware components
- **Routes**: Clean route definitions
- **Types**: TypeScript interfaces and types

### Error Handling
- Global error handler
- Custom error classes
- Multer-specific error handling
- 404 handler

### Middleware Stack
- Security (Helmet)
- CORS
- Compression
- Body parsing
- Request logging
- Static file serving

## 📝 Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` with auto-reload enabled.

## 🏭 Production

Build and start production server:
```bash
npm run build
npm start
```

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Happy Coding! 🚀**
