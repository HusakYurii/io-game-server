class Player {
    constructor(socket, id) {

        this.socket = socket;
        this.roomId = "";
        this.name = "";
        this.id = id;
        this.score = 0;
    }

    /**
     * Set user's room Id as s/he logged in
     * @param {string} roomId 
     */
    setRoomId(roomId) {
        this.roomId = roomId;
    }

    /**
     * Set user's name as s/he logged in
     * @param {string} name 
     */
    setName(name) {
        this.name = name;
    }

    removeAllListeners() {
        this.socket.removeAllListeners();
    }

    /**
     * @param {string} message 
     * @param {object} payload 
     */
    emit(message, payload) {
        this.socket.emit(message, JSON.stringify(payload));
    }

    /**
     * 
     * @param {string} eventName 
     * @param {function} callback 
     */
    on(eventName, callback) {
        this.socket.on(eventName, callback);
    }

    /**
     * @returns {object}
     */
    serialize() {
        return {
            roomId: this.roomId,
            score: this.score,
            name: this.name,
            id: this.id,
        };
    }
}

module.exports = Player;