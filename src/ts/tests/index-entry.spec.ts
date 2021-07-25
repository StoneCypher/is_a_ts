
import {
  version, built, packagename
} from '../index'


test('version is a string',     () => expect(typeof version).toBe('string'));
test('version has two periods', () => expect(version.split('.').length).toBe(3));

test('built is a number', () => expect(typeof built).toBe('number'));

test('packagename is "is_a_ts"', () => expect(packagename).toBe('is_a_ts'));
