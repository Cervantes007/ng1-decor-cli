const util = require('../util');
exports.command = 'routing <name> [route] [layout]';
exports.desc = 'Add to route';
exports.builder = {};
exports.handler = function (argv) {
    const name = argv.name;
    const route = argv.route;
    const layout = argv.layout;
    util.routing(name, route, layout);
};