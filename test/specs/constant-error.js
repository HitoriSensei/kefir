const {Kefir} = require('../test-helpers')

describe('constantError', () => {
  it('should return property', () => {
    expect(Kefir.constantError(1)).toBeProperty()
  })

  it('should be ended and has a current error', () => {
    expect(Kefir.constantError(1)).toEmit([{currentError: 1}, '<end:current>'])
  })
})
