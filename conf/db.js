/**
 * Created by rocland on 2017/1/29.
 */
//MySQL configurations
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'ediss.ckmuc2yg8ii6.us-west-2.rds.amazonaws.com',
    port: '3306',
    user: 'root',
    password: 'edisspassword',
    database: 'ediss',
    debug: false
});

module.exports = pool;