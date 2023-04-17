# CSVParse

A utility for parsing CSV files and converting them to JSON format in Node.js. The `CSVParse` class is easy to use and can handle large CSV files, allowing you to start and stop at specific line numbers and use custom delimiters.

## Features

- Parse large CSV files with configurable start and stop line numbers
- Supports custom delimiters and file encodings
- Optional header row support
- Can specify errorCallback to handle errors

## Installation

```bash
npm install @ochoalopes/csvparse
```

## Usage

Import the `CSVParse` class and create a new instance:

```javascript
import { CSVParse } from '@ochoalopes/csvparse';

const csvParse = new CSVParse();
```

Then, call the parseToJson method:

csvParse.parseToJson(filePathToRead, filePathToWrite, fileHasHeader, encoding, delimiter, startFrom, stopAt, errorCallback);

### Parameters

- `filePathToRead` (string) - The path of the CSV file to read.
- `filePathToWrite` (string) - The path of the JSON file to write.
- `fileHasHeader` (boolean, optional, default: `false`) - Set to `true` if the CSV file has a header row.
- `encoding` (BufferEncoding, optional, default: `'utf-8'`) - The encoding of the CSV file.
- `delimiter` (string, optional, default: `'|'`) - The delimiter used in the CSV file.
- `startFrom` (number, optional, default: `0`) - The line number to start parsing from (inclusive).
- `stopAt` (number, optional, default: `0`) - The line number to stop parsing at (inclusive).
- `errorCallback` (function, optional) - A callback function that receives an `Error` object if an error occurs during parsing.

Example:

```javascript
csvParse.parseToJson('./data/input.csv', './data/output.json', true, 'utf-8', ',', 1, 100, (error) => {
  console.error('Error occurred:', error.message);
});
```

### Tests

```run
npm test
```
 ## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
