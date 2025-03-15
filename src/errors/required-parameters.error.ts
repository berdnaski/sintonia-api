export class RequiredParametersError extends Error {
  private _message: string;
  private _statusCode: number;
  private _code: string

  constructor(message: string, statusCode = 500, code: string = "") {
    super(message);
    this._message = message;
    this._statusCode = statusCode;
    this._code = code
  }

  get message() {
    return this._message;
  }

  get statusCode() {
    return this._statusCode;
  }

  get code() {
    return this._code;
  }
}
