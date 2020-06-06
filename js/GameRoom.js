const World = require('../gameEngine/World.js');
const { CONNECTION_CONSTANTS, GAME_CONSTANTS } = require("../shared/Constants.js");

class GameRoom {
    constructor(id) {
        this.id = id;
        this.maxPlayers = GAME_CONSTANTS.PLAYERS_AMOUNT;
        this.players = new Map();

        this.onWorldUpdated = this.onWorldUpdated.bind(this);

        this.world = new World();
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

    updatePlayerData(data) {
        this.world.updatePlayerData(data);
    }

    deleteWorld() {
        this.world.stop();
        this.world.cleanUpWorld();
        this.world = null;
    }

    /**
     * As soon as world finishes calculation we want to send new data to users
     * @param {object} data
     * @param {PlayerObject[]} deadPlayers
     */
    onWorldUpdated(data = {}, deadPlayers = []) {
        this.players.forEach((player) => {
            player.emit(CONNECTION_CONSTANTS.SERVER_UPDATES, data);
        });

        deadPlayers.forEach((player) => {
            if (this.players.has(player.id)) {
                this.players.get(player.id).emit(CONNECTION_CONSTANTS.GAME_OVER);
            }
        });
    }
}

module.exports = GameRoom;