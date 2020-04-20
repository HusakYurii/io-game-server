const Tools = require('../../shared/Tools.js');
const Player = require('./Player.js');

class ConnectionManager {
    constructor(connectionSocket) {
        this.idlePool = new Map();
        this.connectionSocket = connectionSocket;
    }

    init() {
        this.connectionSocket.on("connection", this.onConnection.bind(this));
    }

    onConnection(playerSocket) {
        const player = new Player(playerSocket, Tools.generateId());
        this.idlePool.set(player.id, player);

        player.emit("user-connected", { id: player.id });
        player.on("disconnect", this.onDisconnection.bind(this, player.id));
    }

    onDisconnection(playerId) {
        const player = this.idlePool.get(playerId);
        this.idlePool.delete(playerId);
        player.removeAllListeners();
    }

    logMessage(message) {
        console.log(message);
    }
}

module.exports = ConnectionManager;