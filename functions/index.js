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
    const event = req.body.events[0]
    const userId = event.source.userId
    const message = event.message.text
    
    //  7. call detectIntent function
    
    //  8. convert structure to json
    
    request({
        method: "POST",
        uri: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            replyToken: event.replyToken,
            messages: [{"type":"text","text":message}]
        })
    })
    
    res.status(200).end()
})

const detectIntent = async (userId, message, languageCode) => {
    //  4. create session path เพื่อจดจำ context ของ user
    
    //  5. create request params เพื่อใช้ส่งไป Dialogflow เพื่อ detectIntent
    
    //  6. call dialogflow API detectIntent
}
