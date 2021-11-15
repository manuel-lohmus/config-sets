/** config-sets file */
module.exports = {
    // default settings
    def: {
        isDebug: false,
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