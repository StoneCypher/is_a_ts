
// there's a fake endpoint to get the tutorial in the docs
// test it to maintain coverage

import { z_tutorial } from '../is_a';

test('tutorial stub', () => expect(z_tutorial()).toBe(''));
