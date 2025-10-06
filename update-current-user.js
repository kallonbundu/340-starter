// Quick script to update the current user to Employee type
// Run this with: node update-current-user.js

const pool = require('./database/index.js');

async function updateCurrentUser() {
  try {
    console.log('Updating current user account type...');
    
    // Change this to match your current logged-in account email
    const userEmail = 'basic@340.edu'; // Update this to your actual account email
    
    const result = await pool.query(
      'UPDATE account SET account_type = $1 WHERE account_email = $2 RETURNING account_firstname, account_lastname, account_email, account_type',
      ['Employee', userEmail]
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Successfully updated account:');
      console.table(result.rows);
      console.log('\n🔄 Please log out and log back in to see the changes!');
    } else {
      console.log(`❌ No account found with email: ${userEmail}`);
      console.log('💡 Make sure to change the userEmail variable in this script to match your account');
    }
    
  } catch (error) {
    console.error('Error updating account:', error);
  } finally {
    process.exit();
  }
}

updateCurrentUser();