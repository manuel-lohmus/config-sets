'use strict';

var confSets = require("./index.js");
var options = confSets.init({
    port: 3000,
    launch_url: "/"
});
//confSet.reload();

options.isDebug = Boolean(confSets.findArg("debug")) || options.isDebug;

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