const Database = require("better-sqlite3");

const db = new Database("anarchian.db");

db.pragma("journal_mode = WAL");

// ==============================
// USERS
// ==============================

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,

        contraband INTEGER NOT NULL DEFAULT 0,

        xp INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,

        warnings INTEGER NOT NULL DEFAULT 0,

        last_daily INTEGER NOT NULL DEFAULT 0,
        last_weekly INTEGER NOT NULL DEFAULT 0,
        last_loot INTEGER NOT NULL DEFAULT 0,

        PRIMARY KEY (user_id, guild_id)
    )
`);

// ==============================
// PUNISHMENTS
// ==============================

db.exec(`
    CREATE TABLE IF NOT EXISTS punishments (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        punishment TEXT NOT NULL,

        PRIMARY KEY (user_id, guild_id, punishment)
    )
`);

// ==============================
// SERVER SETTINGS
// ==============================

db.exec(`
    CREATE TABLE IF NOT EXISTS server_settings (
        guild_id TEXT PRIMARY KEY,
        modlog_channel_id TEXT
    )
`);

// ==============================
// FUNCTIONS
// ==============================

function getUser(userId, guildId) {

    let user = db.prepare(`
        SELECT *
        FROM users
        WHERE user_id = ? AND guild_id = ?
    `).get(userId, guildId);

    if (!user) {

        db.prepare(`
            INSERT INTO users (user_id, guild_id)
            VALUES (?, ?)
        `).run(userId, guildId);

        user = db.prepare(`
            SELECT *
            FROM users
            WHERE user_id = ? AND guild_id = ?
        `).get(userId, guildId);
    }

    return user;
}

// ==============================
// CONTRABAND
// ==============================

function addContraband(userId, guildId, amount) {

    getUser(userId, guildId);

    db.prepare(`
        UPDATE users
        SET contraband = contraband + ?
        WHERE user_id = ? AND guild_id = ?
    `).run(amount, userId, guildId);
}

function removeContraband(userId, guildId, amount) {

    getUser(userId, guildId);

    db.prepare(`
        UPDATE users
        SET contraband = MAX(0, contraband - ?)
        WHERE user_id = ? AND guild_id = ?
    `).run(amount, userId, guildId);
}

function getBalance(userId, guildId) {

    const user = getUser(userId, guildId);

    return user.contraband;
}

// ==============================
// XP / LEVELS
// ==============================

function getRequiredXP(level) {

    return 100 + ((level - 1) * 75);
}

function addXP(userId, guildId, amount) {

    let user = getUser(userId, guildId);

    let newXP = user.xp + amount;
    let newLevel = user.level;
    let levelUps = 0;

    while (newXP >= getRequiredXP(newLevel)) {

        newXP -= getRequiredXP(newLevel);

        newLevel++;
        levelUps++;
    }

    db.prepare(`
        UPDATE users
        SET xp = ?, level = ?
        WHERE user_id = ? AND guild_id = ?
    `).run(
        newXP,
        newLevel,
        userId,
        guildId
    );

    return {
        xp: newXP,
        level: newLevel,
        levelUps
    };
}

// ==============================
// WARNINGS
// ==============================

function addWarning(userId, guildId) {

    getUser(userId, guildId);

    db.prepare(`
        UPDATE users
        SET warnings = warnings + 1
        WHERE user_id = ? AND guild_id = ?
    `).run(userId, guildId);
}

function getWarnings(userId, guildId) {

    const user = getUser(userId, guildId);

    return user.warnings;
}

function clearWarnings(userId, guildId) {

    getUser(userId, guildId);

    db.prepare(`
        UPDATE users
        SET warnings = 0
        WHERE user_id = ? AND guild_id = ?
    `).run(userId, guildId);
}

// ==============================
// PUNISHMENTS
// ==============================

function addPunishment(userId, guildId, punishment) {

    db.prepare(`
        INSERT OR IGNORE INTO punishments
        (user_id, guild_id, punishment)
        VALUES (?, ?, ?)
    `).run(userId, guildId, punishment);
}

function removePunishment(userId, guildId, punishment) {

    db.prepare(`
        DELETE FROM punishments
        WHERE user_id = ?
        AND guild_id = ?
        AND punishment = ?
    `).run(userId, guildId, punishment);
}

function clearPunishments(userId, guildId) {

    db.prepare(`
        DELETE FROM punishments
        WHERE user_id = ?
        AND guild_id = ?
    `).run(userId, guildId);
}

function getPunishments(userId, guildId) {

    return db.prepare(`
        SELECT punishment
        FROM punishments
        WHERE user_id = ?
        AND guild_id = ?
    `).all(userId, guildId);
}

function clearAllPunishments(guildId) {

    db.prepare(`
        DELETE FROM punishments
        WHERE guild_id = ?
    `).run(guildId);
}

// ==============================
// COOLDOWNS
// ==============================

function getCooldown(userId, guildId, type) {

    const allowed = [
        "last_daily",
        "last_weekly",
        "last_loot",
        "last_heist"
    ];

    if (!allowed.includes(type)) {
        throw new Error("Invalid cooldown type.");
    }

    const user = getUser(userId, guildId);

    return user[type];
}

function setCooldown(userId, guildId, type, timestamp) {

    const allowed = [
        "last_daily",
        "last_weekly",
        "last_loot",
        "last_heist"
    ];

    if (!allowed.includes(type)) {
        throw new Error("Invalid cooldown type.");
    }

    getUser(userId, guildId);

    db.prepare(`
        UPDATE users
        SET ${type} = ?
        WHERE user_id = ?
        AND guild_id = ?
    `).run(timestamp, userId, guildId);
}

// ==============================
// LEADERBOARD
// ==============================

function getContrabandLeaderboard(guildId, limit = 10) {

    return db.prepare(`
        SELECT user_id, contraband
        FROM users
        WHERE guild_id = ?
        ORDER BY contraband DESC
        LIMIT ?
    `).all(guildId, limit);
}

function getLevelLeaderboard(guildId, limit = 10) {

    return db.prepare(`
        SELECT user_id, level, xp
        FROM users
        WHERE guild_id = ?
        ORDER BY level DESC, xp DESC
        LIMIT ?
    `).all(guildId, limit);
}

// ==============================
// MOD LOG
// ==============================

function setModLogChannel(guildId, channelId) {

    db.prepare(`
        INSERT INTO server_settings
        (guild_id, modlog_channel_id)
        VALUES (?, ?)

        ON CONFLICT(guild_id)
        DO UPDATE SET
        modlog_channel_id = excluded.modlog_channel_id
    `).run(guildId, channelId);
}

function getModLogChannel(guildId) {

    const result = db.prepare(`
        SELECT modlog_channel_id
        FROM server_settings
        WHERE guild_id = ?
    `).get(guildId);

    return result?.modlog_channel_id || null;
}

// ==============================
// EXPORTS
// ==============================

module.exports = {

    db,

    getUser,

    addContraband,
    removeContraband,
    getBalance,

    addXP,
    getRequiredXP,

    addWarning,
    getWarnings,
    clearWarnings,

    addPunishment,
    removePunishment,
    clearPunishments,
    getPunishments,
    clearAllPunishments,

    getCooldown,
    setCooldown,

    getContrabandLeaderboard,
    getLevelLeaderboard,

    setModLogChannel,
    getModLogChannel
};