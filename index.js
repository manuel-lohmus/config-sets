/**Config functions. @preserve Copyright(c ) 2021 Manuel Lõhmus.*/
'use strict';

var fs = require('fs');
var path = require('path');
var configPath = path.resolve(process.cwd(), 'config-sets.js');

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath,
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
var config = fs.existsSync(configPath) ? require(configPath) : {};

function assign(target, source) {

    if (!target && typeof target !== "object") { target = {}; }
    if (Array.isArray(source)) { target = []; }

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


module.exports = config[process.env.NODE_ENV]
    ? config[process.env.NODE_ENV]
    : config['def'];
module.exports.assign = assign;