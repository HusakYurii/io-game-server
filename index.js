const path = require('path');

const Express = require('express');
const expressApp = Express();
const httpServer = require('http').createServer(expressApp);
const socketIo = require('socket.io')(httpServer);

const PORT = process.env.PORT || 9090;

expressApp.use(Express.static(path.join(__dirname, '../dist')));

socketIo.on('connection', (clientSocket) => {
    console.log(`A new user has been connected`);
    
    clientSocket.on('disconnect', () => {
        console.log(`A user has been disconnected`);
    });
});

httpServer.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log(`Server is ready and is running on port: ${PORT}`);
});