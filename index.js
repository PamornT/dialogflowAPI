const region = 'asia-northeast1';
const functions = require('firebase-functions');
const request = require('request-promise');
const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message";
const LINE_HEADER = {
    "Content-Type": "application/json",
    "Authorization": "Bearer CHANNEL_ACCESS_TOKEN"
};

exports.webhook = functions.region(region).https.onRequest(async (req, res) => {
    if (req.body.events[0].type !== 'message') {
        return
    }
    if (req.body.events[0].message.type !== 'text') {
        return
    }
    
    res.status(200).end()
})

const detectIntent = async (userId, message, languageCode) => {
   
}
