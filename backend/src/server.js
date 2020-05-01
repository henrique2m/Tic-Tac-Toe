require('./Database/mongodb');
const express = require('express');
const cors = require('cors');
const { errors } = require('celebrate');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const routes = require('./routes');
const SocketControllrs = require('./controllers/SocketControllers');

io.on('connection', (socket) => {
    const { user } = socket.handshake.query;
    const idSocket = socket.id;
    SocketControllrs.store({ user, idSocket });
});

app.use((req, res, next) => {
    req.io = io;
    return next();
});

app.use(
    cors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
);

app.use(express.json());

app.use(routes);

app.use(errors());

server.listen(process.env.PORT || 3333);
