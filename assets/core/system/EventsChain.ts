import { CoreError } from "../errors/Core";
import { ExecuteResult } from "../template/Result";
import { IHistory } from "../types/History";
import { Event, Page } from "../types/global";

export type EventsChainConfig = {
  ID_IN_CHAIN: number,
  ORDERED_PAGES: number,
  RESERVED_TICKET: number,
}

export class EventsChain {
  private _events: Event[] = []
  private _reservedPagesValues: Set<number> = new Set()
  private _reservedPagesCounter: Map<number, number> = new Map()
  private _maxReservedPage: number = -1

  public Execute(history: IHistory): ExecuteResult[] {
    const results = []
    const reserved = { pages: null, reserved: this._maxReservedPage }
    for (let event of this._events) {
      if (event.OrderPages == -1 || this._maxReservedPage == -1) {
        results.push(event.Callback(history))
        continue
      }
      results.push(event.Callback({ pages: history.GetLast(this._maxReservedPage), reserved: this._maxReservedPage }))
    }

    return results
  }

  public Add(event: Event): ExecuteResult {
    let res = this._addEventToChain(event)
    if (!res.ok) return res

    this._orderPages(event)
    return new ExecuteResult()
  }

  public Remove(event: Event): ExecuteResult {
    if (!event.Chains || !event.Chains.has(this))
      return new ExecuteResult(false, new CoreError('event doesn`t exist in chain'))
    this._cancelReservation(event)
    event.Chains.delete(this)
    return new ExecuteResult()
  }

  private _addEventToChain(event: Event): ExecuteResult {
    if (!event.Chains)
      event.Chains = new WeakMap()
    if (event.Chains.has(this))
      return new ExecuteResult(false, new CoreError('event already used in chain'))
    this._getEventConfig(event).ORDERED_PAGES = this._events.push(event)
    return new ExecuteResult()
  }

  private _orderPages(event: Event) {
    if (!event.OrderPages) return
    if (!this._reservedPagesValues.has(event.OrderPages)) {
      this._reservedPagesValues.add(event.OrderPages)
      this._reservedPagesCounter.set(event.OrderPages, 1)
      if (event.OrderPages > this._maxReservedPage) this._maxReservedPage = event.OrderPages
    } else {
      this._reservedPagesCounter.set(event.OrderPages, this._reservedPagesCounter.get(event.OrderPages) + 1)
    }


    this._getEventConfig(event).ORDERED_PAGES = event.OrderPages
  }

  private _cancelReservation(event: Event) {
    if (!event.OrderPages || !this._reservedPagesValues.has(event.OrderPages))
      return

    let newReservedFlagValue = this._reservedPagesCounter.get(event.OrderPages) - 1
    if (newReservedFlagValue > 1)
      return void this._reservedPagesCounter.set(event.OrderPages, newReservedFlagValue)

    this._reservedPagesValues.delete(event.OrderPages)
    this._reservedPagesCounter.delete(event.OrderPages)
    this._pickNewOrderedMaximum()

  }

  private _pickNewOrderedMaximum() {
    let maximum = 0
    this._reservedPagesValues.forEach((value) => {
      if (value > maximum) maximum = value
    })
    this._maxReservedPage = maximum
  }

  private _getEventConfig(event: Event): EventsChainConfig {
    if (event.Chains.has(this))
      return event.Chains.get(this)

    let newConfig: EventsChainConfig = { ID_IN_CHAIN: null, ORDERED_PAGES: null, RESERVED_TICKET: null }
    event.Chains.set(this, newConfig)

    return newConfig
  }
}