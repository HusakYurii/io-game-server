class Player {
    constructor(socket, id, roomId) {
        this.socket = socket;
        this.roomId = roomId;
        this.id = id;

        this.position = {
            x: Math.random() * 200,
            y: Math.random() * 200
        }
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