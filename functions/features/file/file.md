# File Upload Feature Documentation

This document describes the Cloudinary-based file upload system implemented in the backend.

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get these values from your [Cloudinary Dashboard](https://console.cloudinary.com/console).

### 2. Dependencies Installed

- `cloudinary` - Cloudinary SDK
- `multer-storage-cloudinary` - Multer storage engine for Cloudinary

---

## Architecture

```
Files → Cloudinary (Cloud Storage)
Metadata → MongoDB (File collection)
```

**Why this approach:**
- MongoDB is not optimized for large binary files
- Cloudinary provides CDN, optimization, and transformations
- Cleaner separation of concerns

---

## File Storage Structure

Files are organized into folders in Cloudinary:

```
├── restaurants/
│   └── images/
├── food-items/
│   └── images/
├── profiles/
│   └── images/
└── uploads/
    ├── images/
    └── documents/
```

---

## API Endpoints

### General File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/file/upload` | Upload single file (any type) |
| POST | `/api/file/upload-multiple` | Upload multiple files (max 10) |
| POST | `/api/file/upload-image` | Upload single image only |
| POST | `/api/file/upload-images` | Upload multiple images (max 10) |
| GET | `/api/file` | Get all files (paginated) |
| GET | `/api/file/my-files` | Get authenticated user's files |
| GET | `/api/file/:id` | Get file by ID |
| GET | `/api/file/:id/transform` | Get transformed image URL |
| GET | `/api/file/:id/signed-url` | Get signed URL for private access |
| DELETE | `/api/file/:id` | Delete file |
| DELETE | `/api/file/bulk` | Delete multiple files |

### Restaurant Image Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/restaurant` | Create restaurant with image (form-data: `image`) |
| PATCH | `/api/restaurant/:id/image` | Update restaurant image |

### Food Item Image Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/food-item` | Create food item with image (form-data: `image`) |
| PATCH | `/api/food-item/:id/image` | Update food item image |

### User Profile Picture Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/user/profile/:userId/profile-picture` | Upload profile picture (form-data: `image`) |

---

## Usage Examples

### Upload Single File

```bash
# Using curl
curl -X POST http://localhost:3000/api/file/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=custom-folder"
```

### Upload Restaurant with Image

```bash
curl -X POST http://localhost:3000/api/restaurant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/restaurant.jpg" \
  -F "name=My Restaurant" \
  -F "street=123 Main St" \
  -F "state=Lagos" \
  -F "mode=both" \
  -F "openTime=09:00" \
  -F "closeTime=22:00"
```

### Update Food Item Image

```bash
curl -X PATCH http://localhost:3000/api/food-item/FOOD_ITEM_ID/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/food.jpg"
```

### Get Transformed Image URL

```bash
curl -X GET "http://localhost:3000/api/file/FILE_ID/transform?width=300&height=300&crop=fill" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## File Validation

### Allowed Image Types
- image/jpeg
- image/png
- image/gif
- image/webp
- image/svg+xml

### Allowed Document Types
- application/pdf
- application/msword (doc)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (docx)
- application/vnd.ms-excel (xls)
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (xlsx)

### Size Limits
- Images: 5MB max
- Documents: 10MB max
- General uploads: 10MB max

---

## File Model (MongoDB)

```typescript
{
  filename: string;          // Cloudinary public_id
  originalName: string;      // Original filename
  url: string;               // Cloudinary secure URL
  publicId: string;          // Cloudinary public_id
  mimetype: string;          // File MIME type
  size: number;              // File size in bytes
  resourceType: 'image' | 'raw' | 'video' | 'auto';
  folder: string;            // Cloudinary folder
  uploadedBy?: ObjectId;     // Reference to User
  associatedModel?: string;  // e.g., "Restaurant", "FoodItem"
  associatedId?: ObjectId;   // ID of associated document
  metadata?: object;         // Custom metadata
  isPublic: boolean;         // Default: true
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Image Transformations

Cloudinary provides automatic image optimization. When getting transformed URLs:

| Parameter | Description | Example |
|-----------|-------------|---------|
| width | Target width in pixels | 300 |
| height | Target height in pixels | 300 |
| crop | Crop mode | fill, fit, limit, scale |
| quality | Image quality | auto, 80, best |
| format | Output format | auto, webp, jpg |

---

## Security Best Practices

1. **Authentication**: All upload endpoints require JWT authentication
2. **File Type Validation**: Only whitelisted MIME types are accepted
3. **Size Limits**: Prevents large file uploads
4. **Signed URLs**: For private file access
5. **API Secrets**: Never expose Cloudinary API secret to frontend

---

## Error Handling

The system handles common errors:

- `400`: No file uploaded / Invalid file type
- `401`: Unauthorized (missing/invalid token)
- `404`: File not found
- `500`: Cloudinary upload failed

---

## Cleanup

When deleting records that have associated images:

1. The image is deleted from Cloudinary
2. The file metadata is deleted from MongoDB
3. The main record is deleted

This ensures no orphaned files in storage.
