import type { FieldRecord, StateQuery } from "../types/global"
import type { IState } from "../types/State"

import type { Module } from "../template/Module"
import { CoreError } from "../errors/Core"

export class State implements IState {
  private fields: Map<string, FieldRecord<unknown>> = new Map()

  public use(module: Module) {
    for (let field of module.Fields()) {
      this.fields.set(`${module.Name}:${field.Name}`, field)
    }
  }

  public push(transaction: StateQuery<unknown>[]) {
    for (let query of transaction) {
      if (!this.fields.has(query.Field)) throw new CoreError(`Не существует параметра с именем ${query.Field}`)
      let field = this.fields.get(query.Field)

      if (field.Type.constructor.name === query.Type.constructor.name) continue
      let current = query.Compute(field.Get())

      let executionResult = field.Set(current)
      if (!executionResult.ok) throw executionResult.error
    }
  }

  public read(field: string) {
    return this.fields.get(field).Get()
  }
}
