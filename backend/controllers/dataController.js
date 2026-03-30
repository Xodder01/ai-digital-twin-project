import DailyData from "../models/DailyData.js";

export const addData = async (req, res) => {
  try {
    const data = await DailyData.create({
      userId: req.user._id,
      ...req.body,
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to add daily data", error: error.message });
  }
};

export const getData = async (req, res) => {
  try {
    const data = await DailyData.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error: error.message });
  }
};

export const getDashboardAnalytics = async (req, res) => {
  try {
    // Analytics calculations based on user's last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = await DailyData.find({ 
      userId: req.user._id,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });

    if (!data || data.length === 0) {
      return res.json({ message: "Not enough data to generate analytics yet." });
    }

    // Example computations for the frontend dashboard
    let totalStudyHours = 0;
    let totalTasksCompleted = 0;
    
    const weeklyTrend = data.map(record => ({
      date: record.createdAt,
      studyHours: record.studyHours,
      tasksCompleted: record.tasksCompleted
    }));

    data.forEach(record => {
      totalStudyHours += record.studyHours || 0;
      totalTasksCompleted += record.tasksCompleted || 0;
    });

    const averageStudyHours = totalStudyHours / data.length;
    
    // Simplistic mock calculations for the presentation
    const productivityScore = Math.min(100, Math.round((averageStudyHours / 8) * 100)); // Assuming 8 hours is 100%
    const burnoutRisk = averageStudyHours > 10 ? 85 : averageStudyHours > 8 ? 60 : 20;

    res.json({
      productivityScore,
      burnoutRisk,
      totalTasksCompleted,
      weeklyTrend,
      insights: [
        "Consistent sleep improves your productivity by 20%.",
        averageStudyHours > 8 ? "You are studying hard, watch out for burnout." : "You have capacity to increase your study hours safely."
      ]
    });
  } catch (error) {
    res.status(500).json({ message: "Analytics generation failed", error: error.message });
  }
};