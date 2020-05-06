const GameRoomsManager = require('./GameRoomsManager.js');
const Player = require('./Player.js');

const Logger = require("./Logger.js");

class ConnectionManager {
    constructor(connectionSocket) {
        this.connectionsPool = new Map();
        this.connectionSocket = connectionSocket;
        this.gameRoomsManager = new GameRoomsManager();
    }

    init() {
        this.connectionSocket.on("connection", this.onConnection.bind(this));
        Logger.addDividerLabel("Initialization");
        Logger.logMessage("Socket initialized...");
    }

    onConnection(playerSocket) {
        const player = new Player(playerSocket, playerSocket.id);
        this.connectionsPool.set(player.id, player);

        player.emit("player-connected", { id: player.id });
        player.on("disconnect", this.onDisconnection.bind(this, player.id));
        player.on("login-player", this.onPlayerLogin.bind(this));
        player.on("player-updates", this.onPlayerUpdates.bind(this))

        Logger.addDividerLabel("New User connected", "#0b74de");
        Logger.logMessage("New user has beeen connected and user data was send back:");
        Logger.logData({ id: player.id, roomId: player.roomId, name: player.name });
    }

    onDisconnection(playerId) {

        const player = this.connectionsPool.get(playerId);
        this.connectionsPool.delete(playerId);
        player.removeAllListeners();

        this.gameRoomsManager.deletePlayerFromRoom(player);

        Logger.addDividerLabel("A User disconnected", "#28a134");
        Logger.logMessage("A user has been disconnected:");
        Logger.logData({ id: player.id, roomId: player.roomId, name: player.name });
        Logger.logMessage(`Connection Manager - current # of all users: ${this.connectionsPool.size}`);
        Logger.logMessage(`Rooms Manager - current # of rooms: ${this.gameRoomsManager.rooms.size}`);
    }

    onPlayerLogin(payload) {
        const data = JSON.parse(payload);
        const player = this.connectionsPool.get(data.id);

        const newRoomId = this.gameRoomsManager.addPlayerToRoom(player, data);
        player.emit("player-loggedin", { roomId: newRoomId, id: player.id, name: player.name });

        Logger.addDividerLabel("One of the users logged-in", "#a623b8");
        Logger.logData({ id: player.id, roomId: player.roomId, name: player.name });
        Logger.logMessage(`Connection Manager - current # of all users: ${this.connectionsPool.size}`);
        Logger.logMessage(`Rooms Manager - current # of rooms: ${this.gameRoomsManager.rooms.size}`);
    }

    onPlayerUpdates(payload) {
        const data = JSON.parse(payload);
        this.gameRoomsManager.updatePlayerDir(data);
    }

    isPlayerConnected(playerId) {
        return this.connectionsPool.has(playerId);
    }
}

module.exports = ConnectionManager;