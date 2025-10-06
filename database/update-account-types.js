// Script to update account types for test accounts
// Run this with: node database/update-account-types.js

const pool = require('./index.js');

async function updateAccountTypes() {
  try {
    console.log('Updating account types...');
    
    // Update Happy Employee to Employee type
    const employeeResult = await pool.query(
      'UPDATE account SET account_type = $1 WHERE account_email = $2 RETURNING *',
      ['Employee', 'happy@340.edu']
    );
    
    if (employeeResult.rowCount > 0) {
      console.log('✅ Updated happy@340.edu to Employee type');
    } else {
      console.log('❌ No account found with email happy@340.edu');
    }
    
    // Update Manager User to Admin type
    const adminResult = await pool.query(
      'UPDATE account SET account_type = $1 WHERE account_email = $2 RETURNING *',
      ['Admin', 'manager@340.edu']
    );
    
    if (adminResult.rowCount > 0) {
      console.log('✅ Updated manager@340.edu to Admin type');
    } else {
      console.log('❌ No account found with email manager@340.edu');
    }
    
    // Show all test accounts
    console.log('\nCurrent test accounts:');
    const accountsResult = await pool.query(
      'SELECT account_firstname, account_lastname, account_email, account_type FROM account WHERE account_email IN ($1, $2, $3)',
      ['basic@340.edu', 'happy@340.edu', 'manager@340.edu']
    );
    
    console.table(accountsResult.rows);
    
  } catch (error) {
    console.error('Error updating account types:', error);
  } finally {
    process.exit();
  }
}

updateAccountTypes();