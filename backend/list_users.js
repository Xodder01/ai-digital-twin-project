// Run: node list_users.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('\n📋 All registered users:\n');

  const users = await User.find({}, 'name email age gender user_type auth_provider created_at').sort({ created_at: -1 });

  if (users.length === 0) {
    console.log('  No users yet.\n');
  } else {
    console.log(`  Total: ${users.length} user(s)\n`);
    console.log('  ' + '-'.repeat(90));
    console.log(`  ${'Name'.padEnd(20)} ${'Email'.padEnd(30)} ${'Type'.padEnd(15)} ${'Provider'.padEnd(10)} ${'Joined'}`);
    console.log('  ' + '-'.repeat(90));

    users.forEach(u => {
      const joined = new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      console.log(`  ${(u.name || '').padEnd(20)} ${(u.email || '').padEnd(30)} ${(u.user_type || '').padEnd(15)} ${(u.auth_provider || 'local').padEnd(10)} ${joined}`);
    });
    console.log('  ' + '-'.repeat(90) + '\n');
  }

  await mongoose.disconnect();
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
