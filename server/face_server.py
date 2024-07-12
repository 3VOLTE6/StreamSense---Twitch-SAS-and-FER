import cv2
import streamlink
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from flask import Flask, Response, request, jsonify

app = Flask(__name__)

# Load the emotion classifier model
emotion_model_path = './cnn_FER2013.h5'
emotion_classifier = load_model(emotion_model_path)
emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

# Load face detector classifiers
face_cascade_path = './haarcascade/haarcascade_frontalface_alt2.xml'
profileface_cascade_path = './haarcascade/haarcascade_profileface.xml'
face_cascade = cv2.CascadeClassifier(face_cascade_path)
profileface_cascade = cv2.CascadeClassifier(profileface_cascade_path)

# Emotion colors
colors = {
    'happy': (0, 255, 0),      # Verde
    'sad': (255, 0, 0),        # Blu
    'angry': (0, 0, 255),      # Rosso
    'fear': (128, 0, 128),     # Viola
    'surprise': (0, 255, 255), # Giallo
    'neutral': (255, 255, 255),# Bianco
    'disgust': (255, 255, 0)   # Ciano
}

def get_stream_link(channel_name):
    streams = streamlink.streams(f'twitch.tv/{channel_name}')
    return streams['best'].url if streams else None

def process_frame(frame, perc):
    width = int(frame.shape[1] * perc / 100)
    height = int(frame.shape[0] * perc / 100)
    dim = (width, height)
    return cv2.resize(frame, dim, interpolation=cv2.INTER_AREA)

@app.route('/video_feed', methods=['GET'])
def video_feed():
    channel = request.args.get('channel')
    stream_url = get_stream_link(channel)
    if not stream_url:
        return "Unable to get channel stream", 400

    def generate():
        cap = cv2.VideoCapture(stream_url)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            res_frame = process_frame(gray, 50)
            faces = face_cascade.detectMultiScale(res_frame, scaleFactor=2, minNeighbors=3, minSize=(30, 30))
            profiles = profileface_cascade.detectMultiScale(res_frame, scaleFactor=2, minNeighbors=3, minSize=(30, 30))

            all_faces = list(faces) + list(profiles)

            for (x, y, w, h) in all_faces:
                x, y, w, h = int(x * 2), int(y * 2), int(w * 2), int(h * 2)
                face = gray[y:y + h, x:x + w]
                face = cv2.resize(face, (48, 48))
                face = face.astype('float') / 255.0
                face = img_to_array(face)
                face = np.expand_dims(face, axis=0)

                emotion_prediction = emotion_classifier.predict(face)[0]
                max_index = np.argmax(emotion_prediction)
                emotion_label = emotion_labels[max_index]

                # Ensure the emotion_label is in lowercase to match dictionary keys
                emotion_label_lower = emotion_label.lower()
                color = colors.get(emotion_label_lower, (0, 0, 255))  # Default to red if not found
                
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, emotion_label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        cap.release()

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
