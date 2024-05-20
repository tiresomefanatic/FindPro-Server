import mongoose from 'mongoose';
import config from './config';

const connectDB = async () => {
  try {
    //mongoose.set('debug', true);


    await mongoose.connect( config.mongodbURI,
    // {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   useCreateIndex: true,
    // }
    );
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;