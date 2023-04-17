import { ICSVParse } from '../interfaces/ICSVParse';
import fs from 'fs';
import byline, { LineStream, LineStreamOptions } from 'byline';
import path from 'path';

export class CSVParse implements ICSVParse {
  private firstLine: boolean = true;
  private lineNumber: number = 0;
  private jsonKeys: string[] = [];
  private firstObjectWritten: boolean = false;

  async parseToJson(
    filePathToRead: string,
    filePathToWrite: string,
    fileHasHeader: boolean = false,
    encoding: BufferEncoding = 'utf-8',
    delimiter: string = '|',
    startFrom: number = 0,
    stopAt: number = 0,
    errorCallback?: (err: Error) => void,
  ): Promise<void> {
    const options = {
      keepEmptyLines: false,
      keepTrailingNewLine: false,
      encoding,
      autoDetect: true,
    } as LineStreamOptions;

    try {
      // Validate the input file path

      await this.validateFilePath(
        filePathToRead,
        // tslint:disable-next-line:no-bitwise
        fs.constants.F_OK | fs.constants.R_OK,
        'Input file not found or not readable.',
      );

      // Validate the output file directory
      const outputDir = path.dirname(filePathToWrite);
      await this.validateFilePath(
        outputDir,
        // tslint:disable-next-line:no-bitwise
        fs.constants.F_OK | fs.constants.W_OK,
        'Output directory not found or not writable.',
      );
    } catch (error) {
      if (error instanceof Error) {
        // Invoke the error callback with the error
        if (errorCallback) {
          errorCallback(error);
        }
      } else {
        const unknownError = new Error('An unknown error occurred.');
        if (errorCallback) {
          errorCallback(unknownError);
        }
      }
      return;
    }

    const readStream = byline(fs.createReadStream(filePathToRead), options);
    const writeStream = fs.createWriteStream(filePathToWrite, { encoding });

    // Write the opening bracket for the JSON array
    writeStream.write('[');

    readStream.on('error', (error) => this.onErrorEvent(error, readStream, writeStream, errorCallback));
    readStream.on('data', (chunk) =>
      this.onDataEvent(chunk, readStream, writeStream, delimiter, fileHasHeader, startFrom, stopAt),
    );
    readStream.on('end', () => this.onEndEvent(writeStream));
  }

  private onErrorEvent(
    error: Error,
    readStream: LineStream,
    writeStream: fs.WriteStream,
    errorCallback?: (err: Error) => void,
  ) {
    // Close the read stream
    readStream.destroy();

    // Close the write stream
    writeStream.end();
    // Invoke the error callback, if provided
    if (errorCallback) {
      errorCallback(error);
    }
  }

  private onDataEvent(
    chunk: any,
    readStream: LineStream,
    writeStream: fs.WriteStream,
    delimiter: string,
    fileHasHeader: boolean,
    startFrom: number,
    stopAt: number,
  ): void {
    this.lineNumber++;

    if (startFrom > 0 && this.lineNumber < startFrom) {
      return;
    }

    if (stopAt > 0 && this.lineNumber > stopAt) {
      readStream.destroy(); // Stop reading the stream
      return;
    }

    const line = chunk.toString().split(delimiter) as string[];

    if (this.firstLine) {
      this.jsonKeys = this.setUpJsonKeys(line, fileHasHeader);
      this.firstLine = false;
      return;
    }

    const jsonObject: any = {};
    for (let i = 0; i < line.length; i++) {
      jsonObject[this.jsonKeys[i].toString()] = line[i];
    }

    if (this.firstObjectWritten) {
      writeStream.write(',');
    }

    // Write the JSON object to the writable stream
    writeStream.write(JSON.stringify(jsonObject));

    this.firstObjectWritten = true;
  }

  private onEndEvent(writeStream: fs.WriteStream) {
    // Write the closing bracket for the JSON array
    writeStream.write(']');

    // Close the writable stream
    writeStream.end();
  }

  private setUpJsonKeys(header: string[], fileHasHeader: boolean): string[] {
    const jsonObject: string[] = [];
    for (let i = 0; i < header.length; i++) {
      jsonObject.push(fileHasHeader ? header[i] : `key${i + 1}`);
    }
    return jsonObject;
  }

  private validateFilePath(filePath: string, mode: number, errorMessage: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.access(filePath, mode, (err) => {
        if (err) {
          reject(new Error(errorMessage));
        } else {
          resolve();
        }
      });
    });
  }
}
