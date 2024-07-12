const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const tmi = require('tmi.js');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

server.listen(3100, () => console.log(`Il server è in esecuzione sulla porta 3100.`));

const SENTIMENT_SERVER_IP = '127.0.0.1';
const SENTIMENT_SERVER_PORT = '5001';
const EMOTION_SERVER_IP = '127.0.0.1';
const EMOTION_SERVER_PORT = '5002';
const sentimentAPI = `http://${SENTIMENT_SERVER_IP}:${SENTIMENT_SERVER_PORT}/analyze`;
const videoFeedAPI = `http://${EMOTION_SERVER_IP}:${EMOTION_SERVER_PORT}/video_feed`;

function analyzeSentiment(message, callback) {
  axios.post(sentimentAPI, { text: message })
    .then(response => {
      callback(null, response.data.sentiment);
    })
    .catch(error => {
      console.error('Sentiment analysis error:', error);
      callback(error, null);
    });
}

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected...`);
  const client = new tmi.Client({
    connection: {
      secure: true,
      reconnect: true,
    },
  });

  socket.on("start", (streamer) => {
    client.connect().then(() => {
      client.join(streamer).then(() => {
        console.log(`Connected to streamer: ${streamer}`);
      }).catch((err) => {
        console.log(`Error connecting to ${streamer}: ${err}`);
      });
    }).catch((err) => {
      console.log(`Error connecting to ${streamer}: ${err}`);
    });

    client.on("message", (_channel, tags, message, _self) => {
      analyzeSentiment(message, (error, sentiment) => {
        if (error) {
          console.error('Sentiment analysis error:', error);
          return;
        }
        socket.emit("new_msg", { user: tags['display-name'], msg: message, sentiment: sentiment });
      });
    });

    const videoFeedUrl = `${videoFeedAPI}?channel=${streamer}`;
    socket.emit("video_feed", { url: videoFeedUrl });

    client.on('disconnected', (reason) => {
      console.log(`Twitch Client disconnected: ${reason}`);
    });

    client.on("unhost", (channel, _viewers) => {
      console.log(`${channel} ended the stream.`);
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket ${socket.id} disconnected: ${reason}`);
    client.disconnect().then(() => {
      console.log(`Twitch client disconnected`);
    }).catch((err) => {
      console.log(`Failed to disconnect from twitch client: ${err}`);
    });
  });
});

const router = express.Router();

router.get("/", (req, res) => {
  res.send({ response: "Server is up and running." }).status(200);
});

module.exports = router;
