from datetime import datetime
import json
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS
from langchain_openai import ChatOpenAI
import os
from scraping import *

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Configure the language model
together_model = ChatOpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.getenv("TOGETHER_API_KEY"),
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
)

# Load the trained model and TF-IDF vectorizer
model = joblib.load('models/disease_prediction_model.pkl')
vectorizer = joblib.load('models/tfidf_vectorizer.pkl')

# Load the dataset with diseases and drugs
medicine_df = pd.read_csv('models/disease_drug_data.csv')

# Other APIs (unchanged)
@app.route("/fetch-medicines", methods=["POST"])
def fetch_medicine():
    try:
        data = request.get_json()
        search = data.get("search")

        one_mg_data = one_mg(str(search).replace(" ","%20").strip())
        apollopharmacy_data = apollopharmacy(str(search))
        pharmeasy_data = pharmeasy(str(search).replace(" ","%20").strip())
        
        return jsonify({
            "success":True,
            "one_mg":one_mg_data,
            "apollopharmacy":apollopharmacy_data,
            "pharmeasy":pharmeasy_data
        }), 200
    except Exception as e:
        print(str(e))
        return jsonify({"success":False,"message":str(e)}),500


@app.route('/predict', methods=['POST'])
def predict():
    # Get the input sentence from the request
    data = request.json
    input_sentence = data.get('symptoms', '')

    # Check if the input sentence is empty
    if not input_sentence:
        return jsonify({"error": "Input sentence is required"}), 400

    try:
        # Transform the input sentence using the TF-IDF vectorizer
        transformed_input = vectorizer.transform([input_sentence])

        # Predict the disease using the trained model
        predicted_disease = model.predict(transformed_input)[0]

        # Retrieve medicines for the predicted disease
        if predicted_disease in medicine_df['disease'].values:
            drugs_for_disease = medicine_df[medicine_df['disease'] == predicted_disease]['drug'].tolist()
        else:
            drugs_for_disease = []

        # Generate a detailed response using the language model
        ai_response = together_model.invoke(
            f"""
            Act as a doctor who gives response in simple and easy to understand language. Based on the detected disease ({predicted_disease}),
            here are the recommended medicines: {drugs_for_disease}.
            Please provide additional information about the disease and treatment options
            in the following format:
            Predicted Disease:
            Recommended Medicines:
            Additional Information:
            When to see a doctor:
            """
        ).content

        # Format the response
        response = {
            "Doctor": {
                "disease": predicted_disease,
                "recommended_medicines": drugs_for_disease,
                "response": str(ai_response)
            }
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)