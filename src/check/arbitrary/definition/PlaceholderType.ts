/**
 * Placeholder structure
 *
 * Instances of PlaceholderType might be accepted by some Arbitraries
 * in order to let them choose the best values instead of letting the choice to the user
 */
export class PlaceholderType {
  private constructor(private readonly holder: symbol) {}
  is(other: PlaceholderType): boolean {
    return this.holder === other.holder;
  }

  static Default: PlaceholderType = new PlaceholderType(Symbol.for('fast-check/placeholder/default'));
}

/**
 * Alias for PlaceholderType.Default
 */
export const _ = PlaceholderType.Default;
