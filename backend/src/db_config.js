const mysql = require ('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'magic',
    database: 'project_tec'
});

connection.connect((err) =>{
    if(err) {
        throw err;
    }   else {
        console.log('vai corinthians')
    }
});

module.exports = connection;