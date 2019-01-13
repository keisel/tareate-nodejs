const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN', 'USER'],
    message: '{VALUE} no es un rol valido'
};

let usuarioSchema = new Schema({

    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']

    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        uniqueCaseInsensitive: true
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio']
    },
    role: {
        type: String,
        default: 'USER',
        enum: rolesValidos

    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },
    facebook: {
        type: Boolean,
        default: false
    },
    telefono: {
        type: String,

    },
    monedaPago: {
        type: String
    },
    nacionalidad: {
        type: String
    },
    created_at: {
        type: Date,
        default: new Date()
    }
});

// validar que el email sea unico
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} Ya se encuentra en nuestra BD' });

//evitar que el campo password se retorne al usuario cuando haga una insercion
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;

}


module.exports = mongoose.model('usuario', usuarioSchema);