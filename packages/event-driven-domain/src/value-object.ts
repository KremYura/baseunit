import { Jsonify } from 'type-fest';

type Primitive = string | number | boolean | symbol | null | undefined;
type AllowedValueType = Primitive | ValueObject<any>;
type BaseValueType = AllowedValueType | Record<PropertyKey, AllowedValueType>;

export abstract class ValueObject<ValueType extends BaseValueType> {
  private readonly _value: Readonly<ValueType>;

  constructor(value: ValueType) {
    this._value = Object.freeze(value);
  }

  equals(vo?: ValueObject<ValueType>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.constructor !== this.constructor) {
      return false;
    }
    return JSON.stringify(this._value) === JSON.stringify(vo._value);
  }

  get value(): Readonly<ValueType> {
    return this._value;
  }

  protected toJSON(): Jsonify<ValueType> {
    // more correct way to `return this.value`, if we call toJSON from code and have nested VOs in value
    return JSON.parse(JSON.stringify(this.value));
  }
}
