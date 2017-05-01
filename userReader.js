
//This assumes that you're using mysql.  You'll need to change this if you're using another database
var mysql      = require('mysql'),
    co         = require('co'),
    wrapper    = require('co-mysql');
    parse      = require('csv-parse');
    fs         = require('fs');
    csv        = require('fast-csv');
var fileName = "userData.csv";


//You need to change this to be appropriate for your system
var pool = mysql.createPool({
    host: 'ediss.ckmuc2yg8ii6.us-west-2.rds.amazonaws.com',
    port: '3306',
    user: 'root',
    password: 'edisspassword',
    database: 'EDISS',
});

csv
    .fromPath(fileName, {delimiter : '|'})
    .on("data", function(data) {
        var len = data.length;
        var sql = "insert into user (fname, lname, address, city, state, zip, email, username, password) values (";
        for(var i = 0; i < 9; i++) {
            sql += "\"" + data[i] + "\", ";
        }
        sql = sql.substring(0, sql.length - 2);
        sql += ");";
        if (data[0] != 'fname') {
            pool.query(sql, function(err, result){
                if (err) {
                    console.log(err);
                    console.log(sql);
                }

            });
        }

    })
    .on("end", function(){
        console.log("done");
    });