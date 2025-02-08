﻿/**  Copyright (c) 2024, Manuel Lõhmus (MIT License). */

'use strict';

var fs = require('fs'),
    path = require('path'),
    dataContext = require('data-context'),
    configFileName = 'config-sets.json',
    configPath = path.resolve(path.parse(process.argv[1]).dir.split("node_modules").shift(), configFileName),
    scriptName = path.parse(process.argv[1]).base,
    args = arg_options(),
    isFileWriteInProgress = false,
    timeout = null,
    isSaveChanges = true,
    configSettings = dataContext({
        isProduction: true,
        production: {},
        development: {}
    });

if (fs.existsSync(configPath)) {

    configSettings = assign(
        dataContext.parse(fs.readFileSync(configPath, { encoding: 'utf8' }), dataContext),
        configSettings
    );
}
else {

    fs.writeFileSync(configPath,
        dataContext.stringify(configSettings, null, 2),
        { encoding: 'utf8' }
    );
}

if ((args.help || args.help === '')
    && scriptName !== 'index.test'
    && scriptName !== 'index.test.js') {

    print_help();
    process.exit(0);
}

if (Object.keys(args).length) {

    configSettings.production = assign(configSettings.production, args, true);
    configSettings.resetChanges();
}

fs.watchFile(configPath, (curr, prev) => {

    if (!isFileWriteInProgress) {
        // Read 'config-sets.json' file
        configSettings.overwritingData(fs.readFileSync(configPath, { encoding: 'utf8' }));
    }
});

configSettings.on('-change', (event) => {

    clearTimeout(timeout);

    timeout = setTimeout(() => {

        if (!configSettings.isChanged || !isSaveChanges) { return; }

        isFileWriteInProgress = true;
        
        fs.writeFile(
            configPath,
            configSettings.stringifyChanges(null, 2, false),
            { encoding: 'utf8' },
            (err) => {

                if (err) throw err;

                isFileWriteInProgress = false;
            }
        );
    });
    // I am alive.
    return true;
});

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

    isSaveChanges: {
        configurable: false, enumerable: false,
        get: function () { return isSaveChanges; },
        set: function (val) { isSaveChanges = Boolean(val); }
    }
});


function configSets(configModuleName, defaultConfigSettings) {

    if (defaultConfigSettings === undefined) {

        defaultConfigSettings = configModuleName;
        configModuleName = undefined;
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

                values[values.length - 1] += c;

                return args;
            }, {});

    if (isKey && key && !args[key]) { args[key] = []; }

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