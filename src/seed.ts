import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model';
import config from './config';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.database.mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@fitfive.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@fitfive.com',
      password: 'Admin123!', // Change this to a secure password in production
      role: 'admin',
      type: 'owner',
      isActive: true,
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@fitfive.com');
    console.log('Password: Admin123!');

    // Create test user
    const testUser = await User.findOne({ email: 'user@fitfive.com' });
    
    if (!testUser) {
      const newTestUser = new User({
        name: 'Test User',
        email: 'user@fitfive.com',
        password: 'User123!', // Change this to a secure password in production
        role: 'user',
        type: 'customer',
        isActive: true,
      });

      await newTestUser.save();
      console.log('Test user created successfully');
      console.log('Email: user@fitfive.com');
      console.log('Password: User123!');
    } else {
      console.log('Test user already exists');
    }

    await mongoose.connection.close();
    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
