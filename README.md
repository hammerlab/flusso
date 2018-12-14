[![Build Status](https://travis-ci.com/hammerlab/flusso.svg?branch=master)](https://travis-ci.com/hammerlab/flusso)
[![NPM version](https://img.shields.io/npm/v/flusso.svg)](https://www.npmjs.com/package/flusso)


# flusso
Dead simple FCS (Flow Cytometry Standard) file parsing utility.

## Install
### For developers
Checkout the repository and install all the dependencies as follows.
[`yarn`](https://yarnpkg.com/en/docs/install) is our preferred dependency manager:

```bash
$ git clone https://github.com/hammerlab/flusso.git
$ cd flusso
$ yarn
$ yarn link # so that we run as a command
```

## Use
### Command Line Interface (CLI)
Once you install `flusso`, you should be able to invoke
the CLI as follows:

```bash
$ flusso --help
Usage: flusso [options] [command]

Options:
  -V, --version       output the version number
  -h, --help          output usage information

Commands:
  json <fcsFile>      converts the FCS file into JSON format
  tsv <fcsFile>       converts the FCS file into TSV format
  validate <fcsFile>  parses the file and exits
  *                   prints help and exits
```

#### Validate
```bash
$ flusso validate test/testfile-Donor42-CD4-CD8.fcs \
    && echo "looks good"
looks good

$ touch /tmp/empty.fcs
$ flusso validate /tmp/empty.fcs 2> /dev/null \
    || echo "looks bad"
looks bad
```

#### Export as JSON
Recommended companion tool: [`jq`](https://stedolan.github.io/jq/).

```bash
$ flusso json test/testfile-Donor42-CD4-CD8.fcs | jq ".HEADER"
{
  "version": "FCS3.0",
  "_": "    ",
  "textBegin": 256,
  "textEnd": 3744,
  "dataBegin": 3748,
  "dataEnd": 13203747,
  "analysisBegin": 0,
  "analysisEnd": 0
}

$ flusso json test/testfile-Donor42-CD4-CD8.fcs | jq ".TEXT._TOT"
"300000"

$ flusso json test/testfile-Donor42-CD4-CD8.fcs | jq ".DATA | length"
300000

$ flusso json test/testfile-Donor42-CD4-CD8.fcs | jq ".DATA[0]"
[
  79785.59375,
  28077.822265625,
  18567.943359375,
  2307.93359375,
  384.65557861328125,
  379.2283630371094,
  174.4023895263672,
  6579.56591796875,
  45.95596694946289,
  103.18415069580078,
  331
]
```

#### Export as TSV
This will eat all the metadata expect the parameter names,
but is useful for streamlining the analysis across multiple files. Recommended companion tool: [`datamash`](https://www.gnu.org/software/datamash/).

```bash
$ flusso tsv test/testfile-Donor42-CD4-CD8.fcs | head -5
FileName	FSC-A	SSC-A	FITC-A	PE-A	PerCP-Cy5.5-A	PE-Cy7-A	APC-A	APC-Cy7-A	V450-A	V500-A	Time
test/testfile-Donor42-CD4-CD8.fcs	79785.59375	28077.822265625	18567.943359375	2307.93359375	384.65557861328125	379.2283630371094	174.4023895263672	6579.56591796875	45.95596694946289	103.18415069580078	331
test/testfile-Donor42-CD4-CD8.fcs	75418.953125	20048.900390625	16241.6923828125	1972.1231689453125	366.3386535644531	495.91400146484375	198.55947875976562	6481.75927734375	34.683746337890625	102.31705474853516	342
test/testfile-Donor42-CD4-CD8.fcs	73400.875	21521.71875	8060.80712890625	1018.2857666015625	24166.818359375	4319.404296875	101.34193420410156	804.2542724609375	29.481185913085938	117.05764770507812	344
test/testfile-Donor42-CD4-CD8.fcs	75060.1796875	27572.412109375	14014.4892578125	1778.7777099609375	36766.83203125	6424.49462890625	129.62339782714844	657.544189453125	67.63330841064453	45.088871002197266	351
test/testfile-Donor42-CD4-CD8.fcs	69146	22488.4453125	16298	1831.693359375	306.6390380859375	160.78196716308594	103.69872283935547	5276.26171875	47.69015121459961	73.70296478271484	354

$ flusso tsv test/testfile-Donor42-CD4-CD8.fcs | datamash -H mean 4 count 1
mean(FITC-A)	count(FileName)
15294.586121011	300000
```
