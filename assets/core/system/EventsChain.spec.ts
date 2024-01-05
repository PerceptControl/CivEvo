import { CoreError } from "../errors/Core";
import { EventsChain } from "./EventsChain";

import { History } from "./History";
import { State } from "./State";

jest.mock('./History')
jest.mock('./State')

describe('test managing', () => {
  let chain: EventsChain
  beforeEach(() => {
    chain = new EventsChain()
  })

  it('correct: add multiple', () => {
    let mock = jest.fn()
    expect(chain.Add({ Name: 'test', Module: 'test', Callback: mock }).ok).toBeTruthy()
    expect(chain.Add({ Name: 'test', Module: 'test', Callback: mock }).ok).toBeTruthy()
    chain.Execute(new History(new State()))
    expect(mock.mock.calls.length).toBe(2)
  })

  it('wrong: add same', () => {
    let mock = jest.fn()
    let Event = { Name: 'test', Module: 'test', Callback: mock }
    chain.Add(Event)
    expect(chain.Add(Event).error).toBeInstanceOf(CoreError)
    chain.Execute(new History(new State()))
    expect(mock.mock.calls.length).toBe(1)
  })

  it('wrong: remove', () => {
    let mock = jest.fn()
    let Event = { Name: 'test', Module: 'test', Callback: mock }
    chain.Add(Event)

    let removeRes = chain.Remove({ Name: 'test', Module: 'test', Callback: mock })
    expect(removeRes.error).toBeInstanceOf(CoreError)
  })
})