//----- C H A N G E -------//
const CHANNEL_ACCESS_TOKEN = ""
const DIALOGFLOW_PROJECTID = ""
const DIALOGFLOW_SERVICE_ACCOUNT = ""
const activeHandover = false
const groupAdminId = ''
//------------------------//

const region = 'asia-northeast1'
const functions = require('firebase-functions')
const request = require('request-promise')
const dialogflow = require('dialogflow')
const {WebhookClient} = require("dialogflow-fulfillment")
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
    console.log('Start Webhook', JSON.stringify(req.body))
    if (req.body.events[0].type !== 'message') {
        return
    }
    if (req.body.events[0].message.type !== 'text') {
        return
    }
    const event = req.body.events[0]
    const userId = event.source.userId
    const sessionId = event.source.groupId || event.source.userId
    const message = event.message.text
    
    console.log('sessionId', sessionId)

    const intentResponse = await detectIntent(sessionId, message, 'th')
    const replyMessage = await convertStruct(intentResponse)
    if(intentResponse.queryResult.intent.isFallback && activeHandover) {
        await informAdmin(groupAdminId, userId, event, message)
    } else {
        await reply(event.replyToken, replyMessage)
    }
    
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

const convertStruct = async (intentResponse) => {
    const structjson = require('./lib/structjson');
    
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
    return replyMessage
}

const informAdmin = async(adminId, userId, event, message) => {
    try {
        const profile = await getprofile(userId)
        const handover = require('./message/handover')
        const informMessage = handover.inform_admin(event.replyToken, userId, profile.displayName, message)
        await push(adminId, informMessage)
        return true
    } catch(err) {
        console.log(err)
        return false
    }
}

const getprofile = async(userId) => {
    const profile = await request({
        method: "GET",
        uri: `https://api.line.me/v2/bot/profile/${userId}`,
        headers: LINE_HEADER
    }, (error, response, body) => {
        return body
    })
    return JSON.parse(profile)
}
const reply = async(replyToken, message) => {
    return request({
        method: "POST",
        uri: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            replyToken: replyToken,
            messages: message
        })
    })
}

const push = async(userId, message) => {
    return request({
        method: "POST",
        uri: `${LINE_MESSAGING_API}/push`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            to: userId,
            messages: message
        })
    })
}

const reply_or_push = async(replyToken, userId, message) => {
    try {
        await request({
            method: "POST",
            uri: `${LINE_MESSAGING_API}/reply`,
            headers: LINE_HEADER,
            body: JSON.stringify({
                replyToken: replyToken,
                messages: message
            })
        })
    } catch(err) {
        if(err.statusCode === 400) {
            console.log('push message', userId)
            await push(userId, message)
        }
    }
    return true
}

exports.fulfillment = functions.region(region).https.onRequest(async (request, response) => {
    try {
      parameters = request.body.queryResult.parameters
      const agent = new WebhookClient({request,response})
      
      let intentMap = new Map()
      intentMap.set('handover - custom', handover)
     
      agent.handleRequest(intentMap)
    } catch(err) {
      console.log('Fulfillment Error: ',err)
    }
    
  })
  
const handover = async(agent) => {
    let replyToken = parameters.replyToken
    let userId = parameters.userId
    let replyMessage = parameters.replyMessage
    
    await reply_or_push(replyToken, userId, [{type:"text", text: replyMessage}])
    return await agent.add('ส่งข้อความเรียบร้อยแล้ว')
}

