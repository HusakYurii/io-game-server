const PhysicsObject = require("./PhysicsObject.js");

class PlayerObject extends PhysicsObject {
    constructor(id, pos, r) {
        super(id, pos, r);
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