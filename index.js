require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const botCommands = require('./commands');
// const express = require('express');
// const db = require("./database");

bot.commands = new Discord.Collection();

// const port = 3000;


Object.keys(botCommands).map(key => {
    bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
    //TODO: Check only specific channels

    if (msg.content.charAt(0) !== '!' || !msg.member.roles.find(r => r.name === "Admin")) {
        return;
    }
    const args = msg.content.split(/ +/);
    const command = args.shift().toLowerCase();
    console.info(`Called command: ${command} ${args}`);

    if (!bot.commands.has(command)) return;

    try {
        bot.commands.get(command).execute(msg, args);
    } catch (error) {
        console.error(error);
        msg.channel.send('There was an error trying to execute that command!');
    }
});

// const app = express(); // Creates express app
// app.use(express.json());

// app.get('/submit', function(req, res) {
//     res.send('Hello World!');
// });
//
// app.post('/submit', (req, res) => {
//
// });
//
// app.get('/teams', (req, res) => {
//     res.send(db.getTeams());
// });

// app.listen(port);
//
// console.log(`Listening on http://localhost:${port}`);
// app._router.stack.forEach(function(r){
//     if (r.route && r.route.path){
//         console.log(r.route.path);
//     }
// });
