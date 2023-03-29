# config-sets: simple configure library

[![npm-version](https://badgen.net/npm/v/config-sets)](https://www.npmjs.com/package/config-sets)
[![npm-week-downloads](https://badgen.net/npm/dw/config-sets)](https://www.npmjs.com/package/config-sets)

Configure the app easily.
Consolidate all your module settings into one 'config-sets.json' file

## Installing

`npm install config-sets`

or

use the https://npm.paydevs.com registry to get the latest version.

More info [www.paydevs.com](https://www.paydevs.com/)

## Usage example

config-sets.json      //is automatically added to the working folder

```json
{
  "production": {
    "isDebug": false,
    "port": 8080,
    "launch_url": "/"
  },
  "development": {
    "isDebug": true,
    "launch_url": "/options"
  }
}
```

app.js

```js
var options = require('config-sets').init({
    port: 3000,
    launch_url: "/"
});

console.log('isDebug:' + options.isDebug);
console.log('profiler:' + options.profiler);

require('http').createServer(function (req, res) {

    if (req.url.startsWith('/options')) {

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify(options, null, 2));

        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');

}).listen(options.port);

// Opens the URL in the default browser.
function openBrowser(url) {

    var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    require('child_process').exec(start + ' ' + url);
}

openBrowser(`http://localhost:${options.port}${options.launch_url}`);
```
### select development settings

```console
$env:NODE_ENV="development"
```

or

```console
set NODE_ENV=development
```
### select production settings

```console
$env:NODE_ENV="production"
```

or

```console
set NODE_ENV=production
```

## 'config-sets' Reference

```
var configSets = require('config-sets')

/**
 * Customizing default settings
 * @param {object} defSettings example: { isDebug: false }
 * @returns {object} returns the current settings => { isDebug: false }
 */
configSets.init(defSettings)

/**
 * Save changes
 */
configSets.save()

/**
 * Reload current settings
 * @returns {object} returns the current settings
 */
configSets.reload()

/**
 * Find command line argument
 * @param {string} key
 * @returns {string|null}
 */
configSets.findArg(key)
```

## License

The [MIT](LICENSE) License 
```txt
Copyright (c) 2021 Manuel Lõhmus <manuel@hauss.ee>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```