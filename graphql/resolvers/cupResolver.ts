import CupType from '../../models/cup'; // Adjust the path to your CupType model
import { ApolloError } from 'apollo-server-express';
import * as GraphQLUpload from 'graphql-upload';
import path from 'path';
import fs from 'fs';


const UPLOAD_DIR = path.join(__dirname, '../../uploads'); // Directory for uploads

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  
const resolvers = {
  Upload: GraphQLUpload, // Add this scalar resolver for file uploads
  Query: {
    getAllCupTypes: async () => {
      try {
        return await CupType.find();
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
    getCupTypeById: async (_: any, { id }: { id: string }) => {
      try {
        const cupType = await CupType.findById(id);
        if (!cupType) throw new ApolloError('CupType not found');
        return cupType;
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
  },
  Mutation: {
    addCupType: async (_: any, { input }: { input: any }) => {
        try {
          // Destructure the input, which includes the file (image)
          const { name, description, diamondValue, image } = input;
  
          // Destructure the image file details (file stream and filename)
          const { createReadStream, filename } = await image;
  
          // Define the path where the file will be saved locally
          const filePath = path.join(__dirname, '../../uploads', filename);
          
          // Create a write stream to save the file
          const writeStream = fs.createWriteStream(filePath);
  
          // Pipe the file stream to the local file
          createReadStream().pipe(writeStream);
  
          // Once the file has been saved, create a new CupType in the database
          const newCupType = new CupType({
            name,
            description,
            diamondValue,
            image: `/uploads/${filename}`, // Save the relative path to the image in the database
          });
  
          // Save the CupType to the database
          const savedCupType = await newCupType.save();
  
          return savedCupType;
        } catch (error) {
          throw new ApolloError(error.message);
        }
      },
    updateCupType: async (_: any, { id, input }: { id: string; input: Partial<any> }) => {
      try {
        const updatedCupType = await CupType.findByIdAndUpdate(id, input, { new: true });
        if (!updatedCupType) throw new ApolloError('CupType not found');
        return updatedCupType;
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
    deleteCupType: async (_: any, { id }: { id: string }) => {
      try {
        const deletedCupType = await CupType.findByIdAndDelete(id);
        return !!deletedCupType; // Return true if deletion succeeded
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
  },
};

export default resolvers;
