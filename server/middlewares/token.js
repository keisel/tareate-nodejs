const jwt = require('jsonwebtoken');

let verificaToken = (req, res, next) => {

    let token = req.get('token');
    // verify recibe el token que estamos recibiendo mas el seed que esta en config.js mas un callback 
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token invalido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};

let verificaTokenEmail = (req, res, next) => {

    let token = req.query.token;
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token invalido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};

let verificaRole = (req, res, next) => {

    let usuario = req.usuario;
    if (usuario.role != 'ADMIN') {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
    next();
};

module.exports = {
    verificaToken,
    verificaRole,
    verificaTokenEmail
};