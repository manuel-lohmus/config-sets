# config-sets: simple configure library

[![npm-version](https://badgen.net/npm/v/config-sets)](https://www.npmjs.com/package/config-sets)
[![npm-week-downloads](https://badgen.net/npm/dw/config-sets)](https://www.npmjs.com/package/config-sets)

Configure the app easily.

## Installing

`npm install config-sets`

## Usage example

config-sets.json      //in working folder

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
'use strict';

var options = require('config-sets').init({
    port: 3000,
    launch_url: "/"
});

console.log('isDebug:' + options.isDebug);

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
#### select development settings

```console
$env:NODE_ENV="development"
```

or

```console
set NODE_ENV=development
```
#### select production settings

```console
$env:NODE_ENV="production"
```

or

```console
set NODE_ENV=production
```


## License

[MIT](LICENSE)

Copyright (c) 2021 Manuel L&otilde;hmus <manuel@hauss.ee>


