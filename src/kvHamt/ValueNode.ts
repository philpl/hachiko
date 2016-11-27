import { Node, KVKey } from './common'
import CollisionNode from './CollisionNode'
import BitmapIndexedNode from './BitmapIndexedNode'
import resolveConflict from './resolveConflict'

export default class ValueNode<T> {
  level: number // NOTE: Receives their level from the parent
  size: number
  hashCode: number
  key: KVKey
  value: T

  constructor(level: number, hashCode: number, key: KVKey, value: T) {
    this.level = level
    this.size = 1
    this.hashCode = hashCode
    this.key = key
    this.value = value
  }

  get(hashCode: number, key: KVKey, notSetVal?: T): T {
    if (key !== this.key) {
      return notSetVal
    }

    return this.value
  }

  set(hashCode: number, key: KVKey, value: T): Node<T> {
    if (key === this.key) {
      return new ValueNode<T>(
        this.level,
        this.hashCode,
        this.key,
        value
      )
    }

    if (hashCode === this.hashCode) {
      const keys: KVKey[] = [ this.key, key ]
      const values: T[] = [ this.value, value ]

      return new CollisionNode(
        this.level,
        this.hashCode,
        keys,
        values
      )
    }

    return resolveConflict<T>(
      this.level,
      this.hashCode,
      this.clone(),
      hashCode,
      new ValueNode<T>(0, hashCode, key, value)
    )
  }

  private clone(): ValueNode<T> {
    return new ValueNode<T>(
      this.level,
      this.hashCode,
      this.key,
      this.value
    )
  }
}
