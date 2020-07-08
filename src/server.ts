import app from "./app";
import {Recognize} from "./speechRecognition/revAI/recognize";
import {IBMRecognize} from "./speechRecognition/ibmWatson/ibmRecognize";
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const PORT = normalizePort(process.env.PORT || '3000');
const ibmWatSon = new IBMRecognize();

server.listen(PORT, () => {
    console.log(`Listening on :${PORT}`);
});

io.on('connection', socket => {
    socket.on('START_STREAM_1', (streamID) => {
        console.log('streamID via socket ' + streamID);
        //const revAIStream = new Recognize();
        //revAIStream.startRecognizeStream(io,streamID,`${process.env.SERVER_URL_HTTP}:8000/live/${streamID}.flv`);
        ibmWatSon.startRecognizeStream(io, `${process.env.SERVER_URL_HTTP}:8000/live/${streamID}.flv`);
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