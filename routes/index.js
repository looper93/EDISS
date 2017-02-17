var express = require('express');
var router = express.Router();
var pool = require('./db');

function IsNum(s) {
    if (s != null && s != "") {
      return !isNaN(s);
    }
    return false;
}

router.post('/add', function(req, res, next) {
    var num1 = req.body.num1;
    var num2 = req.body.num2;
    if (!req.session.logged) {
        res.json({
            message: 'You are not currently logged in'
        });
    }
    else if (IsNum(num1) && IsNum(num2)) {
        res.json({
            message: 'The action was successful',
            result: num1 + num2
        });
    }
    else {
        res.json({
            message:'The numbers you entered are not valid'
        });
    }
});
router.post('/divide', function(req, res, next) {
    var num1 = req.body.num1;
    var num2 = req.body.num2;
    console.log(num1);
    console.log(num2);
    if (!req.session.logged) {
        res.json({
            message: 'You are not currently logged in'
        });
    }
    else if (IsNum(num1) && IsNum(num2) && num2 != 0) {
        res.json({
            message: 'The action was successful',
            result: num1 / num2
        });
    }
    else {
        res.json({
            message:'The numbers you entered are not valid'
        });
    }
});
router.post('/multiply', function(req, res, next) {
    var num1 = req.body.num1;
    var num2 = req.body.num2;
    if (!req.session.logged) {
        res.json({
            message: 'You are not currently logged in'
        });
    }
    else if (IsNum(num1) && IsNum(num2)) {
        res.json({
            message: 'The action was successful',
            result: num1 * num2
        });
    }
    else {
        res.json({
            message:'The numbers you entered are not valid'
        });
    }
});
router.post('/login', function(req, res, next) {
    var name = req.body.username;
    var password = req.body.password;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("error on pool");
            res.redirect("/");
            return;
        }
        connection.query('select * from user where username = ?  and password = ?', [name, password],
            function (err, result) {
                connection.release();
                if(!err) {
                    console.log("database connected");
                    if(result[0]) {
                        req.session.logged = true;
                        req.session.username = name;
                        req.session.fname = result[0].fname;
                        res.json({
                            message: 'Welcome ' + req.session.fname
                        });
                    }
                    else {
                        res.json({
                            message: 'There seems to be an issue with the username/password combination that you entered'
                        });
                    }
                }
            });
        connection.on('error', function(err) {
           res.redirect("/");
        });
    });
});
router.post('/logout', function(req, res, next) {
    if (req.session.logged) {
        req.session.destroy(function () {
            res.json({
                message:'You have been successfully logged out'
            });
        });
    }
    else {
        res.json({
            message:'You are not currently logged in'
        });
    }
});
router.post('/registerUser', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("error on pool");
            res.redirect("/");
            return;
        }
        try {
            if (req.body.username == "" || req.body.fname == ""
                || req.body.lname == "" || req.body.address == ""
                || req.body.city == "" || req.body.state == ""
                || req.body.zip == "" || req.body.email == ""
                || req.body.password == "") {
                res.json({
                    message: 'The input you provided is not valid'
                });
                return;
            }
            var query = connection.query('INSERT INTO user SET ?', req.body,
                function (err, result) {
                    connection.release();

                    if (!err) {
                        res.json({
                            message: req.body.fname + ' was registered successfully'
                        });
                    }
                    else {

                    }
                });
            console.log(query.sql);
        }catch(e) {
            res.json({
                message: 'The input you provided is not valid'
            });
        }

    });
});
router.post('/updateInfo', function (req, res, next) {
    if (!req.session.logged) {
        res.json({
            message : 'You are not currently logged in'
        });
    }
    else {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("error on pool");
                res.redirect("/");
                return;
            }
            var query = connection.query(
                'UPDATE user SET ? where username = ?',
                [req.body, req.session.username],
                function (err, result) {
                    connection.release();
                    if(err) {
                        res.json({
                            message : 'The input you provided is not valid'
                        });
                    }
                    else {
                        if (req.body.username != undefined)
                            req.session.username = req.body.username;
                        if (req.body.fname != undefined)
                            req.session.fname = req.body.fname;
                        res.json({
                            message : req.session.fname + ' your information was successfully updated'
                        });
                    }
                });
            console.log(query.sql);
        });
    }
});
router.post('/addProducts', function (req, res, next) {
    if (!req.session.logged) {
        res.json({
            message : 'You are not currently logged in'
        });
    }
    else if (req.session.username != 'jadmin') {
        res.json({
            message : 'You must be an admin to perform this action'
        });
    }
    else {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("error on pool");
                res.redirect("/");
                return;
            }
            var query = connection.query('INSERT INTO product SET ?', req.body,
                function (err, result) {
                    connection.release();
                    if(!err) {
                        res.json({
                            message : req.body.productName + ' was successfully added to the system'
                        });
                    }
                    else {
                        res.json({
                            message : 'The input you provided is not valid'
                        });
                    }
                });
            console.log(query.sql);
        });
    }
});
router.post('/modifyProduct', function (req, res, next) {
    if (!req.session.logged) {
        res.json({
            message : 'You are not currently logged in'
        });
    }
    else if (req.session.username != 'jadmin') {
        res.json({
            message : 'You must be an admin to perform this action'
        });
    }
    else {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("error on pool");
                res.redirect("/");
                return;
            }
            var query = connection.query(
                'UPDATE product SET productName = ?, productDescription = ?, `group` = ? where asin = ?',
                [req.body.productName, req.body.productDescription, req.body.group, req.body.asin],
                function (err, result) {
                    connection.release();
                    if(err) {
                        res.json({
                            message : 'The input you provided is not valid'
                        });
                    }
                    else {
                        res.json({
                            message : req.body.productName + ' was successfully updated'
                        });
                    }
                });
            console.log(query.sql);
        });
    }
});
router.post('/viewUsers', function (req, res, next) {

    if (!req.session.logged) {
        res.json({
            message : 'You are not currently logged in'
        });
    }
    else if (req.session.username != 'jadmin') {
        res.json({
            message : 'You must be an admin to perform this action'
        });
    }
    else {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("error on pool");
                res.redirect("/");
                return;
            }
            var fname = req.body.fname;
            var lname = req.body.lname;
            var q = 'SELECT fname, lname, userId from user';
            if (fname != undefined && lname != undefined)
                q += ' where fname like \'%' + fname + '%\' and lname like \'%' + lname + '%\'';
            else if (fname != undefined)
                q += ' where fname like \'%' + fname + '%\'';
            else if (lname != undefined)
                q += ' where lname like \'%' + lname + '%\'';
            var query = connection.query(q, function (err, result) {
                    connection.release();
                    if(err || result.length == 0) {
                        res.json({
                            message : 'There are no users that match that criteria'
                        });
                    }
                    else {
                        res.json({
                            message : 'The action was successful',
                            user : result
                        });
                    }
                });
            console.log(query.sql);
        });
    }
});
router.post('/viewProducts', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("error on pool");
            res.redirect("/");
            return;
        }
        var asin = req.body.asin;
        var group = req.body.group;
        var keyword = req.body.keyword;
        var q = 'SELECT asin, productName from product';
        if (asin || group || keyword)
            q += ' where ';
        if (asin)
            q += 'asin = \'' + asin + '\'';
        if (group) {
            if (asin)
                q += ' and ';
            q += '`group` = \'' + group + '\'';
        }
        if (keyword) {
            if (asin || group)
                q += ' and ';
            q += '(productName like \'%' + keyword + '%\' or productDescription like \'%' + keyword + '%\')';
        }
        var query = connection.query(
            q,
            function (err, result) {
                connection.release();
                if(err || result.length == 0) {
                    res.json({
                        message : 'There are no products that match that criteria'
                    });
                }
                else {
                    res.json({
                        product : result
                    });
                }
            });
        console.log(query.sql);
    });
});
module.exports = router;
