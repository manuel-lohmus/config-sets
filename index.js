/**  Copyright (c) Manuel Lõhmus (MIT License). */

'use strict';

var path = require('path'),
    dataContext = require('data-context'),
    configFileName = 'config-sets.json',
    scriptName = path.parse(process.argv[1]).base,
    args = arg_options(),
    isWatchingFile = false,
    configSettings = dataContext({
        isProduction: true,
        production: {},
        development: {}
    });

if ((args.help || args.help === '') && (scriptName === 'index' || scriptName === 'index.js')) {

    print_help();
    process.exit(0);
}

if (Object.keys(args).length) {

    configSettings.production = assign(configSettings.production, args, true);
    configSettings.resetChanges();
}

module.exports = Object.defineProperties(configSets, {

    assign: { value: assign, configurable: false, enumerable: false, writable: false },

    arg_options: { value: arg_options, configurable: false, enumerable: false, writable: false },

    print_help: { value: print_help, configurable: false, enumerable: false, writable: false },

    isProduction: {
        configurable: false, enumerable: false,
        get: function () { return configSettings.isProduction; },
        set: function (val) { configSettings.isProduction = Boolean(val); }
    },

    production: {
        configurable: false, enumerable: false,
        get: function () { return configSettings.production; }
    },

    development: {
        configurable: false, enumerable: false,
        get: function () { return configSettings.development; }
    },

    enableFileReadWrite: {
        configurable: false, enumerable: false,
        get: function () { return dataContext.enableFileReadWrite; },
        set: function (val) { dataContext.enableFileReadWrite = Boolean(val); }
    }
});


function configSets(configModuleName, defaultConfigSettings) {

    if (!isWatchingFile) {

        dataContext.watchJsonFile({
            filePath: configFileName,
            data: configSettings,
            removeUnusedKeys: false
        });
    }

    if (defaultConfigSettings === undefined && typeof configModuleName === 'object') {

        defaultConfigSettings = configModuleName;
        configModuleName = undefined;
    }
    else if (defaultConfigSettings === undefined) {

        defaultConfigSettings = {};
    }

    if (configModuleName) {

        configModuleName = configModuleName + '';

        if (!configSettings.production[configModuleName]) { configSettings.production[configModuleName] = dataContext({}); }

        configSettings.production[configModuleName] = assign(configSettings.production[configModuleName], defaultConfigSettings);
    }
    else {

        configSettings.production = assign(configSettings.production, defaultConfigSettings);
    }

    if (configSettings.isProduction) {

        return configModuleName ? configSettings.production[configModuleName] : configSettings.production;
    }

    configSettings.development = assign(configSettings.development, configSettings.production);
    configSettings.resetChanges();

    return configModuleName ? configSettings.development[configModuleName] : configSettings.development;
}

function assign(target, source, overwriteChanges = false) {

    if (!target && typeof target !== "object") { target = {}; }
    if (Array.isArray(source) && !Array.isArray(target) && target !== null) { target = []; }

    if (source && typeof source === "object") {

        for (var k in source) {

            if (!source.hasOwnProperty(k)) continue;

            if (typeof source[k] === "function" || k === "__proto__" || k === "constructor") { continue; }

            if (!source[k] || typeof source[k] !== "object") {

                if (target[k] === undefined || overwriteChanges) { target[k] = source[k]; }
            }
            else {

                if (typeof target[k] !== "object") { target[k] = {}; }

                target[k] = assign(target[k], source[k], overwriteChanges);
            }
        }
    }
    return target;
}

function arg_options() {

    if ("undefined" === typeof process) { return {}; }

    var isKey = false,
        key = '',
        values,
        args = process.argv
            .slice(2)
            .join('')
            .split('')
            .reduce(function (args, c) {


                if (c === '-') {

                    if (isKey && key && !args[key]) { args[key] = ['true']; }
                    isKey = true;
                    key = '';
                    return args;
                }

                if (c === '=') {

                    isKey = false;
                    if (!args[key]) { args[key] = []; }
                    values = args[key];
                    values.push('');
                    return args;
                }

                if (isKey && /\s/.test(c)) {

                    return args;
                }

                if (isKey) {

                    key += c;
                    return args;
                }

                if (values?.length) {

                    values[values.length - 1] += c;
                }

                return args;
            }, {});

    if (isKey && key && !args[key]) { args[key] = ['true']; }

    Object.keys(args).forEach((k) => {

        if (!args[k].length) {

            args[k] = '';

            return;
        }

        if (args[k].length === 1) {

            args[k] = convertValue(args[k][0].trim());

            return;
        }

        args[k] = args[k].map((s) => {

            return convertValue(s.trim());
        });
    });

    return args;

    function convertValue(val) {

        if (val === '') { return ''; }
        if (val === 'null') { return null; }
        if (val === 'true') { return true; }
        if (val === 'false') { return false; }
        if (!isNaN(Number(val))) { return Number(val); }

        return val;
    }
}

function print_help() {

    var lines = [
        `
USAGE: ${scriptName} [OPTION1=VALUE1] [OPTION2=VALUE2] ...

The following options are supported:
        `
    ],
        options = { help: 'Display this help' };

    for (var key in configSettings.production) {

        if (configSettings.production['-metadata-' + key]) {

            options[key] = configSettings.production['-metadata-' + key];
        }
    }

    for (var [key, value] of Object.entries(options)) {

        lines.push(
            '\t--'
            + key
            + (key.length < 5 ? ':\t\t' : ':\t')
            + (value + '').trim()
        );
    }

    lines.forEach((l) => console.log(l));
    console.log();
}