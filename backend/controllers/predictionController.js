import axios from "axios";

export const getPrediction = async (req, res) => {
  try {
    // We send data to the separate Python ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000/predict";
    
    // Ensure we don't crash if ML isn't running, return a mock response for now
    let predictionData;
    try {
      const response = await axios.post(mlServiceUrl, req.body);
      predictionData = response.data;
    } catch (mlError) {
      console.warn("Python ML Service unreachable. Providing mock prediction.", mlError.message);
      predictionData = {
        productivityScore: 78,
        burnoutRisk: "Medium",
        goalProbability: 82,
        futureForecast: "Performance expected to rise if sleep is maintained at 8 hours."
      };
    }

    res.json({
      success: true,
      prediction: predictionData,
      genAI_Feedback: "Based on your projected burnout risk, taking 15-minute scheduled breaks every 2 hours will optimize your focus and lower risk."
    });
  } catch (error) {
    res.status(500).json({ message: "Prediction service error", error: error.message });
  }
};