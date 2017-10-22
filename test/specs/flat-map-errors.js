{stream, prop, send, activate, deactivate, Kefir} = require('../test-helpers.coffee')


describe 'flatMapErrors', ->


  describe 'stream', ->

    it 'should return stream', ->
      expect(stream().flatMapErrors()).toBeStream()

    it 'should activate/deactivate source', ->
      a = stream()
      expect(a.flatMapErrors()).toActivate(a)

    it 'should be ended if source was ended', ->
      expect(send(stream(), ['<end>']).flatMapErrors()).toEmit ['<end:current>']

    it 'should handle events', ->
      a = stream()
      b = stream()
      c = send(prop(), [0])
      expect(a.flatMapErrors()).toEmit [1, 2, 0, 3, 4, '<end>'], ->
        send(b, [0])
        send(a, [{error: b}])
        send(b, [1, 2])
        send(a, [{error: c}, '<end>'])
        send(b, [3, '<end>'])
        send(c, [4, '<end>'])

    it 'should activate sub-sources', ->
      a = stream()
      b = stream()
      c = send(prop(), [0])
      map = a.flatMapErrors()
      activate(map)
      send(a, [{error: b}, {error: c}])
      deactivate(map)
      expect(map).toActivate(b, c)

    it 'should accept optional map fn', ->
      a = stream()
      b = stream()
      expect(a.flatMapErrors((x) -> x.obs)).toEmit [1, 2, '<end>'], ->
        send(b, [0])
        send(a, [{error: {obs: b}}, '<end>'])
        send(b, [1, 2, '<end>'])

    it 'should correctly handle current values of sub sources on activation', ->
      a = stream()
      b = send(prop(), [1])
      c = send(prop(), [2])
      m = a.flatMapErrors()
      activate(m)
      send(a, [{error: b}, {error: c}])
      deactivate(m)
      expect(m).toEmit [{current: 1}, {current: 2}]

    it 'should correctly handle current values of new sub sources', ->
      a = stream()
      b = send(prop(), [1])
      c = send(prop(), [2])
      expect(a.flatMapErrors()).toEmit [1, 2], ->
        send(a, [{error: b}, {error: c}])

    it 'should work nicely with Kefir.constant and Kefir.never', ->
      a = stream()
      expect(
        a.valuesToErrors().flatMapErrors (x) ->
          if x > 2
            Kefir.constant(x)
          else if x < 0
            Kefir.constantError(x)
          else
            Kefir.never()
      ).toEmit [3, {error: -1}, 4, {error: -2}, 5], ->
        send(a, [1, 2, 3, -1, 4, -2, 5])

    it 'values should flow', ->
      a = stream()
      expect(a.flatMapErrors()).toEmit [1, 2, 3], ->
        send(a, [1, 2, 3])

    it 'should be possible to add same obs twice on activation', ->
      b = send(prop(), [1])
      a = Kefir.stream (em) ->
        em.error(b)
        em.error(b)
      expect(a.flatMapErrors()).toEmit [{current: 1}, {current: 1}]






  describe 'property', ->



    it 'should be ended if source was ended (with current error)', ->
      expect(
        send(prop(), [{error: send(prop(), [0, '<end>'])}, '<end>']).flatMapErrors()
      ).toEmit [{current: 0}, '<end:current>']

    it 'should not costantly adding current value on each activation', ->
      a = send(prop(), [0])
      b = send(prop(), [{error: a}])
      map = b.flatMapErrors()
      activate(map)
      deactivate(map)
      activate(map)
      deactivate(map)
      expect(map).toEmit [{current: 0}]

    it 'should allow to add same obs several times', ->
      b = send(prop(), ['b0'])
      c = stream()
      a = send(prop(), [b])
      expect(a.valuesToErrors().flatMapErrors()).toEmit [
        {current: 'b0'}, 'b0', 'b0', 'b0', 'b0',
        'b1', 'b1', 'b1', 'b1', 'b1',
        'c1', 'c1', 'c1',
        '<end>'
      ], ->
        send(a, [b, c, b, c, c, b, b, '<end>'])
        send(b, ['b1', '<end>'])
        send(c, ['c1', '<end>'])

    it 'should correctly handle current error of source', ->
      a = send(prop(), [0])
      b = send(prop(), [{error: a}])
      expect(b.flatMapErrors()).toEmit [{current: 0}]

    it 'values should flow', ->
      a = send(prop(), [0])
      expect(a.flatMapErrors()).toEmit [{current: 0}, 1, 2, 3], ->
        send(a, [1, 2, 3])


