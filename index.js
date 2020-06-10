const path = require('path');
const Express = require('express');
const expressApp = Express();
const httpServer = require('http').createServer(expressApp);
const socketIo = require('socket.io')(httpServer);

const ConnectionManager = require('./js/ConnectionManager.js');

const PORT = process.env.PORT || 9090;
const url = process.env.NODE_ENV === undefined ? "192.168.168.101" : undefined;

// To host it if client files are on the same website as server
// expressApp.use(Express.static(path.join(__dirname, '../dist/client')));
//  

const connectionManager = new ConnectionManager(socketIo);
connectionManager.init();

httpServer.listen(PORT, url, (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log(`Server is ready and is running on port: ${PORT}`);
});