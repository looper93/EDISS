var express = require('express');
var router = express.Router();
var pool = require('./db');
var cookie = require('cookie');

router.get('/', function(req, res, next) {
    res.json({
        message : 'For ELB settings.'
    });
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
                    if(result[0]) {
                        req.session.logged = true;
                        req.session.username = name;
                        req.session.fname = result[0].fname;
                        req.session.userId = result[0].userId;
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
                || req.body.city == ""  || req.body.state == ""
                || req.body.zip == ""   || req.body.email == ""
                || req.body.password == "") {
                console.log("missing register parameters");
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
                        res.json({
                            message: 'The input you provided is not valid'
                        });
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
//test needed
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
            var query = connection.query('INSERT INTO product SET asin = ?, productName = ?, productDescription = ?',
                [req.body.asin, req.body.productName, req.body.productDescription],
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
            var sql = "REPLACE INTO groups (category, asin) VALUES ";
            for(var i = 0; i < req.body.group.length; i++) {
                sql = sql + "('"+ req.body.group[i] + "' , '" + req.body.asin + "')";
                if (i !== req.body.group.length - 1)
                    sql = sql + ", ";
            }
            sql = sql + ";";
            query = connection.query(sql, function (err) {
                if (err)
                    console.log(err);
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
                'UPDATE product SET productName = ?, productDescription = ? where asin = ?',
                [req.body.productName, req.body.productDescription, req.body.asin],
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
            var sql = "REPLACE INTO groups (category, asin) VALUES ";
            for(var i = 0; i < req.body.group.length; i++) {
                sql = sql + "('"+ req.body.group[i] + "' , '" + req.body.asin + "')";
                if (i !== req.body.group.length - 1)
                    sql = sql + ", ";
            }
            sql = sql + ";";
            query = connection.query(sql, function (err) {
                if (err)
                    console.log(err);
            });
            console.log(sql);
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
        //select * from product where
        // asin = 'asin' and
        // (match(productName) against ('keyword') OR
        // match(productDescription) against ('keyword')) and
        // asin in (select asin from groups where category = group)
        // LIMIT 20;
        var asin = req.body.asin;
        var group = req.body.group;
        var keyword = req.body.keyword;
        var q = 'SELECT asin, productName from product';
        if (asin || group || keyword)
            q += ' where ';
        if (asin)
            q += 'asin = \'' + asin + '\'';
        if (keyword) {
            if (asin)
                q += ' AND ';
            q += '(MATCH (productName) against (\'' + keyword +
                '\') OR MATCH (productDescription) against (\'' + keyword + '\'))';
        }
        if (group) {
            if (asin || keyword)
                q += ' AND ';
            q += 'asin in (select asin from groups where category = \'' + group + '\')';
        }
        q += ' LIMIT 20;';
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

router.post('/buyProducts', function (req, res, next){
    if (!req.session.logged) {
        res.json({
            message : 'You are not currently logged in'
        });
        return;
    }
    var username = req.session.username;
    var products = req.body.products;
    //没有考虑有的asin不存在的情况
    var sql = "select id, asin from product where asin in (";
    for(var i = 0; i < products.length; i++) {
        sql += "'" + products[i]['asin'] + "', ";
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ");";
    console.log(sql);
    pool.query(sql, function (err, result) {
        if(err || result.length == 0) {
            res.json({
                message : 'There are no products that match that criteria'
            });
            return;
        }
        sql = "insert into orders (userId, productId) values ";
        for (var i = 0; i < result.length; i++) {
            sql += "(" + req.session.userId + ", " + result[i]['id'] + "), ";
        }
        if (result.length > 1) {
            var sql_for_record = "insert into record (asin1, asin2) values ";
            for( var i = 0; i < result.length; i++) {
                for( var j = 0; j < result.length; j++) {
                    if (i != j)
                        sql_for_record += "(" + result[i]['asin'] + ", " + result[j]['asin'] + "), ";
                }
            }
            sql_for_record = sql_for_record.substring(0, sql_for_record.length - 2);
            sql_for_record += ";";
            pool.query(sql_for_record);
        }
        sql = sql.substring(0, sql.length - 2);
        sql += ";";
        pool.query(sql, function (err, result){
            if (err) {
                res.json({
                    message : 'There are no products that match that criteria'
                });
            }
            else {
                res.json({
                    message : 'The action was successful'
                });
            }});
    });
});
router.post('/productsPurchased', function (req, res, next){
    pool.getConnection(function (err, connection) {
        var username = req.body.username;
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
                var sql = "select productName, count(*) AS quantity " +
                          "from product p left join orders o on p.id = o.productId left join user u on u.userId = o.userId " +
                          "where u.username = '" + username + "' group by p.id; ";
                query = connection.query(sql, function(err, result){
                    if (err || result[0] == undefined) {
                        res.json({
                            message : 'There are no users that match that criteria'
                        });
                    }
                    else {
                        res.json({
                            message : 'The action was successful',
                            products : result
                        })
                    }
                })
            });

        }
    });
});
router.post('/getRecommendations', function (req, res, next){
    var asin = req.body.asin;
    pool.getConnection(function (err, connection) {
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
                var sql = "select asin2 as asin, count(*) as quantity from record r where r.asin1 = '"
                    + asin + "' group by r.asin2 order by quantity;";
                var query = connection.query(sql, function (err, result) {
                   if (err || result.length == 0) {
                       res.json({
                           message : 'There are no recommendations for that product'
                       });
                   }
                   else {
                       var product = [];
                       for(var i = 0; i < 5 && i < result.length; i++) {
                           product.push({"asin" : result[i]['asin']});
                       }
                       res.json({
                           message : 'The action was successful',
                           products : product
                       })
                   }
                });
            });
        }
    });
});
module.exports = router;
