const http = require('http')
const fs = require('fs')
var express = require('express');

//VersaSense devices are outdated, certificates are no longer valid
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();

app.use(express.static('public'));

app.set('port', process.env.PORT || 3000);

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(app.get('port'),  function() {
    console.log('Express server listening on port ' + server.address().port);
});

const middleware = require('./iot-middleware/control/engine')
const engine = new middleware.Engine();
engine.setup('./configurations-middleware/devices.json');

io.on('connection', function (socket) {
    console.log("New socket connected");

    socket.on('start-monitor', function (msg){
        // TODO: write code to monitor devices (both lamp and lightsensor)
    });

    socket.on('stop-monitor', function (msg){
        // TODO: write code to stop monitoring devices (both lamp and lightsensor)
    });

    socket.on('lamp-on', function (msg){
        // TODO: write code to turn lamp on
    });

    socket.on('lamp-off', function (msg){
        // TODO: write code to to turn lamp off
    });

});



