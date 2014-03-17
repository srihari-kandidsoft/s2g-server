var mysql = require('mysql');
mysqlConfiguration = 'development';
var mysqlConfigs = {
    'development': {
        host: 'share2give-db-instance.caobw7uurd0v.us-west-1.rds.amazonaws.com',
        password: 'share2give2014',
        user: 'share2give',
        database: 'share2give_db'
    },
}

module.exports = {
    query: function (query, res, next) {
        get_connection(function (connection) {
            connection.query(query, function (err, rows, fields) {
                if (err) {
                    throw err;
                } else {
                    return next(rows);
                }
            });
        });
    },
    execute: function (query, res, next) {
        get_connection(function (connection) {
            connection.query(query, function (err, rows, fields) {
                if (err) {
                    throw err;
                } else {
                    return next();
                }
            });
        });
    },
};

function get_connection(next) {
    var connection =
        mysql.createConnection({
            host: mysqlConfigs[mysqlConfiguration]['host'],
            user: mysqlConfigs[mysqlConfiguration]['user'],
            password: mysqlConfigs[mysqlConfiguration]['password'],
            database: mysqlConfigs[mysqlConfiguration]['database']
        });

    return next(connection);
}