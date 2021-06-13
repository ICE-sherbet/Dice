const http = require('http');
const querystring = require('querystring');
const discord = require('discord.js');
const client = new discord.Client();

http.createServer(function (req, res) {
    if (req.method == 'POST') {
        var data = "";
        req.on('data', function (chunk) {
            data += chunk;
        });
        req.on('end', function () {
            if (!data) {
                res.end("No post data");
                return;
            }
            var dataObject = querystring.parse(data);
            console.log("post:" + dataObject.type);
            if (dataObject.type == "wake") {
                console.log("Woke up in post");
                res.end();
                return;
            }
            res.end();
        });
    }
    else if (req.method == 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Discord Bot is active now\n');
    }
}).listen(3000);

client.on('ready', message => {
    console.log('Bot準備完了～');
    client.user.setPresence({ game: { name: 'ダイス準備' } });
});

client.on('message', message => {
    if (message.author.id == client.user.id || message.author.bot) {
        return;
    }
    let code = message.content;
    if (code.match(/にゃ～ん|にゃーん/)) {
        let text = "にゃ～ん";
        sendMsg(message.channel.id, text);
        return;
    }
    if (code.match(/^!dice /i)) {
        let diceroll = /^!dice +(?<dice>\d+d\d+)/i;
        let result = diceroll.exec(code)
        if (result === null) return;
        if (result.groups.dice) {
            dice(message, result.groups.dice)
        }
    }
    if (code.match(/^!d /i)) {
        let diceroll = /^!d +(?<dice>\d+d\d+)/i;
        let result = diceroll.exec(code)
        if (result === null) return;
        if (result.groups.dice) {
            dice(message, result.groups.dice)
        }
    }
});
function dice(message, code) {
    let dice_compile = /^(?<count_dice>\d+)d(?<max_dice>\d+)/i;
    let dice_setting = dice_compile.exec(code)
    let Quantity = Math.min(parseInt(dice_setting.groups.count_dice, 10), 100)
    let max_dice = Math.min(parseInt(dice_setting.groups.max_dice, 10), 1000)
    let text = "";
    let deme = 0;
    let sum = 0;

    const isOne = (Quantity == 1 && max_dice == 100);
    for (let i = 0; i < Quantity; i++) {
        if (i % 10 == 0 && i > 1) text += "\n";
        deme = Math.floor(Math.random() * (max_dice)) + 1;
        sum += deme;
        text += ('00' + deme).slice(-2) + " ";
        if (isOne && deme < 6) text += "クリティカル"
        if (isOne && 95 < deme) text += "ファンブルwww"

    }
    if (Quantity > 1) text += "\n合計:" + sum;
    sendMsg(message.channel.id, text);

}
if (process.env.DISCORD_BOT_TOKEN == undefined) {
    console.log('DISCORD_BOT_TOKENが設定されていません。');
    process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);

function sendReply(message, text) {
    message.reply(text)
        .then(console.log("リプライ送信: " + text))
        .catch(console.error);
}

function sendMsg(channelId, text, option = {}) {
    client.channels.cache.get(channelId).send(text, option)
        .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
        .catch(console.error);
}
