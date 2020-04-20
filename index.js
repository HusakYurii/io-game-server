const path = require('path');
const Express = require('express');
const expressApp = Express();
const httpServer = require('http').createServer(expressApp);
const socketIo = require('socket.io')(httpServer);

const ConnectionManager = require('./js/ConnectionManager.js');

const PORT = process.env.PORT || 9090;

expressApp.use(Express.static(path.join(__dirname, '../dist/client')));

const connectionManager = new ConnectionManager(socketIo);
connectionManager.init();

httpServer.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log(`Server is ready and is running on port: ${PORT}`);
});