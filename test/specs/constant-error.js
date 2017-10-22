/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Kefir = require('../../dist/kefir')

describe('constantError', function() {
  it('should return property', () => expect(Kefir.constantError(1)).toBeProperty())

  return it('should be ended and has a current error', () =>
    expect(Kefir.constantError(1)).toEmit([{currentError: 1}, '<end:current>']))
})
