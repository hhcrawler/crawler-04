var WebSocketClient = require('websocket').client;
const Data2 = require("./models/data.model");
const mongoose = require('mongoose')
var http = require('http');
const axios = require('axios');

require('dotenv').config()



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
            axios.post('https://api-gw.25bp-tank.net/user/login.aspx', 
                        {
                            "username": "jklgf123",
                            "password": "bnmghjtyu",
                            "app_id": "b52.club",
                            "os": "OS X",
                            "device": "Computer",
                            "browser": "chrome",
                            "fg": "kjhdhfgjksdfhkjasfhajksdhasjkxca"
                          })
                          .then(function (response) {
                            console.log(response.data.data[0].token);
                            
                            startWebsocket(response.data.data[0].token);
                          })
                          .catch(function (error) {
                            console.log(error);
                          });
        });

        connection.on('message', async function (message) {
            if (message.type === 'utf8') {
                const data = JSON.parse(message.utf8Data);
                if (data[0] === 5) {
                    if ('rsmd5' in data[1]) {
                        const rsmd5 = data[1].rsmd5;
                        let is_even = true;
                        const split = rsmd5.split(':');
                        if (split[0] == '[3D - 1T]' || split[0] == '[3T - 1D]') is_even = false;
                        console.log(rsmd5);
                        const mgData = new Data2({
                            is_even: is_even,
                            result: split[0],
                            rsmd5: `${split[1]}`
                        });
                        try {
                            await mgData.save();
                            console.log('save success');

                        } catch {
                        }
                    }
                    return;
                }
                if (data[0] === 1) {
                    if (data[1] == true) {
                        console.log('login success');
                        connection.send(JSON.stringify([3, "Simms", 157, ""]));
                    }
                    else {
                        console.log('login failed');
                        
                    }

                }


            }
        });

        function login() {
            if (connection.connected) {
                connection.send(JSON.stringify(
                    [
                        1,
                        "Simms",
                        "",
                        "",
                        {
                            "agentId": "1",
                            "accessToken": accessToken,
                            "reconnect": false
                        }
                    ]
                ));
            }
        }
    });

    client.connect('wss://api-card.b5wssb.com/websocket');
}

startWebsocket('123');


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fezar.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
    .connect(
        uri,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
        console.log('Connect Mongodb Successfully');
    })
    .catch((error) => console.log(error));



http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World!');
    res.end();
}).listen(8080);