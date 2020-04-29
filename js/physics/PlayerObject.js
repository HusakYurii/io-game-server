const PhysicsObject = require("./PhysicsObject.js");

class PlayerObject extends PhysicsObject {
    constructor(id, pos, r) {
        super(id, pos, r);
    }

    /**
     * To update object's postions
     * @override
     * @param {number} dt - delta time
     */
    update(dt) {
        const vel = this.velocity.copy();
        this.position.add(vel.multiply(dt));
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