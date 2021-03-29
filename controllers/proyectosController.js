const { vardump } = require('../helpers');
const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');


exports.proyectosHome = async (req,res)=>{
    const UsuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where: {UsuarioId}});
    res.render('index', {
        nombrePagina: 'Proyectos',
        proyectos
    });
}

exports.formularioProyecto = async (req,res) => {
    const UsuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where: {UsuarioId}}); 

    res.render('nuevoProyecto', {
        nombrePagina: 'Nuevo Proyecto',
        proyectos
    });
}

exports.nuevoProyecto = async (req,res) => {
    const UsuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where: {UsuarioId}});

    // Enviar a la consola lo que escriba el usuario
    //validar que el input no esté vacío
    const {nombre} = req.body;
    let errores = [];
    if(!nombre){
        errores.push({'texto': 'Agrega un nombre al proyecto'});
    }

    //si hay errores
    if(errores.length > 0){
        res.render('nuevoProyecto',{
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        });
    } else {
        //No hay errores
        //Insertar en la BD
        await Proyectos.create({nombre, UsuarioId});
        res.redirect('/');
            
    }

}

exports.proyectoPorUrl = async (req, res, next) => {
    const UsuarioId = res.locals.usuario.id;
    const proyectosPromise = Proyectos.findAll({where: {UsuarioId}});
    const proyectoPromise = Proyectos.findOne({
        where: {
            url: req.params.url
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise,proyectoPromise]);

    //consultar las tareas del proyecto actual:

    const tareas = await Tareas.findAll({
        where: {
            proyectoId: proyecto.id
        }
        // ,
        // include: [
        //     {model: Proyectos}
        // ]
    
    });
    

    if(!proyecto) {
        return next();
    }
    
    res.render('tareas',{
        nombrePagina: 'Tareas del proyecto',
        proyecto,
        proyectos,
        tareas
    });
}

exports.formularioEditar = async (req,res) => {
    const UsuarioId = res.locals.usuario.id;
    const proyectosPromise = Proyectos.findAll({where: {UsuarioId}});
    
    const proyectoPromise = Proyectos.findOne({
        where:{
            id:req.params.id
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    res.render('nuevoProyecto',{
        nombrePagina: 'Editar Proyecto',
        proyectos,
        proyecto
    });
}

exports.actualizarProyecto = async (req,res) => {
    const UsuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where: {UsuarioId}});

    // Enviar a la consola lo que escriba el usuario
    //validar que el input no esté vacío
    const {nombre} = req.body;
    let errores = [];
    if(!nombre){
        errores.push({'texto': 'Agrega un nombre al proyecto'});
    }

    //si hay errores
    if(errores.length > 0){
        res.render('nuevoProyecto',{
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        });
    } else {
        //No hay errores
        //Insertar en la BD
        await Proyectos.update(
            { nombre: nombre},
            { where: {id: req.params.id}}
        );
        res.redirect('/');
            
    }

}

exports.eliminarProyecto = async (req, res, next) => {
    const {urlProyecto} = req.query;
    const resultado = await Proyectos.destroy({where: {url: urlProyecto}});
    if(!resultado){
        return next();
    }
    res.status(200).send('Proyecto eliminado correctamente');
}