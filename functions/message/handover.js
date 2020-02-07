exports.inform_admin = (replyToken, userId, name, msg) => ([
    {
        "type": "flex",
        "altText": "Fallback Intent",
        "contents": {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [{
                        "type": "text",
                        "text": `${name}`,
                        "weight": "bold",
                        "size": "xl"
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "lg",
                        "spacing": "sm",
                        "contents": [{
                            "type": "text",
                            "text": `${msg}`,
                            "wrap": true,
                            "color": "#666666",
                            "size": "sm"
                        }]
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [{
                        "type": "button",
                        "style": "secondary",
                        "height": "sm",
                        "action": {
                            "type": "message",
                            "label": "Reply",
                            "text": `replyToken=${replyToken}&userId=${userId}`
                        }
                    },
                    {
                        "type": "spacer",
                        "size": "sm"
                    }
                ],
                "flex": 0
            }
        }
    }
])
