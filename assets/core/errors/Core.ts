export class CoreError extends Error {
  constructor(message: string) {
    super(`[core]: ${message}`)
  }
}