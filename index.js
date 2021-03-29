const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

//importar las variables
require('dotenv').config({path: 'variables.env'});

//Helpers con funciones

const helpers = require('./helpers');
//crear la conexión a la BD

const db = require('./config/db');
const { networkInterfaces } = require('os');

//Importar el modelo

require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then(()=>{
        console.log('Conectado al servidor')
    })
    .catch(error => console.log(error));

//crear una aplicación de express

const app = express();

//Habilitar bodyparser para leer datos de formularios

app.use(bodyParser.urlencoded({extended: true}));

//Dónde cargar los archivos estáticos

app.use(express.static('public'));


//se define pug como view engine

app.set('view engine', 'pug');

//se define la carpeta de las vistas

app.set(path.join(__dirname, './views'));

// agregar flash messages

app.use(flash());

app.use(cookieParser());

//sesiones para navegar entre distintas páginas sin volver a autenticarnos
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//pasar vardump a la aplicación

app.use(function(req, res, next) {
    res.locals.vardump = helpers.vardump;
    res.locals.mensaje = req.flash();
    res.locals.usuario = {...req.user} || null;
    console.log(res.locals.usuario);
    next();
});

//se define el archivo de rutas

app.use('/', routes());


require('./config/db');

//servidor y puerto

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log('El servidor está funcionando');
});
