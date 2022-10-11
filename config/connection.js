// import the Sequelize constructor from the library
const Sequelize = require('sequelize');
require('dotenv').config(); // need this
// create connection to our database, pass in your MySQL information for username and password
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { 
  host: 'localhost',          //^^ this executes the info from .env
  dialect: 'mysql',
  port: 3306
});

module.exports = sequelize;

//The new Sequelize() function accepts the database name, MySQL username, and MySQL password (respectively) as parameters, then we also pass configuration settings