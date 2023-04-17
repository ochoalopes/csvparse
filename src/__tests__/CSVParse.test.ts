import fs from 'fs';
import { CSVParse } from '..';
import path from 'path';

describe('CSVParse', () => {
  const csvParse = new CSVParse();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('parseToJson - basic functionality', async () => {
    const testInputFilePath = path.join(__dirname, 'data', 'test-input.csv');
    const testOutputFilePath = path.join(__dirname, 'data', 'test-output.json');

    fs.writeFileSync(testInputFilePath, 'header1|header2\nvalue1|value2\nvalue3|value4', 'utf-8');

    await csvParse.parseToJson(testInputFilePath, testOutputFilePath, true);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const outputFileContent = fs.readFileSync(testOutputFilePath, 'utf-8');
    expect(outputFileContent).toBe('[{"header1":"value1","header2":"value2"},{"header1":"value3","header2":"value4"}]');

    // Cleanup
    fs.unlinkSync(testInputFilePath);
    fs.unlinkSync(testOutputFilePath);
  });

  test('parseToJson - error handling', async () => {
    const invalidInputFilePath = path.join(__dirname, 'data', 'nonexistent.csv');
    const testOutputFilePath = path.join(__dirname, 'data', 'test-output.json');

    const errorCallback = jest.fn((err: Error) => {});

    await csvParse.parseToJson(invalidInputFilePath, testOutputFilePath, true, 'utf-8', ',', 0, 0, errorCallback);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    expect(errorCallback).toHaveBeenCalled();
  });
});
