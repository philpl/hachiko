import { Node, KVKey } from './common'
import { copyArray } from '../util/array'
import ValueNode from './ValueNode'
import resolveConflict from './resolveConflict'

export default class CollisionNode<T> {
  level: number // NOTE: Receives their level from the parent
  hashCode: number
  keys: KVKey[]
  values: T[]
  size: number

  constructor(level: number, hashCode: number, keys: KVKey[], values: T[]) {
    this.level = level
    this.hashCode = hashCode
    this.keys = keys
    this.values = values
    this.size = keys.length
  }

  get(hashCode: number, key: KVKey, notSetVal?: T): T {
    const length = this.keys.length

    for (let index = 0; index < length; index++) {
      if (this.keys[index] === key) {
        return this.values[index]
      }
    }

    return notSetVal
  }

  set(hashCode: number, key: KVKey, value: T): Node<T> {
    // Resolve different hashCodes by branching off
    if (hashCode !== this.hashCode) {
      const valueNode = new ValueNode<T>(0, hashCode, key, value)

      return resolveConflict<T>(
        this.level,
        this.hashCode,
        this.clone(),
        hashCode,
        valueNode
      )
    }

    const length = this.keys.length
    let index: number

    for (index = 0; index < length; index++) {
      if (this.keys[index] === key) {
        break
      }
    }

    const keys = copyArray<KVKey>(this.keys)
    const values = copyArray<T>(this.values)

    keys[index] = key
    values[index] = value

    return new CollisionNode<T>(
      this.level,
      this.hashCode,
      keys,
      values
    )
  }

  private clone(): CollisionNode<T> {
    return new CollisionNode(
      this.level,
      this.hashCode,
      this.keys,
      this.values
    )
  }
}
