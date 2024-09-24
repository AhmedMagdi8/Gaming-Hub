import mongoose from 'mongoose';
type AchievementType = {
  name: string;
  description: string;
  img: string;
};

const achievementSchema = new mongoose.Schema<AchievementType>(
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
const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
