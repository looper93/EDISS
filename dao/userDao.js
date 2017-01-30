/**
 * Created by rocland on 2017/1/29.
 */
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./userSqlMapping');
var session = require('session');
// Use Pool to improve performance
var pool  = mysql.createPool($util.extend({}, $conf.mysql));


// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, result) {
    if(typeof result === 'undefined') {
        res.json({
            message: 'There seems to be an issue with the username/password combination that you entered'
        });
    } else {
        res.json(result);
    }
};

module.exports = {
    login: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            // 获取前台页面传过来的参数
            var param = req.query || req.params;

            // 建立连接，登陆
            // 'Select * from user(id, name, password) where name = ? and password = ?',
            connection.query($sql.login, [param.username, param.password], function(err, result) {
                if(result) {
                    result = {
                        message:'Welcome ' + param.username
                    };
                    session.logged = true;
                    session.user = param.username;
                }
                // 以json形式，把操作结果返回给前台页面
                jsonWrite(res, result);
                // 释放连接
                connection.release();
            });
        });
    }
};