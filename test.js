'use strict';

var contSet = require('./index.js');
contSet.init('./');
var options = contSet.assign(contSet.server, {
    port: 80,
    launch_url: "/"
});

var isDebug = contSet && contSet.isDebug ? true : false;
console.log('isDebug:' + isDebug);

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