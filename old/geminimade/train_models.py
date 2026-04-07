import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import r2_score, accuracy_score, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_PATH = os.path.join(BASE_DIR, 'ultimate_student_productivity_dataset_5000.csv')
    EDA_DIR = os.path.join(BASE_DIR, 'EDA_Plots')
    MODEL_DIR = os.path.join(BASE_DIR, 'models')

    os.makedirs(EDA_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Loading dataset from:", DATA_PATH)
    if not os.path.exists(DATA_PATH):
        print("Dataset not found! Please check the path.")
        return

    df = pd.read_csv(DATA_PATH)
    
    print("\n--- 1. Exploratory Data Analysis ---")
    
    # 1.1 Correlation Matrix
    print("Generating Correlation Matrix...")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    plt.figure(figsize=(16, 12))
    sns.heatmap(df[numeric_cols].corr(), annot=False, cmap='coolwarm', vmin=-1, vmax=1)
    plt.title('Feature Correlation Matrix')
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, 'correlation_matrix.png'))
    plt.close()

    # 1.2 Distributions of Target Variables
    print("Generating Target Distributions...")
    targets = ['productivity_score', 'burnout_level', 'focus_index', 'exam_score']
    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    axes = axes.flatten()
    for i, target in enumerate(targets):
        sns.histplot(df[target], kde=True, ax=axes[i], color='teal')
        axes[i].set_title(f'Distribution of {target}')
    plt.tight_layout()
    plt.savefig(os.path.join(EDA_DIR, 'target_distributions.png'))
    plt.close()

    print("\n--- 2. Data Preprocessing ---")
    
    # Feature Engineering for Burnout Classification
    # We will use the median as the threshold for 'High Burnout Risk' (1) vs 'Low Risk' (0)
    burnout_threshold = df['burnout_level'].median()
    df['burnout_risk_class'] = (df['burnout_level'] >= burnout_threshold).astype(int)
    
    # Encode Categoricals
    categorical_cols = ['gender', 'academic_level', 'internet_quality']
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
    joblib.dump(label_encoders, os.path.join(MODEL_DIR, 'label_encoders.pkl'))

    # Define feature set (Exclude pure targets and IDs)
    targets_to_exclude = ['productivity_score', 'burnout_level', 'focus_index', 'exam_score', 'burnout_risk_class']
    features = [col for col in df.columns if col not in targets_to_exclude and col != 'student_id']

    X = df[features]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'scaler.pkl'))
    joblib.dump(features, os.path.join(MODEL_DIR, 'feature_names.pkl'))

    def train_and_evaluate_regressor(target_name):
        y = df[target_name]
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)
        score = r2_score(y_test, model.predict(X_test))
        rmse = np.sqrt(mean_squared_error(y_test, model.predict(X_test)))
        print(f"[{target_name}] Model R2 Score: {score:.4f} | RMSE: {rmse:.4f}")
        joblib.dump(model, os.path.join(MODEL_DIR, f'{target_name}_model.pkl'))

    print("\n--- 3. Training Machine Learning Models ---")
    
    # 3.1 Regression Models
    print("\nTraining Regression Models (Predictability)...")
    for target in ['productivity_score', 'focus_index', 'exam_score']:
        train_and_evaluate_regressor(target)

    # 3.2 Classification Model (Burnout Risk)
    print("\nTraining Burnout Classification Model...")
    y_burnout = df['burnout_risk_class']
    X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(X_scaled, y_burnout, test_size=0.2, random_state=42)
    rf_burnout = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf_burnout.fit(X_train_b, y_train_b)
    burnout_acc = accuracy_score(y_test_b, rf_burnout.predict(X_test_b))
    print(f"[burnout_risk_class] Classifier Accuracy: {burnout_acc:.4f}")
    joblib.dump(rf_burnout, os.path.join(MODEL_DIR, 'burnout_classifier_model.pkl'))

    # 3.3 Clustering (User Behaviors)
    print("\nClustering Student Habits using K-Means...")
    behavioral_features = ['study_hours', 'screen_time_hours', 'gaming_hours', 'sleep_hours', 'social_media_hours', 'exercise_minutes']
    X_cluster = df[behavioral_features]
    scaler_cluster = StandardScaler()
    X_cluster_scaled = scaler_cluster.fit_transform(X_cluster)
    joblib.dump(scaler_cluster, os.path.join(MODEL_DIR, 'scaler_cluster.pkl'))

    kmeans = KMeans(n_clusters=4, random_state=42, n_init='auto')
    df['behavior_cluster'] = kmeans.fit_predict(X_cluster_scaled)
    joblib.dump(kmeans, os.path.join(MODEL_DIR, 'kmeans_behavior_model.pkl'))
    
    # Dimensionality Reduction for Visualization
    try:
        from sklearn.decomposition import PCA
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_cluster_scaled)
        plt.figure(figsize=(10, 8))
        sns.scatterplot(x=X_pca[:, 0], y=X_pca[:, 1], hue=df['behavior_cluster'], palette='viridis', legend='full')
        plt.title('Student Behavior Clusters (PCA View)')
        plt.tight_layout()
        plt.savefig(os.path.join(EDA_DIR, 'behavior_clusters_pca.png'))
        plt.close()
    except Exception as e:
        print(f"Skipping PCA plot: {e}")

    print("\n==================================")
    print("Execution Finished Successfully!")
    print(f"EDA Outputs saved to: {EDA_DIR}")
    print(f"Trained Models saved to: {MODEL_DIR}")
    print("==================================")

if __name__ == "__main__":
    main()
