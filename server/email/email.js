const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

function enviarEmail(usuario, tipo) {

    let token = jwt.sign({
        usuario
    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

    if (tipo == 'usuario') {
        var asunto = 'ACTIVACION DE CUENTA';
        var html = `<a href='http://localhost:3000/usuario/activar?token=${token}'>APRIETA AQUI</a> `
    } else if (tipo == 'password') {
        var asunto = 'CAMBIO DE PASSWORD';
        var html = `<a href='http://localhost:3000/usuario/password?token=${token}'>APRIETA AQUI</a> `
    }

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '', // Cambialo por tu email
            pass: '' // Cambialo por tu password
        }
    });
    const mailOptions = {
        from: `"TAREATE"  <tareate@gmail.com>`,
        to: usuario.email, // Cambia esta parte por el destinatario
        subject: asunto,
        html: html
    };
    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log(err);
            return;

        } else {
            console.log(info);
            return;
        }
    });
}

module.exports = {
    enviarEmail
}