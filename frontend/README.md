AI Digital Twin (Frontend)
This is the interface for the AI Digital Twin—a predictive system designed to help users understand the tipping point between peak productivity and burnout.

Most productivity tools just track time. This project uses AI to analyze behavioral inputs and predict future risks, giving users a "Digital Twin" to experiment with before they actually hit a wall.

The Stack
I chose Vite + React for the speed. The UI is built with Tailwind CSS to keep the design system consistent and the bundle size small.

React Router DOM for seamless, zero-refresh navigation.

Lucide React for clean, consistent iconography.

Component-Driven Design to ensure the dashboard widgets are reusable across the app.

Key Modules:
The Predictor
The core of the app. It’s a multi-input form that captures work habits and stress markers. It’s designed with validation to ensure the AI gets clean data for every prediction.

Performance Dashboard
A bird’s-eye view of your stats. Instead of just showing numbers, I used progress indicators and color-coded risk levels to make the burnout data "scannable" at a glance.

Historical Audit
Every prediction is logged. This table allows users to look back and see how their productivity scores have fluctuated over weeks or months.
