const Vector2D = require("./Vector2D.js");

class PhysicsObject {
    /**
     * @param {string} id
     * @param {number} x 
     * @param {number} y 
     * @param {number} r 
     */
    constructor(id = "", x = 0, y = 0, r = 5) {
        this.id = id;
        this.position = new Vector2D(x, y);
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
        this.position.add(this.velocity);
        this.velocity.multiply(0);
    }

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