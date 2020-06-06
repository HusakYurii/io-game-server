const GAME_CONSTANTS = Object.freeze({
    ITEM_RESPAWN_TIME_RANGE: [200, 1000],
    ITEM_AMOUNT: 300,
    MAX_ITEMS_AMOUNT: 500,
    ITEM_SIZE_RANGE: [8, 20], // min - max
    DESTRUCTURED_ITEM_SIZE_RANGE: [4, 10],

    MAX_VECTOR_SPEED: 10, // is used in PhysicsObject to avoid singularity

    BOTS_AMOUNT: 10,
    BOT_ACTION_TIME_RANGE: [6000, 12000], // a range of how often a bot activates the gravity
    BOT_MOVEMENT_TIME_RANGE: [500, 5000], // a range of how often a bot changes the direction
    BOT_RESPAWN_TIME_RANGE: [2000, 10000],
    BOT_SIZE: 30,

    PLAYERS_AMOUNT: 10,
    PLAYER_SPEED_RANGE: [0.5, 3],
    // PLAYER_GRAVITY_TIME_RANGE: [3500, 6000],  // as a player grows the gravity action time goes down
    PLAYER_GRAVITY_TIME: 3500, // maybe constant ?

    PLAYER_COOLDOWN_TIME_RANGE: [5000, 10000], // as a player grows the colldown time goes up
    PLAYER_SIZE: 30,

    ROOMS_AMOUNT: 10,
    LOOP_DELTA_TIME: 1000 / 60,
    WORLD_WIDTH: 3000,
    WORLD_HEIGTH: 3000,

    GAME_RENDER_DELAY: (1000 / 60) * 10 //ms - difference in time of server and client (client is being rendered with delay of 10 frames)
});

const CONNECTION_CONSTANTS = Object.freeze({
    CONNECTION: "connection", // one of Socket's default,
    DISCONNECT: "disconnect", // one of Socket's default,
    LOGIN_PLAYER: "LOGIN_PLAYER",
    PLAYER_LOGGEDIN: "PLAYER_LOGGEDIN",
    PLAYER_CONNECTED: "PLAYER_CONNECTED",
    SERVER_UPDATES: "SERVER_UPDATES",
    PLAYER_UPDATES: "PLAYER_UPDATES",
    RESTART_GAME: "RESTART_GAME",
    GAME_RESTARTED: "GAME_RESTARTED",
    GAME_OVER: "GAME_OVER"
});

module.exports = {
    GAME_CONSTANTS,
    CONNECTION_CONSTANTS
};