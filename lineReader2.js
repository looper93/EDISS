/*
lineReader will extract the records from amazon-meta.txt one at a time as
file is too large to read all at once.  In order to add records to a database you need to add code below to insert records

This code depnds on "line-reader"

You need to install line-reader by using the following command:
npm install line-reader

*/

//This assumes that you're using mysql.  You'll need to change this if you're using another database
var mysql      = require('mysql'),
    co         = require('co'),
    wrapper    = require('co-mysql');
var query;
var jsonRecord;
var execute = true;
var query;
var totalRecords = 0;
var fs = require('fs');
var fileName = "productRecords.json";
// var fileName = "Samples.json";


var lineReader = require('line-reader');


//You need to change this to be appropriate for your system
var connection = mysql.createConnection({
    host: 'ediss.ckmuc2yg8ii6.us-west-2.rds.amazonaws.com',
    port: '3306',
    user: 'root',
    password: 'edisspassword',
    database: 'EDISS',
});

var sql = wrapper(connection);

var values = ""; //The records read from the file.
var arr = [];
var groups = [];
var numRecords = 0; //The current number of records read from the file.
var recordBlock = 50; //The number of records to write at once.

lineReader.eachLine(fileName, function(line, last) {
  execute = false;
  currentLine = line.toString();
  try{
    jsonRecord = JSON.parse(currentLine);
    //console.log(jsonRecord);
    //console.log(currentLine);
    var temp = [];
    temp.push(jsonRecord.title,jsonRecord.description,jsonRecord.asin);
    arr.push(temp);

    var asin = jsonRecord.asin;
    var categories = jsonRecord.categories;

    if(categories) {
        var arrayLength = categories.length;
        for (var i = 0; i < arrayLength; i++) {
            var groupLength = categories[i].length;
            for (var j = 0; j < groupLength; j++) {
                var temp = [];
                temp.push(categories[i][j], asin);
                groups.push(temp);
            }
        }
    }
    // if (numRecords) {
    //   // values += "\n";
    // }

    // values += `('${jsonRecord.title}', '${jsonRecord.categories}', '${jsonRecord.description}', '${jsonRecord.asin}')`;
    numRecords++;

    //Change the query to align with your schema
    if (numRecords == recordBlock) {
        var sql = "INSERT INTO product (productName, productDescription, asin) VALUES ?";
        connection.query(sql, [arr], function(err) {
            if (err) {
                console.log(err);
            }
        });
        sql = "REPLACE INTO groups (category, asin) VALUES ";
        for(var i = 0; i < groups.length; i++) {
            var gr = groups[i];
            sql = sql + "('"+ gr[0] + "' , '" + gr[1] + "')";
            if (i !== groups.length - 1)
                sql = sql + ", ";
        }
        sql = sql + ";";

        connection.query(sql, function (err) {
            if (err) {
                console.log(sql);
                console.log(err);
            }
        });
        groups = [];
        arr = [];
        numRecords = 0;
        execute = true;
    }
  }catch(err) {
    execute = false;//there was a quote in the text and the parse failed ... skip insert
    console.log(err);
  }

  if(execute){//***************Need to put logic to insert into your db*****************************************
    co(function* () {
        totalRecords += recordBlock;
        console.log(totalRecords + " records inserted.");
    });
  }//if(execute)
});//lineReader.eachLine
