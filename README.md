# schema-parser

## Functionality
* `schemaParser(prop)` only function that should run
* `unitTestFrameWork()` to run 'custom' unit tests for this file
* `testObj` used to visual demostration with output in to console > (line 184)
* `Enums` created custom only for convenience

## Prevention
* `schemaParser()` is used only for the schema as an object, but can also be used as a viewer for 'JSON.parse()'
* `unitTestFrameWork()` cover only the main parser and functions that return random values. Handlers can be tested using libs with toHaveBeenCalled and others, skiped to save time
* `getStringByPattern()` highly specific and should be replaced with randexp.js 
