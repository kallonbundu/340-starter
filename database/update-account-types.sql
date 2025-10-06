-- Update account types for test accounts
-- Run these queries in your database management tool

-- Update Happy Employee account to Employee type
UPDATE account 
SET account_type = 'Employee' 
WHERE account_email = 'happy@340.edu';

-- Update Manager User account to Admin type  
UPDATE account 
SET account_type = 'Admin' 
WHERE account_email = 'manager@340.edu';

-- Verify the updates
SELECT account_firstname, account_lastname, account_email, account_type 
FROM account 
WHERE account_email IN ('basic@340.edu', 'happy@340.edu', 'manager@340.edu');