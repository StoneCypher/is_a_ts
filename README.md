# is_a_ts

Typescript implementation of
[generic type guard, by Ran Lottem](https://dev.to/krumpet/generic-type-guard-in-typescript-258l)

[![Node.js CI](https://github.com/StoneCypher/is_a_ts/actions/workflows/node.js.yml/badge.svg)](https://github.com/StoneCypher/is_a_ts/actions/workflows/node.js.yml) [![Coverage Status](https://coveralls.io/repos/github/StoneCypher/is_a_ts/badge.svg?branch=main)](https://coveralls.io/github/StoneCypher/is_a_ts?branch=main)

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/StoneCypher/is_a_ts/blob/master/LICENSEs)
[![NPM Version](https://img.shields.io/npm/v/is_a_ts.svg?style=flat)]()
[![Issues](https://img.shields.io/github/issues-raw/StoneCypher/is_a_ts.svg?maxAge=25000)](https://github.com/StoneCypher/is_a_ts/issues)
[![GitHub contributors](https://img.shields.io/github/contributors/StoneCypher/is_a_ts.svg?style=flat)]()


<br/><br/>

## What is this?

The mechanism that most Typescript developers use to distinguish types,
`instanceof`, doesn't work at runtime - only compiletime.  Making a runtime
version [is a complicated affair](https://dev.to/krumpet/generic-type-guard-in-typescript-258l).

This library exists to centralize and test an function called `is_a` (aka
`typeGuard`) to solve this problem.



<br/><br/>

## ... What is this?

Consider implementing `.from` on a custom container.  Don't worry about the long
signature; it's just an example.

To implement `.from`, your container has an internal typed `Array`, and so in
implementing `.from`, you'd want to iterate over the input, to make sure all of
the contents fit storage.  Initially you might think "well, `source` is typed,
should be fine."

```typescript

class SomeContainer<T> {

  _storage: T[];

  static from<T>(source: Iterable<T> | ArrayLike<T>): T[] {

    const inst = new SomeContainer<T>

    source.forEach(item => {
      if (item instanceof T) {   // HA!
        _storage.push(T);
      }
    });

  }

}
```

See the place where The Joker is laughing at you?  That's because ***instanceof
is a compile time thing***, and what you're doing requires runtime type
inference.

Turns out there isn't a particularly good way to do this in TS.  But I found one
on [some developer's blog](https://dev.to/krumpet/generic-type-guard-in-typescript-258l),
so here, we've productionalized it, and automated the test set.

It's now relatively simple.

```typescript
import { is_a } from 'is_a_ts';

class SomeContainer<T> {

  _storage: T[];

  static from<T>(source: Iterable<T> | ArrayLike<T>): T[] {

    const inst = new SomeContainer<T>

    source.forEach(item => {
      if (is_a(item, T)) {   // Okay then
        _storage.push(T);
      }
    });

  }

}
```

Nice and simple, the way code ought to be.