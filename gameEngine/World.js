const Logger = require("../js/Logger.js");
const Vector2D = require("../shared/Vector2D.js");
const PhysicsObject = require("./Object.js");
const PlayerObject = require("./Player.js");
const BotObject = require("./Bot.js");
const { randomInt, randomFloat } = require("../shared/Tools.js");
const { GAME_CONSTANTS } = require("../shared/Constants.js");

const {
    BOT_RESPAWN_TIME_RANGE, ITEM_RESPAWN_TIME_RANGE,
    LOOP_DELTA_TIME, BOTS_AMOUNT, WORLD_WIDTH, WORLD_HEIGTH, BOT_SIZE, ITEM_AMOUNT,
    PLAYER_SIZE, ITEM_SIZE_RANGE, MAX_ITEMS_AMOUNT, DESTRUCTURED_ITEM_SIZE_RANGE
} = GAME_CONSTANTS;

class PhysicsWorld {
    constructor() {
        this.players = [];
        this.items = [];
        this.itemsIdCounter = -1;

        const [brtMin, brtMax] = BOT_RESPAWN_TIME_RANGE;
        this.botsRespawnTime = randomInt(brtMin, brtMax);
        this.botsRespawnTimer = 0;
        this.botsToRespawn = BOTS_AMOUNT / 2;

        const [irtMin, irtMax] = ITEM_RESPAWN_TIME_RANGE;
        this.itemsRespawnTime = randomInt(irtMin, irtMax);
        this.itemsRespawnTimer = 0;
        this.itemsToRespawn = 0;

        this.loopRennerId = "";
        this.prevTimestamp = 0;
        this.update = this.update.bind(this);

        this.onWorldUpdated = () => { };
    }

    run(onWorldUpdated) {
        this.loopRennerId = setInterval(this.update, LOOP_DELTA_TIME);
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
        const botsAmount = BOTS_AMOUNT / 2;
        for (let i = 0; i < botsAmount; i += 1) {
            this.players.push(this.createBot());
        }
    }

    createBot() {
        this.itemsIdCounter += 1;

        const pos = this.calculateSpawnPosition(WORLD_WIDTH, WORLD_HEIGTH, BOT_SIZE);
        const id = String(this.itemsIdCounter);

        return new BotObject(id, pos, BOT_SIZE);
    }

    removeBot() {
        const findBot = (player) => player.isBot;
        const bot = this.players.find(findBot);
        this.removePlayer(bot.id);
    }

    createItems() {
        const itemsAmount = ITEM_AMOUNT;
        for (let i = 0; i < itemsAmount; i += 1) {
            this.items.push(this.createItem());
        }
    }

    createItem() {
        this.itemsIdCounter += 1;

        const [min, max] = ITEM_SIZE_RANGE;

        const pos = this.calculateSpawnPosition(WORLD_WIDTH, WORLD_HEIGTH, max);
        const id = String(this.itemsIdCounter);
        const size = randomInt(min, max);

        return new PhysicsObject(id, pos, size);
    }

    createPlayer(playerId) {
        this.removeBot();

        const pos = this.calculateSpawnPosition(WORLD_WIDTH, WORLD_HEIGTH, PLAYER_SIZE);
        const player = new PlayerObject(playerId, pos, PLAYER_SIZE);

        this.players.push(player);
    }

    removePlayer(playerId) {
        const playerFilter = (player) => player.id !== playerId;
        this.players = this.players.filter(playerFilter);

        // Add a bot if there is space for them
        if (this.players.length < BOTS_AMOUNT) {
            this.botsToRespawn += 1
        }
    }

    updatePlayerData(data) {
        const findPlayer = (player) => player.id === data.playerId;
        const player = this.players.find(findPlayer);

        if (!player) {
            return;
        }

        const dirForce = new Vector2D(data.x, data.y).normalize();
        player.applyForce(dirForce);

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
        const dt = (currTimestamp - this.prevTimestamp) / LOOP_DELTA_TIME; // just to make sure we multiply vectors not by 16.7 but something about 1
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
        for (let i = 0; i < this.players.length; i += 1) {
            const player = this.players[i];
            player.update(dt);
            this.setWorldsBounds(player);
        }
    }

    setWorldsBounds({ position, r }) {
        let x, y;

        if (position.x > (WORLD_WIDTH / 2 - r)) x = (WORLD_WIDTH / 2 - r);
        if (position.x < -(WORLD_WIDTH / 2 - r)) x = -(WORLD_WIDTH / 2 - r);
        if (position.y > (WORLD_HEIGTH / 2 - r)) y = (WORLD_HEIGTH / 2 - r);
        if (position.y < -(WORLD_HEIGTH / 2 - r)) y = -(WORLD_HEIGTH / 2 - r);

        position.set({ x, y });
    }

    updateItems(dt) {
        for (let i = 0; i < this.items.length; i += 1) {
            this.items[i].update(dt);
        }
    }

    calculateGravity() {
        for (let i = 0; i < this.players.length; i += 1) {
            const player = this.players[i];
            if (!player.isActivated) {
                continue;
            }

            for (let j = 0; j < this.items.length; j += 1) {
                const item = this.items[j];
                if (player.canGravitate(item)) {
                    player.gravitate(item);
                }
            }
        }
    }

    calculateCollisions() {
        for (let i = 0; i < this.players.length; i += 1) {
            const player = this.players[i];

            // count it backwards because of this.items.splice()
            for (let j = this.items.length - 1; j >= 0; j -= 1) {
                const item = this.items[j];
                if (!player.canAbsorb(item)) {
                    continue;
                }
                this.itemsToRespawn += 1;
                this.items.splice(j, 1);
                player.countScore(item.r);
                player.grow(item.r);
            }
        }
    }

    respawnItems(dt) {
        if (this.itemsToRespawn <= 0 || this.itemsToRespawn > MAX_ITEMS_AMOUNT) {
            return;
        }

        this.itemsRespawnTimer += dt * LOOP_DELTA_TIME; // to convert it back to ms
        if (this.itemsRespawnTimer > this.itemsRespawnTime) {
            const [irtMin, irtMax] = ITEM_RESPAWN_TIME_RANGE;

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

        this.botsRespawnTime += dt * LOOP_DELTA_TIME; // to convert it back to ms

        if (this.botsRespawnTime > this.botsRespawnTimer) {
            const [brtMin, brtMax] = BOT_RESPAWN_TIME_RANGE;

            this.botsRespawnTimer = randomInt(brtMin, brtMax);
            this.botsRespawnTime = 0;
            this.botsToRespawn -= 1;
            this.players.push(this.createBot());
        }
    }

    destructPlayers() {
        const [min, max] = DESTRUCTURED_ITEM_SIZE_RANGE;

        for (let i = 0; i < this.players.length; i += 1) {
            const player = this.players[i];
            if (!player.isActivated) {
                continue;
            }
            for (let j = 0; j < this.players.length; j += 1) {
                const other = this.players[j];
                if (player === other || !player.canDestruct(other)) {
                    continue;
                }
                const chunkSiez = randomInt(min, max);
                const chunkPos = other.position.copy();
                other.destruct(chunkSiez);
                other.countScore(-chunkSiez);

                const direction = Vector2D.getDirection(chunkPos, player.position);

                /* calculate an offset from the other player for the chunk to spawn. */
                const angle = direction.getAngle();
                direction.setAngle(angle + randomFloat(-Math.PI / 8, Math.PI / 8)); // Add some randomnes
                direction.multiply(other.r * 1.2);

                chunkPos.add(direction);

                this.itemsIdCounter += 1;
                this.itemsToRespawn -= 1;
                this.items.push(new PhysicsObject(String(this.itemsIdCounter), chunkPos, chunkSiez));

            }
        }
    }


    finishUpdating() {
        const serialize = (el) => el.serialize();
        const filterDead = (player) => player.isDestructed;
        const filterAlive = (player) => !player.isDestructed;

        const payload = {
            time: this.prevTimestamp,
            players: this.players.map(serialize),
            items: this.items.map(serialize)
        };

        const deadPlayers = this.players.filter(filterDead);
        this.players = this.players.filter(filterAlive);

        this.onWorldUpdated(payload, deadPlayers);
    }
}

module.exports = PhysicsWorld;