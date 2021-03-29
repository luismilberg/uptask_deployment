const Sequilize = require('sequelize');
const db = require('../config/db');
const slug = require('slug');
const shortid = require('shortid');

const Proyectos = db.define('proyectos',{
    id : {
        type: Sequilize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: Sequilize.STRING(100),

    url: Sequilize.STRING(100)

}, {
    hooks: {
        beforeCreate(proyecto){
            const url = slug(proyecto.nombre).toLocaleLowerCase();

            proyecto.url = `${url}-${shortid.generate()}`;
        }
    }
});

module.exports = Proyectos;