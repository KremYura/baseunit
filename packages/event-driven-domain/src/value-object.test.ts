import { describe, expect, it, vi } from 'vitest';
import { ValueObject } from './value-object';

describe('ValueObject', () => {
  it('should provide value based on initial value', () => {
    class StringVO extends ValueObject<string> {}
    const stringVO = new StringVO('test');
    
    expect(stringVO.value).toBe('test');
  });

  it('should not allow to change value', () => {
    expect.assertions(1);
    class Currency extends ValueObject<{ code: string; }> {}
    const usd = new Currency({ code: 'USD' });
    
    try {
      // @ts-expect-error
      usd.value.code = 'USD code';
    } catch(e) {
      expect(usd.value.code).toBe('USD');
    }
  });

  it('should equals two objects with the same values', () => {
    class Currency extends ValueObject<{ code: string; name: string; }> {}
    const usd1 = new Currency({ code: 'USD', name: 'US Dollar' });
    const usd2 = new Currency({ code: 'USD', name: 'US Dollar' });

    expect(usd1.equals(usd2)).toBe(true);
  });

  it('should NOT equal two objects with different values', () => {
    class Currency extends ValueObject<{ code: string; name: string; }> {}
    const usd1 = new Currency({ code: 'USD', name: 'US Dollar' });
    const usd2 = new Currency({ code: 'USD2', name: 'US Dollar' });

    expect(usd1.equals(usd2)).toBe(false);
  });

  it('should NOT equal two objects based on different classes even with the same values', () => {
    class Currency extends ValueObject<{ code: string; name: string; }> {}
    class Currency2 extends ValueObject<{ code: string; name: string; }> {}
    const usd1 = new Currency({ code: 'USD', name: 'US Dollar' });
    const usd2 = new Currency2({ code: 'USD', name: 'US Dollar' });

    expect(usd1.equals(usd2)).toBe(false);
  });

  it('should NOT equal two objects if compared with null | undefined', () => {
    class Currency extends ValueObject<{ code: string; name: string; }> {}
    const usd1 = new Currency({ code: 'USD', name: 'US Dollar' });

    // @ts-expect-error
    expect(usd1.equals(null)).toBe(false);
    expect(usd1.equals(undefined)).toBe(false);
  });

  it('should return JSON representation for value', () => {
    class Currency extends ValueObject<{ code: string; name: string; }> {}
    const usd = new Currency({ code: 'USD', name: 'US Dollar' });

    expect(JSON.parse(JSON.stringify(usd))).toStrictEqual({ code: 'USD', name: 'US Dollar' });
  })
});