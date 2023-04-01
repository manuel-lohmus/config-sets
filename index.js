/**Config functions. @preserve Copyright(c ) 2021 Manuel Lõhmus.*/
'use strict';

var fs = require('fs');
var path = require('path');
var configFileName = 'config-sets.json';
var configPath = path.resolve(path.parse(process.argv[1]).dir.split("node_modules").shift(), configFileName);
var config = { production: { isDebug: false }, development: { isDebug: true } };
var profiler = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';

if (!fs.existsSync(configPath)) { init(configPath); }
config = require(configPath);

/**
 * Customizing default settings
 * @param {object} defSettings example: { isDebug: false }
 * @returns {object} returns the current settings => { isDebug: false }
 */
function init(defSettings, saveChanges = false) {

    var isSaveFile = false;

    if (profiler === "production" && typeof defSettings === "object" && defSettings) {
        for (var key in defSettings) {
            if (!module.exports[key]) {
                isSaveFile = true;
                break;
            }
        }
    }

    assign(module.exports, defSettings, saveChanges);

    if (fs.existsSync(configPath)) {

        if (profiler === 'production') {
            config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));
        }

        delete module.exports.init;
        delete module.exports.assign;
        delete module.exports.profiler;
        delete module.exports.findArg;
        delete module.exports.save;
        delete module.exports.reload;

        if (isSaveFile || JSON.stringify(config['production']) !== JSON.stringify(module.exports)) {

            config['production'] = module.exports;
            fs.writeFileSync(configPath,
                JSON.stringify(config, null, 2),
                { encoding: 'utf8' }
            );
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
    module.exports.save = save;
    module.exports.reload = reload;

    return module.exports;
}
function assign(target, source, saveChanges = false) {

    if (!target && typeof target !== "object") { target = {}; }
    if (Array.isArray(source) && !Array.isArray(target) && target !== null) { target = []; }

    if (source && typeof source === "object") {

        for (var k in source) {
            if (!source.hasOwnProperty(k)) continue;
            if (typeof source[k] === "function" || k === "__proto__" || k === "constructor") { continue; }
            if (!source[k] || typeof source[k] !== "object") {
                if (target[k] === undefined || saveChanges) { target[k] = source[k]; }
            }
            else {
                if (typeof target[k] !== "object") { target[k] = {}; }
                target[k] = assign(target[k], source[k], saveChanges);
            }
        }
    }
    return target;
}
/**
 * Find command line argument
 * @param {string} key
 * @returns {string|null}
 */
function findArg(key) {
    key = key + '';
    var val = process.argv.find(function (keyVal) { return keyVal.startsWith(key) });
    if (val) { return val.substring(key.length + 1) || val; }
    else if (process.env[key]) { return process.env[key]; }
    return null;
}
/**
 * Save changes
 */
function save() { init(); }
/**
 * Reload current settings
 * @returns {object} returns the current settings
 */
function reload() {

    config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));

    return module.exports = assign(
        module.exports,
        config[profiler]
            ? config[profiler]
            : config['production'],
        true
    );
}

var production = config.production ? config.production : {};
Object.keys(config).forEach(function (k) {
    if (k !== 'production' && config[k] && typeof config[k] === 'object') {
        config[k] = assign(config[k], production);
    }
});
selectConfig();