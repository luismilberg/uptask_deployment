const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


//referencia al modelo donde vamos a autenticarnos
const Usuarios = require('../models/Usuarios');

//local strategy - Login con credenciales propias (mail y password)

passport.use(
    new LocalStrategy(
        //por default passport espera un usuario y password
        { 
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const usuario = await Usuarios.findOne({where:{
                    email, 
                    activo: 1
                }});
                //Password incorrecto
                if(!usuario.verificarPassword(password)){
                    return done(null, false, {
                        message: 'Password Incorrecto'
                    });
                }

                //El email existe y el password es correcto

                return done(null, usuario);
            } catch (error) {
                // Ese usuario no existentes
                return done(null, false, {
                    message: 'Ese usuario no existe'
                });
            }
        }
    )
);

//Serializar el usuario
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
});

//Deserealizar el usuario
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario);
});

//exportar el

module.exports = passport;