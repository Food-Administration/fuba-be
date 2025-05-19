/**
 * 
 * POST http://localhost:3000/api/auth/signup
    Content-Type: application/json

    {
        "companyName": "Example Corp",
        "email": "user@example.com",
        "password": "securepassword123"
    }
 * 

    POST http://localhost:3000/api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
    



{
  "companyName": "Tech Corp",
  "email": "john.doe@example.com",
  "password": "password123",
  "username": "johndoe",
  "phNo": "1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "employmentDetails": {
    "department": "Engineering",
    "designation": "Software Engineer",
    "empDate": "2023-01-01",
    "empId": "EMP123",
    "empType": "Full-Time",
    "jobRole": "Developer",
    "supervisor": null
  },
  "fileDocument": "document.pdf",
  "appointmentLetter": "appointment.pdf",
  "EmergencyContact": {
    "contactName": "Jane Doe",
    "contactNumber": "0987654321",
    "contactAddress": "123 Main St"
  },
  "profilePicture": "profile.jpg",
  "roles": [],
  "googleId": null,
  "twoFactorSecret": "secret123",
  "isBlocked": false,
  "verified": false,
  "otp": "123456",
  "otpExpires": "2023-12-31T23:59:59Z",
  "resetPasswordToken": "token123",
  "resetPasswordExpires": "2023-12-31T23:59:59Z",
  "role": null,
  "status": "active",
  "vendorBusinessDetails": {
    "businessType": "IT Services",
    "category": "Software",
    "description": "Providing software solutions",
    "vendorId": "VENDOR123"
  },
  "vendorComplianceInfo": {
    "cacDocument": "cac.pdf",
    "validId": "id.pdf"
  },
  "vendorCompanyInfo": {
    "vendorLegalName": "Tech Corp LLC",
    "tradingName": "Tech Corp",
    "registrationNumber": "REG123",
    "taxId": "TAX123",
    "startDate": "2023-01-01",
    "endDate": "2024-01-01"
  }
}


















 */