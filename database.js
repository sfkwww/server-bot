const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const databasePath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(databasePath);

// INIT
db.serialize(() => {
    db.run('DROP TABLE users');
    db.run('CREATE TABLE IF NOT EXISTS users (discordID BLOB PRIMARY KEY, scoreSaberID INTEGER, username TEXT)');
});

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
            msg.channel.send(notImplementedTable)
        }
    }
};

const addUser = (discordID, scoreSaberID, user, msg) => {
    db.get('SELECT username, scoreSaberID, discordID FROM users WHERE discordID = (?) OR scoreSaberID = (?)',
        [discordID, scoreSaberID], (err, row) => {
            console.log(row);
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
            }
    });
};

const removeUser = (discordID, msg) => {
    db.get('SELECT discordID, scoreSaberID, username FROM users WHERE discordID = (?)', [discordID], (err, row) => {
        if (err) {
            msg.channel.send(`**ERROR** when getting user with ID \`${discordID}\``);
        } else if (!row) {
            msg.channel.send('That user is not registered in the database.')
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

const updateUser = (discordID, scoreSaberID, user, msg) => {
    db.get('SELECT discordID, scoreSaberID, username FROM users WHERE discordID = (?)', [discordID], (err, row) => {
        if (err) {
            msg.channel.send(`**ERROR** when getting user with ID \`${discordID}\``);
        } else if (!row) {
            msg.channel.send('That user is not registered in the database.')
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
                    msg.channel.send(`Successfully updated record for ${user} \`[${discordID}]\``)
                }
            });
        }
    });
};

const isValidSSID = (SSID) => {
    return !(isNaN(SSID) || SSID.toString().length < 15 || SSID.toString().length > 16);
};

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
exports.database = db;
