const db = require("../database");
const axios = require('axios');

const roles = [
    ['Novice', '683840653037404201'],
    ['Apprentice', '683840780502171927', '28354ff876872e0d9b1e91069527faa4'],
    ['Adept', '683840844373032971', '376a128f8d719cd8962b9b5af387bfb4'],
    ['Expert', '683840882054529047', '7681af6a9956182cdbd5ffc5334dc9f0'],
    ['Master', '683840966221758473', 'ed249a2b5de7c5bcd871fa391bdf1b64'],
    ['Legend', '683840995334684770', '908316a2b96b3bbd7b86b128dd6b5739']
];

const REGISTER_CHANNEL_ID = '684459145893904497';
const RANKUP_CHANNEL_ID = '695661983684624496';

async function setRoles (msg, scoreSaberID) {
    if (!scoreSaberID) {
        msg.channel.send(`You have not yet registered, please register with \`!register ScoreSaberID\` at ${msg.guild.channels.get(REGISTER_CHANNEL_ID).toString()}`);
        return;
    }
    if (msg.member.roles.get(roles[roles.length - 1][1])) {
        msg.channel.send(`You have already obtained the highest rank possible, stop flexing`);
        return;
    }
    let getNext = false;
    let previousID = null;
    let haveGivenRole = false;
    for (const [role, roleID, hash] of roles) {
        if (getNext) {
            const data = await axios.get(`https://bsaber.com/campaign-api/leaderboard?challengeHash=${hash}&id=${scoreSaberID}`).then((response) => {
                if (response) {
                    return response.data;
                } else {
                    return null;
                }
            }).catch(console.error);
            console.log(data);
            if (data && data.you && data.you.position) {
                msg.member.addRole(roleID).then((response) => {
                    msg.channel.send(`Congratulations on beating the ${role} Milestone, you have earned the <@&${roleID}> role!`);
                    msg.member.removeRole(previousID).catch(console.error);
                    previousID = roleID;
                    haveGivenRole = true;
                }).catch(console.error);
            } else {
                if (!haveGivenRole) {
                    msg.channel.send(`You need to beat the ${role} Milestone in order to rank up!`)
                }
                getNext = false;
            }
        }
        if (msg.member.roles.get(roleID)) {
            getNext = true;
            previousID = roleID;
        }
    }
}

module.exports = {
    name: '!rankup',
    description: 'Rankup!',
    async execute(msg, args) {
        if (msg.channel.id !== RANKUP_CHANNEL_ID) {
            return;
        }
        db.getScoreSaberID(msg.member.id, msg, setRoles);
    },
};
