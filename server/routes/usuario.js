const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const token = require('../middlewares/token');

// USUARIO: me devuelve los datos del usuario conectado.
app.get('/usuario', token.verificaToken, (req, res) => {
    let id = req.usuario._id;
    Usuario.findOne({ _id: id, estado: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Id no valido'
                }
            });
        } else if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        } else {
            return res.status(200).json({
                ok: true,
                usuarios: usuarioDB
            });
        }
    });
});

// USUARIO: crear usuario esto no necesita token ni nada
app.post('/usuario', (req, res) => {
    let body = req.body;
    bcrypt.hash(body.password, 10, function(err, hash) {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Debe ingresar una contraseña'
                }
            })
        } else {
            let usuario = new Usuario({
                nombre: body.nombre,
                email: body.email,
                password: hash
            });
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                } else {
                    return res.status(201).json({
                        ok: true,
                        usuario: usuarioDB
                    });
                }
            })
        }
    });
});

// USUARIO. cambios que puede hacer
app.put('/usuario/modificar', token.verificaToken, (req, res) => {

    let id = req.usuario._id;
    let body = req.body;
    let usuario = _.pick(body, ['nombre', 'email', 'telefono', 'monedaPago', 'nacionalidad']);

    Usuario.findByIdAndUpdate(id, usuario, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        } else {
            return res.status(201).json({
                ok: true,
                usuario: usuarioDB
            });
        }
    });
});

//USUARIO: cambio de clave
app.put('/password', token.verificaToken, (req, res) => {

    let body = req.body;
    let id = req.usuario._id;
    if (body.password == body.rePassword) {
        bcrypt.hash(body.password, 10, function(err, hash) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            } else {
                Usuario.findByIdAndUpdate(id, { password: hash }, (err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    } else if (!usuarioDB) {
                        return res.status(400).json({
                            ok: false,
                            err: {
                                message: 'id No encontrado'
                            }
                        });
                    } else {
                        return res.status(201).json({
                            ok: true,
                            usuario: usuarioDB
                        });
                    }
                });
            }
        });
    } else {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las contraseñas no coinciden'
            }
        });
    }
});

// ADMIN: Me devuleve todos los usuario
app.get('/usuario/full', [token.verificaToken, token.verificaRole], (req, res) => {
    Usuario.find((err, usuariosDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (usuariosDB == '') {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontraron usuarios registrados'
                }
            });
        } else {
            return res.status(200).json({
                ok: true,
                usuarios: usuariosDB
            });
        }
    });
});

module.exports = app;