const PhysicsObject = require("./PhysicsObject.js");

class PlayerObject extends PhysicsObject {
    constructor(id, pos, r) {
        super(id, pos, r);

        this.score = 0;

        // TODO change it to function
        this.velEasing = 1.2;
        this.originalR = r;
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
    }

    update(dt) {
        const velocityMag = (this.originalR / this.r) * this.velEasing;
        this.velocity.multiply(velocityMag);
        super.update(dt);
    }

    /**
     * @extends
     * @returns {object}
     */
    serialize() {
        const data = super.serialize();
        return data;
    }
}

module.exports = PlayerObject;