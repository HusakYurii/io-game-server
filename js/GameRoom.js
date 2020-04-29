const PhysicsWorld = require('./physics/PhysicsWorld.js');

class GameRoom {
    constructor(id) {
        this.id = id;
        this.maxPlayers = 5;
        this.players = new Map();
        this.onWorldUpdated = this.onWorldUpdated.bind(this);

        this.world = new PhysicsWorld();
        this.world.run(this.onWorldUpdated);
        this.world.createItems();
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
            player.emit('server-updates', data);
        });
    }
}

module.exports = GameRoom;