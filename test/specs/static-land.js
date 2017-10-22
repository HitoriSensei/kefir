let {Kefir} = require('../test-helpers')
const {Observable} = Kefir.staticLand

describe('Kefir.staticLand.Observable', () => {
  it('of works', () => {
    expect(Observable.of(2)).toEmit([{current: 2}, '<end:current>'])
  })

  it('empty works', () => {
    expect(Observable.empty()).toEmit(['<end:current>'])
  })

  it('concat works', () => {
    expect(Observable.concat(Observable.of(2), Observable.empty())).toEmit([{current: 2}, '<end:current>'])
  })

  it('map works', () => {
    expect(Observable.map(x => x * 3, Observable.of(2))).toEmit([{current: 6}, '<end:current>'])
  })

  it('bimap works', () => {
    expect(Observable.bimap(x => x, x => x * 3, Observable.of(2))).toEmit([{current: 6}, '<end:current>'])
    expect(Observable.bimap(x => x * 3, x => x, Kefir.constantError(2))).toEmit([{currentError: 6}, '<end:current>'])
  })

  it('ap works', () => {
    expect(Observable.ap(Observable.of(x => x * 3), Observable.of(2))).toEmit([{current: 6}, '<end:current>'])
  })

  it('chain works', () => {
    expect(Observable.chain(x => Observable.of(x * 3), Observable.of(2))).toEmit([{current: 6}, '<end:current>'])
  })
})
