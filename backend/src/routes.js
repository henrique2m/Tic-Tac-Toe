const express = require('express');
const { celebrate, Segments, Joi } = require('celebrate');

const UserControllers = require('./controllers/UserControllers');
const AuthControllrs = require('./controllers/AuthControllers');
const SocketControllers = require('./controllers/SocketControllers');
const GameControllers = require('./controllers/GameControllers');
const ValidationControllers = require('./controllers/ValidationControllers');
const InvitationControllers = require('./controllers/InvitationControllers');

const Middlewares = require('./middlewares/PrivateRoutes');

const routes = express.Router();

routes.post(
    '/register',
    celebrate({
        [Segments.BODY]: Joi.object().keys({
            email: Joi.string()
                .required()
                .email(),
            password: Joi.string()
                .required()
                .min(6)
                .max(8),
            confirmPassword: Joi.string()
                .required()
                .min(6)
                .max(8),
        }),
    }),
    UserControllers.store
);

routes.post(
    '/validation',
    celebrate({
        [Segments.BODY]: Joi.object().keys({
            code: Joi.number().required(),
            idUser: Joi.required(),
        }),
    }),
    ValidationControllers.show
);
routes.post('/cancel', ValidationControllers.delete);
routes.post('/auth', AuthControllrs.show);
routes.post('/socketDelete', SocketControllers.delete);
routes.post('/socket', SocketControllers.socket);

routes.use(Middlewares);

routes.post(
    '/ivitation',
    celebrate({
        [Segments.BODY]: Joi.object().keys({
            email: Joi.string()
                .required()
                .email(),
            username: Joi.required(),
        }),
    }),
    InvitationControllers.sendHbs
);

routes.post('/session', AuthControllrs.session);

routes.get('/profile', UserControllers.show);

routes.post('/online', SocketControllers.index);

routes.put('/updatePlaying', SocketControllers.update);

routes.post('/startgame', GameControllers.store);
routes.post('/game', GameControllers.show);
routes.post('/updateGame', GameControllers.update);
routes.post('/deleteGame', GameControllers.delete);

module.exports = routes;
