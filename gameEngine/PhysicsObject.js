const Vector2D = require("../shared/Vector2D.js");
const { GAME_CONSTANTS } = require("../shared/Constants.js");

class PhysicsObject {
    /**
     * @param {string} id
     * @param {Vector2D} pos
     * @param {number} r 
     */
    constructor(id = "", pos = new Vector2D(0, 0), r = 5) {
        this.id = id;
        this.position = pos;
        this.velocity = new Vector2D(0, 0);
        this.r = r;
    }

    /**
     * To accumulate all forces on this object
     * @param {Vector2D} vector 
     */
    applyForce(vector) {
        this.velocity.add(vector);
    }

    /**
     * To update object's postions
     * @param {number} dt - delta time
     */
    update(dt) {
        this.velocity.multiply(dt);
        this.velocity.setLimit(GAME_CONSTANTS.MAX_VECTOR_SPEED);
        this.position.add(this.velocity);
        this.velocity.multiply(0);
    }

    /**
     * @returns {object}
     */
    serialize() {
        return {
            r: this.r,
            id: this.id,
            x: this.position.x,
            y: this.position.y
        };
    }
}

module.exports = PhysicsObject;