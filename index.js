module.exports = {
    init: require('./src/commands/init'),
    ls: require('./src/commands/ls'),
    sync: require('./src/commands/sync'),
    external: {
        chalk: require('chalk'),
        mime: require('mime')
    }
};