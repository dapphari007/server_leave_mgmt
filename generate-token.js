const jwt = require("jsonwebtoken");

// Create a payload for a super admin user
const payload = {
  aud: "leave-management-app",
  iss: "leave-management-api",
  id: "550e8400-e29b-41d4-a716-446655440000", // Sample UUID
  email: "admin@example.com",
  role: "super_admin",
  level: 4,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 14 days
};

// Sign the token with a secret key
const token = jwt.sign(payload, "your_jwt_secret_key");

console.log("Super Admin JWT Token:");
console.log(token);
