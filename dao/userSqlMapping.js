/**
 * Created by rocland on 2017/1/29.
 */
//CRUD SQL
var user = {
    login: 'select * from user where name =? and password=?'
};

module.exports = user;