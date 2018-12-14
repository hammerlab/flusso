#!/usr/bin/env node

var program = require("commander");
var flusso = require(".");

let fcsParser = flusso.fcsParser;

program.version("0.1.1");

program
  .command("json <fcsFile>")
  .description("converts the FCS file into JSON format")
  .action(fcsFile => {
    let fcs = fcsParser.fromFile(fcsFile);
    console.log(JSON.stringify(fcs));
  });

program
  .command("tsv <fcsFile>")
  .description("converts the FCS file into TSV format")
  .action(fcsFile => {
    let fcs = fcsParser.fromFile(fcsFile);
    let tsvHeader = "FileName";
    for (i = 1; i <= fcs.TEXT._PAR; i++) {
      tsvHeader += "\t" + fcs.TEXT[`_P${i}N`];
    }
    console.log(tsvHeader);

    for (i = 0; i < fcs.DATA.length; i++) {
      let eventData = fcs.DATA[i].join("\t");
      process.stdout.write(`${fcsFile}\t${eventData}\n`);
    }
  });

program
  .command("validate <fcsFile>")
  .description("parses the file and exits")
  .action(fcsFile => {
    // Just parse and do nothing
    fcsParser.fromFile(fcsFile);
  });

program
  .command("*")
  .description("prints help and exits")
  .action(() => {
    program.help();
  });

program.parse(process.argv);

if (program.args.length < 1) {
  program.help();
}
