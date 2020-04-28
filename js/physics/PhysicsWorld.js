const Logger = require("../Logger.js");
const Vector2D = require("./Vector2D.js");
const PhysicsObject = require("./PhysicsObject.js");
const Tools = require("../../../shared/Tools.js");

class PhysicsWorld {
    constructor() {
        this.players = new Set();
        this.items = new Set();
        this.itemsIdCounter = -1;

        this.intervalId = "";
        this.prevTimestamp = 0;
        this.dtConstant = 1000 / 60;
        this.update = this.update.bind(this);
        this.onSendData = () => { };

    }

    run(onSendData) {
        this.intervalId = setInterval(this.update, this.dtConstant);
        this.prevTimestamp = Date.now();
        this.onSendData = onSendData;
        Logger.addDividerLabel("Physics World Run", "#FFFF00", "#000000");
    }

    stop() {
        clearInterval(this.intervalId);
        Logger.addDividerLabel("Physics World Stopped", "#FFFF00", "#000000");
    }

    createItems() {

        Logger.logMessage(`${items} items created`);
    }

    removeItems() {
        this.items.clear();
        this.players.clear();
        this.onSendData = () => { };

        Logger.addDividerLabel("Physics World Cleaned", "#FFFF00", "#000000");
    }

    addPlayer(player) {
        this.players.add(player);
    }

    removePlayer(player) {
        this.players.delete(player);
    }

    update() {
        const currTimestamp = Date.now();
        const dt = (currTimestamp - this.prevTimestamp) / this.dtConstant; // just to make sure we multiply vectors not by 16.7 but something about 1
        this.prevTimestamp = currTimestamp;

        this.updatePlayers(dt);
        this.calculateGravity(dt);
        this.updateItems(dt);
        this.calculateCollisions();
        this.sendData();
    }

    updatePlayers(dt) { }
    calculateGravity(dt) { }
    updateItems(dt) { }
    calculateCollisions() { }
    sendData() {

        const dummy = {
            time: this.prevTimestamp,
            players: {
                toDelete: [],
                toUpdate: []
            },
            items: {
                toDelete: [],
                toUpdate: []
            }
        };

        this.onSendData(dummy);
    }
}

module.exports = PhysicsWorld;