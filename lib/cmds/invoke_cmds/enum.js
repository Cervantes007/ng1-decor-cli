const fs = require('fs');
const chalk = require('chalk');
const util = require('../../util');
exports.command = 'enum <name>';
exports.desc = 'Add enumerable named <name>';
exports.builder = {};
exports.handler = function (argv) {
    const name = argv.name;
    const type = 'enum';
    const fileToCreate = `${name}.${type}.ts`;
    fs.exists(fileToCreate, (exists) => {
        if (exists) {
            console.log(chalk.red(`${type} ${name} already exists`));
        } else {
            let writeStreamTs = fs.createWriteStream(`${name}.enum.ts`);
            writeStreamTs.write(`export enum ${util.snakeToCamel(name, true)} {}
`);
            writeStreamTs.on('finish', () => {
                console.log(chalk.green(`created ${name}.enum.ts`));
            });
            writeStreamTs.end();
        }
    });
};