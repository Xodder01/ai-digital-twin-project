import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    productivityScore: Number,
    burnoutRisk: String,
    goalProbability: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Prediction", predictionSchema);