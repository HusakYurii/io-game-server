const GameRoom = require('./GameRoom.js');
const Tools = require('../../shared/Tools.js');

class RoomsManager {
    constructor() {
        this.maxRooms = 10;
        this.rooms = new Map();
    }

    get isFull() {
        return this.maxRooms === this.rooms.length;
    }

    createRoom() {
        const room = new GameRoom(Tools.generateId());
        this.rooms.set(room.id, room);
    }

    hasRoom(roomId) {
        return this.rooms.has(roomId);
    }

    deleteRoom(roomId) {
        this.rooms.delete(roomId);
    }
}

module.exports = RoomsManager;