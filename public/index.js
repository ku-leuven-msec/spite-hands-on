const socket = io.connect('http://localhost:3000');

socket.on('lamp-value', (value) => {
    var cell = document.getElementById('lamp-value');
    cell.innerHTML=value;
});

socket.on('lightsensor-value', (value) => {
    var cell = document.getElementById('lightsensor-value');
    cell.innerHTML=value;
});

function startMonitor() {
    socket.emit('start-monitor', {});
}

function stopMonitor() {
    socket.emit('stop-monitor', {});
    var cell1 = document.getElementById('lamp-value');
    cell1.innerHTML="--";
    var cell2 = document.getElementById('lightsensor-value');
    cell2.innerHTML="--";
}

function turnLampOn() {
    socket.emit('lamp-on', {});
}

function turnLampOff() {
    socket.emit('lamp-off', {});
}