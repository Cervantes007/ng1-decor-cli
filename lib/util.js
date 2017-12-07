const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
exports.addRoute = function (name, module) {
    let fileName = `${name}.routing.ts`;
    if (module) {
        fileName = `${module}/${name}.routing.ts`;
    }
    let writeStreamTs = fs.createWriteStream(fileName);
    writeStreamTs.write(`import {Routes} from 'ng1-decor';

@Routes()
export class ${this.snakeToCamel(name, true)}Routing {
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
};

exports.addToFlow =  function(name, module) {
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
            fs.readFile(barrelFile, 'utf8', (err, data) => {
                // if (err) throw err;
                if (!err) {
                    if (data.indexOf(lineToAddIntoBarrel) >= 0) {
                        canAddToBarrel = false;
                        console.log(chalk.red(`${lineToAddIntoBarrel} already exists in ${module ? moduleFile : barrelFile}`));
                    } else {
                        this.automaticImport(lineToAddIntoBarrel, barrelFile, isEditingBarrel, module);
                    }
                }
            });
        } else {
            this.automaticImport(lineToAddIntoBarrel, barrelFile, isEditingBarrel, module);
        }
    });
};

exports.toModelResource = function(s) {
    return s.replace(/-/g, '/');
};

exports.snakeToCamel = function(s, capitalize){
    if (capitalize) {
        s = s[0].toUpperCase() + s.slice(1);
    }
    return s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
};

exports.routing = function(component, route, layout) {
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
                    template: '<${state}></${state}>'
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
export class ${this.snakeToCamel(feature, true)}Routing {
    constructor(private $stateProvider: ng.ui.IStateProvider) {
         this.$stateProvider
                .state('${layout || 'layout2'}.${state}', <ng.ui.IState> {
                    url: '${routeTo}',
                    template: '<${state}></${state}>'
                })
            ;
         }
}
`);
            writeStreamToRoute.on('finish', () => {
                console.log(chalk.green(`created ${routingFile}`));
            });
            writeStreamToRoute.end();
            this.addToFlow(routingFile);
        }
    });
};

exports.automaticImport = function(lineToAddIntoBarrel, barrelFile, isEditingBarrel, module) {
    const file = module ? `${module}/index.ts` : 'index.ts';
    fs.appendFile(file,
        `${lineToAddIntoBarrel}
`, (err) => {
            if (err) throw err;
            if (isEditingBarrel) {
                console.log(chalk.blue(`updated ${barrelFile}`)  + chalk.yellow(` <<< `) + lineToAddIntoBarrel);
            } else {
                console.log(chalk.green(`created ${barrelFile}`));
            }

        });
};