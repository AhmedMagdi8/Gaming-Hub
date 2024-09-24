import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserType from './types/userTypes';
import mongoose from 'mongoose';

dotenv.config();

export const generateToken = (user: UserType) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    // @ts-ignore
    process.env.JWT_SECRET
    // {
    //   expiresIn: '30d',
    // }
  );
};

export function isLoggedIn(
  parent: any,
  args: any,
  {
    user,
  }: {
    user:
      | mongoose.Document<unknown, {}, UserType> &
          UserType &
          Required<{
            _id: mongoose.Schema.Types.ObjectId;
          }>;
  }
) {
  if (!user) throw new Error('يجب تسجيل دخولك!!');
}

export function verify(token: string) {
  // @ts-ignore
  return jwt.verify(token, process.env.JWT_SECRET);
}
export default generateToken;
