-- Sample SQL script to insert admin, manager, and HR users
-- Note: Passwords are hashed as 'Admin@123', 'Manager@123', and 'HR@123' respectively
-- In a real scenario, you would need to generate proper bcrypt hashes

-- Sample Admins
INSERT INTO users (id, first_name, last_name, email, password, phone_number, address, role, level, gender, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'John', 'Smith', 'john.smith@example.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V8hqwxLxEYj/RuFAGm', '+1-555-123-4567', '123 Admin Street, New York, NY 10001', 'super_admin', 4, 'male', true, NOW(), NOW()),
  (gen_random_uuid(), 'Sarah', 'Johnson', 'sarah.johnson@example.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V8hqwxLxEYj/RuFAGm', '+1-555-234-5678', '456 Admin Avenue, San Francisco, CA 94105', 'super_admin', 4, 'female', true, NOW(), NOW()),
  (gen_random_uuid(), 'Michael', 'Williams', 'michael.williams@example.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V8hqwxLxEYj/RuFAGm', '+1-555-345-6789', '789 Admin Boulevard, Chicago, IL 60601', 'super_admin', 3, 'male', true, NOW(), NOW()),
  (gen_random_uuid(), 'Emily', 'Brown', 'emily.brown@example.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V8hqwxLxEYj/RuFAGm', '+1-555-456-7890', '101 Admin Road, Austin, TX 78701', 'super_admin', 3, 'female', true, NOW(), NOW()),
  (gen_random_uuid(), 'David', 'Jones', 'david.jones@example.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V8hqwxLxEYj/RuFAGm', '+1-555-567-8901', '202 Admin Lane, Seattle, WA 98101', 'super_admin', 3, 'male', true, NOW(), NOW());

-- Sample Managers
INSERT INTO users (id, first_name, last_name, email, password, phone_number, address, role, level, gender, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Robert', 'Miller', 'robert.miller@example.com', '$2b$10$7JwTQmV.jz.vYUHR.gtM2.QD1OUXESVRJfBqyfE.qc3ku5vR9JSaC', '+1-555-678-9012', '303 Manager Street, Boston, MA 02108', 'manager', 3, 'male', true, NOW(), NOW()),
  (gen_random_uuid(), 'Jennifer', 'Davis', 'jennifer.davis@example.com', '$2b$10$7JwTQmV.jz.vYUHR.gtM2.QD1OUXESVRJfBqyfE.qc3ku5vR9JSaC', '+1-555-789-0123', '404 Manager Avenue, Denver, CO 80202', 'manager', 3, 'female', true, NOW(), NOW()),
  (gen_random_uuid(), 'James', 'Wilson', 'james.wilson@example.com', '$2b$10$7JwTQmV.jz.vYUHR.gtM2.QD1OUXESVRJfBqyfE.qc3ku5vR9JSaC', '+1-555-890-1234', '505 Manager Boulevard, Atlanta, GA 30303', 'manager', 2, 'male', true, NOW(), NOW()),
  (gen_random_uuid(), 'Patricia', 'Taylor', 'patricia.taylor@example.com', '$2b$10$7JwTQmV.jz.vYUHR.gtM2.QD1OUXESVRJfBqyfE.qc3ku5vR9JSaC', '+1-555-901-2345', '606 Manager Road, Miami, FL 33131', 'manager', 2, 'female', true, NOW(), NOW()),
  (gen_random_uuid(), 'Thomas', 'Anderson', 'thomas.anderson@example.com', '$2b$10$7JwTQmV.jz.vYUHR.gtM2.QD1OUXESVRJfBqyfE.qc3ku5vR9JSaC', '+1-555-012-3456', '707 Manager Lane, Portland, OR 97201', 'manager', 2, 'male', true, NOW(), NOW()),
  (gen_random_uuid(), 'Elizabeth', 'Martinez', 'elizabeth.martinez@example.com', '$2b$10$7JwTQmV.jz.vYUHR.gtM2.QD1OUXESVRJfBqyfE.qc3ku5vR9JSaC', '+1-555-123-4567', '808 Manager Court, Phoenix, AZ 85004', 'manager', 2, 'female', true, NOW(), NOW());

-- Sample HR Personnel
INSERT INTO users (id, first_name, last_name, email, password, phone_number, address, role, level, gender, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Susan', 'Clark', 'susan.clark@example.com', '$2b$10$dVUbFX1ADXPqvkN1nRMjPOEjBrfgJWy9.Y1E/Efa3YRhv4iNHOCgK', '+1-555-234-5678', '909 HR Street, Philadelphia, PA 19103', 'hr', 3, 'female', true, NOW(), NOW()),
  (gen_random_uuid(), 'Richard', 'Rodriguez', 'richard.rodriguez@example.com', '$2b$10$dVUbFX1ADXPqvkN1nRMjPOEjBrfgJWy9.Y1E/Efa3YRhv4iNHOCgK', '+1-555-345-6789', '1010 HR Avenue, San Diego, CA 92101', 'hr', 2, 'male', true, NOW(), NOW()),
  (gen_random_uuid(), 'Karen', 'Lewis', 'karen.lewis@example.com', '$2b$10$dVUbFX1ADXPqvkN1nRMjPOEjBrfgJWy9.Y1E/Efa3YRhv4iNHOCgK', '+1-555-456-7890', '1111 HR Boulevard, Dallas, TX 75201', 'hr', 2, 'female', true, NOW(), NOW()),
  (gen_random_uuid(), 'Daniel', 'Lee', 'daniel.lee@example.com', '$2b$10$dVUbFX1ADXPqvkN1nRMjPOEjBrfgJWy9.Y1E/Efa3YRhv4iNHOCgK', '+1-555-567-8901', '1212 HR Road, Minneapolis, MN 55401', 'hr', 2, 'male', true, NOW(), NOW()),
  (gen_random_uuid(), 'Nancy', 'Walker', 'nancy.walker@example.com', '$2b$10$dVUbFX1ADXPqvkN1nRMjPOEjBrfgJWy9.Y1E/Efa3YRhv4iNHOCgK', '+1-555-678-9012', '1313 HR Lane, Detroit, MI 48226', 'hr', 1, 'female', true, NOW(), NOW());

-- Note: The password hashes above are examples only and should be generated properly in a real scenario
-- The actual hash values would depend on your salt rounds and other bcrypt configuration