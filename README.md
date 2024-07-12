
# Twitch Livestream Sentiment Analysis and Face Emotion Recognition

This project integrates advanced Sentiment Analysis and Face Emotion Recognition models for Twitch livestreams, providing real-time insights into both viewer sentiments and streamer emotions.

## Key Components

### Sentiment Analysis (SAS)
- Model: Utilizes BERT (Bidirectional Encoder Representations from Transformers) for its superior context understanding capabilities.
- Fine-Tuning: The model is fine-tuned specifically for Twitch chat messages to improve accuracy in sentiment classification.
- Dataset: Compiled from Twitch chat logs, including preprocessing and manual labeling of messages as positive or negative.

### Face Emotion Recognition (FER)
- Model: Implements Multi-task Cascaded Convolutional Networks (MTCNN) for robust face detection.
- Emotion Recognition: Uses DeepFace for accurate real-time emotion recognition, providing insights into the streamer’s emotional state during broadcasts.

## Features

- Real-Time Data Processing: The system processes and analyzes chat messages and video streams in real-time, offering instant feedback on the emotional and sentiment dynamics of the stream.
- Interactive Web Interface: A user-friendly web application built using React and Node.js allows users to visualize sentiment and emotion data, enhancing the viewing experience and providing valuable insights for streamers.
- Comprehensive Metrics: Detailed metrics and visualizations of sentiment analysis and face emotion recognition results, helping users understand audience reactions and streamer emotions at a glance.
- Custom Emote Classification: Incorporates classification of Twitch-specific emotes to improve sentiment analysis accuracy, understanding the unique language used by Twitch communities.

## Implementation Details

- Data Collection: Utilizes a GitHub tool to extract chat logs from past Twitch streams in JSON format.
- Data Processing: Employs Python scripts for parsing and organizing data, ensuring that only relevant information (e.g., username, message content) is included.
- Data Labeling: Manual labeling of the dataset with positive and negative sentiment tags to create a robust training set for the model.
- Real-Time Integration: Models are integrated into the web interface to provide real-time analysis and visualization of ongoing streams.

## Future Enhancements

- Multimodal Analysis: Integration of audio analysis to provide a more holistic understanding of interactions and emotions.
- Continuous Learning: Implementing models that adapt and improve with continuous learning based on new data from live streams.
- Enhanced Real-Time Processing: Improving the efficiency and speed of real-time data processing to handle larger volumes of data with minimal latency.
- Advanced Emotion Detection: Exploring the use of more sophisticated deep learning architectures to improve the accuracy of emotion recognition.

---

This project leverages the power of machine learning to bring deeper insights and enhanced interactivity to Twitch livestreams, making it an invaluable tool for streamers and viewers alike. By combining sentiment analysis and facial emotion recognition, it offers a comprehensive understanding of live interactions, paving the way for more engaging and personalized streaming experiences.
