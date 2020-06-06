const Logger = require("../js/Logger.js");
const Vector2D = require("../shared/Vector2D.js");
const PhysicsObject = require("./Object.js");
const PlayerObject = require("./Player.js");
const BotObject = require("./Bot.js");
const { randomInt, randomFloat } = require("../shared/Tools.js");
const { GAME_CONSTANTS } = require("../shared/Constants.js");

class PhysicsWorld {
    constructor() {
        this.players = [];
        this.items = [];
        this.itemsIdCounter = -1;

        const [brtMin, brtMax] = GAME_CONSTANTS.BOT_RESPAWN_TIME_RANGE;
        this.botsRespawnTime = randomInt(brtMin, brtMax);
        this.botsRespawnTimer = 0;
        this.botsToRespawn = GAME_CONSTANTS.BOTS_AMOUNT / 2;

        const [irtMin, irtMax] = GAME_CONSTANTS.ITEM_RESPAWN_TIME_RANGE;
        this.itemsRespawnTime = randomInt(irtMin, irtMax);
        this.itemsRespawnTimer = 0;
        this.itemsToRespawn = 0;

        this.loopRennerId = "";
        this.prevTimestamp = 0;
        this.update = this.update.bind(this);

        this.onWorldUpdated = () => { };
    }

    run(onWorldUpdated) {
        this.loopRennerId = setInterval(this.update, GAME_CONSTANTS.LOOP_DELTA_TIME);
        this.prevTimestamp = Date.now();
        this.onWorldUpdated = onWorldUpdated;
        Logger.addDividerLabel("Physics World Run", "#FFFF00", "#000000");
    }

    stop() {
        clearInterval(this.loopRennerId);
        Logger.addDividerLabel("Physics World Stopped", "#FFFF00", "#000000");
    }

    cleanUpWorld() {
        this.items = [];
        this.players = [];
        this.onWorldUpdated = () => { };

        Logger.addDividerLabel("Physics World Cleaned", "#FFFF00", "#000000");
    }

    createBots() {
        const botsAmount = GAME_CONSTANTS.BOTS_AMOUNT / 2;
        for (let i = 0; i < botsAmount; i += 1) {
            this.players.push(this.createBot());
        }
    }

    createBot() {
        this.itemsIdCounter += 1;

        const { WORLD_WIDTH, WORLD_HEIGTH, BOT_SIZE } = GAME_CONSTANTS;
        const pos = this.calculateSpawnPosition(WORLD_WIDTH, WORLD_HEIGTH, BOT_SIZE);
        const id = String(this.itemsIdCounter);

        return new BotObject(id, pos, BOT_SIZE);
    }

    removeBot() {
        const bot = this.players.find((player) => player.isBot);
        this.removePlayer(bot.id);
    }

    createItems() {
        const itemsAmount = GAME_CONSTANTS.ITEM_AMOUNT;
        for (let i = 0; i < itemsAmount; i += 1) {
            this.items.push(this.createItem());
        }
    }

    createItem() {
        this.itemsIdCounter += 1;

        const { WORLD_WIDTH, WORLD_HEIGTH, ITEM_SIZE_RANGE: [min, max] } = GAME_CONSTANTS;
        const pos = this.calculateSpawnPosition(WORLD_WIDTH, WORLD_HEIGTH, max);
        const id = String(this.itemsIdCounter);
        const size = randomInt(min, max);

        return new PhysicsObject(id, pos, size);
    }

    createPlayer(playerId) {
        this.removeBot();

        const { WORLD_WIDTH, WORLD_HEIGTH, PLAYER_SIZE } = GAME_CONSTANTS;
        const pos = this.calculateSpawnPosition(WORLD_WIDTH, WORLD_HEIGTH, PLAYER_SIZE);
        const player = new PlayerObject(playerId, pos, PLAYER_SIZE);

        this.players.push(player);
    }

    removePlayer(playerId) {
        this.players = this.players.filter((player) => {
            return player.id !== playerId;
        });

        this.botsToRespawn += this.players.length < 10 ? 1 : 0;
    }

    updatePlayerData(data) {
        const player = this.players.find((player) => player.id === data.playerId);
        
        if (!player) {
            return;
        }

        const velocity = new Vector2D(data.x, data.y).normalize();
        player.applyForce(velocity);

        if (data.activate) {
            player.activate();
        }
    }

    calculateSpawnPosition(width, height, size) {
        let w = width - size;
        let h = height - size;
        return new Vector2D(randomInt(-w / 2, w / 2), randomInt(-h / 2, h / 2));
    }

    update() {
        const currTimestamp = Date.now();
        const dt = (currTimestamp - this.prevTimestamp) / GAME_CONSTANTS.LOOP_DELTA_TIME; // just to make sure we multiply vectors not by 16.7 but something about 1
        this.prevTimestamp = currTimestamp;

        this.updatePlayers(dt);
        this.updateItems(dt);

        this.calculateGravity(dt);
        this.calculateCollisions();

        this.respawnItems(dt);
        this.respawnBots(dt);

        this.destructPlayers();

        this.finishUpdating();
    }

    updatePlayers(dt) {
        this.players.forEach((player) => {
            player.update(dt);
            this.setWorldsBounds(player)
        });
    }

    setWorldsBounds({ position, r }) {
        const { WORLD_WIDTH, WORLD_HEIGTH } = GAME_CONSTANTS;
        let x, y;

        if (position.x > (WORLD_WIDTH / 2 - r)) x = (WORLD_WIDTH / 2 - r);
        if (position.x < -(WORLD_WIDTH / 2 - r)) x = -(WORLD_WIDTH / 2 - r);
        if (position.y > (WORLD_HEIGTH / 2 - r)) y = (WORLD_HEIGTH / 2 - r);
        if (position.y < -(WORLD_HEIGTH / 2 - r)) y = -(WORLD_HEIGTH / 2 - r);

        position.set({ x, y });
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
                player.gravitate(item);
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

        this.itemsRespawnTimer += dt * GAME_CONSTANTS.LOOP_DELTA_TIME; // to convert it back to ms
        if (this.itemsRespawnTimer > this.itemsRespawnTime) {
            const [irtMin, irtMax] = GAME_CONSTANTS.ITEM_RESPAWN_TIME_RANGE;
            this.itemsRespawnTime = randomInt(irtMin, irtMax);
            this.itemsRespawnTimer = 0;
            this.itemsToRespawn -= 1;
            this.items.push(this.createItem());
        }
    }

    respawnBots(dt) {
        if (this.botsToRespawn <= 0) {
            return;
        }

        this.botsRespawnTime += dt * GAME_CONSTANTS.LOOP_DELTA_TIME; // to convert it back to ms
        if (this.botsRespawnTime > this.botsRespawnTimer) {
            const [brtMin, brtMax] = GAME_CONSTANTS.BOT_RESPAWN_TIME_RANGE;
            this.botsRespawnTimer = randomInt(brtMin, brtMax);
            this.botsRespawnTime = 0;
            this.botsToRespawn -= 1;
            this.players.push(this.createBot());
        }
    }

    destructPlayers() {
        const { DESTRUCTURED_ITEM_SIZE_RANGE: [min, max] } = GAME_CONSTANTS;

        this.players.forEach((player) => {
            if (!player.isActivated) {
                return;
            }
            this.players.forEach((other) => {
                if (player === other || !player.canDestruct(other)) {
                    return;
                }
                
                const chunkSiez = randomInt(min, max);
                const chunkPos = other.position.copy();
                other.destruct(chunkSiez);

                const direction = Vector2D.getDirection(chunkPos, player.position);

                /* calculate an offset from the other player for the chunk to spawn. */
                const angle = direction.getAngle();
                direction.setAngle(angle + randomFloat(-Math.PI / 8, Math.PI / 8)); // Add some randomnes
                direction.multiply(other.r * 1.2);

                chunkPos.add(direction);

                this.itemsIdCounter += 1;
                this.itemsToRespawn -= 1;
                this.items.push(new PhysicsObject(String(this.itemsIdCounter), chunkPos, chunkSiez));
            });
        });
    }


    finishUpdating() {
        const serialize = (el) => el.serialize();

        const payload = {
            time: this.prevTimestamp,
            players: this.players.map(serialize),
            items: this.items.map(serialize)
        };

        const deadPlayers = this.players.filter((player) => player.isDestructed);
        this.players = this.players.filter((player) => !player.isDestructed);

        this.onWorldUpdated(payload, deadPlayers);
    }
}

module.exports = PhysicsWorld;