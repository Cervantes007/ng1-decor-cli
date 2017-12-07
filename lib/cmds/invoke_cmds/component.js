const fs = require('fs');
const chalk = require('chalk');
const util = require('../../util');
exports.command = 'component <name> [dirName]';
exports.desc = 'Add component';
exports.aliases = ['c'];
exports.builder = {};
exports.handler = function (argv) {
    const name = argv.name;
    const dirName = argv.dirName;
    const type = 'component';
    const style = argv.style;
    const styleType = 'scss';
    const test = argv.test || false;
    const routing = argv.routing || false;
    const rxjs = argv.rx || false;

    const fileToCreate = dirName || name;
    fs.exists(fileToCreate, (exists) => {
        if (exists) {
            console.log(chalk.red(`${type} ${name} already exists`));
        } else {
            fs.mkdir(`${dirName || name}`, () => {
                // Typescript file
                const content =  rxjs ? `constructor() {
        super();
    }
    
    public $onInit(): void {
        // code here
    }` : `public $onInit(): void {
        // code here
    }`;
                let writeStreamTs = fs.createWriteStream(`${dirName || name}/${name}.${type}.ts`);
                writeStreamTs.write(`import { Component, OnInit } from 'ng1-decor';
${style ? `import './${name}.component.${styleType}';
` : ''}
@Component({
    selector: '${name}',
    template: require('./${name}.component.html')
})
export class ${util.snakeToCamel(name, true)}Component ${rxjs ? 'extend RxjsComponent ' : ''}implements OnInit {
    ${content}
}
`);
                writeStreamTs.on('finish', () => {
                    console.log(chalk.green(`created ${dirName || name}/${name}.${type}.ts`));
                });
                writeStreamTs.end();

                // HTML File
                let writeStreamHTML = fs.createWriteStream(`${dirName || name}/${name}.${type}.html`);
                writeStreamHTML.write(`<div class="${name}-component">
    ${name} works!
</div>`);
                writeStreamHTML.on('finish', () => {
                    console.log(chalk.green(`created ${dirName || name}/${name}.${type}.html`));
                });
                writeStreamHTML.end();

                //Style File
                if (style) {
                    let writeStreamSCSS = fs.createWriteStream(`${dirName || name}/${name}.${type}.${styleType}`);
                    writeStreamSCSS.write(`@import "styles";

.${name}-component {
  //styles here
}
`);
                    writeStreamSCSS.on('finish', () => {
                        console.log(chalk.green(`created ${dirName || name}/${name}.${type}.${styleType}`));
                    });
                    writeStreamSCSS.end();
                }

                // Internal Barrel File
                let writeStreamBarrel = fs.createWriteStream(`${dirName || name}/index.ts`);
                writeStreamBarrel.write(`export * from './${name}.${type}';
`);
                writeStreamBarrel.on('finish', () => {
                    console.log(chalk.green(`created ${dirName || name}/index.ts`));
                });
                writeStreamBarrel.end();

                util.addToFlow(dirName || name);

                //Test File
                if (test) {
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
                if (routing) {
                    if (dirName) {
                        const toRoute = routing === true ? false : routing;
                        util.routing(dirName, toRoute);
                    } else {
                        console.log(chalk.red(`to use --routing you need use [dirName] param`));
                    }
                }
            });
        }
    });
};