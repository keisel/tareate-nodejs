const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {

    let body = req.body;
    Usuario.findOne({ email: body.email, estado: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }
        bcrypt.compare(body.password, usuarioDB.password)
            .then(function(resp) {
                if (!resp) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Usuario o contraseña incorrectos'
                        }
                    });
                }
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token

                });
            });
    });
});


async function verify(token) {
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.CLIENT_ID, });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        google: true
    }
}

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                err: {
                    message: 'Token invalido'
                }
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Datos invalidos'
                }
            });
        };
        if (usuarioDB) {

            if (usuarioDB.google == false) {

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Ud no esta autenticado con google debe usar su autenticacion normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {

            let usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                google: true,
                password: ':)'
            });

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

module.exports = app;