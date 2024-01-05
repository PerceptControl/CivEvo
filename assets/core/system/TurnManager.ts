import { IHistory } from "../types/History"

export class TurnManager {
  private _current = 0
  private _assignedHistory: IHistory[]

  assign(history: IHistory) {

  }

  get Turn() {
    return this._current
  }

  EndTurn() {
    for (let history of this._assignedHistory)
      history.Next()
    this._current++
  }
}


export const GlobalTurnManager = new TurnManager()