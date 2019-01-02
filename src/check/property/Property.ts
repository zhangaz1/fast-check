import { Arbitrary } from '../arbitrary/definition/Arbitrary';
import { tuple } from '../arbitrary/TupleArbitrary';
import { property } from './Property.generated';
import { Property } from './Property.generic';

type ArbitraryTuple<Ts> = { [P in keyof Ts]: Arbitrary<Ts[P]> };
type Prop<Ts extends any[]> = (...args: Ts) => boolean | void;

// Signature change... :/
export function property2<Ts extends any[]>(arbs: ArbitraryTuple<Ts>, predicate: Prop<Ts>): Property<Ts> {
  return new Property(tuple<Ts>(...(arbs as any)), t => predicate(...t));
}

export { property, Property };
