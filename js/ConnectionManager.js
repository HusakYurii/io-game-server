const { CONNECTION_CONSTANTS } = require("../../shared/Constants.js");
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
        this.connectionSocket.on(CONNECTION_CONSTANTS.CONNECTION, this.onConnection.bind(this));
        Logger.addDividerLabel("Initialization");
        Logger.logMessage("Socket initialized...");
    }

    onConnection(playerSocket) {
        const player = new Player(playerSocket, playerSocket.id);
        this.connectionsPool.set(player.id, player);

        player.emit(CONNECTION_CONSTANTS.PLAYER_CONNECTED, { id: player.id });
        player.on(CONNECTION_CONSTANTS.DISCONNECT, this.onDisconnection.bind(this, player.id));
        player.on(CONNECTION_CONSTANTS.LOGIN_PLAYER, this.onPlayerLogin.bind(this));
        player.on(CONNECTION_CONSTANTS.PLAYER_UPDATES, this.onPlayerUpdates.bind(this));
        player.on(CONNECTION_CONSTANTS.RESTART_GAME, this.onGameRestart.bind(this));

        Logger.addDividerLabel("New User connected", "#0b74de");
        Logger.logMessage("New user has beeen connected and user data was send back:");
        Logger.logData({ id: player.id, roomId: player.roomId, name: player.name });
    }

    onDisconnection(id) {
        const player = this.connectionsPool.get(id);
        player.removeAllListeners();

        this.connectionsPool.delete(id);
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
        player.setRoomId(newRoomId);
        player.setName(data.name);
        player.emit(CONNECTION_CONSTANTS.PLAYER_LOGGEDIN, { roomId: newRoomId, id: player.id, name: player.name });

        Logger.addDividerLabel("One of the users logged-in", "#a623b8");
        Logger.logData({ id: player.id, roomId: player.roomId, name: player.name });
        Logger.logMessage(`Connection Manager - current # of all users: ${this.connectionsPool.size}`);
        Logger.logMessage(`Rooms Manager - current # of rooms: ${this.gameRoomsManager.rooms.size}`);
    }

    onPlayerUpdates(payload) {
        const data = JSON.parse(payload);
        this.gameRoomsManager.updatePlayerData(data);
    }

    onGameRestart(payload) {
        const data = JSON.parse(payload);
        const player = this.connectionsPool.get(data.id);

        this.gameRoomsManager.deletePlayerFromRoom(player);

        player.setRoomId("");
        player.setName("");
        player.emit(CONNECTION_CONSTANTS.GAME_RESTARTED, { id: player.id });

        Logger.addDividerLabel(`Game restarted for user id: ${player.id }`, "#a653b8");
        Logger.logMessage(`Connection Manager - current # of all users: ${this.connectionsPool.size}`);
        Logger.logMessage(`Rooms Manager - current # of rooms: ${this.gameRoomsManager.rooms.size}`);
    }

    isPlayerConnected(playerId) {
        return this.connectionsPool.has(playerId);
    }
}

module.exports = ConnectionManager;