// Module import
const Parser = require("binary-parser").Parser;
const fs = require("fs");
const assert = require('assert').strict;


// Minimal size
const FCS_HEADER_SIZE = 58;

// To be used within the exported data
const FCS_SEGMENT_HEADER = "HEADER";
const FCS_SEGMENT_TEXT = "TEXT";
const FCS_SEGMENT_DATA = "DATA";
const FCS_SEGMENT_ANALYSIS = "ANALYSIS";

// Standard header offset field description
const FCS_HEADER_8CHAR_OFFSET = {
  length: 8,
  formatter: (str) => parseInt(str)
}

// Common parser definitions
var headerParser = new Parser()
  .string("version", { length: 6 })
  .string("_", { length: 4})
  .string("textBegin", FCS_HEADER_8CHAR_OFFSET)
  .string("textEnd", FCS_HEADER_8CHAR_OFFSET)
  .string("dataBegin", FCS_HEADER_8CHAR_OFFSET)
  .string("dataEnd", FCS_HEADER_8CHAR_OFFSET)
  .string("analysisBegin", FCS_HEADER_8CHAR_OFFSET)
  .string("analysisEnd", FCS_HEADER_8CHAR_OFFSET)
; // We are ignoring potential custom header fields


const parseHeader = headerBuffer => headerParser.parse(headerBuffer);


const parseText = textBuffer => {
  textStr = textBuffer.toString();

  // Find out which delimiter to use and split the text
  delim = textStr.charAt(0);

  // Turn the splitted text into a map
  values = textStr.split(delim);
  let textMap = {};
  for(i = 1; i < values.length; i += 2) {
    let normalizedKey = values[i]
      .replace("$", "_")
      .replace(" ", "_");
    textMap[normalizedKey] = values[i+1];
  }
  return textMap;
};


const parseData = (dataBuffer, numOfParams, numOfEvents) => {
  let dataParser = new Parser()
    .array(null, {
      type: new Parser().array(null, { type: "floatle", length: numOfParams }),
      length: numOfEvents
    })
  ;

  data = dataParser.parse(dataBuffer);
  return data;
};


const combineSegments = (header, text, data, analysis=null) => {
  let fcs = {};

  // Believe or not,
  //  these are more reliable than the ones in the header
  text._BEGINDATA = header.dataBegin = parseInt(text._BEGINDATA);
  text._ENDDATA = header.dataEnd = parseInt(text._ENDDATA);

  fcs[FCS_SEGMENT_HEADER] = header;
  fcs[FCS_SEGMENT_TEXT] = text;
  fcs[FCS_SEGMENT_DATA] = data;
  fcs[FCS_SEGMENT_ANALYSIS] = analysis;

  return fcs;
};


const fromFile = fileName => {
  let headerBuffer = Buffer.alloc(FCS_HEADER_SIZE);

  let fd = fs.openSync(fileName, 'r');
  assert.strictEqual(
    FCS_HEADER_SIZE,
    fs.readSync(fd, headerBuffer, 0, FCS_HEADER_SIZE, 0)
  );
  let header = parseHeader(headerBuffer);

  let textSize = header.textEnd - header.textBegin;
  let textBuffer = Buffer.alloc(textSize);
  fs.readSync(fd, textBuffer, 0, textSize, header.textBegin);
  let text = parseText(textBuffer);

  let dataLength = text._ENDDATA - text._BEGINDATA + 1;
  let dataBuffer = Buffer.alloc(dataLength);
  fs.readSync(fd, dataBuffer, 0, dataLength, text._BEGINDATA);
  let data = parseData(
    dataBuffer,
    parseInt(text._PAR),
    parseInt(text._TOT)
  );

  return combineSegments(header, text, data);
};


module.exports = {
  fromFile,
  parseHeader,
  parseData,
  parseText
};
