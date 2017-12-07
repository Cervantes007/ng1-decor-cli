const fs = require('fs');
const chalk = require('chalk');
const util = require('../../util');
exports.command = 'pipe <name>';
exports.desc = 'Add pipe named <name>';
exports.builder = {};
exports.handler = function (argv) {
    const name = argv.name;
    const type = 'pipe';
    const fileToCreate = `${name}.${type}.ts`;
    fs.exists(fileToCreate, (exists) => {
        if (exists) {
            console.log(chalk.red(`${type} ${name} already exists`));
        } else {
            let writeStreamTs = fs.createWriteStream(`${name}.${type}.ts`);
            writeStreamTs.write(`import {Pipe, PipeTransform} from 'ng1-decor';

@Pipe({
    name: '${util.snakeToCamel(name)}'
})
export class ${util.snakeToCamel(name, true)}Pipe implements PipeTransform {
    public transform(data: any[]): any {
        return data;
    }
}
`);
            writeStreamTs.on('finish', () => {
                console.log(chalk.green(`created ${name}.${type}.ts`));
            });
            writeStreamTs.end();

            util.addToFlow(`${name}.${type}`);
        }
    });
};