# config-sets: simple configure library

[![npm-version](https://badgen.net/npm/v/config-sets)](https://www.npmjs.com/package/config-sets)
[![npm-week-downloads](https://badgen.net/npm/dw/config-sets)](https://www.npmjs.com/package/config-sets)

Configure the app easily.

## Installing

`npm install config-sets`

## Usage example

config-sets.js      //in working folder

```js
/** config-sets file */
module.exports = {
    // default settings
    def: {
        isDebug: false,
        //apiKey: process.env.API_KEY,
        server: {
            port: 8080,
            launch_url: 'index.html'
        }
    },
    // develop settings  
    dev: {
        // overwriting
        isDebug: true,
        server: {
            launch_url: 'options'
        }
    }
};
```

app.js

```js
'use strict';

var contSet = require('config-sets');
var options = contSet.assign(contSet.server, {
    port: 80,
    launch_url: "/"
});

var isDebug = contSet && contSet.isDebug ? true : false;
console.log('isDebug: ' + isDebug);

// Opens the URL in the default browser.
function openBrowser(url) {

    var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    require('child_process').exec(start + ' ' + url);
}

var http = require('http');
http.createServer(function (req, res) {

    if (req.url.startsWith('/options')) {

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify(options, null, 2));

        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');

}).listen(options.port);

if (isDebug) {
    openBrowser(`http://localhost:${options.port}/${options.launch_url}`);
} else {
    openBrowser(`http://localhost:${options.port}/`);
}
```
#### select develop settings

```console
$env:NODE_ENV="dev"
```

or

```console
set NODE_ENV=dev
```

## License

[MIT](LICENSE)

Copyright (c) 2021 Manuel L&otilde;hmus <manuel@hauss.ee>


