import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI;
    
    if (connUri) {
      try {
        const conn = await mongoose.connect(connUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (err) {
        console.warn(`[Warning] Could not connect to process.env.MONGO_URI (${err.message}).`);
      }
    }

    // Connect via MongoMemoryServer (runs an official MongoDB mongod process)
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoMemoryServer = await MongoMemoryServer.create({
        binary: { version: '4.4.18' },
      });
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host} (In-Memory Database Engine: ${uri})`);
    } catch (memErr) {
      console.error(`MongoDB connection error: ${memErr.message}`);
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
  }
};

export default connectDB;
