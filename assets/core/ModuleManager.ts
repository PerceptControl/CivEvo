import type { Event } from "./types/global"
import type { Module } from "./template/Module"
import type { History } from "./system/History"

import { ExecuteResult } from "./template/Result"

export class ModuleMager {
  private _modules: Map<string, Module> = new Map()
  private _events: Map<string, Event[]> = new Map()

  constructor(private _history: History) {
  }

  public register(module: Module): ExecuteResult {
    this._history.State.use(module)
    for (let event of module.Events()) {
      this._storeEvent(module, event)
    }
    return new ExecuteResult()
  }


  public forget(module: Module): ExecuteResult {
    this._removeModule(module)
    return new ExecuteResult()
  }


  public emit(event: string): ExecuteResult {
    for (let eventCard of this._events.get(event)) {
      let result = eventCard.Callback(this._history)
      if (!result.ok) return result
    }

    return new ExecuteResult()
  }


  private _storeEvent(module: Module, event: Event) {
    if (!this._events.has(event.Name)) this._events.set(event.Name, [event])
    else this._events.get(event.Name).push(event)

    if (!this._modules.has(module.Name)) this._modules.set(module.Name, module)
  }

  private _removeModule(module: Module) {
    if (!this._modules.has(module.Name)) return

    for (let event of this._modules.get(module.Name).Events())
      this._events.get(event.Name).splice(
        this._events.get(event.Name).findIndex((elem) => {
          return event.Name == elem.Name && event.Module == elem.Module
        }),
        1,
      )

    this._modules.delete(module.Name)
  }
}
