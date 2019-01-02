import { Arbitrary } from './definition/Arbitrary';
import { genericTuple } from './TupleArbitrary.generic';

type ArbitraryTuple<Ts> = { [P in keyof Ts]: Arbitrary<Ts[P]> };

function tuple<Ts extends any[]>(...arbs: ArbitraryTuple<Ts>): Arbitrary<Ts> {
  return genericTuple(arbs) as any;
}

export { tuple, genericTuple };
