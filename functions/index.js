//----- C H A N G E -------//
const CHANNEL_ACCESS_TOKEN = ""
const DIALOGFLOW_PROJECTID = ""
const DIALOGFLOW_SERVICE_ACCOUNT = ""
//------------------------//

const region = 'asia-northeast1'
const functions = require('firebase-functions')
const request = require('request-promise')
const dialogflow = require('dialogflow')
const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message"
const LINE_HEADER = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
}
const sessionClient = new dialogflow.SessionsClient({
    DIALOGFLOW_PROJECTID,
    keyFilename: DIALOGFLOW_SERVICE_ACCOUNT,
})

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
    
    const intentResponse = await detectIntent(userId, message, 'th')
    
    const structjson = require('./structjson');
    const intentResponseMessage = intentResponse.queryResult.fulfillmentMessages
    const replyMessage = intentResponseMessage.map( (messageObj) => {
        let struct
        if (messageObj.message === "text") {
            return {type: "text", text: messageObj.text.text[0] }
        } else if(messageObj.message === "payload") {
            struct = messageObj.payload
            return structjson.structProtoToJson(struct)
        }
        return null
    })

    request({
        method: "POST",
        uri: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            replyToken: event.replyToken,
            messages: replyMessage
        })
    })
    
    res.status(200).end()
})

const detectIntent = async (userId, message, languageCode) => {
    const sessionPath = sessionClient.sessionPath(DIALOGFLOW_PROJECTID, userId)
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: languageCode,
            },
        },
    }
    const responses = await sessionClient.detectIntent(request)
    return responses[0]
}
