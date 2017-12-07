exports.command = 'invoke <command>';
exports.aliases = ['add', 'generate', 'i', 'g'];
exports.desc = 'Generate folder structure';
exports.builder = function (yargs) {
    return yargs.commandDir('invoke_cmds')
};
exports.handler = function (argv) {};
