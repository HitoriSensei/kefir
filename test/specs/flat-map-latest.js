const {stream, prop, send, activate, deactivate, Kefir} = require('../test-helpers')

describe('flatMapLatest', () => {
  describe('stream', () => {
    it('should return stream', () => {
      expect(stream().flatMapLatest()).toBeStream()
    })

    it('should activate/deactivate source', () => {
      const a = stream()
      expect(a.flatMapLatest()).toActivate(a)
    })

    it('should be ended if source was ended', () =>
      expect(send(stream(), ['<end>']).flatMapLatest()).toEmit(['<end:current>']))

    it('should handle events', () => {
      const a = stream()
      const b = stream()
      const c = send(prop(), [0])
      expect(a.flatMapLatest()).toEmit([1, 0, 3, 5, '<end>'], () => {
        send(b, [0])
        send(a, [b])
        send(b, [1])
        send(a, [c])
        send(b, [2])
        send(c, [3])
        send(a, [b, '<end>'])
        send(c, [4])
        send(b, [5, '<end>'])
      })
    })

    it('should activate sub-sources (only latest)', () => {
      const a = stream()
      const b = stream()
      const c = send(prop(), [0])
      const map = a.flatMapLatest()
      activate(map)
      send(a, [b, c])
      deactivate(map)
      expect(map).toActivate(c)
      expect(map).not.toActivate(b)
    })

    it('should accept optional map fn', () => {
      const a = stream()
      const b = stream()
      expect(a.flatMapLatest(x => x.obs)).toEmit([1, 2, '<end>'], () => {
        send(a, [{obs: b}, '<end>'])
        send(b, [1, 2, '<end>'])
      })
    })

    it('should correctly handle current values of sub sources on activation', () => {
      const a = stream()
      const b = send(prop(), [1])
      const c = send(prop(), [2])
      const m = a.flatMapLatest()
      activate(m)
      send(a, [b, c])
      deactivate(m)
      expect(m).toEmit([{current: 2}])
    })

    it('should correctly handle current values of new sub sources', () => {
      const a = stream()
      const b = send(prop(), [1])
      const c = send(prop(), [2])
      expect(a.flatMapLatest()).toEmit([1, 2], () => send(a, [b, c]))
    })

    it('should work nicely with Kefir.constant and Kefir.never', () => {
      const a = stream()
      expect(
        a.flatMapLatest(x => {
          if (x > 2) {
            return Kefir.constant(x)
          } else {
            return Kefir.never()
          }
        })
      ).toEmit([3, 4, 5], () => send(a, [1, 2, 3, 4, 5]))
    })
  })

  describe('property', () => {
    it('should return stream', () => {
      expect(prop().flatMapLatest()).toBeStream()
    })

    it('should activate/deactivate source', () => {
      const a = prop()
      expect(a.flatMapLatest()).toActivate(a)
    })

    it('should be ended if source was ended', () =>
      expect(send(prop(), ['<end>']).flatMapLatest()).toEmit(['<end:current>']))

    it('should be ended if source was ended (with value)', () =>
      expect(send(prop(), [send(prop(), [0, '<end>']), '<end>']).flatMapLatest()).toEmit([
        {current: 0},
        '<end:current>',
      ]))

    it('should correctly handle current value of source', () => {
      const a = send(prop(), [0])
      const b = send(prop(), [a])
      expect(b.flatMapLatest()).toEmit([{current: 0}])
    })
  })
})
