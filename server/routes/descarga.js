const express = require('express');
const app = express();
const Descarga = require('../models/descarga');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const token = require('../middlewares/token');


app.get('/descarga/buscar/:termino', (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
    Descarga.find({ $or: [{ titulo: regex }, { categoria: regex }] })
        .sort('titulo')
        .exec((err, tareasDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            } else if (tareasDB == '') {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No hay coincidencias'
                    }
                });
            } else {
                return res.status(200).json({
                    ok: true,
                    tareasDB
                });
            }
        });
});

// get para los usuarios
app.get('/descarga', (req, res) => {
    Descarga.find({ estado: true }, (err, tareasDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (tareasDB == '') {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontraron tareas registradas'
                }
            });
        } else {
            return res.status(200).json({
                ok: true,
                tareas: tareasDB
            });
        }
    });
});

// este es el get con id de los usuario, estado=true.
app.get('/descarga/:id', (req, res) => {
    let id = req.params.id;
    Descarga.findOne({ _id: id, estado: true }, (err, tareaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!tareaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        } else {
            return res.status(200).json({
                ok: true,
                tarea: tareaDB
            });
        }
    });
});

// esto solo lo pdora hacer el admin
// get para el admin con estado false
app.get('/descarga/admin/full', [token.verificaToken, token.verificaRole], (req, res) => {
    Descarga.find({ estado: false }, (err, tareasDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (tareasDB == '') {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontraron tareas registradas'
                }
            });
        } else {
            return res.status(200).json({
                ok: true,
                tareas: tareasDB
            });
        }
    });
});

// esto solo lo pdora hacer el admin
// get con id que le devulve la tarea con estado false al admin para poder cambiarla
app.get('/descarga/individual/:id', [token.verificaToken, token.verificaRole], (req, res) => {
    let id = req.params.id;
    Descarga.findById(id, (err, tareaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!tareaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        } else {
            return res.status(200).json({
                ok: true,
                tarea: tareaDB
            });
        }
    });
});

// ADMIN: solo la podra cambiar el admin
app.put('/descarga/:id', [token.verificaToken, token.verificaRole], (req, res) => {

    let id = req.params.id;
    let body = req.body;
    let tarea = _.pick(body, ['titulo', 'categoria', 'tarea', "estado"]);

    Descarga.findByIdAndUpdate(id, tarea, { new: true, runValidators: true, context: 'query' }, (err, tareaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else if (!tareaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        } else {
            return res.status(201).json({
                ok: true,
                tarea: tareaDB
            });
        }
    });
});

// esto solo lo pdora hacer el admin
app.delete('/descarga/:id', [token.verificaToken, token.verificaRole], (req, res) => {

    let id = req.params.id;
    Descarga.findByIdAndRemove(id, (err, tareaBorrada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else {
            let pathArchivo = path.resolve(__dirname, `../../uploads/descargas/${tareaBorrada.tarea}`);
            if (fs.existsSync(pathArchivo)) {
                fs.unlinkSync(pathArchivo);
            }
            return res.status(200).json({
                ok: true,
                tarea: tareaBorrada
            });
        }
    });
});

module.exports = app;