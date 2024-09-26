var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs');
const webpush = require('web-push');

const upload = multer();


async function sendPushNotifications() {
    let subscriptions = [];
    const SUBS_FILENAME = './public/subscriptions.json';
    try {
        subscriptions = JSON.parse(fs.readFileSync(SUBS_FILENAME));
    } catch (error) {
        console.error(error);    
    }

    webpush.setVapidDetails('https://webprojekt5.onrender.com', 
    'BLxRStiPVJdiSAnmunz_W8epHVHNUHUPO4lQj_k54-UXhs-f7B5njM9RBD30paTOzvDHfhDxyQPf0uIiTuIXJUo', 
    'Z4NlFZ6fe1nbHzdtuCiHefsOhBHVf6z0fgDCt1iEoko');
    subscriptions.forEach(async sub => {
        try {
            console.log("Sending notification to", sub);
            await webpush.sendNotification(sub, JSON.stringify({
                title: 'New task!',
                body: 'Somebody created a new task',
                redirectUrl: '/'
              }));    
        } catch (error) {
            console.error(error);
        }
    });
}



router.post('/', upload.none(), async function(req, res, next) {
    const reqBody = req.body;
    const syncData = reqBody['syncData'];

    const filePath = './public/tasks.json';

    fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        fs.writeFile(filePath, syncData, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Data saved to file');
        }
        });
    } else {
        fs.writeFile(filePath, syncData, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Data appended to file');
        }
        });
    }
    });

    await sendPushNotifications();
});

module.exports = router;