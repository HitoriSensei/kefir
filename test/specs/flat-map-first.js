const {stream, prop, send, activate, deactivate, Kefir, expect} = require('../test-helpers')

describe('flatMapFirst', () => {
  describe('stream', () => {
    it('should return stream', () => {
      expect(stream().flatMapFirst()).to.be.observable.stream()
    })

    it('should activate/deactivate source', () => {
      const a = stream()
      expect(a.flatMapFirst()).to.activate(a)
    })

    it('should be ended if source was ended', () =>
      expect(send(stream(), ['<end>']).flatMapFirst()).to.emit(['<end:current>']))

    it('should handle events', () => {
      const a = stream()
      const b = stream()
      const c = stream()
      expect(a.flatMapFirst()).to.emit([1, 2, 4, '<end>'], () => {
        send(b, [0])
        send(a, [b])
        send(b, [1])
        send(a, [c])
        send(b, [2, '<end>'])
        send(c, [3])
        send(a, [c, '<end>'])
        send(c, [4, '<end>'])
      })
    })

    it('should activate sub-sources (only first)', () => {
      const a = stream()
      const b = stream()
      const c = send(prop(), [0])
      const map = a.flatMapFirst()
      activate(map)
      send(a, [b, c])
      deactivate(map)
      expect(map).to.activate(b)
      expect(map).not.to.activate(c)
    })

    it('should accept optional map fn', () => {
      const a = stream()
      const b = stream()
      expect(a.flatMapFirst(x => x.obs)).to.emit([1, 2, '<end>'], () => {
        send(a, [{obs: b}, '<end>'])
        send(b, [1, 2, '<end>'])
      })
    })

    it('should correctly handle current values of sub sources on activation', () => {
      const a = stream()
      const b = send(prop(), [1])
      const c = send(prop(), [2])
      const m = a.flatMapFirst()
      activate(m)
      send(a, [b, c])
      deactivate(m)
      expect(m).to.emit([{current: 1}])
    })

    it('should correctly handle current values of new sub sources', () => {
      const a = stream()
      const b = send(prop(), [1, '<end>'])
      const c = send(prop(), [2])
      const d = send(prop(), [3])
      expect(a.flatMapFirst()).to.emit([1, 2], () => send(a, [b, c, d]))
    })

    it('should work nicely with Kefir.constant and Kefir.never', () => {
      const a = stream()
      expect(
        a.flatMapFirst(x => {
          if (x > 2) {
            return Kefir.constant(x)
          } else {
            return Kefir.never()
          }
        })
      ).to.emit([3, 4, 5], () => send(a, [1, 2, 3, 4, 5]))
    })

    it('should not call transformer function when skiping values', () => {
      let count = 0
      const a = stream()
      const b = stream()
      const c = stream()
      const result = a.flatMapFirst(x => {
        count++
        return x
      })
      activate(result)
      expect(count).to.equal(0)
      send(a, [b])
      expect(count).to.equal(1)
      send(a, [c])
      expect(count).to.equal(1)
      send(b, ['<end>'])
      expect(count).to.equal(1)
      send(a, [c])
      expect(count).to.equal(2)
    })
  })

  describe('property', () => {
    it('should return stream', () => {
      expect(prop().flatMapFirst()).to.be.observable.stream()
    })

    it('should activate/deactivate source', () => {
      const a = prop()
      expect(a.flatMapFirst()).to.activate(a)
    })

    it('should be ended if source was ended', () =>
      expect(send(prop(), ['<end>']).flatMapFirst()).to.emit(['<end:current>']))

    it('should be ended if source was ended (with value)', () =>
      expect(send(prop(), [send(prop(), [0, '<end>']), '<end>']).flatMapFirst()).to.emit([
        {current: 0},
        '<end:current>',
      ]))

    it('should correctly handle current value of source', () => {
      const a = send(prop(), [0])
      const b = send(prop(), [a])
      expect(b.flatMapFirst()).to.emit([{current: 0}])
    })
  })
})
