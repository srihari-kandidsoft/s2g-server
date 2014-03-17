var sql = require('./sql_connect');

module.exports = {
    register_user: function (req, res, next) {
        var query = "INSERT INTO Users(Email, Password) VALUES('" + req.params.email_id +
            "','" + req.params.password + "')";
        sql.execute(query, res, function () {
            res.send('success');
            return next();
        });
    }
};


