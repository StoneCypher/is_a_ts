
import { typeGuard } from '../index'


class A { a: string = 'a'; }
class B extends A { b: number = 5; }


test('Knows 5 is number', () => expect(typeGuard(5, 'number')).toBe(true));
test('Knows 5 is not string', () => expect(typeGuard(5, 'string')).toBe(false));

test('Knows new A is an A', () => expect(typeGuard(new A(), A)).toBe(true));
test('Knows new B is also an A', () => expect(typeGuard(new B(), A)).toBe(true));

test('Knows new A is not a B', () => expect(typeGuard(new A(), B)).toBe(false));
test('Knows new B is a B', () => expect(typeGuard(new B(), B)).toBe(true));

test('Knows new B is not a string', () => expect(typeGuard(new B(), 'string')).toBe(false));
