const generateId = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

const callAfter = function (number = 1, callback, arg = [], scope) {
    const total = number;
    let counter = 0;
    return function (...payload) {
        counter += 1;
        arg.push.apply(arg, payload);
        if (counter === total) {
            callback.call(scope, arg);
        }
    }
};

const randomInt = function (min = 0, max = Number.MAX_SAFE_INTEGER) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomFloat = function (min = 0, max = 1) {
    return (Math.random() * (max - min)) + min;
};

/**
 * @param {sting} prefix - #0 or 0x
 */
const randomColor = function (prefix) {
    return `${prefix}${Math.random().toString(16).slice(2, 8)}`;
};

module.exports = {
    generateId,
    callAfter,
    randomInt,
    randomFloat,
    randomColor
};