const chalk = require('chalk');
exports.command = '$0';
exports.desc = 'known command';
exports.builder = {};
exports.handler = function (argv) {
    console.log(chalk.yellow('Invoke options: [module], [component], [service], [model], [pipe], [interface], [enum]'));
};
