from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from sklearn.cluster import KMeans
import os

app = Flask(__name__)
CORS(app)

# Correct file path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(BASE_DIR, "Mall_Customers.csv")

# Load dataset
df = pd.read_csv(file_path)

# Train model
X = df[["Annual Income (k$)", "Spending Score (1-100)"]]
kmeans = KMeans(n_clusters=4, random_state=42)
df["cluster"] = kmeans.fit_predict(X)

@app.route("/")
def home():
    return "Backend running!"

@app.route("/data")
def data():
    return jsonify(df.to_dict(orient="records"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    income = int(data["income"])
    score = int(data["score"])

    result = kmeans.predict([[income, score]])
    return jsonify({"cluster": int(result[0])})

if __name__ == "__main__":
    app.run(debug=True)