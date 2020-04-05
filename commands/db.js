const db = require("../database");
const DB_CHANNEL = '696149988819992646';

module.exports = {
	name: '!db',
	description: 'Database Operation!',
	execute(msg, args) {
		if (msg.channel.id !== DB_CHANNEL) {
			return;
		}
		if (!msg.member.roles.find(r => r.name === "Admin")) {
			msg.channel.send('The role \`Admin\` is required to run this command.');
			return;
		}
		if (args.length < 2) {
			msg.channel.send('Usage: \`!db [table] [ADD / REMOVE / UPDATE]\`');
			return;
		}
		switch (args[0]) {
			case 'users': {
				switch (args[1]) {
					case 'ADD': {
						if (args.length !== 4 || !msg.mentions.users.first()) {
							msg.channel.send('Usage: \`!db users ADD @user [scoreSaberID]\`');
							return;
						}
						const username = msg.mentions.users.first().tag;
						const discordID = msg.mentions.users.first().id;
						const scoreSaberID = args[3];
						if (!db.isValidSSID(scoreSaberID)) {
							msg.channel.send(db.invalidSSIDMessage);
							return;
						}
						db.addUser(discordID, scoreSaberID, username, msg);
						break;
					}
					case 'REMOVE': {
						if (args.length !== 3) {
							msg.channel.send('Usage: \`!db users REMOVE [discordID]\`');
							return;
						}
						const discordID = args[2];
						if (!db.isValidDID(discordID)) {
							msg.channel.send(db.invalidDIDMessage);
							return;
						}
						db.removeUser(discordID, msg);
						break;
					}
					case 'UPDATE': {
						if (args.length !== 4 || !msg.mentions.users.first()) {
							msg.channel.send('Usage: \`!db users UPDATE @user [scoreSaberID]\`');
							return;
						}
						const discordID = msg.mentions.users.first().id;
						const username = msg.mentions.users.first().tag;
						const scoreSaberID = args[3];
						if (!db.isValidSSID(scoreSaberID)) {
							msg.channel.send(db.invalidSSIDMessage);
							return;
						}
						db.updateUser(discordID, scoreSaberID, username, msg);
						break;
					}
				}
				break;
			}
			case 'songs': {

				break;
			}
			default: {
				msg.channel.send(db.notImplementedTableMessage);
				msg.channel.send('Usage: \`!db [table] [ADD / REMOVE / UPDATE]\`')
			}
		}
	},
};
