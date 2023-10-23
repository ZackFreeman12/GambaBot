/* "StAuth10222: I Zack Freeman, 000781330 certify that this material is my original work. 
No other person's work has been used without due acknowledgement. 
I have not made my work available to anyone else." */

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const wait = require("node:timers/promises").setTimeout;
const { token } = require('./config.json');
const { channelId } = require('./config.json');
const { channel } = require('node:diagnostics_channel');
const client = new Client({
	intents: [GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,]
});
const minBet = 10;
const helpEmbed = new EmbedBuilder()
	.setColor([14, 94, 22])
	.setTitle("Command Help")
	.addFields(
		{ name: '!newplayer', value: "Use this command to register as a player. Will only work once per unique discord ID" },
		{ name: '!rules', value: "View the rules of all games" },
		{ name: '!stats', value: "View your stats" },
		{ name: '!highroll bet', value: "Plays the highroll game. Type the number of GambaCoins you wish to bet after the command as shown" },
		{ name: '!ceelo bet', value: "Plays a game of Cee-lo with the house. Type the number of GambaCoins you wish to bet after the command as shown" },
		{ name: '!reset', value: "Reset your GambaCoins back to 100. Use if you lost all of your GambaCoins" }
	)

const ruleEmbed = new EmbedBuilder()
	.setColor([14, 94, 22])
	.setTitle("Game Rules")
	.addFields(
		{
			name: '!highroll', value: "You and the house will roll 5 dice each." +
				"The house rolls first and you follow. The one with the highest sum of dice wins. Player wins in event of a tie."
		},
		{
			name: '!ceelo', value: "You and the house will roll 3 dice each." +
				"The house rolls first and you follow. Cee-lo scoring rules are as follows.\n" +
				"Triple 6s are considered the highest roll along with a sequential 4-5-6.\n" +
				"Triple 5s would be the next highest then 4s and so on.\n" +
				"One pair of any number plus any other value will score that single value i.e 6-6-3 = 3.\n" +
				"Sequential 1-2-3 is a 0 along with any other combonation that is not mentioned above.\n" +
				"Ties will result in no wins or losses."
		},
		{ name: 'Min Bet', value: "Minimum bet for all games is 10" }
	)


client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});


client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	/* if (message.channel.id !== channelId) return; */
	try {
		if (message.content.startsWith('!help')) {


			message.reply({ embeds: [helpEmbed] });
		}
	}

	catch (error) {
		console.error(error);
		await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	/* if (message.channel.id !== channelId) return; */
	try {
		if (message.content.startsWith('!rules')) {


			message.reply({ embeds: [ruleEmbed] });
		}
	}

	catch (error) {
		console.error(error);
		await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

//Post a new user to the database if they dont exist based on discord user id
client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	/* if (message.channel.id !== channelId) return; */
	if (message.content.startsWith('!newplayer')) {
		try {
			const userData = await axios.get('http://localhost:3000/api/get/' + message.author.id)
			if (userData.data[0] == null) {

				const user = { 'userid': message.author.id, 'points': 100, 'streak': 0, 'lifetime': 0 };

				await axios.post('http://localhost:3000/api/new-user', user);

				const newuser = await axios.get('http://localhost:3000/api/get/' + message.author.id);

				message.reply(message.author.displayName + " Is now a player\nGambaCoins: " +
					newuser.data[0].points + "\nWin Streak: " + newuser.data[0].streak +
					"\nLifetime Earnings: " + newuser.data[0].lifetime);
			}
			else {
				message.reply(message.author.displayName + " is already a player.\nGambaCoins: " +
					userData.data[0].points + "\nWin Streak: " + userData.data[0].streak +
					"\nLifetime Earnings: " + userData.data[0].lifetime);
			}
		}
		catch (error) {
			console.error(error);
			await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}

	}
});

//Get stats stored in database based on discord user id
client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	/* if (message.channel.id !== channelId) return; */
	try {
		if (message.content.startsWith('!stats')) {
			const userData = await axios.get('http://localhost:3000/api/get/' + message.author.id)

			if (userData.data[0] == null) {
				message.reply('You are not a player please use !newplayer to start playing.')
			}
			else {
				const statEmbed = new EmbedBuilder()
					.setColor(0x0099FF)
					.setTitle(message.author.displayName + "'s Stats")
					.addFields(
						{ name: 'Current GambaCoins', value: userData.data[0].points.toString() },
						{ name: 'Current Win Streak', value: userData.data[0].streak.toString() },
						{ name: 'Total Lifetime Earnings', value: userData.data[0].lifetime.toString() }
					)
				message.reply({ embeds: [statEmbed] });
			}



		}
	}
	catch (error) {
		console.error(error);
		await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	/* if (message.channel.id !== channelId) return; */
	try {
		if (message.content.startsWith('!reset')) {
			const userData = await axios.get('http://localhost:3000/api/get/' + message.author.id)

			if (userData.data[0] == null) {
				message.reply('You are not a player please use !newplayer to start playing.')
			}
			else {
				const update = { points: 100, streak: userData.data[0].streak, lifetime: userData.data[0].lifetime }
				await axios.put('http://localhost:3000/api/update/' + message.author.id, update)
				await message.reply(message.author.displayName + "'s GambaCoins have been reset to 100")
			}



		}
	}
	catch (error) {
		console.error(error);
		await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});


client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	/* if (message.channel.id !== channelId) return; */
	try {
		if (message.content.startsWith('!highroll ')) {
			const userData = await axios.get('http://localhost:3000/api/get/' + message.author.id);

			if (userData.data[0] == null) {
				message.reply('You are not a player please use !newplayer to start playing.')
				return;
			}
			else {
				const bet = parseInt(message.content.substring(('!highroll ').length));
				if (Number.isNaN(bet)) {
					message.reply('You did not enter a number, Please enter a valid bet');
					return;
				}
				else if (bet > userData.data[0].points || bet < minBet) {
					message.reply('You do not have enough GambaCoins or You bet less than the min bet, Please enter a valid bet');
					return;
				}
				else {
					var houseRoll = [];
					var playerRoll = [];
					var houseSum = 0;
					var playerSum = 0;
					var houseString = '';
					var playerString = '';
					const diceFaces = ["0", "<:diceone:1166042443679006802>", "<:dicetwo:1166046954061565985>",
						"<:dicethree:1166048027648208917>", "<:dicefour:1166048061001306174>",
						"<:dicefive:1166048076784468028>", "<:dicesix:1166048088788582400>"];
					const diceRoll = "<a:diceroll:1166018578517069875>";
					var replyMessage = ""

					for (var i = 0; i < 5; i++) {
						houseRoll.push(getRandomInt(6));
						playerRoll.push(getRandomInt(6));
					}

					for (var i = 0; i < 5; i++) {
						houseSum += houseRoll[i];
						playerSum += playerRoll[i];
						houseString = houseString + diceFaces[houseRoll[i]] + ' ';
						playerString = playerString + diceFaces[playerRoll[i]] + ' ';
					}

					if (playerSum >= houseSum) {
						const update = { points: userData.data[0].points + bet, streak: userData.data[0].streak + 1, lifetime: userData.data[0].lifetime + bet }
						await axios.put('http://localhost:3000/api/update/' + message.author.id, update)
						replyMessage = "You won!\n\nGambaCoins Won: " + bet + "\nNew GambaCoin Total: " + update.points
					}
					else {
						const update = { points: userData.data[0].points - bet, streak: 0, lifetime: userData.data[0].lifetime }
						await axios.put('http://localhost:3000/api/update/' + message.author.id, update)
						replyMessage = "You lost!\n\nGambaCoins Lost: " + bet + "\nNew GambaCoin Total: " + update.points
					}

					const msg = await message.reply({
						content: diceRoll + diceRoll + diceRoll + diceRoll + diceRoll
					});
					await wait(2000);
					msg.edit(houseString)

					const msg1 = await message.reply({
						content: diceRoll + diceRoll + diceRoll + diceRoll + diceRoll
					});
					await wait(2000);
					msg1.edit(playerString)

					await message.reply("House Roll: " + houseSum + "\nYour Roll: " + playerSum + "\n" + replyMessage);
				}

			}


		}
	}
	catch (error) {
		console.error(error);
		await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	/* if (message.channel.id !== channelId) return; */
	try {
		if (message.content.startsWith('!ceelo ')) {
			const userData = await axios.get('http://localhost:3000/api/get/' + message.author.id);

			if (userData.data[0] == null) {
				message.reply('You are not a player please use !newplayer to start playing.')
				return;
			}
			else {
				const bet = parseInt(message.content.substring(('!ceelo ').length));
				if (Number.isNaN(bet)) {
					message.reply('You did not enter a number, Please enter a valid bet');
					return;
				}
				else if (bet > userData.data[0].points || bet < minBet) {
					message.reply('You do not have enough GambaCoins or You bet less than the min bet, Please enter a valid bet');
					return;
				}
				else {
					var houseRoll = [];
					var playerRoll = [];
					var houseScore;
					var playerScore;
					var houseString = '';
					var playerString = '';
					const diceFaces = ["0", "<:diceone:1166042443679006802>", "<:dicetwo:1166046954061565985>",
						"<:dicethree:1166048027648208917>", "<:dicefour:1166048061001306174>",
						"<:dicefive:1166048076784468028>", "<:dicesix:1166048088788582400>"];
					const diceRoll = "<a:diceroll:1166018578517069875>";
					var replyMessage = "you lost"

					for (var i = 0; i < 3; i++) {
						houseRoll.push(getRandomInt(6));
						playerRoll.push(getRandomInt(6));
					}

					for (var i = 0; i < 3; i++) {
						houseString = houseString + diceFaces[houseRoll[i]] + ' ';
						playerString = playerString + diceFaces[playerRoll[i]] + ' ';
					}
					houseScore = ceeloRoll(houseRoll);
					playerScore = ceeloRoll(playerRoll);

					if (playerScore > houseScore) {
						const update = { points: userData.data[0].points + bet, streak: userData.data[0].streak + 1, lifetime: userData.data[0].lifetime + bet }
						await axios.put('http://localhost:3000/api/update/' + message.author.id, update)
						replyMessage = "You won!\n\nGambaCoins Won: " + bet + "\nNew GambaCoin Total: " + update.points
					}
					else if (playerScore == houseScore) {
						replyMessage = "You Tied! No GambaCoins were won or lost."
					}
					else {
						const update = { points: userData.data[0].points - bet, streak: 0, lifetime: userData.data[0].lifetime }
						await axios.put('http://localhost:3000/api/update/' + message.author.id, update)
						replyMessage = "You lost!\n\nGambaCoins Lost: " + bet + "\nNew GambaCoin Total: " + update.points
					}

					const msg = await message.reply({
						content: diceRoll + diceRoll + diceRoll
					});
					await wait(2000);
					msg.edit(houseString)

					const msg1 = await message.reply({
						content: diceRoll + diceRoll + diceRoll
					});
					await wait(2000);
					msg1.edit(playerString)

					await message.reply(replyMessage);
				}

			}


		}
	}
	catch (error) {
		console.error(error);
		await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

//scoring logic for the cee-lo game
function ceeloRoll(roll) {
	var rank = 0;
	if (roll[0] == 6 && roll[1] == 6 && roll[2] == 6) {
		rank = 12;
	}
	else if (roll[0] == 4 && roll[1] == 5 && roll[2] == 6) {
		rank = 12;
	}
	else if (roll[0] == 5 && roll[1] == 5 && roll[2] == 5) {
		rank = 11;
	}
	else if (roll[0] == 4 && roll[1] == 4 && roll[2] == 4) {
		rank = 10;
	}
	else if (roll[0] == 3 && roll[1] == 3 && roll[2] == 3) {
		rank = 9;
	}
	else if (roll[0] == 2 && roll[1] == 2 && roll[2] == 2) {
		rank = 8;
	}
	else if (roll[0] == 1 && roll[1] == 1 && roll[2] == 1) {
		rank = 7;
	}
	else if (roll[0] == roll[1]) {
		rank = roll[2];
	}
	else if (roll[0] == roll[2]) {
		rank = roll[1];
	}
	else if (roll[1] == roll[2]) {
		rank = roll[0];
	}
	else if (roll[0] == 1 && roll[1] == 2 && roll[2] == 3) {
		rank = 0;
	}
	else {
		rank = 0;
	}
	return rank;
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max + 1);
}

client.login(token);
