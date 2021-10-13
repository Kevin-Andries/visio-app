export default class AppError {
  code: number;
  message: string;
  isOperational: boolean;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
    this.isOperational = true;
  }
}
