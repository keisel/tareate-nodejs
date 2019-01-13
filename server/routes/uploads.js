const express = require('express');
const app = express();
const Descarga = require('../models/descarga');
const fileUpload = require('express-fileupload');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');

app.use(fileUpload());

// descarga
app.post('/descarga', (req, res) => {

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Debe cargar un archivo carajo'
                }
            });
    }

    let archivo = req.files.tarea;
    let nombreArchivo = validarExtension(archivo, res);

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
        } else {
            cargarArchivo(archivo, nombreArchivo, res, tareaDB);
        }
    })
});

function validarExtension(archivo, res) {
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
    return `${nombreCortado[0]}-${new Date().getMilliseconds() }.${extension}`;
}


function cargarArchivo(archivo, nombreArchivo, res, tareaDB) {

    archivo.mv(`uploads/descargas/${nombreArchivo}`, (err) => {
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
}


module.exports = app;