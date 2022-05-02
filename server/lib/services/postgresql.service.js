const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    database: 'ticks',
    password: '4wy11dnl',
    port: 5432,
    host: 'database-2.chibojorgjcv.eu-west-2.rds.amazonaws.com',
});

module.exports = { pool };
