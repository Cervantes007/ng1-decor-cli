const fs = require('fs');
const chalk = require('chalk');
const util = require('../../util');
exports.command = 'service <name>';
exports.desc = 'Add service named <name>';
exports.builder = {};
exports.handler = function (argv) {
    const name = argv.name;
    const type = 'service';
    const fileToCreate = `${name}.${type}.ts`;
    fs.exists(fileToCreate, (exists) => {
        if (exists) {
            console.log(chalk.red(`${type} ${name} already exists`));
        } else {
            let writeStreamTs = fs.createWriteStream(`${name}.${type}.ts`);
            writeStreamTs.write(`import {Injectable} from 'ng1-decor';

@Injectable({
    name: '${util.snakeToCamel(name)}Service'
})
export class ${util.snakeToCamel(name, true)}Service {}
`);
            writeStreamTs.on('finish', () => {
                console.log(chalk.green(`created ${name}.${type}.ts`));
            });
            writeStreamTs.end();
        }
    });
};