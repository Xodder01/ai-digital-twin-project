import mongoose from "mongoose";

const dailyDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    studyHours: Number,
    sleepHours: Number,
    mood: String,
    screenTime: Number,
    tasksCompleted: Number,
  },
  { timestamps: true }
);

export default mongoose.model("DailyData", dailyDataSchema);