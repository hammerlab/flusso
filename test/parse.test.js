const fcsParser = require("../lib/fcs_parser");

describe("parses an FCS file", () => {
  let fcs = fcsParser.fromFile("test/testfile-Donor42-CD4-CD8.fcs");

  test("captures version", () => {
    expect(fcs.HEADER.version).toBe("FCS3.0");
  });

  test("finds where the DATA segment starts and ends", () => {
    expect(fcs.HEADER.dataBegin).toBe(3748);
    expect(fcs.HEADER.dataEnd).toBe(13203747);
  });

  test("extracts all the events", () => {
    expect(fcs.TEXT._TOT).toBe("300000");
    expect(fcs.DATA).toHaveLength(300000);
  });

  test("uses all the parameters", () => {
    expect(fcs.TEXT._PAR).toBe("11");
    expect(fcs.DATA[0]).toHaveLength(11);
  });

  test("captures tube name", () => {
    expect(fcs.TEXT.TUBE_NAME).toBe("2a");
  });
});

describe("parses segments from Buffer", () => {
  test("parses HEADER", () => {
    let headerBuffer = Buffer.from(
      "FCS3.0         256    3744    374813203747       0       0"
    );
    let header = fcsParser.parseHeader(headerBuffer);

    expect(header.version).toBe("FCS3.0");
    expect(header.dataBegin).toBe(3748);
    expect(header.dataEnd).toBe(13203747);
    expect(header.dataBegin).toBe(3748);
    expect(header.dataEnd).toBe(13203747);
  });

  test("parses TEXT", () => {
    let textBuffer = Buffer.from(
      "|$BEGINDATA|3748|$ENDDATA|13203747|TUBE NAME|2a|GUID|abcde"
    );
    let text = fcsParser.parseText(textBuffer);

    expect(text._BEGINDATA).toBe("3748");
    expect(text._ENDDATA).toBe("13203747");
    expect(text.TUBE_NAME).toBe("2a");
    expect(text.GUID).toBe("abcde");
    expect(Object.keys(text)).toHaveLength(4);
  });

  test("parses DATA", () => {
    let dataBuffer = Buffer.from(
      "cdcccc3d3333134066663642664645c4664645c46666364233331340cdcccc3d",
      "hex"
    );
    let numOfParams = 4;
    let numOfEvents = 2;
    let data = fcsParser.parseData(dataBuffer, numOfParams, numOfEvents);

    expect(data).toHaveLength(numOfEvents);

    expect(data[0]).toHaveLength(numOfParams);
    expect(data[0][0]).toBeCloseTo(0.1);
    expect(data[0][1]).toBeCloseTo(2.3);
    expect(data[0][2]).toBeCloseTo(45.6);
    expect(data[0][3]).toBeCloseTo(-789.1);

    expect(data[1]).toHaveLength(numOfParams);
    expect(data[1][3]).toBeCloseTo(0.1);
    expect(data[1][2]).toBeCloseTo(2.3);
    expect(data[1][1]).toBeCloseTo(45.6);
    expect(data[1][0]).toBeCloseTo(-789.1);
  });
});
