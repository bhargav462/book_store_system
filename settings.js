const config = require('./config.json');

module.exports = {
    POSTGRES_CONFIG: config.POSTGRES_CONFIG || {}
};
