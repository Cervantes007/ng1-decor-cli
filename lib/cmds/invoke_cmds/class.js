const fs = require('fs');
const chalk = require('chalk');
const util = require('../../util');
exports.command = 'class <name>';
exports.desc = 'Add class named <name>';
exports.aliases = ['cs'];
exports.builder = {};
exports.handler = function (argv) {
    const name = argv.name;
    const type = 'cs';
    const fileToCreate = `${name}.${type}.ts`;
    fs.exists(fileToCreate, (exists) => {
        if (exists) {
            console.log(chalk.red(`${type} ${name} already exists`));
        } else {
            let writeStreamTs = fs.createWriteStream(`${name}.${type}.ts`);
            writeStreamTs.write(`export class ${util.snakeToCamel(name, true)} {}
`);
            writeStreamTs.on('finish', () => {
                console.log(chalk.green(`created ${name}.${type}.ts`));
            });
            writeStreamTs.end();
        }
    });
};