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

        this.itemsToCreate = 50;
        this.itemsToRespawn = 0;
        this.itemsRespawnTimer = 500;
        this.timeCounter = 0;

        this.loopRennerId = "";
        this.prevTimestamp = 0;
        this.dtConstant = 1000 / 60;
        this.update = this.update.bind(this);
        this.onSendData = () => { };
    }

    run(onSendData) {
        this.loopRennerId = setInterval(this.update, this.dtConstant);
        this.prevTimestamp = Date.now();
        this.onSendData = onSendData;
        Logger.addDividerLabel("Physics World Run", "#FFFF00", "#000000");
    }

    stop() {
        clearInterval(this.loopRennerId);
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

    createItems(amount = this.itemsToCreate) {
        for (let i = 0; i < amount; i += 1) {
            this.items.push(this.createItem());
        }
    }

    createItem() {
        this.itemsIdCounter += 1;
        return new PhysicsObject(
            String(this.itemsIdCounter),
            new Vector2D(Tools.randomInt(-300, 300), Tools.randomInt(-300, 300)),
            Tools.randomInt(6, 12)
        );
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

    updateMousePos(data) {
        const player = this.players.find((player) => player.id === data.playerId);
        const velocity = Vector2D.getDirection(player.position, new Vector2D(data.x, data.y));

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
        this.respawnItems(dt);
        this.sendData();
    }

    updatePlayers(dt) {
        this.players.forEach((player) => player.update(dt));
    }

    calculateGravity(dt) { }

    updateItems(dt) {
        this.items.forEach((item) => item.update(dt));
    }

    calculateCollisions() {
        this.players.forEach((player) => {
            this.items.forEach((item, i) => {
                const dist = Vector2D.getDistance(player.position, item.position);
                if (!(dist < player.r + item.r / 2)) {
                    return;
                }

                this.itemsToRespawn += 1;
                this.itemsToDelete.push(...this.items.splice(i, 1));
                player.countScore(item.r);
                player.grow(item.r);
            });
        });
    }

    respawnItems(dt) {
        if (this.itemsToRespawn <= 0) {
            return;
        }

        this.timeCounter += dt * this.dtConstant;
        if (this.timeCounter > this.itemsRespawnTimer) {
            this.timeCounter = 0;
            this.itemsToRespawn -= 1;
            this.items.push(this.createItem());
        }
    }

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