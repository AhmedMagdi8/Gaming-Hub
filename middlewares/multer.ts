import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set your uploads directory
  },
  filename: (req: any, file, cb) => {
    const userId = req.userId; // Assumes userId is set in req
    if (!userId) {
      cb(new Error('User ID is missing from request'), '');
      return;
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    const filename = `${userId}-${uniqueSuffix}${fileExt}`;
    
    cb(null, filename);
  },
});

const upload = multer({ storage });

export default upload;