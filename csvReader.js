
//This assumes that you're using mysql.  You'll need to change this if you're using another database
var mysql      = require('mysql'),
    co         = require('co'),
    wrapper    = require('co-mysql');
    parse      = require('csv-parse');
    fs         = require('fs');
    csv        = require('fast-csv');
var fileName = "alsoBought.csv";


//You need to change this to be appropriate for your system
var pool = mysql.createPool({
    host: 'ediss.ckmuc2yg8ii6.us-west-2.rds.amazonaws.com',
    port: '3306',
    user: 'root',
    password: 'edisspassword',
    database: 'EDISS',
});

var stream = fs.createReadStream(fileName);
var csvStream = csv()
    .on("data", function(data) {
        var len = data.length;
        var sql = "insert into record (asin1, asin2) values ";
        for(var i = 0; i < len; i++) {
            for(var j = 0; j < len; j++) {
                if (i != j && data[i] != "" && data[j] != "")
                    sql += "('" + data[i] + "', '" + data[j] + "'), ";
            }
        }
        sql = sql.substring(0, sql.length - 2);
        sql += ";";
        pool.query(sql, function(err, result){
            if (err) {
                console.log(err);
            }
            console.log(sql);
        });

    })
    .on("end", function(){
        console.log("done");
    });
stream.pipe(csvStream);
