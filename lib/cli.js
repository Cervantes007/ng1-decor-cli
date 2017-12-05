var yargs = require('yargs');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');
var shell = require("shelljs");
var Spinner = require('cli-spinner').Spinner;
var depSpin = new Spinner(chalk.yellow('Checking for update.. %s'));

yargs
    .command('serve [port]', 'start the server', (yargs) => {
        yargs
            .positional('port', {
                describe: 'port to bind on',
                default: 5000
            })
    }, (argv) => {
        if (argv.verbose) console.info(`start server on :${argv.port}`)
        serve(argv.port)
    })
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .argv