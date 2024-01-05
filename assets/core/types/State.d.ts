import { Module, StateQuery } from "./global";

export interface IState {
  use(module: Module)
  push(transaction: StateQuery<unknown>[])
  read(field: string): unknown
}