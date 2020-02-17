const db = require("../database");

module.exports = {
	name: '!register',
	description: 'Register!',
	execute(msg, args) {
		if (args.length < 1) {
			msg.channel.send('Please specify a ScoreSaber ID. Example: \`!register ID\`');
		} else if (!db.isValidSSID(args[0])) {
			msg.channel.send(db.invalidSSIDMessage);
		} else {
			db.addUser(msg.author.id, args[0], msg.author.tag, msg);
		}
	},
};
