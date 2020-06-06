const PhysicsObject = require("./Object.js");
const Vector2D = require("../shared/Vector2D.js");
const { GAME_CONSTANTS } = require("../shared/Constants.js");

class PlayerObject extends PhysicsObject {
    constructor(id, pos, r) {
        super(id, pos, r);

        this.score = 0;

        this.gravityTime = GAME_CONSTANTS.PLAYER_GRAVITY_TIME;
        this.gravityTimer = 0;
        this.isActivated = false;

        this.gravityR = 3 * this.r;

        const [cdtMin, cdtMax] = GAME_CONSTANTS.PLAYER_COOLDOWN_TIME_RANGE
        this.coolDownTime = cdtMin;
        this.coolDownTimer = 0;
        this.isCooledDown = true;

        const [velMin, velMax] = GAME_CONSTANTS.PLAYER_SPEED_RANGE;
        this.currVelocity = velMax;
        this.originalR = r;
    }

    /** To activate grtavity force */
    activate() {
        if (!this.isCooledDown) {
            return;
        }

        this.isActivated = true;
        this.isCooledDown = false;
    }

    /** To deactivate gravity force */
    deactivate() {
        this.isActivated = false;
    }

    /**
     * @param {number} size - the radius of an item a player absorbed
     */
    countScore(size) {
        this.score += size;
    }

    /**
     * Player will be drawn as a circle. To calculate new radius:
     * A_new = A_1 + A_2 the same as r_new = sqrt(r_1^2 + r_2^2)
     * 
     * @param {number} size - the radius of an item a player absorbed
     */
    grow(size) {
        this.r = Math.sqrt(this.r * this.r + size * size);
        this.currVelocity = this.calcVelocity(false);
    }

    /**
     * To update player's properties postions
     * @override
     * @param {number} dt - delta time
     */
    update(dt) {
        this.updateGravityTimer(dt);
        this.updateCoolDownTimer(dt);
        this.updateGravityR();

        this.velocity.multiply(this.currVelocity);

        super.update(dt);
    }

    /**
     * In the case when a player is active (gravitating) update timers
     * @param {number} dt 
     */
    updateGravityTimer(dt) {
        if (!this.isActivated) {
            return;
        }

        this.gravityTimer += dt * GAME_CONSTANTS.LOOP_DELTA_TIME;
        if (this.gravityTimer >= this.gravityTime) {
            this.gravityTimer = 0;
            this.deactivate();
            this.updateGravityTime();
        }
    }

    /**
     * Update cool down timer
     * @param {number} dt 
     */
    updateCoolDownTimer(dt) {
        if (this.isCooledDown) {
            return;
        }

        this.coolDownTimer += dt * GAME_CONSTANTS.LOOP_DELTA_TIME;
        if (this.coolDownTimer >= this.coolDownTime) {
            this.coolDownTimer = 0;
            this.isCooledDown = true;
            this.updatecoolDownTime();
        }
    }

    updateGravityR() {
        this.gravityR = 3 * this.r;
    }

    updatecoolDownTime() {
        // based on new R update min, max timer
    }

    updateGravityTime() {
        // based on new R update min, max timer
    }

    /**
     * Velocity is chenged by easing of 
     * V(k) = k^n * Vmax
     * k = (Roriginal / Rnew)^n
     * 1 >= k >= Vmin/Vmax
     * @param {boolean} isDestructed - if a player is being destructured make his speed up quicker
     * @returns {number};
     */
    calcVelocity(isDestructed) {
        const [velMin, velMax] = GAME_CONSTANTS.PLAYER_SPEED_RANGE;
        const sizeRatio = this.originalR / this.r;
        const speedRatio = velMin / velMax;
        const power = isDestructed ? 0.5 : 0.8; // TODO think about more accurate easing

        let k = Math.pow(sizeRatio, power);
        k = (k >= 1) ? 1 : (k >= speedRatio) ? k : speedRatio;

        let vel = (Math.pow(k, power) * velMax);
        vel = Number(vel.toFixed(4));
        return vel;
    }

    /**
     * Basic circle - circle collision
     * @param {PhysicsObject} item 
     * @returns {boolean}
     */
    canAbsorb(item) {
        const dist = Vector2D.getDistance(this.position, item.position);
        return (dist <= (this.r + item.r));
    }

    /**
     * Basic circle - point collision
     * @param {PhysicsObject} item 
     * @returns {boolean}
     */
    canGravitate(item) {
        const dist = Vector2D.getDistance(this.position, item.position);
        return (dist <= this.gravityR);
    }

    /**
     * @returns {boolean}
     */
    get isDestructed() {
        return (this.r / this.originalR) < 1;
    }

    /**
     * As a player is being destructured we need to change its size
     * @param {number} size 
     */
    destruct(size) {
        this.r = Math.sqrt(this.r * this.r - size * size);
        this.currVelocity = this.calcVelocity(true);
        this.countScore(-size);
    }

    /**
     * @param {BotObject | PlayerObject} other 
     * @returns {boolean}
     */
    canDestruct(other) {
        const dist = Vector2D.getDistance(this.position, other.position);
        return (dist <= (this.gravityR + other.r * 0.8));
    }

    /**
     * To apply gravity force to an item
     * F = G * ((m1 * m2) / dist^2); 
     * m = V * density; 
     * V = PI * r^2 * h; 
     * assume h = density = G = 1;
     * F = 1 * (PI * (r1^2 * r2^2) / dist^2)
     * @param {PhysicsObject} item 
     */
    gravitate(item) {
        const unitForce = Vector2D.getDirection(item.position, this.position);
        const dist = Vector2D.getDistanceSqrt(item.position, this.position);
        const gravity = Math.PI * (this.r * this.r + item.r * item.r) / dist;
        // unitForce.multiply(gravity) the same as attraction force 
        item.applyForce(unitForce.multiply(gravity));
    }

    /**
     * @extends
     * @returns {object}
     */
    serialize() {
        const data = super.serialize();
        data.isActivated = this.isActivated;
        data.isCooledDown = this.isCooledDown;
        data.gravityTimer = this.gravityTimer;
        data.gravityTime = this.gravityTime;
        data.coolDownTimer = this.coolDownTimer;
        data.coolDownTime = this.coolDownTime;
        data.gravityR = this.gravityR;
        return data;
    }
}

module.exports = PlayerObject;