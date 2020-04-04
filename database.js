const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const databasePath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(databasePath);

// INIT
db.serialize(() => {
    //db.run('DROP TABLE users');
    db.run('CREATE TABLE IF NOT EXISTS users (discordID BLOB PRIMARY KEY, scoreSaberID INTEGER, username TEXT, teamID INTEGER)');
    // db.run('DROP TABLE songs');
    // db.run('CREATE TABLE IF NOT EXISTS songs (songID BLOB PRIMARY KEY, songName TEXT, difficulty INTEGER, type TEXT)');
    // db.run('CREATE TABLE IF NOT EXISTS scores (scoreSaberID INTEGER PRIMARY KEY, songID BLOB, score INTEGER, fc INTEGER)');
    //db.run('CREATE TABLE IF NOT EXISTS teams (teamID INTEGER PRIMARY KEY, teamName TEXT, color TEXT');
});

const songTypes = ['True Acc', 'Standard', 'Technical'];

/*  ------------------
    DATABASE FUNCTIONS
    ------------------ */

const resetDatabase = (table, msg) => {
    switch(table) {
        case 'users': {
            db.serialize(() => {
                db.run('DROP TABLE users', (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        msg.channel.send('**ERROR** when dropping table: \`users\`');
                    }
                });
                db.run('CREATE TABLE IF NOT EXISTS users (discordID INTEGER PRIMARY KEY, scoreSaberID INTEGER, username TEXT)', (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        msg.channel.send('**ERROR** when creating table: \`users\`');
                    }
                });
            });
            break;
        }
        case 'songs': {

            break;
        }
        default: {
            // msg.channel.send(notImplementedTable)
        }
    }
};

/*
    Adds a user to the database and sends a message back in the same channel indicating success or failure.

    discordID - A discord ID from the discord api, only numbers.
    scoreSaberID - A 15 or 16 digit number from ScoreSaber.
    user - A discord username along with the tag (Ex: user#1234).
    msg - The msg object that is received from the discordjs bot.
 */
const addUser = (discordID, scoreSaberID, user, msg) => {
    db.get('SELECT username, scoreSaberID, discordID FROM users WHERE discordID = (?) OR scoreSaberID = (?)',
        [discordID, scoreSaberID], (err, row) => {
            if (row && row.scoreSaberID === parseInt(scoreSaberID)) {
                msg.channel.send(`The ScoreSaber ID \`${scoreSaberID}\` is already used by \`${row.username}\` \`[${row.discordID}]\``);
            } else if (row) {
                msg.channel.send(`\`${user}\` is already registered, use \`!unregister\` to be able to register with a new id`);
            } else {
                db.run(`
              INSERT INTO users (discordId, scoreSaberId, username)
              VALUES (?, ?, ?)
            `, [discordID, scoreSaberID, user]);
                msg.channel.send(`Successfully registered \`${user}\` with ScoreSaber ID \`${scoreSaberID}\``);
                msg.member.addRole('683840653037404201').catch(console.error);
            }
    });
};

/*
    Removes a user from the database and sends a message back in the same channel indicating success or failure.

    discordID - A discord ID from the discord api, only numbers.
    msg - The msg object that is received from the discordjs bot.
 */
const removeUser = (discordID, msg) => {
    db.get('SELECT discordID, scoreSaberID, username FROM users WHERE discordID = (?)', [discordID], (err, row) => {
        if (err) {
            msg.channel.send(`**ERROR** when getting user with ID \`${discordID}\``);
        } else if (!row) {
            msg.channel.send('That user is not registered in the database')
        } else {
            db.run(`
                DELETE FROM users
                WHERE discordID = (?)
            `, [discordID], (err) => {
                if (err) {
                    msg.channel.send(`**ERROR** when removing user with ID \`${discordID}\``);
                } else {
                    msg.channel.send(`Successfully unregisterd \`${row.username}\` \`[${discordID}]\``)
                }
            });
        }
    });
};

const getScoreSaberID = (discordID, msg, callback) => {
    db.get('SELECT scoreSaberID FROM users WHERE discordID = (?)', [discordID], (err, row) => {
        if (err) {
            msg.channel.send(`**ERROR** when getting user with ID \`${discordID}\``);
        } else if (!row) {
            callback(msg, null);
        } else {
            callback(msg, row.scoreSaberID);
        }
    })
};

/*
    Updates the ScoreSaber ID and username for a specific Discord ID and sends a message back in the same channel indicating success or failure.

    discordID - A discord ID from the discord api, only numbers.
    scoreSaberID - A 15 or 16 digit number from ScoreSaber.
    user - A discord username along with the tag (Ex: user#1234).
    msg - The msg object that is received from the discordjs bot.
 */
const updateUser = (discordID, scoreSaberID, user, msg) => {
    db.get('SELECT discordID, scoreSaberID, username FROM users WHERE discordID = (?)', [discordID], (err, row) => {
        if (err) {
            msg.channel.send(`**ERROR** when getting user with ID \`${discordID}\``);
        } else if (!row) {
            msg.channel.send('That user is not registered in the database')
        } else {
            db.run(`
                UPDATE users
                SET scoreSaberID = (?),
                    username = (?)
                WHERE discordID = (?)
            `, [scoreSaberID, user, discordID], (err) => {
                if (err) {
                    msg.channel.send(`**ERROR** when updating user with ID \`${discordID}\``);
                } else {
                    msg.channel.send(`Successfully updated record for \`${user}\` \`[${discordID}]\``)
                }
            });
        }
    });
};

const addSong = (songID, songName, difficulty, type, msg) => {
    db.get('SELECT songID, songName, type FROM songs WHERE songID = (?)',
        [songID], (err, row) => {
            if (row) {
                msg.channel.send(`Song ID \`${songID}\` is already added, use \`!db REMOVE songs [songID]\` to remove it`);
            } else {
                db.run(`
                  INSERT INTO songs (songID, songName, type)
                  VALUES (?, ?, ?, ?)
                `, [songID, songName, difficulty, type]);
                msg.channel.send(`Successfully added song \`${songName} - ${difficulty} (${type})\` with ID \`[${songID}]\``);
            }
        });
};

const removeSong = (songID, msg) => {
    db.get('SELECT songID, songName, type FROM songs WHERE songID = (?)', [discordID], (err, row) => {
        if (err) {
            msg.channel.send(`**ERROR** when getting song with ID \`${songID}\``);
        } else if (!row) {
            msg.channel.send('That song has not been added')
        } else {
            db.run(`
                DELETE FROM songs
                WHERE songID = (?)
            `, [songID], (err) => {
                if (err) {
                    msg.channel.send(`**ERROR** when removing song with ID \`${songID}\``);
                } else {
                    msg.channel.send(`Successfully removed song \`${row.songName}\` \`[${songID}]\``)
                }
            });
        }
    });
};

const getTeams = () => {
    db.get('SELECT teamName FROM teams)', (err, rows) => {
        if (err) {
            console.log('ERROR when getting teams');
        } else {
            return rows;
        }
    });
};

// Returns true if the ScoreSaber ID is valid.
const isValidSSID = (SSID) => {
    return !(isNaN(SSID) || SSID.toString().length < 15 || SSID.toString().length > 16);
};

// Returns true if the Discord ID is a number.
const isValidDID= (DID) => {
    return !(isNaN(DID));
}

// Database ERROR messages

const invalidSSIDMessage = 'That is not a valid ID. The ScoreSaber ID should be a number with 15 or 16 digits' +
    ' and can be found at the end of the url on your ScoreSaber profile: \`https://scoresaber.com/u/<ID>\`';
const invalidDIDMessage = 'That is not a valid Discord ID.';
const notImplementedTableMessage = 'That is not a valid table, currently implemented tables: [users / songs]';


exports.invalidSSIDMessage = invalidSSIDMessage;
exports.invalidDIDMessage = invalidDIDMessage;
exports.notImplementedTableMessage = notImplementedTableMessage;
exports.isValidSSID = isValidSSID;
exports.isValidDID = isValidDID;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.updateUser = updateUser;
exports.getTeams = getTeams;
exports.getScoreSaberID = getScoreSaberID;
exports.database = db;
