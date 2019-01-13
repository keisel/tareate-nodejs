const express = require('express');
const app = express();
const Tarea = require('../models/tarea');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');

// esto solo lo pdora hacer el admin
app.get('/tarea', (req, res) => {

    Tarea.find({ estado: true })
        .populate('usuario')
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
app.get('/tarea/:id', (req, res) => {
    let id = req.params.id;
    Tarea.findOne({ _id: id, estado: true })
        .populate('usuario')
        .exec((err, tareaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'id no valido'
                    }
                })
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

// esto solo lo podra hacer el admin ver todas las tareas eliminadas revisarlas y autorizar la eliminacion por completo
app.get('/tarea/admin/full', (req, res) => {

    Tarea.find({ estado: false })
        .populate('usuario')
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

// esto solo lo pdora hacer el admin eliminar defitivo una tarea
app.delete('/tarea/admin/delete/:id', (req, res) => {

    let id = req.params.id;
    Tarea.findByIdAndRemove(id, (err, tareaBorrada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else {
            let pathArchivo = path.resolve(__dirname, `../../uploads/tareas/${tareaBorrada.tarea}`);
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



// este id lo agarro por el token
app.get('/tarea/usuario', (req, res) => {
    let id = req.usuario._id;
    Tarea.find({ usuario: id, estado: true })
        .populate('usuario')
        .exec((err, tareasDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            } else if (tareasDB == '') {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No hay tareas asignadas a este usuario'
                    }
                });
            } else {
                return res.status(200).json({
                    ok: true,
                    tarea: tareasDB
                });
            }
        });
});
// el id por parametro es de la tarea y el id del usuario lo agarro del token
app.get('/tarea/usuario/:id', (req, res) => {
    let id = req.params.id;
    let id_usuario = req.usuario._id;
    Tarea.findOne({ _id: id, usuario: id_usuario, estado: true })
        .populate('usuario')
        .exec((err, tareaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            } else if (!tareaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No hay tareas asignadas'
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

app.delete('/tarea/:id', (req, res) => {

    let id = req.params.id;
    let id_usuario = req.usuario._id;
    let estado = { estado: false };
    Tarea.findOneAndUpdate({ _id: id, usuario: id_usuario }, estado, { new: true }, (err, tareaDB) => {
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


module.exports = app;