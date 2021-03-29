const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const { Op } = require("sequelize");
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/', 
    failureRedirect: '/iniciar-sesion', 
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//función para controlar si el usuario esta autenticador

exports.usuarioAutenticado = (req, res, next) => {

    //si el usuario está autenticado 
    if(req.isAuthenticated()){
        return next();
    }

    //si no está autenticado, redirigir al login
    return res.redirect('/iniciar-sesion');

}

//funcion para cerrar sesión

exports.cerrarSesion = (req, res) => {
    req.session.destroy(()=> {
        res.redirect('/iniciar-sesion');
    });
}

//generar un token si el usuario a recuperar es válido 

exports.enviarToken = async (req, res) => {
    //verificar que el usuario existe
    const {email} = req.body;
    const usuario = await Usuarios.findOne({where:{email}});
    
    //si no existe el usuario
    if(!usuario){
        req.flash('error','No existe esa cuenta');
        res.render('restablecer',{
            nombrePagina: 'Restablecer tu contraseña',
            mensajes: req.flash()
        });
    }

    //el usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000;

    //guardar en la base de datos
    await usuario.save();

    //reset URL

    const resetUrl = `http://${req.headers.host}/restablecer/${usuario.token}`;
    
    //envía el correo con el token

    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'restablecerPassword'
    });

    res.redirect('/iniciar-sesion');

}

exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({where:{
        token: req.params.token
    }});

    if(!usuario){
        req.flash('error', 'No Válido');
        res.render('restablecer',{
            nombrePagina: 'Restablecer tu contraseña',
            mensajes: req.flash()
        });
    }

    //formulario para generar el password

    res.render('resetPassword',{
        nombrePagina: 'Restablecer Contraseña'
    });

}

//cambia el password por uno nuevo

exports.actualizarPassword = async(req, res) => {

    //verifica el token válido y la fecha de expiracion
    const usuario = await Usuarios.findOne({where:{
        token: req.params.token,
        expiracion: {
            [Op.gte] : Date.now()
        }
    }});

    //verificamos si el usuario existe:

    if(!usuario){
        req.flash('error', 'No Válido');
        res.render('restablecer',{
            nombrePagina: 'Restablecer tu contraseña',
            mensajes
        });
    }

    //hashear el nuevo password
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;
    
    //guardamos el nuevo password:

    await usuario.save();

    req.flash('correcto', 'Tu password se ha modificado correctamente')
    res.redirect('/iniciar-sesion');
}