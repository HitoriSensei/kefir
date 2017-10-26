const {stream, prop, send} = require('../test-helpers')

describe('filter', () => {
  describe('stream', () => {
    it('should return stream', () => {
      expect(stream().filter(() => {})).toBeStream()
    })

    it('should activate/deactivate source', () => {
      const a = stream()
      expect(a.filter(() => {})).toActivate(a)
    })

    it('should be ended if source was ended', () => {
      expect(send(stream(), ['<end>']).filter(() => {})).toEmit(['<end:current>'])
    })

    it('should handle events', () => {
      const a = stream()
      expect(a.filter(x => x > 3)).toEmit([4, 5, {error: 7}, 6, '<end>'], () =>
        send(a, [1, 2, 4, 5, 0, {error: 7}, 6, '<end>'])
      )
    })

    it('shoud use id as default predicate', () => {
      const a = stream()
      expect(a.filter()).toEmit([4, 5, {error: 7}, 6, '<end>'], () => send(a, [0, 0, 4, 5, 0, {error: 7}, 6, '<end>']))
    })
  })

  describe('property', () => {
    it('should return property', () => {
      expect(prop().filter(() => {})).toBeProperty()
    })

    it('should activate/deactivate source', () => {
      const a = prop()
      expect(a.filter(() => {})).toActivate(a)
    })

    it('should be ended if source was ended', () => {
      expect(send(prop(), ['<end>']).filter(() => {})).toEmit(['<end:current>'])
    })

    it('should handle events and current', () => {
      let a = send(prop(), [5])
      expect(a.filter(x => x > 2)).toEmit([{current: 5}, 4, {error: 7}, 3, '<end>'], () =>
        send(a, [4, {error: 7}, 3, 2, 1, '<end>'])
      )
      a = send(prop(), [{error: 0}])
      expect(a.filter(x => x > 2)).toEmit([{currentError: 0}, 4, {error: 7}, 3, '<end>'], () =>
        send(a, [4, {error: 7}, 3, 2, 1, '<end>'])
      )
    })

    it('should handle current (not pass)', () => {
      const a = send(prop(), [1, {error: 0}])
      expect(a.filter(x => x > 2)).toEmit([{currentError: 0}])
    })

    it('shoud use id as default predicate', () => {
      let a = send(prop(), [0])
      expect(a.filter()).toEmit([4, {error: -2}, 5, 6, '<end>'], () => send(a, [0, 4, {error: -2}, 5, 0, 6, '<end>']))
      a = send(prop(), [1])
      expect(a.filter()).toEmit([{current: 1}, 4, {error: -2}, 5, 6, '<end>'], () =>
        send(a, [0, 4, {error: -2}, 5, 0, 6, '<end>'])
      )
    })
  })
})
