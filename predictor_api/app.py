from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

model = joblib.load('sgpa_predictor.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_df = pd.DataFrame([[data['prev3'], data['prev2'], data['prev1']]], 
                            columns=['Prev_3', 'Prev_2', 'Prev_1'])
    
    prediction = model.predict(input_df)[0]
    return jsonify({"predicted_sgpa": round(prediction, 2)})

if __name__ == '__main__':
    app.run(port=5000)