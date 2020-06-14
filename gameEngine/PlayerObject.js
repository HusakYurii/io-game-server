const PhysicsObject = require("./PhysicsObject.js");
const Vector2D = require("../shared/Vector2D.js");
const { GAME_CONSTANTS } = require("../shared/Constants.js");
const {
    PLAYER_GRAVITY_TIME, PLAYER_COOLDOWN_TIME_RANGE,
    PLAYER_SPEED_RANGE, LOOP_DELTA_TIME, GRAVITY_RADIUS_SIZE_RANGE
} = GAME_CONSTANTS;

class PlayerObject extends PhysicsObject {
    constructor(id, pos, r) {
        super(id, pos, r);

        this.score = 0;

        this.gravityTime = PLAYER_GRAVITY_TIME;
        this.gravityTimer = 0;
        this.isActivated = false;

        const [grMin, grMax] = GRAVITY_RADIUS_SIZE_RANGE;
        this.gravityR = grMax * this.r;

        const [cdtMin, cdtMax] = PLAYER_COOLDOWN_TIME_RANGE
        this.coolDownTime = cdtMin;
        this.coolDownTimer = 0;
        this.isCooledDown = true;

        const [velMin, velMax] = PLAYER_SPEED_RANGE;
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
        /** Update all properties related to the size */
        this.updateVelocity();
        this.updateGravityRadius();
        this.updateCoolDownTime();
    }

    /**
     * To update player's properties postions
     * @override
     * @param {number} dt - delta time
     */
    update(dt) {
        this.updateGravityTimer(dt);
        this.updateCoolDownTimer(dt);

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

        this.gravityTimer += dt * LOOP_DELTA_TIME;
        if (this.gravityTimer >= this.gravityTime) {
            this.gravityTimer = 0;
            this.isActivated = false;
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

        this.coolDownTimer += dt * LOOP_DELTA_TIME;
        if (this.coolDownTimer >= this.coolDownTime) {
            this.coolDownTimer = 0;
            this.isCooledDown = true;
        }
    }

    /**
     * The gravity radius should be growing because the body is growing as well,
     * But I want to balance it a little bit, so it will grow with some easing
     * GR(k) = k * (GRMax * r)
     */
    updateGravityRadius() {
        const [grMin, grMax] = GRAVITY_RADIUS_SIZE_RANGE;

        const k = this.easeValues(grMin, grMax, 0.33);

        this.gravityR = Number((k * grMax * this.r).toFixed(4));
    }

    /**
     * Set new CD time based on the player new size
     * CD(k) = CDMax / k
     */
    updateCoolDownTime() {
        const [cdtMin, cdtMax] = PLAYER_COOLDOWN_TIME_RANGE

        const k = this.easeValues(cdtMin, cdtMax, 0.34);

        this.coolDownTime = Number((cdtMin / k).toFixed(4));
    }

    /**
     * Velocity is chenged by easing of 
     * V(k) = k * Vmax
     */
    updateVelocity() {
        const [velMin, velMax] = PLAYER_SPEED_RANGE;

        const k = this.easeValues(velMin, velMax, 0.32);

        this.currVelocity = Number((k * velMax).toFixed(4));
    }

    /**
     * k = (1 / (Roriginal / Rnew))^n
     * 1 >= k >= Vmin/Vmax
     * @param {number} min
     * @param {number} max 
     * @param {number} pow
     * @returns {number} 
     */
    easeValues(min, max, pow) {
        const maxRatio = 1;
        const minRatio = min / max;
        const sizeRatio = 1 / (this.r / this.originalR);

        let k = Math.pow(sizeRatio, pow);
        k = (k >= maxRatio) ? maxRatio : (k >= minRatio) ? k : minRatio;
        return k;
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
        /** Update all properties related to the size */
        this.updateVelocity();
        this.updateGravityRadius();
        this.updateCoolDownTime();
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