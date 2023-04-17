export interface ICSVParse {
  parseToJson(
    filePathToRead: string,
    filePathToWrite: string,
    fileHasHeader: boolean,
    encoding: BufferEncoding,
    delimiter: string,
    startFrom: number,
    stopAt: number,
    errorCallback?: (err: Error) => void,
  ): Promise<void>;
}
