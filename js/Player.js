class Player {
    constructor(socket, id) {
        this.socket = socket;
        this.roomId = "";
        this.name = ""
        this.id = id;

        this.position = {
            x: Math.random() * 200,
            y: Math.random() * 200
        }
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
}

module.exports = Player;