import app from "./app";
import {Recognize} from "./speechRecognition/revAI/recognize";
const http = require('http');
const revAIStream = new Recognize();
const server = http.createServer(app);
const io = require('socket.io')(server);
const PORT = normalizePort(process.env.PORT || '3000');

server.listen(PORT, () => {
    console.log(`Listening on :${PORT}`);
});

io.on('connection', socket => {
    socket.on('START_STREAM_1', (streamID) => {
        console.log('streamID via socket ' + streamID);
        revAIStream.startRecognizeStream(io,streamID,`rtmp://zoomlivestreaming.herokuapp.com/live/${streamID}`);
    });
});

function normalizePort(val) {
    let port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}