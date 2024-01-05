import { Page, Transaction } from "../types/global"
import type { IHistory } from "../types/History"


import { State } from "./State"
import { TurnManager } from "./TurnManager"
import { ExecuteResult } from "../template/Result"

export class History implements IHistory {
  private _currentSerial = 0
  private _pages: Page[] = []
  constructor(private _userState: State, private _turnManager?: TurnManager) {
  }

  get State() {
    return this._userState
  }

  get CurrentSerial() {
    if (this._turnManager) return this._turnManager.Turn
    return this._currentSerial
  }

  get CurrentPage() {
    if (this._pages.length == 0) return this._createPage()

    let Page = this._pages[this._pages.length - 1]
    if (Page.Serial == this.CurrentSerial) return Page

    throw Error('Invalid turn')
  }

  public Store(transactions: Transaction[]): ExecuteResult {
    const Page = this.CurrentPage
    for (let transaction of transactions) {
      this._userState.push(transaction.Changes)
      Page.Transactions.push(transaction)
      if (transaction.NextTurn && this._turnManager) this.Next()
    }

    return new ExecuteResult()
  }


  public Search(from: number, to: number): Page[] {
    const pages = []
    for (let [index, page] of this._pages.entries()) {
      if (index > from && index < to) pages.push(page)
    }

    return pages
  }

  public GetLast(count: number): Page[] {
    const pages = []
    for (let i = this._pages.length, picked = 0; this._pages.length - count > i; i--, picked++)
      pages[picked] = this._pages[i]

    return pages
  }

  public Next() {
    if (this._turnManager)
      return void this._turnManager.EndTurn()
    this._currentSerial++
  }

  private _createPage() {
    this._pages[this._pages.length] = {
      Serial: !!this._turnManager ? this._turnManager.Turn : this.CurrentSerial,
      Transactions: new Array(),
    }
    return this._pages[this._pages.length - 1]
  }
}
