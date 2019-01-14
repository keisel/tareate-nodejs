const express = require('express');
const app = express();

app.use(require('./usuario'));
app.use(require('./tarea'));
app.use(require('./descarga'));
app.use(require('./uploads'));
app.use(require('./login'));
module.exports = app;