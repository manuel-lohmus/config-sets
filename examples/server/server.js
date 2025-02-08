'use strict';

var http = require('http');
//var configSets = require("config-sets");
var configSets = require("../../index.js");

// Create server options with default values
var settings = configSets({
    '-metadata': ' Server configuration sets ', // 'options' comment, see config-sets.json file
    '-metadata-port': ' Server listen port ', // option 'port' comment, see config-sets.json file
    port: 3000, // option 'port'
    '-metadata-launch_url': ' Launch url in browser ', // option 'launch_url' comment, see config-sets.json file
    launch_url: "/", // option 'launch_url'
    isDebug: false
})

settings.on('isDebug', function (ev) { console.log(ev); return true; });

http.createServer(function (req, res) {

    if (req.url.startsWith('/options')) {

        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.end(JSON.stringify(settings, null, 2));

        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!');

}).listen(settings.port);

openBrowser(`http://localhost:${settings.port}${settings.launch_url}`);


// Opens the URL in the default browser.
function openBrowser(url) {

    var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    require('child_process').exec(start + ' ' + url);
}