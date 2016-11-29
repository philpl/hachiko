import Node from './Node'
import { KVKey, Predicate, Transform, Option } from '../constants'
import CollisionNode from './CollisionNode'
import resolveConflict from './resolveConflict'

export default class ValueNode<T> {
  level: number // NOTE: Receives their level from the parent
  size: number
  hashCode: number
  key: KVKey
  value: T
  owner?: Object

  constructor(
    level: number,
    hashCode: number,
    key: KVKey,
    value: T,
    owner?: Object
  ) {
    this.level = level
    this.size = 1
    this.hashCode = hashCode
    this.key = key
    this.value = value
    this.owner = owner
  }

  get(hashCode: number, key: KVKey, notSetVal?: T): Option<T> {
    if (key !== this.key) {
      return notSetVal
    }

    return this.value
  }

  set(hashCode: number, key: KVKey, value: T, owner?: Object): Node<T> {
    if (key === this.key) {
      if (owner && owner === this.owner) {
        this.value = value
        return this
      }

      return new ValueNode<T>(
        this.level,
        this.hashCode,
        this.key,
        value,
        owner
      )
    }

    if (hashCode === this.hashCode) {
      const keys: KVKey[] = [ this.key, key ]
      const values: T[] = [ this.value, value ]

      return new CollisionNode(
        this.level,
        this.hashCode,
        keys,
        values,
        owner
      )
    }

    return resolveConflict<T>(
      this.level,
      this.hashCode,
      this.clone(owner),
      hashCode,
      new ValueNode<T>(0, hashCode, key, value, owner),
      owner
    )
  }

  delete(hashCode: number, key: KVKey, owner?: Object): Option<ValueNode<T>> {
    if (key === this.key) {
      return undefined
    }

    return this
  }

  map<G>(transform: Transform<T, G>, owner?: Object): Node<G> {
    const value = transform(this.value, this.key)

    if (owner && owner === this.owner) {
      const res = (this as ValueNode<any>)
      res.value = value
      return (res as ValueNode<G>)
    }

    return new ValueNode<G>(
      this.level,
      this.hashCode,
      this.key,
      value,
      owner
    )
  }

  iterate(step: Predicate<T>) {
    return step(this.value, this.key)
  }

  private clone(owner?: Object): ValueNode<T> {
    return new ValueNode<T>(
      this.level,
      this.hashCode,
      this.key,
      this.value,
      owner
    )
  }
}
