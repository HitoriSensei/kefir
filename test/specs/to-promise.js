const {stream, prop, send} = require('../test-helpers')

function Promise1(cb) {
  const promise = {type: 1, fulfilled: false, rejected: false}
  cb(
    x => {
      promise.fulfilled = true
      promise.result = x
    },
    x => {
      promise.rejected = true
      promise.result = x
    }
  )
  return promise
}

function Promise2(cb) {
  const promise = {type: 2, fulfilled: false, rejected: false}
  cb(
    x => {
      promise.fulfilled = true
      promise.result = x
    },
    x => {
      promise.rejected = true
      promise.result = x
    }
  )
  return promise
}

let _global = null
if (typeof global !== 'undefined') {
  _global = global
}
if (typeof self !== 'undefined') {
  _global = self
}

const originalGlobalPromise = _global.Promise

describe('toPromise', () => {
  beforeEach(() => {
    _global.Promise = Promise2
  })
  afterEach(() => {
    _global.Promise = originalGlobalPromise
  })

  describe('stream', () => {
    it('should return a promise', () => {
      expect(stream().toPromise().type).toBe(2)
      expect(stream().toPromise(Promise1).type).toBe(1)
    })

    it('should not fulfill/reject if obs ends without value', () => {
      let promise = send(stream(), ['<end>']).toPromise()
      expect(promise.fulfilled || promise.rejected).toBe(false)

      promise = send(stream(), ['<end>']).toPromise(Promise1)
      expect(promise.fulfilled || promise.rejected).toBe(false)
    })

    it('should fulfill with latest value on end', () => {
      let a = stream()
      let promise = a.toPromise()
      send(a, [1, {error: -1}, 2, '<end>'])
      expect(promise.fulfilled).toBe(true)
      expect(promise.result).toBe(2)

      a = stream()
      promise = a.toPromise(Promise1)
      send(a, [1, 2, '<end>'])
      expect(promise.fulfilled).toBe(true)
      expect(promise.result).toBe(2)
    })

    it('should reject with latest error on end', () => {
      let a = stream()
      let promise = a.toPromise()
      send(a, [{error: -1}, 1, {error: -2}, '<end>'])
      expect(promise.rejected).toBe(true)
      expect(promise.result).toBe(-2)

      a = stream()
      promise = a.toPromise(Promise1)
      send(a, [{error: -1}, 1, {error: -2}, '<end>'])
      expect(promise.rejected).toBe(true)
      expect(promise.result).toBe(-2)
    })

    it('should throw when called without Promise constructor and there is no global promise', () => {
      _global.Promise = undefined
      let error = null
      try {
        stream().toPromise()
      } catch (e) {
        error = e
      }
      expect(error.message).toBe("There isn't default Promise, use shim or parameter")
    })
  })

  describe('property', () => {
    it('should handle currents (resolved)', () => {
      let promise = send(prop(), [1, '<end>']).toPromise()
      expect(promise.fulfilled).toBe(true)
      expect(promise.result).toBe(1)

      promise = send(prop(), [1, '<end>']).toPromise(Promise1)
      expect(promise.fulfilled).toBe(true)
      expect(promise.result).toBe(1)
    })

    it('should handle currents (rejected)', () => {
      let promise = send(prop(), [{error: -1}, '<end>']).toPromise()
      expect(promise.rejected).toBe(true)
      expect(promise.result).toBe(-1)

      promise = send(prop(), [{error: -1}, '<end>']).toPromise(Promise1)
      expect(promise.rejected).toBe(true)
      expect(promise.result).toBe(-1)
    })
  })
})
