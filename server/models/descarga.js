const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let descargaSchema = new Schema({

    titulo: {
        type: String,
        required: [true, 'El titulo es obligatorio']
    },
    categoria: {
        type: String,
        required: [true, 'La categoria es obligatoria']
    },
    tarea: {
        type: String,
        required: [true, 'El archivo de la tarea es obligatorio']
    },
    estado: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: new Date()
    }

});

module.exports = mongoose.model('descarga', descargaSchema);