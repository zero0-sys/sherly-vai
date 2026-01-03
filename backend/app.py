from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import cv2
from pose_detector import PoseDetector
from chatbot import get_chat_response

app = Flask(__name__, static_folder='../docs', static_url_path='')
CORS(app)

detector = PoseDetector()

@app.route("/")
def index():
    return app.send_static_file('index.html')

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/detect", methods=["POST"])
def detect():
    try:
        data = request.json.get("image")
        if not data:
            return jsonify({"error": "No image provided"}), 400

        # Decode base64 → OpenCV image
        img_bytes = base64.b64decode(data.split(",")[1])
        img_array = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Invalid image"}), 400

        pose_results = detector.detect(frame)
        return jsonify(pose_results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_text = request.json.get("text")
        if not user_text:
            return jsonify({"error": "No text provided"}), 400
        
        response_text = get_chat_response(user_text)
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
