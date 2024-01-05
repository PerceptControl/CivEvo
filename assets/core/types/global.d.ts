import type { IHistory } from "./History"
import type { ExecuteResult } from "../template/Result"
import { EventsChain, EventsChainConfig } from "../system/EventsChain"

export interface StateQuery<T> {
  Field: string,
  Type: Constructable,
  Compute: (prev: T) => T
}

export type Transaction = {
  Author: string,
  NextTurn: boolean,
  Changes: StateQuery<unknown>[]
}

export interface Page {
  Serial: number,
  Transactions: Transaction[]
}

export type Constructable = {
  constructor: { name: string }
} & Object

export type EventCallback = (pages: IHistory | { pages: Page[], reserved: number }) => ExecuteResult

export interface Event {
  Name: string,
  Module: string,
  OrderPages?: number,
  Chains?: WeakMap<EventsChain, EventsChainConfig>,
  Callback: EventCallback
}

export interface FieldRecord<T> {
  Name: string
  Type: Constructable,
  Set(value: T): ExecuteResult,
  Get(): T,
}