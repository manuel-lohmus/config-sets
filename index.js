/**Config functions. @preserve Copyright(c ) 2021 Manuel Lõhmus.*/
'use strict';

var fs = require('fs');
var path = require('path');
var configFileName = 'config-sets.js';
var configPath = path.resolve(process.cwd(), configFileName);
if (!fs.existsSync(configPath)) { init(configPath); }
var config = require(configPath);

function init(pathToConfigFile) {

    pathToConfigFile = path.resolve(pathToConfigFile);

    if (!pathToConfigFile.endsWith('.js')) {
        pathToConfigFile = path.resolve(pathToConfigFile, configFileName);
    }

    if (fs.existsSync(pathToConfigFile)) {
        config = require(pathToConfigFile);
        selectConfig();
    }
    else {

        fs.writeFileSync(pathToConfigFile,
'/** config-sets file */ \n\
module.exports = {       \n\
                         \n\
    // default settings  \n\
    def: {               \n\
        isDebug: false   \n\
    },                   \n\
    // develop settings  \n\
    dev: {               \n\
        // overwriting   \n\
        isDebug: true    \n\
    }                    \n\
};                       ',
            { encoding: 'utf8' }
        );
    }
}
function selectConfig() {

    module.exports = assign(
        module.exports,
        config[process.env.NODE_ENV]
            ? config[process.env.NODE_ENV]
            : config['def']
    );
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

var def = config.def ? config.def : {};
Object.keys(config).forEach(function (k) { if (k !== 'def') { config[k] = assign(config[k], def); } });
selectConfig();

module.exports.init = init;
module.exports.assign = assign;