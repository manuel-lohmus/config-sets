/**Config functions. @preserve Copyright(c ) 2021 Manuel Lõhmus.*/
'use strict';

var fs = require('fs');
var path = require('path');
var configFileName = 'config-sets.json';
var configPath = path.resolve(process.cwd(), configFileName);
var config = { production: { isDebug: false }, development: { isDebug: true } };
var profiler = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';

if (!fs.existsSync(configPath)) { init(configPath); }
config = require(configPath);

function init(source) {

    assign(module.exports, source);

    if (fs.existsSync(configPath)) {

        if (profiler === 'production') {

            config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));
            delete module.exports.init;
            delete module.exports.assign;
            delete module.exports.profiler;

            if (JSON.stringify(config['production']) !== JSON.stringify(module.exports)) {

                config['production'] = assign(config['production'], module.exports);
                fs.writeFileSync(configPath,
                    JSON.stringify(config, null, 2),
                    { encoding: 'utf8' }
                );
            }
        }
    }
    else {
        fs.writeFileSync(configPath,
            JSON.stringify(config, null, 2),
            { encoding: 'utf8' }
        );
    }

    return selectConfig();
}
function selectConfig() {

    module.exports = assign(
        module.exports,
        config[profiler]
            ? config[profiler]
            : config['production']
    );

    module.exports.init = init;
    module.exports.assign = assign;
    module.exports.profiler = profiler;
    module.exports.findArg = findArg;

    return module.exports;
}
function assign(target, source) {

    if (!target && typeof target !== "object") { target = {}; }
    if (Array.isArray(source) && !Array.isArray(target)) { target = []; }

    if (source && typeof source === "object") {

        Object.keys(source).forEach(function (k) {

            if (!source[k] || typeof source[k] !== "object") {
                if (target[k] === undefined) { target[k] = source[k]; }
            }
            else {
                if (typeof target[k] !== "object") { target[k] = {}; }
                target[k] = assign(target[k], source[k]);
            }
        });
    }
    return target;
}
function findArg(key) {
    key = key + '';
    var val = process.argv.find(function (keyVal) { return keyVal.startsWith(key) });
    if (val) { return val.substr(key.length + 1) || val; }
    else if (process.env[key]) { return process.env[key]; }
    return "";
}

var production = config.production ? config.production : {};
Object.keys(config).forEach(function (k) { if (k !== 'production') { config[k] = assign(config[k], production); } });
selectConfig();