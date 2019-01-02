let app = require('express')();

var cors = require('cors');
//cors

app.use(cors());

let http = require('http').Server(app);
let io = require('socket.io')(http);

/* io.on('connection', (socket) => {

    // Log whenever a user connects
    console.log('user connected');

    // Log whenever a client disconnects from our websocket server
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    // When we receive a 'message' event from our client, print out
    // the contents of that message and then echo it back to our client
    // using `io.emit()`
    socket.on('message', (message) => {
        console.log("Message Received: " + message);
        io.emit('message', { type: 'new-message', text: message });
    });
}); */

var onlineUsers = { 0: 'ADMIN' };
var noOfOnlineUsers = 0;
var messageLog = [];
var MESSAGE_EVENT = 'message';
var INIT_EVENT = 'init';

io.on('connection', function (socket) {
    let nickname = onlineUsers[socket.id] = 'User ' + (++noOfOnlineUsers);

    console.log(onlineUsers);


    console.log('a user connected :: ' + socket.id + ' as ' + nickname);
    //sending init;
    io.emit(INIT_EVENT, { messageLog: messageLog, onlineUsers: onlineUsers, noOfOnlineUsers: noOfOnlineUsers });
    socket.broadcast.emit(MESSAGE_EVENT, { senderId: 0, sender: 'ADMIN', msg: 'New User [ ' + socket.id + ' ] connected   as ' + nickname + ' !!' });
    socket.emit(MESSAGE_EVENT, { senderId: 0, sender: 'ADMIN', msg: 'Hi ' + nickname + ' [ ' + socket.id + ' ]   !!' });

    socket.on('disconnect', function () {
        console.log('user [' + socket.id + '] disconnected!!');
        socket.broadcast.emit(MESSAGE_EVENT, { senderId: 0, sender: 'ADMIN', msg: nickname + ' [' + socket.id + '] disconnected!!' });
    });
    socket.on(MESSAGE_EVENT, function (msg) {
        //console.log('message: ' + msg);
        console.log(socket.id + ' :: ', msg);
        let msglet = { senderId: socket.id, sender: onlineUsers[socket.id], msg: msg, time: new Date() };
        socket.broadcast.emit(MESSAGE_EVENT, msglet);
        messageLog.push(msglet);
        //socket.emit(EVENT_NAME, { sender: onlineUsers[socket.id], msg: msg });
    });
});

// Initialize our websocket server on port 5000
http.listen(5000, () => {
    console.log('started on port 5000');
});
