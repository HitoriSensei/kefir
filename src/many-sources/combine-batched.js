import {inherit} from '../utils/objects'
import {Combine, handleCombineParameters} from './combine'

function CombineBatched(active, passive, combinator) {
  Combine.call(this, active, passive, combinator)
}

inherit(CombineBatched, Combine, {
  _isQueued: false,
  _isAlive: true,

  _emitQueued() {
    if (this._isAlive) {
      this._isQueued = false
      Combine.prototype._emitIfFull.call(this)
    }
  },

  _emitCombined(source) {
    if (this._isAlive && !this._isQueued) {
      this._isQueued = true

      source._batchingQueue.push(this)
    }
  },

  _clear() {
    if (this._isQueued) {
      this._emitQueued()
    }
    this._isAlive = false
    return Combine.prototype._clear.call(this)
  },
})

export default function combineBatched(active, passive, combinator) {
  return handleCombineParameters(active, passive, combinator, CombineBatched)
}
