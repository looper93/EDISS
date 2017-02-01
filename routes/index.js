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
        console.log("here we are");
        res.json({
            message:'The numbers you entered are not valid'
        });
    }
});
router.post('/divide', function(req, res, next) {
    var num1 = req.body.num1;
    var num2 = req.body.num2;
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
        connection.query('select * from user where name = ?  and password = ?', [name, password],
        function (err, result) {
            connection.release();
            if(!err) {
                console.log("database connected");
                if(result[0]) {
                    req.session.logged = true;
                    req.session.username = name;
                    res.json({
                        message: 'Welcome ' + result[0].first_name
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
module.exports = router;
