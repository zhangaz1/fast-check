import * as assert from 'assert';
import * as fc from '../../../../lib/fast-check';

import { Arbitrary } from '../../../../src/check/arbitrary/definition/Arbitrary';
import { _, PlaceholderType } from '../../../../src/check/arbitrary/definition/PlaceholderType';
import { constantFrom } from '../../../../src/check/arbitrary/ConstantArbitrary';
import {
  stringOf,
  string,
  asciiString,
  string16bits,
  unicodeString,
  fullUnicodeString,
  hexaString,
  base64String
} from '../../../../src/check/arbitrary/StringArbitrary';

import * as genericHelper from './generic/GenericArbitraryHelper';

import * as stubRng from '../../stubs/generators';

const minMax = fc
  .tuple(fc.integer(0, 10000), fc.integer(0, 10000))
  .map(t => (t[0] < t[1] ? { min: t[0], max: t[1] } : { min: t[1], max: t[0] }));

const isValidStringArbitrary = function(
  arbitraryBuilder: (minLength?: number | PlaceholderType, maxLength?: number | PlaceholderType) => Arbitrary<string>,
  isOneOfValues: (v: string) => boolean
): void {
  it('Should have same outputs for *String() and *String(_, _)', () =>
    fc.assert(
      fc.property(fc.integer(), seed => {
        assert.strictEqual(
          arbitraryBuilder(_, _).generate(stubRng.mutable.fastincrease(seed)).value,
          arbitraryBuilder().generate(stubRng.mutable.fastincrease(seed)).value
        );
      })
    ));
  it('Should have same outputs for *String(maxLength) and *String(_, maxLength)', () =>
    fc.assert(
      fc.property(fc.integer(), fc.nat(100), (seed, maxLength) => {
        assert.strictEqual(
          arbitraryBuilder(_, maxLength).generate(stubRng.mutable.fastincrease(seed)).value,
          arbitraryBuilder(maxLength).generate(stubRng.mutable.fastincrease(seed)).value
        );
      })
    ));
  describe('Given no length constraints', () => {
    genericHelper.isValidArbitrary(() => arbitraryBuilder(_, _), {
      isValidValue: (g: string) => typeof g === 'string' && [...g].every(isOneOfValues)
    });
  });
  describe('Given minimal length only', () => {
    genericHelper.isValidArbitrary((minLength: number) => arbitraryBuilder(minLength, _), {
      seedGenerator: fc.nat(50),
      isValidValue: (g: string, minLength: number) =>
        typeof g === 'string' && [...g].length >= minLength && [...g].every(isOneOfValues)
    });
  });
  describe('Given maximal length only', () => {
    genericHelper.isValidArbitrary((maxLength: number) => arbitraryBuilder(_, maxLength), {
      seedGenerator: fc.nat(100),
      isValidValue: (g: string, maxLength: number) =>
        typeof g === 'string' && [...g].length <= maxLength && [...g].every(isOneOfValues)
    });
  });
  describe('Given minimal and maximal lengths', () => {
    genericHelper.isValidArbitrary(
      (constraints: { min: number; max: number }) => arbitraryBuilder(constraints.min, constraints.max),
      {
        seedGenerator: genericHelper.minMax(fc.nat(100)),
        isValidValue: (g: string, constraints: { min: number; max: number }) =>
          typeof g === 'string' &&
          [...g].length >= constraints.min &&
          [...g].length <= constraints.max &&
          [...g].every(isOneOfValues)
      }
    );
  });
};
describe('StringArbitrary', () => {
  describe('stringOf', () => {
    isValidStringArbitrary(
      (a, b) =>
        a == null
          ? stringOf(constantFrom('\u{1f431}', 'D', '1').noShrink())
          : b == null
            ? stringOf(constantFrom('\u{1f431}', 'D', '1').noShrink(), a as number)
            : stringOf(constantFrom('\u{1f431}', 'D', '1').noShrink(), a, b),
      (c: string) => c === '\u{1f431}' || c === 'D' || c === '1'
    );
  });
  describe('string', () => {
    isValidStringArbitrary(string, (c: string) => 0x20 <= c.charCodeAt(0) && c.charCodeAt(0) <= 0x7e);
  });
  describe('asciiString', () => {
    isValidStringArbitrary(asciiString, (c: string) => 0x00 <= c.charCodeAt(0) && c.charCodeAt(0) <= 0x7f);
  });
  describe('unicodeString', () => {
    isValidStringArbitrary(
      unicodeString,
      (c: string) =>
        0x0000 <= c.charCodeAt(0) &&
        c.charCodeAt(0) <= 0xffff &&
        !(0xd800 <= c.charCodeAt(0) && c.charCodeAt(0) <= 0xdfff)
    );
  });
  describe('fullUnicodeString', () => {
    isValidStringArbitrary(fullUnicodeString, (c: string) => true);
  });
  describe('hexaString', () => {
    isValidStringArbitrary(hexaString, (c: string) => ('0' <= c && c <= '9') || ('a' <= c && c <= 'f'));
  });
  describe('base64String', () => {
    function isValidBase64(g: string) {
      const valid = (c: string) =>
        ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || c === '+' || c === '/';
      const padStart = g.indexOf('=');
      return g
        .substr(0, padStart === -1 ? g.length : padStart)
        .split('')
        .every(valid);
    }
    function hasValidBase64Padding(g: string) {
      const padStart = g.indexOf('=');
      return g
        .substr(padStart === -1 ? g.length : padStart)
        .split('')
        .every(c => c === '=');
    }
    it('Should have same outputs for base64String() and base64String(_, _)', () =>
      fc.assert(
        fc.property(fc.integer(), seed => {
          assert.strictEqual(
            base64String(_, _).generate(stubRng.mutable.fastincrease(seed)).value,
            base64String().generate(stubRng.mutable.fastincrease(seed)).value
          );
        })
      ));
    it('Should have same outputs for base64String(maxLength) and base64String(_, maxLength)', () =>
      fc.assert(
        fc.property(fc.integer(), fc.nat(100), (seed, maxLength) => {
          assert.strictEqual(
            base64String(_, maxLength).generate(stubRng.mutable.fastincrease(seed)).value,
            base64String(maxLength).generate(stubRng.mutable.fastincrease(seed)).value
          );
        })
      ));
    describe('Given no length constraints', () => {
      genericHelper.isValidArbitrary(() => base64String(_, _), {
        isValidValue: (g: string) =>
          typeof g === 'string' && g.length % 4 === 0 && isValidBase64(g) && hasValidBase64Padding(g)
      });
    });
    describe('Given minimal length only', () => {
      genericHelper.isValidArbitrary((minLength: number) => base64String(minLength, _), {
        seedGenerator: fc.nat(50),
        isValidValue: (g: string, minLength: number) =>
          typeof g === 'string' &&
          [...g].length >= minLength &&
          g.length % 4 === 0 &&
          isValidBase64(g) &&
          hasValidBase64Padding(g)
      });
    });
    describe('Given maximal length only', () => {
      genericHelper.isValidArbitrary((maxLength: number) => base64String(_, maxLength), {
        seedGenerator: fc.nat(100),
        isValidValue: (g: string, maxLength: number) =>
          typeof g === 'string' &&
          [...g].length <= maxLength &&
          g.length % 4 === 0 &&
          isValidBase64(g) &&
          hasValidBase64Padding(g)
      });
    });
    describe('Given minimal and maximal lengths', () => {
      genericHelper.isValidArbitrary(
        (constraints: { min: number; max: number }) => base64String(constraints.min, constraints.max),
        {
          seedGenerator: genericHelper.minMax(fc.nat(100)).filter(l => l.max >= l.min + 4),
          isValidValue: (g: string, constraints: { min: number; max: number }) =>
            typeof g === 'string' &&
            [...g].length >= constraints.min &&
            [...g].length <= constraints.max &&
            g.length % 4 === 0 &&
            isValidBase64(g) &&
            hasValidBase64Padding(g)
        }
      );
    });
  });
});
