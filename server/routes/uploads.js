const express = require('express');
const app = express();
const Descarga = require('../models/descarga');
const Tarea = require('../models/tarea');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
app.use(fileUpload());


// descarga
app.post('/descarga', (req, res) => {

    if (Object.keys(req.files).length == 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Debe cargar un archivo'
                }
            });
    }

    let archivo = req.files.tarea;
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
    let nombreArchivo = `${nombreCortado[0]}-${new Date().getMilliseconds() }.${extension}`;

    let body = req.body;
    let descarga = new Descarga({
        titulo: body.titulo,
        categoria: body.categoria,
        tarea: nombreArchivo
    });
    descarga.save((err, tareaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        cargarArchivo(archivo, nombreArchivo, res, tareaDB, 'descargas');
    })
});


// POST TAREA esto lo podra hacer el usuario
app.post('/tarea', (req, res) => {

    let body = req.body;
    if (Object.keys(req.files).length > 0) {
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
        }
        if (Object.keys(req.files).length > 0) {
            cargarArchivo(archivo, body.tarea, res, tareaDB, 'tareas');
        } else {
            return res.status(200).json({
                ok: true,
                tarea: tareaDB
            })
        }
    });
});


// este es el put
app.post('/tareas/:id', (req, res) => {

    let body = req.body;
    let id = req.params.id;
    let id_usuario = body.usuario;
    body = _.pick(body, ['titulo', 'descripcion', 'categoria', 'fechaEntrega', 'tarea']);

    if (Object.keys(req.files).length > 0) {
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

    Tarea.findOneAndUpdate({ _id: id, usuario: id_usuario }, body, { runValidators: true, context: 'query' }, (err, tareaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!tareaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        }
        if (Object.keys(req.files).length > 0) {
            borrarArchivo(tareaDB.tarea);
            cargarArchivo(archivo, body.tarea, res, tareaDB, 'tareas');
        } else {
            return res.status(200).json({
                ok: true,
                tarea: tareaDB
            })
        }

    });
});


function borrarArchivo(tarea) {

    let pathArchivo = path.resolve(__dirname, `../../uploads/tareas/${tarea}`);
    if (fs.existsSync(pathArchivo)) {
        fs.unlinkSync(pathArchivo);
    }
    return;
}

function cargarArchivo(archivo, nombreArchivo, res, tareaDB, tipo) {
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        return res.status(200).json({
            ok: true,
            tarea: tareaDB
        })
    });
}


module.exports = app;