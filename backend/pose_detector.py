vimport cv2
import mediapipe as mp
from mediapipe.python.solutions import pose as mp_pose
from mediapipe.python.solutions import drawing_utils as mp_drawing
import numpy as np

class PoseDetector:
    def __init__(self):
        self.mp_pose = mp_pose
        self.pose = self.mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5)
        self.mp_draw = mp_drawing

    def detect(self, frame):
        if frame is None:
            return None
        
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(img_rgb)
        
        pose_data = {
            "pose": "unknown",
            "landmarks": []
        }

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            # Ambil koordinat kunci (misal: pinggul dan lutut untuk deteksi duduk)
            # Landmark 23, 24 adalah pinggul; 25, 26 adalah lutut
            hip_y = (landmarks[23].y + landmarks[24].y) / 2
            knee_y = (landmarks[25].y + landmarks[26].y) / 2
            
            # Logika sederhana: jika lutut hampir sejajar dengan pinggul, kemungkinan duduk
            if abs(knee_y - hip_y) < 0.1:
                pose_data["pose"] = "sitting"
            else:
                pose_data["pose"] = "standing"
            
            # Kirim koordinat bahu untuk penempatan anime di frontend
            # Landmark 11, 12 adalah bahu
            shoulder_x = (landmarks[11].x + landmarks[12].x) / 2
            shoulder_y = (landmarks[11].y + landmarks[12].y) / 2
            
            pose_data["position"] = {"x": shoulder_x, "y": shoulder_y}
            
        return pose_data
