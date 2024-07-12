from flask import Flask, request, jsonify
from transformers import BertTokenizer, BertForSequenceClassification
import torch

app = Flask(__name__)

# Percorso del modello
model_dir = './model'

# Carica il tokenizer e il modello
tokenizer = BertTokenizer.from_pretrained(model_dir)
model = BertForSequenceClassification.from_pretrained(model_dir)
# model.to('cpu')  # Utilizza la CPU (la riga è opzionale, poiché il modello usa la CPU per impostazione predefinita)

def analyze_sentiment(text):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512)
    # inputs = {key: value.to('cpu') for key, value in inputs.items()}  # Sposta i tensori sulla CPU (opzionale)
    outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    sentiment = torch.argmax(probs, dim=1).item()
    return sentiment  # 0 per negativo, 1 per positivo

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data['text']
    sentiment = analyze_sentiment(text)
    return jsonify({'sentiment': sentiment})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
