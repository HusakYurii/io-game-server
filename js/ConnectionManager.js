const GameRoomsManager = require('./GameRoomsManager.js');
const Player = require('./Player.js');

class ConnectionManager {
    constructor(connectionSocket) {
        this.connectionsPool = new Map();
        this.connectionSocket = connectionSocket;
        this.gameRoomsManager = new GameRoomsManager();
    }

    init() {
        this.connectionSocket.on("connection", this.onConnection.bind(this));
    }

    onConnection(playerSocket) {
        const player = new Player(playerSocket, playerSocket.id);
        this.connectionsPool.set(player.id, player);

        player.emit("user-connected", { id: player.id });
        player.on("disconnect", this.onDisconnection.bind(this, player.id));
        player.on("login-user", this.onPlayerLogin.bind(this));
    }

    onDisconnection(playerId) {

        const player = this.connectionsPool.get(playerId);
        this.connectionsPool.delete(playerId);
        player.removeAllListeners();

        this.gameRoomsManager.deletePlayerFromRoom(player);
    }

    onPlayerLogin(playload) {
        const data = JSON.parse(playload);
        const player = this.connectionsPool.get(data.id);

        const newRoomId = this.gameRoomsManager.addPlayerToRoom(player, data);
        player.emit("user-loggedin", { roomId: newRoomId });
    }

    isPlayerConnected(playerId) {
        return this.connectionsPool.has(playerId);
    }

    logMessage(message) {
        if(!DEBUG_EVENTS) return;
        console.log(message);
    }
}

module.exports = ConnectionManager;