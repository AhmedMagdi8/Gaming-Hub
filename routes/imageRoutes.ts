import express, { Request, Response } from 'express';
import upload from '../middlewares/multer';
import User from '../models/user';
import GenericError from '../utils/error';
import path from 'path';

const router = express.Router();

// Endpoint to upload user photo
router.post('/upload-photo', upload.single('image'), async (req: any, res: Response) => {
  try {
    if (!req.isAuth) {
      throw new GenericError("Not authenticated!", 401);
    }
    
    const userId = req.userId; // Assumes userId is stored in req from middleware or token
    const imageName = req.file?.filename;

    if (!userId || !imageName) {
      return res.status(400).json({ message: 'User ID or image file missing' });
    }

    // Update the user's image field with the new filename
    await User.findByIdAndUpdate(userId, { image: imageName });

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: imageName,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user image', error });
  }
});

// Endpoint to get user photo
router.get('/photo', async (req: Request, res: Response) => {
  try {
    const { username } = req.query; // Extract username from query parameters

    // Check if a username is provided
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Fetch the user based on username, ensuring to convert to string if needed
    const user = await User.findOne({ username: String(username) }).select('image');

    // Check if user was found and if they have an image
    if (!user || !user.image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const filepath = path.join(__dirname, '../uploads', user.image);
    res.sendFile(filepath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error retrieving image' });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});
export default router;
