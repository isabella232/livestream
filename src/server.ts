import app from "./app";
import {Recognize} from "./speechRecognition/revAI/recognize";

const http = require('http').Server(app);
const io = require('socket.io')(http);

let revAIStream = new Recognize();

io.on('connection', socket => {
    socket.on('START_STREAM_1', (streamID) => {
        console.log('streamID via socket ' + streamID);
        revAIStream.startRecognizeStream(io,streamID, `http://meetpriyesh.com:8000/live/${streamID}/index.m3u8`);
    });
});


const PORT = normalizePort(process.env.PORT || '3000');


try{
    app.listen(PORT, () => {
        console.log(`Express server listening on port ${PORT}`);
    });
}catch (e) {
    console.log(e);
}

process.on('uncaughtException', (err) =>{
        console.log(err);
    }
//do something
);

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
