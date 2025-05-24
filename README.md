<div class="row w-100">
<div class="col-12 text-center">

# Config Sets 

Easy app configure in real time.

This manual is also available in [HTML5](https://manuel-lohmus.github.io/config-sets/README.html).

</div>
</div> 
<div class="row w-100">
<div class="col-lg-3 d-lg-inline">
<div class="sticky-top overflow-auto vh-lg-100">
<div id="list-headers" class="list-group mt-2 ms-lg-2 ms-4">

#### Table of contents
- [**Introduction**](#introduction)
- [**Installation**](#installation)
- [**Usage**](#usage)
  - [Basic Usage](#basic-usage)
  - [Command-Line Arguments](#command-line-arguments)
  - [Watching for Changes](#watching-for-changes)
- [**Testing**](#testing)
- [**API**](#api)
  - [Main Function](#main-function)
  - [Static Properties](#static-properties)
  - [Helper Functions](#helper-functions)
- [**License**](#license)
    
</div>
</div>
</div>
 
<div class="col-lg-9 mt-2">
<div class="ps-4 markdown-body" data-bs-spy="scroll" data-bs-target="#list-headers" data-bs-offset="0" tabindex="0">

## Introduction

This Node.js module manages configuration settings by reading from and writing to a `config-sets.json` file.
It handles command-line arguments and watches for changes to the configuration file.
It allows you to create applications that can be configured in real time.
This module is part of the ['conextra'](https://www.npmjs.com/package/conextra) framework, 
which is a simple and easy-to-use single-page application (SPA) framework.
You have to try it! A different solution than MVC (model–view–controller).

> Please note, this version is not backward compatible with version 2.x<br>
> Please note that JSON string is not 100% compatible.<br>
> It has been extended to allow for incremental updates of JSON files.<br>
> Added the ability to include metadata and comments.<br>
> Parsing of JSON files is enabled.

## Installation

To install the module, use npm:

`npm install config-sets`

## Usage

### Basic Usage

To use the module, require it in your script and call the `configSets` function:

```javascript

const configSets = require('config-sets');

const config = configSets({ 
    '-metadata-key1': ' key1 comment ',
    key1: 'value1', 
    '-metadata-key2': ' key2 comment ',
    key2: 'value2' 
});

const moduleConfig = configSets('moduleName', { key1: 'value1', key2: 'value2' });

console.log(config);

config.on('key1', function (ev) { console.log(ev); return true; });

```

file: `config-sets.json` 
```javascript
{
  "isProduction": true,
  "production": {
    /* key1 comment */
    "key1": "value1",
    /* key2 comment */
    "key2": "value2",
    "moduleName": {
        "key1": "value1",
        "key2": "value2"
    }
  },
  "development": {}
}
```


### Command-Line Arguments

You can pass configuration settings via command-line arguments:

`node index.js --key1=value1 --key2=value2`

`node index.js --help`


### Watching for Changes

The module watches the `config-sets.json` file for changes and updates the configuration settings accordingly.<br>
This uses the ['data-context'](https://www.npmjs.com/package/data-context) module. Read more about how to use it.

```javascript
config.on('key1', function (ev) { console.log(ev); return true; });
```

## Testing

You can test `config-sets` on your system using this command:

`node ./node_modules/config-sets/index.test`

or in the `config-sets` project directory:

`npm test`

## API

### Main Function

#### `configSets(configModuleName, defaultConfigSettings)`

- `configModuleName` (optional): The name of the module to set or update configuration settings for.
- `defaultConfigSettings`: The default configuration settings.

Returns the current configuration settings.

### Static Properties

- **`configSets.isProduction`**: Indicates if the environment is production.
- **`configSets.production`**: Contains production-specific configuration settings.
- **`configSets.development`**: Contains development-specific configuration settings.
- **`configSets.enableFileReadWrite`** (default: true): Determines if changes to the configuration should be saved automatically.

### Helper Functions

#### `assign(target, source, overwriteChanges)`

- `target`: The target object to merge properties into.
- `source`: The source object containing properties to merge.
- `overwriteChanges` (optional): A boolean indicating whether to overwrite existing properties in the target object.

Merges source objects into a target object.

#### `arg_options()`

Parses command-line arguments into an object.

Returns an object containing the parsed command-line arguments.

#### `print_help()`

Prints the help message.

## License

This project is licensed under the MIT License.

Copyright &copy; Manuel Lõhmus

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/donate?hosted_button_id=ESBQQHBB9LVWC)

Donations are welcome and will go towards further development of this project.

<br>
<br>
<br>
</div>
</div>
</div>