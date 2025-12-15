#!/usr/bin/env node

const { MongoMemoryServer } = require('mongodb-memory-server');

async function startMongoDB() {
  try {
    console.log('🚀 Starting MongoDB Memory Server...');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    console.log('✅ MongoDB is running');
    console.log(`📍 Connection URI: ${mongoUri}`);
    console.log('\n🔗 Set MONGODB_URI in your environment:');
    console.log(`   export MONGODB_URI="${mongoUri}"`);
    console.log('\nOr use in .env file:');
    console.log(`   MONGODB_URI=${mongoUri}`);
    console.log('\n💡 Keep this process running while developing');
    console.log('   Press Ctrl+C to stop MongoDB\n');
    
    // Keep the server running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping MongoDB...');
      await mongoServer.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start MongoDB:', error);
    process.exit(1);
  }
}

startMongoDB();
