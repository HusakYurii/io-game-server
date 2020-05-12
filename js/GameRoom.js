const PhysicsWorld = require('../../physics/PhysicsWorld.js');
const { CONNECTION_CONSTANTS, GAME_CONSTANTS } = require("../../shared/Constants.js");

class GameRoom {
    constructor(id) {
        this.id = id;
        this.maxPlayers = GAME_CONSTANTS.PLAYERS_AMOUNT;
        this.players = new Map();
        this.onWorldUpdated = this.onWorldUpdated.bind(this);

        this.world = new PhysicsWorld();
        this.world.run(this.onWorldUpdated);
        this.world.createItems();
        this.world.createBots();
    }

    get isFull() {
        return this.maxPlayers === this.players.size;
    }

    get isEmpty() {
        return this.players.size === 0;
    }

    addPlayer(player) {
        this.players.set(player.id, player);
        this.world.createPlayer(player.id);
    }

    deletePlayer(playerId) {
        this.players.delete(playerId);
        this.world.removePlayer(playerId);
    }

    updatePlayerDir(data) {
        this.world.updatePlayerDir(data);
    }

    deleteWorld() {
        this.world.stop();
        this.world.cleanUpWorld();
    }

    /**
     * As soon as world finishes calculation we want to send new data to users
     * @param {object} data 
     */
    onWorldUpdated(data) {
        this.players.forEach((player) => {
            player.emit(CONNECTION_CONSTANTS.SERVER_UPDATES, data);
        });
    }
}

module.exports = GameRoom;