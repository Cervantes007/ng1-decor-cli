const fs = require('fs');
const chalk = require('chalk');
const util = require('../../util');
exports.command = 'module <name>';
exports.desc = 'Add feature module named <name>';
exports.builder = {};
exports.handler = function (argv) {
    const name = argv.name;
    const type = 'module';
    const fileToCreate = `${name}/index.ts`;
    fs.exists(fileToCreate, (exists) => {
        if (exists) {
            console.log(chalk.red(`${type} ${name} already exists`));
        } else {
            fs.mkdir(`${name}`, () => {
                let writeStreamBarrel = fs.createWriteStream(`${name}/index.ts`);
                writeStreamBarrel.end();
                util.addToFlow(name);
            });
        }
    });
};