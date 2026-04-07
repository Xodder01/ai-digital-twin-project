# AI Digital Twin – Student Performance Prediction System

## Project Overview
The AI Digital Twin project is a web-based application that uses artificial intelligence and machine learning to analyze and predict student performance. The system creates a virtual representation (digital twin) of a student using lifestyle and study-related factors such as study hours, sleep habits, stress level, and screen time.
The purpose of this project is to help students understand how their daily routine affects their academic results. By analyzing patterns in the data, the system provides predictions and insights that can help improve productivity and performance. The project combines modern web development with machine learning to create a practical and intelligent educational tool.


## Problem Statement
Many students are unable to identify how their daily habits influence their academic performance. Factors like insufficient sleep, high stress, or excessive screen usage often lead to poor results. Without proper analysis, it becomes difficult to identify the root cause of low performance.
This project aims to solve this problem by collecting relevant data, analyzing it using machine learning algorithms, and providing predictions along with useful insights. The system helps students make better decisions by understanding how different factors affect their performance.


## Key Features

### Student Digital Twin
The system creates a digital version of a student based on the information provided. This digital twin represents the behaviour and habits of the student and helps simulate possible academic outcomes.

### Performance Prediction
The machine learning model predicts student performance based on input parameters. The prediction helps users understand whether their current habits are suitable for achieving better academic results.

### Dashboard and Analytics
The dashboard displays important insights such as behaviour patterns, performance trends, and factors affecting results. It helps users visually understand their data.

### Prediction History
The application stores previous predictions so users can track their progress and observe improvements over time.

### User-Friendly Interface
The project provides a clean and simple interface that makes the system easy to use for students and beginners.


## Technology Stack
Frontend technologies used in this project include React with Vite, Tailwind CSS, JavaScript, HTML, and CSS. These technologies help create a fast, responsive, and modern user interface.
Backend and machine learning components are developed using Python along with libraries such as Pandas, NumPy, and Scikit-learn. These tools are used for data processing, training the model, and generating predictions.
Other tools used include VS Code, Git, GitHub, Node.js, and npm for development and version control.


## Machine Learning Model
The machine learning model is trained on student-related data to identify patterns between lifestyle habits and academic performance.

Input features used in the model include study hours, sleep hours, sleep quality, stress level, and screen time.

Model evaluation results show the following performance:
Mean Absolute Error (MAE): 12.46
Mean Squared Error (MSE): 223.86
R2 Score: 0.53

The dataset is also divided into clusters to group students with similar habits and characteristics. This clustering helps understand different categories of student behaviour.


## How the System Works
First, the user enters information such as study hours, sleep duration, stress level, and screen time.
The system sends this data to the machine learning model.
The model analyzes the input data using patterns learned during training.
After processing, the model predicts the expected performance.
The predicted result is displayed on the dashboard.
The prediction is saved so the user can track changes over time.


## Installation and Setup
First, download or clone the project files to your system.
Open the project folder in a code editor such as VS Code.
Install the required dependencies using npm install.
Start the development server using npm run dev.
Run the Python machine learning script to train or use the model for predictions.


## Future Improvements
In future versions, the system can include more input parameters to improve prediction accuracy. Real-time data tracking can be added to make predictions more dynamic. Authentication features can be implemented to allow multiple users to securely access the system. Data visualization charts can be improved for better understanding of results. The system can also be deployed online so that users can access it from anywhere.


## Use Cases
Students can use this system to understand how their habits affect their academic performance. Teachers can analyze student patterns and identify areas where improvement is needed. Educational institutions can use the data to study performance trends. Researchers can analyze the relationship between lifestyle and learning outcomes.


## Authors
Abhay Singh<BR>Lakhinder Singh


## Conclusion

The AI Digital Twin project shows how artificial intelligence can be used to analyze human behaviour and predict outcomes. By combining machine learning with modern web technologies, the project provides a useful solution for improving academic performance through data-driven insights. The system demonstrates the practical application of AI in education and highlights how technology can support better decision-making.
