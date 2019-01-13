const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let tareaSchema = new Schema({
    titulo: {
        type: String,
        required: [true, 'El titulo es obligatorio']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'usuario'
    },
    descripcion: {
        type: String
    },
    categoria: {
        type: String,
        required: [true, 'la categoria es obligatoria']
    },
    fechaEntrega: {
        type: Date,
        required: [true, 'la fecha de entrega es obligatoria']
    },
    tarea: {
        type: String
    },
    evaluando: {
        type: String,
        default: 'Evaluando'
    },
    precio: {
        type: String
    },
    estado: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: new Date()
    }
});
module.exports = mongoose.model('tarea', tareaSchema);