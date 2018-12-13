const fcsParser = require('./lib/fcs_parser');

let fcs = fcsParser.fromFile('test/testfile-Donor42-CD4-CD8.fcs');
console.log(JSON.stringify(fcs));
