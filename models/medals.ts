import mongoose from 'mongoose';
type MedalType = {
  name: string;
  description: string;
  img: string;
};

const medalSchema = new mongoose.Schema<MedalType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Medal = mongoose.model('Medal', medalSchema);

export default Medal;
