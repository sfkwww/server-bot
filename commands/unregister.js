const Discord = require('discord.js');
const db = require("../database");

module.exports = {
	name: '!unregister',
	description: 'Unregister!',
	execute(msg, args) {
		msg.channel.send("Are you sure you want to unregister? (y/n)");
		const collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 10000 });
		collector.on('collect', message => {
			if (message.content == "y") {
				db.removeUser(msg.author.id, msg);
				return collector.stop();
			} else {
				message.channel.send("Cancelled unregistration.");
				return collector.stop();
			}
		});
	},
};
