import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 60 * 1000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host} `);
  } catch (error) {
    console.error(`Error while connecting to MongoDB: ${error.message}`);
  }
};

export default connectDB;
