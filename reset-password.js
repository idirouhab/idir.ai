const bcrypt = require('bcryptjs');

// Generate a new password hash
const password = 'admin123'; // Change this to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  console.log('\nPassword:', password);
  console.log('\nPassword hash:');
  console.log(hash);
  console.log('\nRun this SQL to update your password:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'ouhab.idir@gmail.com';`);
});
