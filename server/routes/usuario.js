const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');

app.get('/usuario/:id', (req, res) => {
    let id = req.params.id;
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


app.post('/usuario', (req, res) => {

    let body = req.body;
    bcrypt.hash(body.password, 10, function(err, hash) {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
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

app.put('/usuario/:id', (req, res) => {

    let id = req.params.id;
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

app.put('/password/:id', (req, res) => {

    let body = req.body;
    let id = req.params.id;
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

// esto solo lo pdora hacer el admin
app.get('/usuario', (req, res) => {
    Usuario.find({ estado: true }, (err, usuariosDB) => {
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