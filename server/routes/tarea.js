const express = require('express');
const app = express();
const Tarea = require('../models/tarea');
const _ = require('underscore');
const fileUpload = require('express-fileupload');
app.use(fileUpload());

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

// esto lo podra hacer el usuario
app.post('/tarea', (req, res) => {

    let body = req.body;

    if (req.files) {
        var archivo = req.files.tarea;
        let nombreCortado = archivo.name.split('.');
        let extension = nombreCortado[nombreCortado.length - 1];
        let extensionesValidas = ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlsx', 'xlsm'];

        if (extensionesValidas.indexOf(extension) < 0) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Error. Las extensiones permitidas son: ' + extensionesValidas.join(', ')
                }
            });
        }
        body.tarea = `${nombreCortado[0]}-${new Date().getMilliseconds() }.${extension}`;
    }
    let tarea = new Tarea({
        titulo: body.titulo,
        usuario: body.usuario,
        descripcion: body.descripcion,
        categoria: body.categoria,
        fechaEntrega: body.fechaEntrega,
        tarea: body.tarea
    })
    tarea.save((err, tareaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        } else {
            if (req.files) {
                archivo.mv(`uploads/tareas/${body.tarea}`, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    } else {
                        return res.status(200).json({
                            ok: true,
                            tarea: tareaDB
                        })
                    }
                });
            } else {
                return res.status(200).json({
                    ok: true,
                    tarea: tareaDB
                })
            }
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

// este es el put
app.post('/tareas/:id', (req, res) => {

    let id = req.params.id;
    let body = req.body;
    let id_usuario = body.usuario;
    body = _.pick(body, ['titulo', 'descripcion', 'categoria', 'fechaEntrega', 'tarea']);
    console.log(req.files);
    if (req.files) {
        var archivo = req.files.tarea;
        let nombreCortado = archivo.name.split('.');
        let extension = nombreCortado[nombreCortado.length - 1];
        let extensionesValidas = ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlsx', 'xlsm'];

        if (extensionesValidas.indexOf(extension) < 0) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Error. Las extensiones permitidas son: ' + extensionesValidas.join(', ')
                }
            });
        }
        body.tarea = `${nombreCortado[0]}-${new Date().getMilliseconds() }.${extension}`;
    }

    Tarea.findOneAndUpdate({ _id: id, usuario: id_usuario }, body, { new: true, runValidators: true, context: 'query' }, (err, tareaDB) => {
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
            if (req.files) {
                archivo.mv(`uploads/tareas/${body.tarea}`, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    } else {
                        return res.status(200).json({
                            ok: true,
                            tarea: tareaDB
                        })
                    }
                });
            } else {
                return res.status(200).json({
                    ok: true,
                    tarea: tareaDB
                })
            }
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