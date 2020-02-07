const region = 'asia-northeast1';
const functions = require('firebase-functions');
const request = require('request-promise');
const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message";
const LINE_HEADER = {
    "Content-Type": "application/json",
    "Authorization": "Bearer CHANNEL_ACCESS_TOKEN"
};

//  1. Import Dialogflow library

//  2. define dialogflow projectId

//  3. Create session client

exports.webhook = functions.region(region).https.onRequest(async (req, res) => {
    if (req.body.events[0].type !== 'message') {
        return
    }
    if (req.body.events[0].message.type !== 'text') {
        return
    }
    
    //  7. call detectIntent function
    
    //  8. convert structure to json
    
    //  9. reply to user
    
    res.status(200).end()
})

const detectIntent = async (userId, message, languageCode) => {
    //  4. create session path เพื่อจดจำ context ของ user
    
    //  5. create request params เพื่อใช้ส่งไป Dialogflow เพื่อ detectIntent
    
    //  6. call dialogflow API detectIntent
}
