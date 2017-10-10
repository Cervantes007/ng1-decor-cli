var commander = require('commander');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');
var shell = require("shelljs");
var Spinner = require('cli-spinner').Spinner;
var depSpin = new Spinner(chalk.yellow('Checking for update.. %s'));

commander
    .command('outdated')
    .description('I am updated?')
    .action(function() {
        checkForUpdates();
    });

function checkForUpdates() {
    var dns = require('dns');
    dns.lookupService('8.8.8.8', 53, function(err, hostname, service){
        if(err)
            console.log("Not available")
        else {
            try {
                depSpin.setSpinnerString(25);
                depSpin.start();
                shell.exec('$(npm bin)/ncu -g ng1-decor-cli', () => {
                    depSpin.stop();
                });
            } catch (e) {}
        }
    });
}

commander
    .version('1.2.0')
    .command('routing <name> [route] [layout]')
    .description('Add the given component to the route')
    .action(function(component, route, layout) {
        routing(component, route, layout);
    });

commander
    .command('add <type> <name> [dirName]')
    .description('Add new component')
    .option('-s, --styles [type]', 'No add styles')
    .option('-t, --test', 'Add test file')
    .option('-r, --routing [route]', 'Add to module route')
    .option('-l, --layout [layout]', 'Update route layout')
    .action(function(type, name, dirName, options) {
        const styleType = options.styles || 'scss';
        const fileToCreate = type === 'component' ? (dirName || name) : `${name}.${type}.ts`;
        fs.exists(fileToCreate, (exists) => {
            if (exists) {
                console.log(chalk.red(`${type} ${name} already exists`));
            } else {
                switch (type) {
                    case 'component':
                        fs.mkdir(`${dirName || name}`, () => {
                            addComponent(name, type, styleType, options, dirName);
                        });
                        break;
                    case 'service':
                        addService(name, type);
                        break;
                    case 'model':
                        addModel(name, type);
                        break;
                    case 'enum':
                        addEnum(name);
                        break;
                    case 'interface':
                        addInterface(name);
                        break;
                    case 'pipe':
                        addPipe(name, type);
                        break;
                    case 'module':
                        fs.mkdir(`${name}`, () => {
                            addModule(name, type);
                        });
                        break;
                    default:
                        console.log(chalk.yellow(`ng1-decor-cli can't proccess type: ${type} 
Availables types: [module], [component], [service], [model], [pipe]`));
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

function automaticImport(lineToAddIntoBarrel, barrelFile, isEditingBarrel, module) {
    const file = module ? `${module}/index.ts` : 'index.ts';
    fs.appendFile(file,
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

function addModule(name, type, options) {
    const routingFileName = `${name}.routing.ts`;
    // Internal Barrel File
    let writeStreamBarrel = fs.createWriteStream(`${name}/index.ts`);
    // writeStreamBarrel.write(``);
    // writeStreamBarrel.on('finish', () => {
    //     console.log(chalk.green(`created ${name}/index.ts`));
    // });
    writeStreamBarrel.end();

    addRoute(name, name);

    addToFlow(name);
}

function addRoute(name, module) {
    let fileName = `${name}.routing.ts`;
    if (module) {
        fileName = `${module}/${name}.routing.ts`;
    }
    let writeStreamTs = fs.createWriteStream(fileName);
    writeStreamTs.write(`import {Routes} from 'ng1-decor';

@Routes()
export class ${snakeToCamel(name, true)}Routing {
    constructor(private $stateProvider: ng.ui.IStateProvider) {
         this.$stateProvider
                .state('layout2.${name}', <ng.ui.IState> {
                    url: '/${name}',
                    template: '<${name}></${name}>'
                })
            ;
    }
}
`);
    writeStreamTs.on('finish', () => {
        console.log(chalk.green(`created ${fileName}`));
    });
    writeStreamTs.end();

    addToFlow(`${name}.routing`, module);
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
}
`);
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
export class ${snakeToCamel(name, true)}Service {}
`);
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
}
`);
    writeStreamTs.on('finish', () => {
        console.log(chalk.green(`created ${name}.${type}.ts`));
    });
    writeStreamTs.end();
}

function addEnum(name) {
    let writeStreamTs = fs.createWriteStream(`${name}.enum.ts`);
    writeStreamTs.write(`export enum ${snakeToCamel(name, true)} {}
 `);
    writeStreamTs.on('finish', () => {
        console.log(chalk.green(`created ${name}.enum.ts`));
    });
    writeStreamTs.end();
}

function addInterface(name) {
    let writeStreamTs = fs.createWriteStream(`${name}.interface.ts`);
    writeStreamTs.write(`export enum I${snakeToCamel(name, true)} {}
 `);
    writeStreamTs.on('finish', () => {
        console.log(chalk.green(`created ${name}.interface.ts`));
    });
    writeStreamTs.end();
}

function addComponent(name, type, styleType, options, dirName) {
    // Typescript file
    let writeStreamTs = fs.createWriteStream(`${dirName || name}/${name}.${type}.ts`);
    writeStreamTs.write(`import { Component } from 'ng1-decor';
import './${name}.component.${styleType}';
            
@Component({
    selector: '${name}',
    template: require('./${name}.component.html')
})
export class ${snakeToCamel(name, true)}Component {}
`);
    writeStreamTs.on('finish', () => {
        console.log(chalk.green(`created ${dirName || name}/${name}.${type}.ts`));
    });
    writeStreamTs.end();

    // HTML File
    let writeStreamHTML = fs.createWriteStream(`${dirName || name}/${name}.${type}.html`);
    writeStreamHTML.write(`<div class="${name}-component">
    Works!
</div>`);
    writeStreamHTML.on('finish', () => {
        console.log(chalk.green(`created ${dirName || name}/${name}.${type}.html`));
    });
    writeStreamHTML.end();

    //Style File

    let writeStreamSCSS = fs.createWriteStream(`${dirName || name}/${name}.${type}.${styleType}`);
    writeStreamSCSS.write(`.${name}-component {
  color: red;
}
`);
    writeStreamSCSS.on('finish', () => {
        console.log(chalk.green(`created ${dirName || name}/${name}.${type}.${styleType}`));
    });
    writeStreamSCSS.end();

    // Internal Barrel File
    let writeStreamBarrel = fs.createWriteStream(`${dirName || name}/index.ts`);
    writeStreamBarrel.write(`export * from './${name}.${type}';
`);
    writeStreamBarrel.on('finish', () => {
        console.log(chalk.green(`created ${dirName || name}/index.ts`));
    });
    writeStreamBarrel.end();

    addToFlow(dirName || name);

    //Test File
    if (options.test) {
        let writeStreamBarrel = fs.createWriteStream(`${dirName || name}/${name}.${type}.spect.ts`);
        writeStreamBarrel.write(`test('two plus two', () => {
    let value: number = 2 + 2;
    expect(value).toBe(4);
});`);
        writeStreamBarrel.on('finish', () => {
            console.log(chalk.green(`created ${dirName || name}/${name}.${type}.spect.ts`));
        });
        writeStreamBarrel.end();
    }

    //Route
    if (options.routing) {
        console.log(options.layout);
        if (dirName) {
            routing(dirName, options.routing, options.layout);
        } else {
            console.log(chalk.red(`to use -r you need use [dirName] param`));
        }
    }
}

function addToFlow(name, module) {
    // External Barrel Automatic Import
    const lineToAddIntoBarrel = `export * from './${name}';`;
    const moduleFile = `'./${name}'`;
    let barrelFile = `index.ts`;
    if (module) {
        barrelFile = `${module}/index.ts`;
    }
    let isEditingBarrel = false;
    let canAddToBarrel = true;
    fs.exists(barrelFile, (exists) => {
        if (exists) {
            isEditingBarrel = true;
            fs.readFile(barrelFile, 'utf8', function(err, data) {
                // if (err) throw err;
                if (!err) {
                    if (data.indexOf(lineToAddIntoBarrel) >= 0) {
                        canAddToBarrel = false;
                        console.log(chalk.red(`${lineToAddIntoBarrel} already exists in ${module ? moduleFile : barrelFile}`));
                    } else {
                        automaticImport(lineToAddIntoBarrel, barrelFile, isEditingBarrel, module);
                    }
                }
            });
        } else {
            automaticImport(lineToAddIntoBarrel, barrelFile, isEditingBarrel, module);
        }
    });
}

function routing(component, route, layout) {
    let feature = path.resolve("./").split('/');
    feature = feature[feature.length - 1];
    const routingFile = `${feature}.routing.ts`;
    let isEditing = false;
    const state = `${feature}-${component}`;
    const routeTo = `/${feature}\/${route || component}`;
    layout = layout || 'layout2';
    fs.exists(routingFile, (exists) => {
        if (exists) {
            isEditing = true;
            fs.readFile(routingFile, 'utf8', function(err, data) {
                if (!err) {
                    if (data.indexOf(`'${layout || 'layout2'}.${state}'`) >= 0) {
                        console.log(chalk.red(`'${layout}.${state}' state already exists in ${routingFile}`));
                    } else {
                        let writeStreamToRoute = fs.createWriteStream(routingFile);
                        writeStreamToRoute.write(data.replace('this.$stateProvider', `this.$stateProvider
                .state('${layout}.${state}', <ng.ui.IState> {
                    url: '${routeTo}',
                    template: '<${component}></${component}>'
                })`));
                        writeStreamToRoute.on('finish', () => {
                            console.log(chalk.blue(`updated ${routingFile}`));
                        });
                        writeStreamToRoute.end();
                    }
                }
            });
        } else {
            let writeStreamToRoute = fs.createWriteStream(routingFile);
            writeStreamToRoute.write(`import {Routes} from 'ng1-decor';

@Routes()
export class ${snakeToCamel(feature, true)}Routing {
    constructor(private $stateProvider: ng.ui.IStateProvider) {
         this.$stateProvider
                .state('${layout || 'layout2'}.${state}', <ng.ui.IState> {
                    url: '${routeTo}',
                    template: '<${component}></${component}>'
                })
            ;
         }
}
`);
            writeStreamToRoute.on('finish', () => {
                console.log(chalk.green(`created ${routingFile}`));
            });
            writeStreamToRoute.end();
        }
    });
}