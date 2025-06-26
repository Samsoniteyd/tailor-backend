const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI environment variable is not defined');
      console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('MONGO')));
      process.exit(1);
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('🔗 MONGO_URI exists:', !!process.env.MONGO_URI);
    
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected');
    });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('❌ Full error:', err);
    process.exit(1);
  }
};

// Handle app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📴 MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;