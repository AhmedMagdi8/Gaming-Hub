import mongoose, {Schema} from 'mongoose';
type AchievementType = {
  name: string;
  description: string;
  userId: Schema.Types.ObjectId
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
