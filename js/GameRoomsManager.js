const GameRoom = require('./GameRoom.js');
const { generateId } = require('../../shared/Tools.js');

class RoomsManager {
    constructor() {
        this.maxRooms = 10;
        this.rooms = new Map();
    }

    get isFull() {
        return this.maxRooms === this.rooms.size;
    }

    updatePlayerDir(data) {
        if (!this.hasRoom(data.roomId)) {
            return;
        }
        const room = this.getRoomById(data.roomId);
        room.updatePlayerDir(data);
    }

    /**
     * To delete a player from the related room. 
     * Player has not room id only at the Login and Game over states.
     * If, afterwards, the room becomes empty, delete the room
     * @param {Player} player 
     */
    deletePlayerFromRoom(player) {
        if (!this.hasRoom(player.roomId)) {
            return;
        }

        const room = this.getRoomById(player.roomId);
        room.deletePlayer(player.id);
        if (room.isEmpty) {
            this.deleteRoom(room.id);
        }
    }

    /**
     * To add a user to the room using provided roomId otherwise create new room or take an existing one.
     * In the case when a user sent room id which does not exist, new room will be created, or an existing one will be taken.
     * @param {Player} player 
     * @param {{id: string, roomId: string, name: string}} data 
     * @returns {string} - room id
     */
    addPlayerToRoom(player, data) {
        let roomId = data.roomId.replace(/\s/g, "");
        let room = this.getRoomById(roomId);

        if (!room || room.isFull) {
            room = this.getFreeRoom();
            if (!room) {
                room = this.createRoom();
            }
        }

        player.setRoomId(room.id);
        player.setName(data.name);
        room.addPlayer(player);
        return room.id;
    }

    /**
     * @returns {GameRoom}
     */
    createRoom() {
        const room = new GameRoom(generateId());
        this.rooms.set(room.id, room);
        return room;
    }

    /**
     * @param {string} roomId 
     * @returns {boolean}
     */
    hasRoom(roomId) {
        return this.rooms.has(roomId);
    }

    /**
     * @param {string} roomId 
     * @returns {GameRoom | undefined}
     */
    getRoomById(roomId) {
        return this.rooms.get(roomId);
    }

    /**
     * To take any room which has free slots
     * @returns {GameRoom | undefined}
     */
    getFreeRoom() {
        for (let room of this.rooms.values()) {
            if (!room.isFull) {
                return room;
            }
        }
    }

    /**
     * @param {string} roomId 
     */
    deleteRoom(roomId) {
        const room = this.rooms.get(roomId);
        room.deleteWorld();

        this.rooms.delete(roomId);
    }
}

module.exports = RoomsManager;