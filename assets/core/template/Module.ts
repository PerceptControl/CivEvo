import type { Event, EventCallback, FieldRecord } from "../types/global";

import { State } from "../system/State";
import { CoreError } from "../errors/Core";
import { ExecuteResult } from "./Result";
import { History } from "../system/History";
import { EventsChain } from "../system/EventsChain";

export abstract class Module {
  protected _name: string

  private _events: Map<string, EventsChain> = new Map()
  private _fields: Map<string, FieldRecord<unknown>> = new Map()

  protected readonly _localState = new State()
  protected _history = new History(this._localState)

  get Name() {
    return this._name
  }

  get History() {
    return this._history
  }

  get State() {
    return this._localState
  }

  Notify(event: string): ExecuteResult[] {
    if (!this._events || !this._events.has(event)) return [new ExecuteResult(false, new CoreError('No events'))]

    return this._events.get(event).Execute(this._history)
  }

  Fields(): FieldRecord<unknown>[] {
    return Array.from(this._fields.values())
  }

  Events(): EventsChain[] {
    return Array.from(this._events.values())
  }

  protected on(eventName: string, callback: EventCallback) {
    const event: Event = { Module: this._name, Name: eventName, Callback: callback }
    if (this._events.has(event.Name))
      return void this._events.get(event.Name).Add(event)

    const chain = new EventsChain()
    chain.Add(event)
    this._events.set(event.Name, chain)
  }
}