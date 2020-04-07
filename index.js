const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const roles = require('./roles/roles.js');
const config = require('./config.js');

// Имя файла где списком указаны email игроков
const fileWithMails = 'mails.txt';

const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port===465,
    auth: {
        user: config.email,
        pass: config.pass
    }
});
// извлекаем список email адресов
const mails = fs.readFileSync(path.resolve(__dirname,fileWithMails),'utf8')
                .split("\n");

if(mails.length > roles.length) nodeExit('Игроков больше чем ролей');

// если игроков четное количество и не максимум то удаляем картошку
if(mails.length % 2 === 0 && mails.length !== roles.length) roles.shift();


roles.forEach(item => {
    if(mails.length<=0) return;
    const random = randomInteger(1,mails.length)-1;
    const address = mails.splice(random,1);
    sendMail(item,address);
});

async function sendMail(item,address) {
    try {
        await transporter.sendMail({
            from: `"Bomb"<${config.email}>`,
            to: address,
            subject: `Твоя роль в BOMB`,
            html: `<h1>${item.name}</h1><br><img src="cid:role" style="width: 400px">`,
            attachments:[
                {
                    filename: item.filename,
                    path: path.join(__dirname,'roles',item.filename),
                    contentType:'image/jpeg',
                    cid: 'role'
                }
            ]
        });
    }catch (e) {
        console.log(`Произошла ощибка при отправке письма на ${address}`);
        console.log(e);
    }
}

function nodeExit(message) {
    console.log(message);
    process.exit(1)
}

function randomInteger(min, max) {
    // получить случайное число от (min-0.5) до (max+0.5)
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}