process.env.PORT = process.env.PORT || 3000;

process.env.CADUCIDAD_TOKEN = '48h';

// semilla de autenticacion

process.env.SEED = process.env.SEED || 'tareateKeisel';

process.env.CLIENT_ID = process.env.CLIENT_ID || '1090425564135-atsso83du4jdf0lcum1epkftnii1ios9.apps.googleusercontent.com';


// entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//base de datos

let urlDB;

//if (process.env.NODE_ENV == 'dev') {
// urlDB = 'mongodb://localhost:27017/tareate';
//} else {
urlDB = 'mongodb+srv://keisel31:keisel31@cluster0-ksiiq.mongodb.net/tareate';
//}

process.env.URLDB = urlDB;