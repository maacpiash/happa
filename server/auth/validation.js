const userDB = require('../db/users');

const users = userDB.getUsers().length;

console.log(users);