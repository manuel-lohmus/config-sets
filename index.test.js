/**  Copyright (c) 2024, Manuel Lõhmus (MIT). */


importModules(["config-sets"], function (configSets) {

    /***** Init TESTS *********************************************************/
    testRunner('TESTS for config-sets', { skip: false }, (test) => {
        test('assign should merge source into target   ', { skip: false }, (check) => {
            const target = { a: 1, c: { d: 3 } };
            const source = { b: 2, c: { d: 0 } };
            const result = configSets.assign(target, source);
            return check(result.a).mustBe(1).
                check(result.b).mustBe(2).
                check(result.c.d).mustBe(3);
        });
        test('assign should overwrite target properties', { skip: false }, (check) => {
            const target = { a: 1, c: { d: 3 } };
            const source = { b: 2, c: { d: 0 } };
            const result = configSets.assign(target, source, true);
            return check(result.a).mustBe(1).
                check(result.b).mustBe(2).
                check(result.c.d).mustBe(0);
        });
        test('arg_options                              ', { skip: false }, (check) => {
            const args = ['--key1=value1', '--key2=value2'];
            process.argv = [process.argv[0], process.argv[1], ...args];
            const result = configSets.arg_options();
            return check(result.key1).mustBe('value1').
                check(result.key2).mustBe('value2');
        });
        test('configSets module settings               ', { skip: false }, (check) => {
            configSets.isProduction = true;
            configSets.isSaveChanges = false;
            const result = configSets('moduleName', { key: 'value' });
            return check(result.key).mustBe('value')
                .check(configSets.production.key).mustBe(undefined);
        });
        test('configSets production settings           ', { skip: false }, (check) => {
            configSets.isProduction = true;
            configSets.isSaveChanges = false;
            const result = configSets({ key: 'value' });
            return check(result.key).mustBe('value');
        });
        test('configSets development settings          ', { skip: false }, (check) => {
            configSets.isProduction = false;
            configSets.isSaveChanges = false;
            configSets.development.key = 'dev';
            const result = configSets({ key: 'value' });
            return check(result.key).mustBe('dev');
        });
    });
});


/**
 * Test runner. Function to run unit tests in the console.
 * @author Manuel Lõhmus 2024 (MIT License)
 * @version 1.1.3
 * [2024-12-29] adde    d functionality to select tests by ID in the command line arguments (e.g. --testIDs=1 2 3)
 * @example `npm test '--'` or `node index.test.js`
 * @example `npm test '--' --help` or `node index.test.js --help`
 * @example `npm test '--' --testIDs=1 2 3` or `node index.test.js --testIDs=1 2 3`
 * @param {string} runnerName Test runner name.
 * @param {{skip:boolean}} options Test runner options.
 * @param {(test:Test)=>void} cb Callback function to run the unit tests.
 * @returns {boolean} If the tests are OK
 * @example testRunner('Module name', { skip: false },  function (test) {...});
 * 
 * @callback Test Unit test callback function
 * @param {string} testName Test name.
 * @param {{skip:boolean,timeout:number}} options Test options. (default: {skip:false,timeout:3000})))
 * @param {(check:Check,done:Done)=>void} fn Test function. Function parameters: check, done. `check` is used to check the test result. `done` is used to end the test.
 * @returns {void}
 * @example test("Test name", {skip:false,timeout:3000}, function(check,done){...});
 * @example test("Test name", function(check,done){...});
 * @example test("Test name", {skip:checkableObject === undefined}, function(check,done){...});
 * 
 * @callback Check Check function to check the test result.
 * @param {string} label Value name. Opional.
 * @param {any} value Value to check.
 * @returns {Validator} 
 * @example check('name', value).mustBe(true);
 * @example check('name', value).mustNotBe(false);
 * @example check('name', value).mustBe(true).done();
 * @example check('name', value).mustBe(true).mustNotBe(false).done();
 * 
 * @callback Done Callback function to end the test.
 * @param {Error} err Error message. If the error message is empty, the test is considered successful.
 * @returns {void}
 * 
 * @typedef Validator
 * @property {Check} check Check function to check the test result.
 * @property {(value:any)=>Validator} mustBe Check if the value is equal to the specified value.
 * @property {(value:any)=>Validator} mustNotBe Check if the value is not equal to the specified value.
 * @property {(value:any)=>Validator} mustInclude Check if the value is included to the specified value.
 * @property {Done} done Callback function to end the test.
 */
function testRunner(runnerName, options, cb) {

    this?.process?.on('uncaughtException', function noop() { });

    testRunner.testRunnerOK = true;
    clearTimeout(testRunner.exitTimeoutID);

    var stdout = {},
        timeouts = {},
        countStarted = 0,
        countCompleted = 0,
        testsStarted = false,
        testRunnerOK = true,
        strSKIP = "\t\t[\x1b[100m\x1b[97m  SKIP  \x1b[0m]",
        strTestsERR = "[\x1b[41m\x1b[97m The tests failed! \x1b[0m]",
        strTestsDONE = "[\x1b[42m\x1b[97m The tests are done! \x1b[0m]",
        { help, testID } = arg_options();

    if (help !== undefined) {

        console.log(`
npm test '--' [OPTION1=VALUE1] [OPTION2=VALUE2] ...
or
node index.test.js [OPTION1=VALUE1] [OPTION2=VALUE2] ...

The following options are supported:
    --help      Display this help
    --testID   Number of the test to run (e.g. node index.test.js --testID=1 --testID=2 --testID=3)
    `);

        if (this?.process?.argv[1].endsWith(".js")) { exitPressKey(); }
        else { process.exit(0); }

        return;
    }

    if (!Array.isArray(testID)) { testID = testID ? [testID] : []; }

    //skip all tests
    if (options?.skip) {

        testsStarted = "SKIP";
        if (runnerName) { log(0, "SKIP  > ", runnerName, strSKIP); }
        testCompleted();

        return testRunnerOK;
    }


    if (runnerName) { log(0, "START > ", runnerName); }
    cb(test);
    testsStarted = true;
    testCompleted();

    return testRunnerOK;

    function log() {

        var line = "";

        for (let i = 1; i < arguments.length; i++) {

            line += arguments[i];
        }

        if (stdout[arguments[0]]) {

            stdout[arguments[0]] += line + "\n";
        }
        else {

            stdout[arguments[0]] = line + "\n";
        }
    }
    function print_stdout() {

        console.log();
        console.log(
            Object.keys(stdout).reduce((output, value, i) => output += stdout[i], '')
        );
    }
    /**
     * Unit test function.
     * @type {Test} 
     */
    function test(testName, options, fn) {

        var startTime, endTime,
            id = ++countStarted,
            testOK = true,
            label = "  " + id + ".\tTEST > " + testName + "\t",
            strOK = "\t[\x1b[42m\x1b[97m   OK   \x1b[0m]",
            strERR = "\t[\x1b[41m\x1b[97m FAILED \x1b[0m] -> ";

        //skip
        if (options?.skip || testID && testID.length && !testID.includes(id)) {
            
            log(id, label, "\t", strSKIP);
            testCompleted();

            return;
        }
        //timeout 
        timeouts[id] = setTimeout(function () {
            done("timeout");
        }, options?.timeout || 3000);

        startTime = performance.now();

        try {
            if (fn(check, done)) { done(); }

        }
        catch (err) { done(err); }

        /**
         *  Callback function to end the test.
         * @type {Done}
         */
        function done(err = '') {

            endTime = performance.now();
            if (err) { testRunnerOK = testOK = false; }
            if (err || testOK)
                log(id, label, ": ", (endTime - startTime).toFixed(2), "ms\t", err ? strERR : strOK, err || "");
            if (timeouts[id]) { testCompleted(); }
            clearTimeout(timeouts[id]);
            delete timeouts[id];
        }
        /**
         * Check function to check the test result.
         * @type {Check}
         */
        function check(label, value) {

            if (arguments.length === 1) { value = label; label = 'returned'; }
            if (label === undefined) { label = 'returned'; }

            /**
             * Selection fuctions to check.
             * @type {Validator}
             */
            return {

                check,

                mustBe: function mustBe(mustBe) {
                    if (value !== mustBe) { done("\x1b[44m\x1b[97m " + label + " \x1b[0m '" + value + "' \x1b[44m\x1b[97m must be \x1b[0m '" + mustBe + "'"); }
                    return this;
                },

                mustNotBe: function mustNotBe(mustNotBe) {
                    if (value === mustNotBe) { done("\x1b[44m\x1b[97m " + label + " \x1b[0m '" + value + "' \x1b[44m\x1b[97m must not be \x1b[0m '" + mustNotBe + "'"); }
                    return this;
                },

                mustInclude: function mustInclude(mustInclude) {
                    if (!value?.includes || !value.includes(mustInclude)) { done("\x1b[44m\x1b[97m " + label + " \x1b[0m '" + value + "' \x1b[44m\x1b[97m must include \x1b[0m '" + mustInclude + "'"); }
                    return this;
                },

                done
            };
        }
    }
    function testCompleted() {

        countCompleted++;

        if (!testsStarted || countStarted >= countCompleted) { return; }

        if (runnerName) {

            if (testsStarted === "SKIP") {

                print_stdout();
            }
            else if (!testRunnerOK) {
                log(++countStarted, "END   > " + runnerName + "\t" + strTestsERR);
                print_stdout();
            }
            else {
                log(++countStarted, "END   > ", runnerName, "\t", strTestsDONE);
                print_stdout();
            }

            this?.process?.removeAllListeners('uncaughtException');

            if (this?.process?.argv[1].endsWith(".js")) {

                exitPressKey();
            }
            else if (this?.process) {

                if (!testRunnerOK) { testRunner.testRunnerOK = false; }

                testRunner.exitTimeoutID = setTimeout(function () {

                    process.exit(testRunner.testRunnerOK ? 0 : 1);
                }, 100);
            }
        }
    }

    function exitPressKey() {

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, testRunnerOK ? 0 : 1));

        console.log('Press any key to exit');
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
}

/**
 * Import modules.
 * @param {string[]} importIdentifierArray Modules to import.
 * @param {(...importModules:any[]) => void} callback Callback function.
 */
function importModules(importIdentifierArray, callback) {

    var thisScope = "undefined" != typeof globalThis
        ? globalThis
        : "undefined" != typeof window
            ? window
            : "undefined" != typeof global
                ? global : "undefined" != typeof self
                    ? self
                    : {};

    if (!thisScope.modules) { thisScope.modules = {}; }

    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // CommonJS

        if (importIdentifierArray.length) {

            importIdentifierArray = importIdentifierArray.map(function (id) { return require(id); });
        }

        return module.exports = callback.call(thisScope, ...importIdentifierArray);
    }

    // Browser
    waitModules();


    function waitModules() {

        if (importIdentifierArray.length) {

            for (let i = 0; i < importIdentifierArray.length; i++) {

                if (!thisScope.modules[importIdentifierArray[i]]) { return setTimeout(waitModules, 10); }
            }
        }

        callback.call(thisScope, ...importIdentifierArray.map(function (id) { return thisScope.modules[id]; }));
    }
}