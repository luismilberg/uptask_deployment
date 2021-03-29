const { Sequelize } = require('sequelize');
//extraer valores de variables

require('dotenv').config({path: 'variables.env'});

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS, {
    port: process.env.BD_PORT,
    host: process.env.BD_HOST,
    dialect: 'mysql'
  });


module.exports = db;