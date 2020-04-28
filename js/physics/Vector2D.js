class Vector2D {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }

    /**
     * @returns {number}
     */
    get x() {
        return this._x;
    }

    /**
    * @param {number} val 
    */
    set x(val) {
        this._x = val;
    }

    /**
     * @returns {number}
     */
    get y() {
        return this._y;
    }

    /**
     * @param {number} val 
     */
    set y(val) {
        this._y = val;
    }

    /**
     * @param {{x: number, y: number}} 
     * @returns {Vector2D}
     */
    set({ x = this._x, y = this._y } = {}) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Copy of myself
     * @returns {Vector2D}
     */
    copy() {
        return new Vector2D(this._x, this._y);
    }

    /**
     * @param {{x: number, y: number}} 
     * @returns {Vector2D}
     */
    add({ x = 0, y = 0 } = {}) {
        this._x += x;
        this._y += y;
        return this;
    }

    /**
     * @param {{x: number, y: number}} 
     * @returns {Vector2D}
     */
    subtract({ x = 0, y = 0 } = {}) {
        this._x -= x;
        this._y -= y;
        return this;
    }

    /**
     * @param {Vector2D} vector
     * @returns {Vector2D}
     */
    getDistanceTo(vector) {
        return vector.copy().subtract(this).getMagnitude();
    }

    /**
     * @param {Vector2D} vector
     * @returns {Vector2D}
     */
    getAngleTo(vector) {
        return vector.copy().subtract(this).getAngle();
    }

    /**
     * @param {number} val 
     * @returns {Vector2D}
     */
    multiply(val) {
        this.x *= val;
        this.y *= val;
        return this;
    }

    /**
     * @param {number} val 
     */
    divide(val) {
        if (val === 0) {
            console.warn('can not be divided by 0');
            return this;
        }
        this.x /= val;
        this.y /= val;
        return this;
    }

    /** 
     * @returns {number} - angle in radians
     */
    getAngle() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * @param {number} angle - angle in radians 
     * @returns {Vector2D}
     */
    setAngle(angle) {
        var mag = this.getMagnitude();
        this.x = Math.cos(angle) * mag;
        this.y = Math.sin(angle) * mag;
        return this;
    }

    /**
     * @param {number} max 
     * @returns {Vector2D}
     */
    setLimit(max) {
        var mag = this.getMagnitude();
        if (mag > max) this.divide(mag).multiply(max);
        return this;
    }

    /**
     * @param {number} val 
     * @returns {Vector2D}
     */
    setMagnitude(val) {
        return this.normalize().multiply(val);
    }

    /**
     * @returns {number}
     */
    getMagnitude() {
        return Math.sqrt(this.magSqrt());
    }

    /**
     * @returns {Vector2D}
     */
    normalize() {
        const mag = this.getMagnitude();
        if (mag !== 0) this.multiply(1 / mag);
        return this;
    }

    /**
     * @returns {number}
     */
    magSqrt() {
        const x = this.x;
        const y = this.y;
        return x * x + y * y;
    }

    /**
     * Create a vector from object
     * @static
     * @param {{x: number, y: number}} 
     * @returns {Vector2D}
     */
    static create({ x, y } = {}) {
        return new Vector2D(x, y);
    }

    /**
     * Create a unit vector from angle
     * @static
     * @param {number} angle 
     * @returns {Vector2D}
     */
    static createFromAngle(angle) {
        return this.create({ x: 1, y: 1 })
            .normalize()
            .setAngle(angle);
    }

    /**
     * Create a vector from object
     * @static
     * @param {{x: number, y: number}} 
     * @returns {Vector2D}
     */
    static copyVector({ x = 0, y = 0 } = {}) {
        return new Vector2D(x, y);
    }

    /**
     * To get direction as a unit vector
     * @static
     * @param {Vector2D} from 
     * @param {Vector2D} to 
     */
    static getDirection(from, to) {
        const angle = from.getAngleTo(to);
        const vector = Vector2D.createFromAngle(angle);
        return vector.normalize();
    }

    /**
     * To get distance between 2 points as a result of Math.sqrt()
     * @static
     * @param {Vector2D} from 
     * @param {Vector2D} to 
     */
    static getDistance(from, to) {
        return Math.sqrt(Vector2D.getDistanceSqrt(from, to));
    }

    /**
     * To get distance between 2 points
     * @static
     * @param {Vector2D} from 
     * @param {Vector2D} to 
     */
    static getDistanceSqrt(from, to) {
        return from.copy().subtract(to).magSqrt();
    }
}

module.exports = Vector2D;
