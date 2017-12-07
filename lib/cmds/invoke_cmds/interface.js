const fs = require('fs');
const chalk = require('chalk');
const util = require('../../util');
exports.command = 'interface <name>';
exports.desc = 'Add interface named <name>';
exports.builder = {};
exports.handler = function (argv) {
    const name = argv.name;
    const type = 'interface';
    const fileToCreate = `${name}.${type}.ts`;
    fs.exists(fileToCreate, (exists) => {
        if (exists) {
            console.log(chalk.red(`${type} ${name} already exists`));
        } else {
            let writeStreamTs = fs.createWriteStream(`${name}.interface.ts`);
            writeStreamTs.write(`export enum I${util.snakeToCamel(name, true)} {}
`);
            writeStreamTs.on('finish', () => {
                console.log(chalk.green(`created ${name}.interface.ts`));
            });
            writeStreamTs.end();
        }
    });
};