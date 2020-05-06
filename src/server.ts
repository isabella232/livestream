import app from "./app";


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
