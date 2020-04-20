class GameRoom {
    constructor(id) {
        this.id = id;
        this.maxPlayers = 5;
        this.players = new Map();
    }

    get isFull() {
        return this.maxPlayers === this.players.size;
    }

    get isEmpty() {
        return this.players.size === 0;
    }
}

module.exports = GameRoom;