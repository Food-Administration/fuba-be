# Cart API Documentation

## Base URL
`https://your-api-domain.com/api/cart`

## Authentication
- Requires valid JWT token in Authorization header
- Only accessible by the authenticated consumer
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Cart
**Endpoint:** `GET /:consumerId`  
**Description:** Retrieve a consumer's cart  
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d1",
    "consumer": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "foodItem": {
          "_id": "609b0b0e1c9d440000f4e7d2",
          "name": "Margherita Pizza",
          "price": 12.99,
          "image": "https://example.com/pizza.jpg"
        },
        "quantity": 2
      }
    ],
    "createdAt": "2023-05-15T10:00:00.000Z",
    "updatedAt": "2023-05-15T10:00:00.000Z"
  }
}
```

### 2. Add Item to Cart
**Endpoint:** `POST /:consumerId/items`  
**Description:** Add a new item to the cart  
**Request Body:**
```json
{
  "foodItemId": "609b0b0e1c9d440000f4e7d2",
  "quantity": 1
}
```
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d1",
    "items": [
      {
        "foodItem": {
          "_id": "609b0b0e1c9d440000f4e7d2",
          "name": "Margherita Pizza",
          "price": 12.99
        },
        "quantity": 3,
        "_id": "709b0b0e1c9d440000f4e7d3"
      }
    ]
  },
  "message": "Item added to cart"
}
```

### 3. Update Item Quantity
**Endpoint:** `PUT /:consumerId/items/:foodItemId`  
**Description:** Update quantity of an item in the cart  
**Request Body:**
```json
{
  "quantity": 3
}
```
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d1",
    "items": [
      {
        "foodItem": {
          "_id": "609b0b0e1c9d440000f4e7d2",
          "name": "Margherita Pizza",
          "price": 12.99
        },
        "quantity": 3
      }
    ]
  },
  "message": "Cart item quantity updated"
}
```

### 4. Remove Item from Cart
**Endpoint:** `DELETE /:consumerId/items/:foodItemId`  
**Description:** Remove an item from the cart  
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d1",
    "items": []
  },
  "message": "Item removed from cart"
}
```

### 5. Clear Cart
**Endpoint:** `DELETE /:consumerId/clear`  
**Description:** Remove all items from the cart  
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d1",
    "items": []
  },
  "message": "Cart cleared successfully"
}
```

## Error Responses

### Common Error Responses
- **400 Bad Request**: Invalid ID format or missing required fields
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User trying to access another user's cart
- **404 Not Found**: Food item not found or cart not found
- **500 Internal Server Error**: Server error

### Example Error Response
```json
{
  "success": false,
  "error": "Food item not found",
  "statusCode": 404
}
```

## Data Validation Rules
- `consumerId`: Required, valid MongoDB ID (must be existing user)
- `foodItemId`: Required, valid MongoDB ID (must be existing food item)
- `quantity`: Required, number (min: 1)

## Business Rules
- Each consumer has exactly one cart
- Cart is automatically created when first item is added
- Items must be available (in stock) to be added to cart
- Quantity updates replace the existing quantity (don't increment/decrement)

## Rate Limiting
- 100 requests per 15 minutes per IP address

## Notes
- All prices are in the system's base currency
- Items are populated with current food item data when retrieved
- Cart totals should be calculated client-side based on current prices
- Cart contents are not preserved between sessions if not logged in