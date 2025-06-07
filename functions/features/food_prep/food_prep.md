Here's the comprehensive README documentation for your Food Preparation API endpoints:

# Food Preparation API Documentation

## Base URL
`https://your-api-domain.com/api/food-prep`

## Authentication
- Requires valid JWT token in Authorization header
- Consumer role required for most operations
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Food Preparation Entry
**Endpoint:** `POST /`  
**Description:** Create a new food preparation entry  
**Request Body:**
```json
{
  "consumer": "507f1f77bcf86cd799439011",
  "items": [
    {
      "foodItem": "609b0b0e1c9d440000f4e7d1",
      "quantity": 2
    }
  ]
}
```
**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d2",
    "consumer": "507f1f77bcf86cd799439011",
    "items": [
      {
        "foodItem": "609b0b0e1c9d440000f4e7d1",
        "quantity": 2,
        "_id": "609b0b0e1c9d440000f4e7d3"
      }
    ],
    "createdAt": "2023-05-15T10:00:00.000Z",
    "updatedAt": "2023-05-15T10:00:00.000Z"
  }
}
```

### 2. Get All Food Preparation Entries
**Endpoint:** `GET /`  
**Description:** Get paginated list of food preparation entries  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "609b0b0e1c9d440000f4e7d2",
      "consumer": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "foodItem": {
            "_id": "609b0b0e1c9d440000f4e7d1",
            "name": "Margherita Pizza",
            "price": 12.99
          },
          "quantity": 2
        }
      ],
      "createdAt": "2023-05-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

### 3. Get Food Preparation Entry by ID
**Endpoint:** `GET /:id`  
**Description:** Get single food preparation entry by ID  
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d2",
    "consumer": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "foodItem": {
          "_id": "609b0b0e1c9d440000f4e7d1",
          "name": "Margherita Pizza",
          "price": 12.99
        },
        "quantity": 2
      }
    ],
    "createdAt": "2023-05-15T10:00:00.000Z",
    "updatedAt": "2023-05-15T10:00:00.000Z"
  }
}
```

### 4. Update Food Preparation Entry
**Endpoint:** `PUT /:id`  
**Description:** Update food preparation entry by ID  
**Request Body:**
```json
{
  "items": [
    {
      "foodItem": "609b0b0e1c9d440000f4e7d1",
      "quantity": 3
    },
    {
      "foodItem": "609b0b0e1c9d440000f4e7d4",
      "quantity": 1
    }
  ]
}
```
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d2",
    "items": [
      {
        "foodItem": "609b0b0e1c9d440000f4e7d1",
        "quantity": 3,
        "_id": "609b0b0e1c9d440000f4e7d3"
      },
      {
        "foodItem": "609b0b0e1c9d440000f4e7d4",
        "quantity": 1,
        "_id": "609b0b0e1c9d440000f4e7d5"
      }
    ],
    "updatedAt": "2023-05-15T11:00:00.000Z"
  }
}
```

### 5. Delete Food Preparation Entry
**Endpoint:** `DELETE /:id`  
**Description:** Delete food preparation entry by ID  
**Success Response (200):**
```json
{
  "success": true,
  "message": "Food preparation entry deleted successfully"
}
```

### 6. Get Food Preparation Entries by Consumer
**Endpoint:** `GET /consumer/:consumerId`  
**Description:** Get food preparation entries for specific consumer  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "609b0b0e1c9d440000f4e7d2",
      "items": [
        {
          "foodItem": {
            "_id": "609b0b0e1c9d440000f4e7d1",
            "name": "Margherita Pizza",
            "price": 12.99
          },
          "quantity": 2
        }
      ],
      "createdAt": "2023-05-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

## Error Responses

### Common Error Responses
- **400 Bad Request**: Invalid ID format or missing required fields
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have required privileges
- **404 Not Found**: Food preparation entry not found
- **500 Internal Server Error**: Server error

### Example Error Response
```json
{
  "success": false,
  "error": "Food preparation entry not found",
  "statusCode": 404
}
```

## Data Validation Rules
- `consumer`: Required, valid MongoDB ID (must be existing user)
- `items`: Required, array with at least one item
  - `foodItem`: Required, valid MongoDB ID (must be existing food item)
  - `quantity`: Required, number (min: 1)

## Rate Limiting
- 100 requests per 15 minutes per IP address for read endpoints
- 30 requests per 15 minutes per IP address for write endpoints

## Notes
- All timestamps are in UTC
- Consumer can only access their own food preparation entries unless admin
- Food items must be available (available: true) to be added to preparation