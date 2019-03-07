const mysql = require('mysql');
const createError = require('http-errors');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1212',
  database: 'library',
});

function read(id, cb) {
  connection.query('SELECT * FROM books WHERE id = ?', [id], function(err, result) {
    if (err) return cb(err);
    if (result.length === 0) {
      return cb(createError(404, 'Book not found'));
    }
    return cb(null, result[0]);
  });
}

function readAll(cb) {
  connection.query('SELECT * FROM books', function(err, result) {
    if (err) return cb(err);
    if (result.length === 0) {
      return cb(createError(404, 'Book not found'));
    }
    return cb(null, result);
  });  
}

function create(book, cb) {
  if (!hasAllKeys(book)) {
    console.log('OBJECT', book);
    return cb(createError(400, 'All keys required.'));
  }
  
  let details = [book.name, book.author, book.description, book.year, book.price];
  connection.query(
    'INSERT INTO books (name, author, description, year, price) VALUES (?, ?, ?, ?, ?)', details, function(error, result) {
      if (error) return cb(error);
      return cb(null, result.insertId);
    }
  );
}

function update(id, book, cb) {
  if(!hasOneKey(book)) return cb(createError(400, 'At least one key required.'));
  connection.query(buildPutQuery(book, id), function(err, res) {
    if (err) return cb(err);
    return cb(null, res.insertId);
  });
}

function remove(id, cb) {
  connection.query('DELETE FROM books WHERE id = ' + id, function(err, res) {
    if (err) return cb(err);
    return cb(null, res.affectedRows);
  });
}

function hasAllKeys(book) {
  let jsKeys = Object.keys(book);
  // if (jsKeys === [] || jsKeys === null)
  //   return false;
  const dbKeys = ['name', 'author', 'description', 'year', 'price'];
  let flag = true;
  dbKeys.forEach(k => flag = flag && jsKeys.includes(k));
  return flag;
}

function hasOneKey(book) {
  let jsKeys = Object.keys(book);
  if (jsKeys.length === 0)
    return false;
  const dbKeys = ['name', 'author', 'description', 'year', 'price'];
  let flag = false;
  dbKeys.forEach(k => { if (jsKeys.includes(k)) flag = true; });
  return flag;
}

function buildPutQuery(book, id) {
  let sqlStr = 'UPDATE books SET ';
  let keys = Object.keys(book);
  keys.forEach(k => {
    if(book[k])
      sqlStr += `${k} = "${book[k]}", `;
  });
  return sqlStr.substring(0, sqlStr.length - 2) + ` WHERE id = ${id};`;
}

module.exports = {
  create,
  read,
  readAll,
  update,
  remove
};
