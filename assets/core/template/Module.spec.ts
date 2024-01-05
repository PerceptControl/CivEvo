import { describe } from "node:test";
import { History } from "../system/History";
import { Module } from "./Module";
import { ExecuteResult } from "./Result";
import { CoreError } from "../errors/Core";

class TestModule extends Module {
  static instances = 0
  public test1Counter = 0
  public test2Counter = 0

  constructor() {
    super()
    this._name = 'TestModule'
    this._history = new History(this._localState)
    TestModule.instances++

    this.on('test1', (history) => {
      this.test1Counter++
      return new ExecuteResult()
    })

    this.on('test2', (history) => {
      this.test2Counter++
      return new ExecuteResult()
    })

    this.on('test2', (history) => {
      this.test2Counter++
      return new ExecuteResult()
    })
  }

  test() {
    this._history.Next()
    return this._history.CurrentSerial
  }
}

describe('testing module', () => {
  describe('instancing', () => {
    let actualInstances = 0
    describe('single', () => {
      it('creation', () => {
        let module = new TestModule()
        actualInstances++
        expect(module).toBeInstanceOf(TestModule)
      })

      it('usage', () => {
        let module = new TestModule()
        actualInstances++
        module.test()
        expect(module.History.CurrentSerial).toBe(1)
      })
    })

    describe('multiple', () => {
      it('creation', () => {
        let module = new TestModule()
        let module1 = new TestModule()
        actualInstances += 2
        expect(module).toBeInstanceOf(TestModule)
        expect(module1).toBeInstanceOf(TestModule)
        expect(TestModule.instances).toBe(actualInstances)
      })

      it('usage', () => {
        let module = new TestModule()
        module.test()
        expect(module.History.CurrentSerial).toBe(1)
      })
    })
  })

  describe('event using', () => {
    it('single', () => {
      let module = new TestModule()
      module.Notify('test1')
      expect(module.test1Counter).toBe(1)
    })

    it('multiple', () => {
      let module = new TestModule()
      module.Notify('test2')
      expect(module.test2Counter).toBe(2)
    })

    it('not existing', () => {
      let module = new TestModule()
      let result = module.Notify('test3')
      expect(result[0].error).toBeInstanceOf(CoreError)
    })
  })
})