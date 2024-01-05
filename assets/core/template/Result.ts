import { CoreError } from "../errors/Core";

export class ExecuteResult {
  constructor(private _ok: boolean = true, private _error?: CoreError) { }
  get ok() {
    return this._ok
  }

  get error() {
    return this._error
  }
}