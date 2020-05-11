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

        this.itemsToCreate = 100;
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
            new Vector2D(Tools.randomInt(-1500, 1500), Tools.randomInt(-1500, 1500)),
            Tools.randomInt(6, 12)
        );
    }

    createPlayer(playerId) {
        const pos = new Vector2D(Tools.randomInt(-200, 200), Tools.randomInt(-200, 200))
        const player = new PlayerObject(playerId, pos, 30);
        this.players.push(player);
    }

    removePlayer(playerId) {
        this.players = this.players.filter((player) => {
            return player.id !== playerId;
        });
    }

    updatePlayerDir(data) {
        const player = this.players.find((player) => player.id === data.playerId);
        const velocity = new Vector2D(data.x, data.y).normalize();

        player.applyForce(velocity);
        if (data.activate) {
            player.activate();
        }
    }

    update() {
        const currTimestamp = Date.now();
        const dt = (currTimestamp - this.prevTimestamp) / this.dtConstant; // just to make sure we multiply vectors not by 16.7 but something about 1
        this.prevTimestamp = currTimestamp;

        this.updatePlayers(dt);
        this.updateItems(dt);
        this.calculateGravity(dt);
        this.calculateCollisions();
        this.respawnItems(dt);
        this.sendData();
    }

    updatePlayers(dt) {
        this.players.forEach((player) => {
            player.update(dt);
            this.setWorldsBounds(player)
        });
    }

    setWorldsBounds({ position, r }) {
        const width = 3000;
        const height = 3000;
        const curr = position.copy();

        let x, y;

        if (position.x > (width / 2 - r)) x = (width / 2 - r);
        if (position.x < -(width / 2 - r)) x = -(width / 2 - r);
        if (position.y > (height / 2 - r)) y = (height / 2 - r);
        if (position.y < -(height / 2 - r)) y = -(height / 2 - r);

        position.set({ x: x || curr.x, y: y || curr.y });
    }

    updateItems(dt) {
        this.items.forEach((item) => item.update(dt));
    }

    calculateGravity() {
        this.players.forEach((player) => {
            if (!player.isActivated) {
                return;
            }

            this.items.forEach((item) => {
                if (!player.canGravitate(item)) {
                    return;
                }
                player.cravitate(item);
            });
        });
    }

    calculateCollisions() {
        this.players.forEach((player) => {
            this.items.forEach((item, i) => {
                if (!player.canAbsorb(item)) {
                    return;
                }

                this.itemsToRespawn += 1;
                this.items.splice(i, 1);
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
            players: this.players.map(serialize),
            items: this.items.map(serialize)
        };

        this.onSendData(data);
    }
}

module.exports = PhysicsWorld;