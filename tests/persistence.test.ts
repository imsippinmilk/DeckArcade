// @ts-nocheck
import { describe, expect, it } from 'vitest';
import { compress, decompress } from 'lz4js';

function roundTrip<T>(obj: T): T {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const data = enc.encode(JSON.stringify(obj));
  const blob = compress(data);
  const restored = decompress(blob);
  return JSON.parse(dec.decode(restored));
}

describe('persistence', () => {
  it('serialize -> compress -> decompress -> deserialize == original', () => {
    const original = { a: 1, b: 'test', c: [1, 2, 3] };
    const result = roundTrip(original);
    expect(result).toEqual(original);
  });
});
