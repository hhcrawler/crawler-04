var WebSocketClient = require('websocket').client;
const Data = require("./models/data.model");
const mongoose = require('mongoose')
var http = require('http');
const axios = require('axios');

require('dotenv').config()

var currentSid=1;

function startWebsocket(accessToken) {
    var client = new WebSocketClient();

    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function (connection) {
        login();
        console.log('WebSocket Client Connected');
        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
            startWebsocket(accessToken);
        });
        connection.on('close', function () {
            console.log('echo-protocol Connection Closed');
            startWebsocket(accessToken);
        });

        connection.on('message', async function (message) {
            if (message.type === 'utf8') {
                const data = JSON.parse(message.utf8Data);
                if (data[0] === 5) {
                    if ('rs' in data[1] && 'sid' in data[1]) {
                        const rs = data[1].rs;
                        const sid = data[1].sid;
                        if (sid==currentSid){
                            var d1=data[1].d1;
                            var d2=data[1].d2;
                            var d3=data[1].d3;
                      
                      
                        const mgData = new Data({
                            big: d1+d2+d3>10,
                            sessionId: data[1].sid,
                            d1: d1,
                            d2: d2,
                            d3: d3
                        });
                        try {
                            await mgData.save();
                            console.log(`save success${currentSid}`);
                            currentSid++;
                            connection.send(JSON.stringify(["6","MiniGame","taixiuKCBPlugin",{"cmd":2009,"sid":`${currentSid}`,"aid":"1"}]));

                        } catch (err){
                            console.log(err);
                        }
                    }
                    }
                    return;
                }
                if (data[0] === 1) {
                    if (data[1] == true) {
                        console.log('login success');
                        if (currentSid!=-1){
                        connection.send(JSON.stringify(["6","MiniGame","taixiuKCBPlugin",{"cmd":2009,"sid":`${currentSid}`,"aid":"1"}]));
                    }
                    else{
                        console.log('invalid current sid');
                    }
                    }
                    else {
                        console.log('login failed');
                    }

                }


            }
        });

        async function login() {
            if (connection.connected) {

                connection.send(JSON.stringify(
                    [1,"MiniGame","","",{"agentId":"1","accessToken":`${process.env.ACCESS_TOKEN}`,"reconnect":true}]
                ));
            }
        }
    });

    client.connect('wss://api-mini.gowsazhjo.net/websocket');
}




const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fezar.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
    .connect(
        uri,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(async () => {
        console.log('Connect Mongodb Successfully');
        console.log('finding current sid...');
        const  fdata=await Data.find({sessionId:{$lte:150000}}).sort({sessionId:-1}).limit(1);
        currentSid=fdata[0].sessionId+1;
        console.log(`Current sid: ${currentSid}`);
        startWebsocket(process.env.ACCESS_TOKEN);
    })
    .catch((error) => console.log(error));



http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World!');
    res.end();
}).listen(8080);