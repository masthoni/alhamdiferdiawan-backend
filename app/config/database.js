const {dbHost, dbDriver, dbName, dbPass, dbPort, dbUser} = require('./config');

module.exports = {
  development: {
    username: dbUser,
    password: dbPass,
    database: dbName,
    host: dbHost,
    port: dbPort,
    dialect: dbDriver,
  },
  test: {
    username: dbUser,
    password: dbPass,
    database: dbName,
    host: dbHost,
    port: dbPort,
    dialect: dbDriver,
  },
  production: {
    sername: dbUser,
    password: dbPass,
    database: dbName,
    host: dbHost,
    port: dbPort,
    dialect: dbDriver,
  }
};