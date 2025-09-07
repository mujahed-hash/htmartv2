require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./database/models/user');
const argon2 = require('argon2');
const slugify = require('slugify');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  createSuperAdmin();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function createSuperAdmin() {
  try {
    // Check if a super admin already exists
    const existingSuperAdmin = await User.findOne({ isSuperAdmin: true });
    
    if (existingSuperAdmin) {
      console.log('A super admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }
    
    // Super admin details
    const name = 'Super Admin';
    const email = 'superadmin@super.com';
    const password = 'Sadmin123'; // As requested by user
    const phone = '1234567890';
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // Update existing user to super admin
      existingUser.isSuperAdmin = true;
      existingUser.isAdmin = true;
      
      await existingUser.save();
      console.log('Existing user updated to super admin:', existingUser.email);
    } else {
      // Create new super admin user
      const passwordHash = await argon2.hash(password);
      const randomComponent = Date.now().toString();
      const customIdentifier = `${slugify(name, { lower: true })}-${randomComponent}`;
      
      const superAdmin = new User({
        name,
        email,
        passwordHash,
        phone,
        isAdmin: true,
        isSuperAdmin: true,
        customIdentifer: customIdentifier
      });
      
      await superAdmin.save();
      console.log('Super admin created successfully:', superAdmin.email);
      console.log('Password:', password); // Only for initial setup, remove in production
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}
