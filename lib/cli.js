

var commander = require('commander');
var fs = require('fs');
var chalk = require('chalk');

commander
    .command('add <type> <name>')
    .description('Add new component')
    .option('-s, --styles [type]', 'No add styles')
    .option('-t, --test', 'Add test file')
    .action(function(type, name, options) {
        const styleType = options.styles || 'scss';
        const fileToCreate = type === 'component' ? name : `${name}.${type}.ts`;
        fs.exists(fileToCreate, (exists) => {
            if (exists) {
                console.log(chalk.red(`${type} ${name} already exists`));
            } else {
                switch (type) {
                    case 'component':
                        fs.mkdir(`${name}`, () => {
                            addComponent(name, type, styleType, options);
                        });
                        break;
                    case 'service':
                        addService(name, type);
                        break;
                    case 'model':
                        addModel(name, type);
                        break;
                    case 'pipe':
                        addPipe(name, type);
                        break;
                    default:
                        console.log(chalk.yellow(`ng1-decor-cli can't proccess type: ${type} 
Availables types: [component], [service], [model], [pipe]`));
                        break;
                }
            }
        })

    })

commander.parse(process.argv)

if (commander.rawArgs.length <= 2) {
    commander.help()
}

function snakeToCamel(s, capitalize){
    if (capitalize) {
        s = s[0].toUpperCase() + s.slice(1);
    }
    return s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
}

function toModelResource(s) {
    return s.replace(/-/g, '/');
}

function automaticImport(lineToAddIntoBarrel, barrelFile, isEditingBarrel) {
    fs.appendFile('index.ts',
        `${lineToAddIntoBarrel}
`, (err) => {
            if (err) throw err;
            if (isEditingBarrel) {
                console.log(chalk.blue(`updated ${barrelFile}`));
            } else {
                console.log(chalk.green(`created ${barrelFile}`));
            }

        });
}

function addPipe(name, type) {
    let writeStreamTs = fs.createWriteStream(`${name}.${type}.ts`);
    writeStreamTs.write(`import {Pipe, PipeTransform} from 'ng1-decor';

@Pipe({
    name: '${snakeToCamel(name)}'
})
export class ${snakeToCamel(name, true)}Pipe implements PipeTransform {
    public transform(data: any[]): any {
        return data;
    }
}`);
    writeStreamTs.on('finish', () => {
        console.log(chalk.green(`created ${name}.${type}.ts`));
    });
    writeStreamTs.end();

    addToFlow(`${name}.${type}`);
}

function addService(name, type) {
    let writeStreamTs = fs.createWriteStream(`${name}.${type}.ts`);
    writeStreamTs.write(`import {Injectable} from 'ng1-decor';

@Injectable({
    name: '${snakeToCamel(name)}Service'
})
export class ${snakeToCamel(name, true)}Service {}`);
    writeStreamTs.on('finish', () => {
        console.log(chalk.green(`created ${name}.${type}.ts`));
    });
    writeStreamTs.end();
}

function addModel(name, type) {
    let writeStreamTs = fs.createWriteStream(`${name}.${type}.ts`);
    writeStreamTs.write(`import {Injectable} from 'ng1-decor';

@Injectable({
    name: '${snakeToCamel(name)}Model'
})
export class ${snakeToCamel(name, true)}Model extends BaseModel {
    constructor() {
        super('/bk/${toModelResource(name)}');
    }
}`);
    writeStreamTs.on('finish', () => {
        console.log(chalk.green(`created ${name}.${type}.ts`));
    });
    writeStreamTs.end();
}

function addComponent(name, type, styleType, options) {
    // Typescript file
    let writeStreamTs = fs.createWriteStream(`${name}/${name}.${type}.ts`);
    writeStreamTs.write(`import { Component } from 'ng1-decor';
import './${name}.component.${styleType};'
            
@Component({
    selector: '${name}',
    template: require('./${name}.component.html')
})
export class ${snakeToCamel(name, true)}Component {}
`);
    writeStreamTs.on('finish', () => {
        console.log(chalk.green(`created ${name}/${name}.${type}.ts`));
    });
    writeStreamTs.end();

    // HTML File
    let writeStreamHTML = fs.createWriteStream(`${name}/${name}.${type}.html`);
    writeStreamHTML.write(`<div class="${name}-component">
    Works!
</div>`);
    writeStreamHTML.on('finish', () => {
        console.log(chalk.green(`created ${name}/${name}.${type}.html`));
    });
    writeStreamHTML.end();

    //Style File

    let writeStreamSCSS = fs.createWriteStream(`${name}/${name}.${type}.${styleType}`);
    writeStreamSCSS.write(`.${name}-component {
    color: red;
}
`);
    writeStreamSCSS.on('finish', () => {
        console.log(chalk.green(`created ${name}/${name}.${type}.${styleType}`));
    });
    writeStreamSCSS.end();

    // Internal Barrel File
    let writeStreamBarrel = fs.createWriteStream(`${name}/index.ts`);
    writeStreamBarrel.write(`export * from './${name}.${type}.ts';
`);
    writeStreamBarrel.on('finish', () => {
        console.log(chalk.green(`created ${name}/index.ts`));
    });
    writeStreamBarrel.end();

    addToFlow(name);

    //Test File
    if (options.test) {
        let writeStreamBarrel = fs.createWriteStream(`${name}/${name}.${type}.spect.ts`);
        writeStreamBarrel.write(`test('two plus two', () => {
    let value: number = 2 + 2;
    expect(value).toBe(4);
});`);
        writeStreamBarrel.on('finish', () => {
            console.log(chalk.green(`created ${name}/${name}.${type}.spect.ts`));
        });
        writeStreamBarrel.end();
    }
}

function addToFlow(name) {
    // External Barrel Automatic Import
    const lineToAddIntoBarrel = `export * from './${name}';`;
    const barrelFile = `index.ts`;
    let isEditingBarrel = false;
    let canAddToBarrel = true;
    fs.exists(`${barrelFile}`, (exists) => {
        if (exists) {
            isEditingBarrel = true;
            fs.readFile(barrelFile, 'utf8', function(err, data) {
                // if (err) throw err;
                if (!err) {
                    if (data.indexOf(lineToAddIntoBarrel) >= 0) {
                        canAddToBarrel = false;
                        console.log(chalk.red(`${lineToAddIntoBarrel} already exists in ${barrelFile}`));
                    } else {
                        automaticImport(lineToAddIntoBarrel, barrelFile, isEditingBarrel);
                    }
                }
            });
        } else {
            automaticImport(lineToAddIntoBarrel, barrelFile, isEditingBarrel);
        }
    });
}