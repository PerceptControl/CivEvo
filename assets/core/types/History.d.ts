import type { IState } from "../types/State";
import type { Page, Transaction } from "../types/global";
import type { ExecuteResult } from "../template/Result";

export interface IHistory {
  get State(): IState,
  get CurrentSerial(): number,
  get CurrentPage(): Page

  Store(transaction: Transaction[]): ExecuteResult,
  Search(from: number, to: number): Page[],
  GetLast(count: number): Page[],
  Next(): void
}