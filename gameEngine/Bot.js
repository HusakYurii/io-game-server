const PlayerObject = require("./Player.js");
const Vector2D = require("../shared/Vector2D.js");
const { randomFloat, randomInt } = require("../shared/Tools.js");
const { GAME_CONSTANTS } = require("../shared/Constants.js");

class BotObject extends PlayerObject {
    constructor(id, pos, r) {
        super(id, pos, r);

        this.isBot = true;
        this.currDir = new Vector2D(randomFloat(-1, 1), randomFloat(-1, 1));

        const [min, max] = GAME_CONSTANTS.BOT_ACTION_TIME_RANGE;
        this.actionTime = randomInt(min, max);
        this.actionTimer = 0;
    }

    /**
     * @extends
     * @param {number} dt
     */
    update(dt) {
        this.updateActionTimer(dt);
        this.applyForce(this.currDir);
        super.update(dt);
    }

    /**
     * @param {number} dt 
     */
    updateActionTimer(dt) {
        this.actionTimer += dt * GAME_CONSTANTS.LOOP_DELTA_TIME;  // to convert it back to ms
        if (this.actionTimer > this.actionTime) {
            const [min, max] = GAME_CONSTANTS.BOT_ACTION_TIME_RANGE;
            this.actionTime = randomInt(min, max);
            this.actionTimer = 0;

            this.activate();
            this.currDir = new Vector2D(randomFloat(-1, 1), randomFloat(-1, 1));
        }
    }
}

module.exports = BotObject;