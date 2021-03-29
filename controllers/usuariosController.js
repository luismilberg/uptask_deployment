const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

exports.formCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crear Cuenta en UpTask'
    });
}

exports.crearCuenta = async (req, res) => {
    //leer los datos que

    const {email, password} = req.body;

    try {

        //crear un usuario

        await Usuarios.create({email: email, password: password});

        //crear una URL para confirmar el usuario

        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

        //crear el objeto de usuario 

        const usuario = {
            email
        }

        //enviar el email

        await enviarEmail.enviar({
            usuario,
            subject: 'Confirma tu cuenta UpTask',
            confirmarUrl,
            archivo: 'confirmarCuenta'
        });

        //redirigir al usuario
        req.flash('correcto', 'Enviamos un correo, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
        
    } catch (error) {

        console.log(error);
        req.flash('error', error.errors.map(error => error.message));
        res.render('crearCuenta',{
            mensajes: req.flash(),
            nombrePagina: 'Crear cuenta en UpTask',
            email, 
            password
        });

    }
}

exports.formIniciarSesion = (req, res) => {
    const {error} = res.locals.mensaje;
    res.render('iniciarSesion', {
        nombrePagina: 'Inicar Śesión en UpTask',
        error
    })
}

exports.formRestablecerPassword = (req,res) => {
    res.render('restablecer', {
        nombrePagina: 'Restablecer tu contraseña'
    });
}


//cambia el estado de una cuenta
exports.confirmarCuenta = async (req,res) => {
    const usuario = await Usuarios.findOne({where:{
        email: req.params.correo
    }});

    if(!usuario){
        req.flash('error', 'Cuenta no existente');
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1;
    await usuario.save();
    req.flash('correcto', 'Cuenta activada correctamente');
    res.redirect('/iniciar-sesion');
}