const Logger = require("../Logger.js");
const Vector2D = require("./Vector2D.js");
const PhysicsObject = require("./PhysicsObject.js");
const PlayerObject = require("./PlayerObject.js");
const Tools = require("../../../shared/Tools.js");

class PhysicsWorld {
    constructor() {
        this.players = [];
        this.playersToDelete = [];
        this.items = [];
        this.itemsToDelete = [];
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

    cleanUpWorld() {
        this.items = [];
        this.players = [];
        this.itemsToDelete = [];
        this.playersToDelete = [];
        this.onSendData = () => { };

        Logger.addDividerLabel("Physics World Cleaned", "#FFFF00", "#000000");
    }

    createItems() {
        const items = 50;
        for (let i = 0; i < items; i += 1) {
            this.itemsIdCounter += 1;
            const id = String(this.itemsIdCounter);
            const pos = new Vector2D(Tools.randomInt(-300, 300), Tools.randomInt(-300, 300))
            const r = Tools.randomInt(2, 6);
            this.items.push(new PhysicsObject(id, pos, r));
        }
        Logger.logMessage(`${items} items created`);
    }

    removeItem(itemId) {
        const [item] = this.removeElement(itemId, "items");
        this.itemsToDelete.push(item);
    }

    createPlayer(playerId) {
        const pos = new Vector2D(Tools.randomInt(-300, 300), Tools.randomInt(-300, 300))
        const player = new PlayerObject(playerId, pos, 30);
        this.players.push(player);
    }

    removePlayer(playerId) {
        const [player] = this.removeElement(playerId, "players");
        this.playersToDelete.push(player);
    }

    removeElement(elId, group) {
        let idx = 0;
        for (let i = 0; i < this[group].length; i += 1) {
            if (this[group][i].id === elId) {
                idx = i;
                break;
            }
        }

        return this[group].splice(idx, 1);
    }

    updatePLayer(data) {
        const velocity = new Vector2D(data.x, data.y).normalize();
        const player = this.players.find((player) => player.id === data.playerId);

        player.applyForce(velocity);
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

    updatePlayers(dt) {
        this.players.forEach((player) => player.update(dt));
    }

    calculateGravity(dt) { }
    updateItems(dt) { }
    calculateCollisions() { }
    sendData() {
        const serialize = (el) => el.serialize();

        const data = {
            time: this.prevTimestamp,
            players: {
                toDelete: this.playersToDelete.map(serialize),
                toUpdate: this.players.map(serialize)
            },
            items: {
                toDelete: this.itemsToDelete.map(serialize),
                toUpdate: this.items.map(serialize)
            }
        };

        this.playersToDelete = [];
        this.itemsToDelete = [];

        this.onSendData(data);
    }
}

module.exports = PhysicsWorld;