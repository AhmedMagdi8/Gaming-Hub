
import mongoose from 'mongoose';

export const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL || '');
    console.log('DB Connected successfully');
  } catch (error) {
    console.error('DB connection failed:', error);
    process.exit(1); // Exit on failure
  }
};
