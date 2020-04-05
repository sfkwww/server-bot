const db = require("../database");
const REGISTER_CHANNEL_ID = '684459145893904497';

module.exports = {
	name: '!register',
	description: 'Register!',
	execute(msg, args) {
		if (msg.channel.id !== REGISTER_CHANNEL_ID) {
			return;
		}
		if (args.length < 1) {
			msg.channel.send('Please specify a ScoreSaber ID. Example: \`!register ID\`');
		} else if (!db.isValidSSID(args[0])) {
			msg.channel.send(db.invalidSSIDMessage);
		} else {
			db.addUser(msg.author.id, args[0], msg.author.tag, msg);
		}
	},
};
