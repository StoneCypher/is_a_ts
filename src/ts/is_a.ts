
interface typeMap { // for mapping from strings to types
  string  : string;
  number  : number;
  boolean : boolean;
}





type PrimitiveOrConstructor = // 'string' | 'number' | 'boolean' | constructor
  | { new (...args: any[]): any }
  | keyof typeMap;





// infer the guarded type from a specific case of PrimitiveOrConstructor
type GuardedType<T extends PrimitiveOrConstructor> =
  T extends { new(...args: any[]): infer U; }
    ? U
    : T extends keyof typeMap
      ? typeMap[T]
      : never;





// finally, guard ALL the types!
function typeGuard<T extends PrimitiveOrConstructor>(o: unknown, className: T): o is GuardedType<T> {

  const localPrimitiveOrConstructor: PrimitiveOrConstructor = className;

  if (typeof localPrimitiveOrConstructor === 'string') {
    return typeof o === localPrimitiveOrConstructor;
  }

  return o instanceof localPrimitiveOrConstructor;

}






/*********
 *
 * # Generic type guard in Typescript
 *
 * `#typescript` `#javascript` `#typeguards` `#generictypes`
 *
 * <cite>Ran Lottem</cite> ・ Apr 7, 2019 ・ 10 min read
 *
 * <a href="https://dev.to/krumpet/generic-type-guard-in-typescript-258l">Copy of this original tutorial</a>
 *
 *
 *
 *
 *
 * <br/><br/>
 *
 * <h3>Writing a generic type guard in Typescript, and what I learned from it</h3>
 *
 * * <a href="#introduction">Introduction</a>
 *     * Introducing the Constructor type signature
 *     * Extending the type guard to work for primitive types
 * * Putting it all together
 * * In summary
 *     * Sources
 *     * Addendum
 *
 *
 *
 *
 *
 * <br/><br/>
 *
 * <h1 id="introduction">Introduction</h1>
 *
 * I recently had a problem at work which stemmed from a function assuming its
 * input is of one type, while in fact it sometimes could be of a different
 * type.
 *
 * My initial attempt to fix the problem was to determine what types the input
 * could have, and to fix the function declaration so that the input's type is
 * the union of all possible types, and to then use type guards within the
 * function. Something like taking this function:
 *
 * ```typescript
 * export function myFunc(a: TypeA[]): void {
 *   // ...
 * }
 * ```
 *
 * and refactoring it into:
 *
 * ```typescript
 * export function myFunc(a: TypeA[] | TypeB[]): void {
 *   if (a.every(e => e instanceof TypeA)) {
 *     // ...
 *   } else {
 *     // ...
 *   }
 * }
 * ```
 *
 * This made me want to write a generic version of a type guard. Then using it
 * in an array would be as simple as:
 *
 * ```typescript
 * a instanceof Array && a.every(typeGuard<T>)`
 * ```
 *
 * But what is this `typeGuard<T>`? Well, I already wrote a type guard for some
 * `TypeA` in the example above, so a generic type guard could simply wrap a
 * call to instanceof. We will see a less trivial implementation later. For
 * now, we have:
 *
 * ```typescript
 * export function typeGuard<T>(o: any): o is T {
 *   return o instanceof T;
 * }
 * ```
 *
 * This gives us an error, however: `T` only refers to a type, but is being used as a value here.
 *
 * The issue here is that the type `T` is not always available at runtime, since it could be an interface - a construct that is not accessible to the underlying JavaScript. This means that writing a generic type guard to discern between interfaces wouldn't have worked - though one could write non-generic type guards for specific interfaces. This does work for classes, however:
 *
 * ```typescript
 * class myClass {}
 *
 * function classTypeGuard(object: any): boolean {
 *   return object instanceof myClass;
 * }
 * ```
 *
 * Even if we weren't trying to be generic over `T`, we would get the same error - the bit of code e instanceof `TypeA` above gives the same error about `TypeA` only referring to a type.
 *
 * How, then, can we pass the function the type we want to check object is an instance of? For a class like myClass above, we would want to pass myClass itself to the function, like so:
 *
 * ```typescript
 * function typeGuard(o, className) {
 *   return o instanceof className;
 * }
 *
 * const myClassObject = new myClass();
 *
 * typeGuard(myClassObject, myClass); // returns true
 * ```
 *
 *
 *
 *
 *
 * <br/><br/>
 *
 * <h2 id="constructor">Introducing the Constructor type signature</h2>
 *
 * The above works, but we haven't specified any type restrictions on the className variable. A line like `typeGuard(myClassObject, 5)` raises no errors, but would cause a runtime `TypeError: Right-hand side of 'instanceof' is not an object`. We need to add a restriction on `className`'s type such that only `object`s that can be on the right side of `instanceof` can be used. This restriction stems from the definition of `instanceof` in JavaScript, where the `object` needs to be a `constructor` for some type. We can do this by specifying `className`'s type like so:
 *
 * ```typescript
 * type Constructor<T> = { new (...args: any[]): T };
 *
 * function typeGuard<T>(o, className: Constructor<T>): o is T {
 *   return o instanceof className;
 * }
 *
 * const myClassObject = new myClass();
 *
 * typeGuard(myClassObject, myClass); // returns true
 *
 * typeGuard(myClassObject, 5); // Argument of type '5' is not assignable to parameter of type 'Constructor<{}>'
 * ```
 *
 * Let's unpack some of what we see here: we declare a new type - `Constructor<T>` is a type that has a method new that takes any number of arguments (including zero) and returns an instance of type `T`. This is exactly the restriction we need to be able to use `className` with `instanceof`.
 *
 *
 *
 *
 *
 * <br/><br/>
 *
 * <h2 id="extending">Extending the type guard to work for primitive types</h2>
 *
 * So far, all we've really done is wrap instanceof with another function, albeit with fancy-looking typing. We'd also like to be able to do something like this:
 *
 * ```typescript
 * typeGuard(5, 'number'); // true
 * typeGuard('abc', 'number'); // false
 * ```
 *
 * What we need to do here is widen the type of the `myClass` parameter we're using, to something like this: `type PrimitiveOrConstructor<T> = Constructor<T> | 'string' | 'number' | 'boolean'`.
 *
 * Let's try and use this new type:
 *
 * ```typescript
 * type PrimitiveOrConstructor<T> =
 *   | Constructor<T>
 *   | 'string'
 *   | 'number'
 *   | 'boolean';
 *
 * function typeGuard<T>(o, className: PrimitiveOrConstructor<T>): o is T {
 *   if (typeof className === 'string') {
 *     return typeof o === className;
 *   }
 *   return o instanceof className;
 * }
 *
 * class A {
 *   a: string = 'a';
 * }
 *
 * class B extends A {
 *   b: number = 3;
 * }
 *
 * console.log(typeGuard(5, 'number'), 'is true');
 * console.log(typeGuard(5, 'string'), 'is false');
 *
 * console.log(typeGuard(new A(), A), 'is true');
 * console.log(typeGuard(new A(), B), 'is false');
 *
 * console.log(typeGuard(new B(), A), 'is true');
 * console.log(typeGuard(new B(), B), 'is true');
 *
 * console.log(typeGuard(new B(), 'string'), 'is false');
 * ```
 *
 * Let's examine the new implementation of `typeGuard`: `className` is now either a `Constructor<T>` or it's a `string` whose value is limited to one of `'string'`, `'number'`, or `'boolean'`. In case it's a string (technically, if its type is `'string' | 'number' | 'boolean'`), then `typeof className === 'string'` will be `true`, and then the type guard will be based on `typeof` rather than `instanceof`. Notice that the if checks `className`'s type (`'function'` in the case of a `Constructor<T>` vs. `'string'` in the rest of the cases), and the type guard itself is comparing type of the object we want to guard, with the actual value of `className`.
 *
 * Something is still amiss, though. The return type for `typeGuard` is wrong in the case where we're checking if an `object` has a primitive type. Notice that `typeGuard`'s return type is `o is T`. this `T` comes from `Constructor<T>` if that's `className`'s type, but if it isn't then `T` is resolved as `{}`, meaning that for primitive types, our type guard is wrong:
 *
 * ```typescript
 * function typeDependent(o: any) {
 *   if (typeGuard(o, 'number')) {
 *     console.log(o + 5); // Error: Operator '+' cannot be applied to types '{}' and '5'
 *   }
 * }
 * ```
 *
 * We could correct this by letting the compiler know what `T` is manually, like so:
 *
 * ```typescript
 * function typeDependent(o: any) {
 *   if (typeGuard<number>(o, 'number')) {
 *     console.log(o + 5); // o is number, no error
 *   }
 * }
 * ```
 *
 * But we'd like for typeGuard's return type to be inferred from the value of `className`. We need to use the type `PrimitiveOrConstructor<T>` to guard `T | string | number | boolean`. First, the type `T` should be inferred only if the type we're guarding isn't a primitive. We will make a new `PrimitiveOrConstructor` which is not generic, and then use that type to infer what type it is guarding.
 *
 * ```typescript
 * type PrimitiveOrConstructor =
 *   | { new (...args: any[]): any }
 *   | 'string'
 *   | 'number'
 *   | 'boolean';
 * ```
 *
 * The type of object `PrimitiveOrConstructor` creates in the non-primitive case is not specified, because it can be inferred when resolving what type is being guarded by it:
 *
 * ```typescript
 * type GuardedType<T extends PrimitiveOrConstructor> = T extends { new(...args: any[]): infer U; } ? U : T;
 * ```
 *
 * Now, if the type we want to have a type guard for `is aClass`, then `GuardedType<aClass>` resolves to `aClass`. Otherwise, if we set `T as 'string'` then `GuardedType<'string'>` is just `'string'` again, instead of the type `string`. We still need to be able to map from a string value like `'string'` to the appropriate type, and to do this we will introduce `keyof`, and index types. First, we'll create a mapping from strings to types with a type map:
 *
 * ```typescript
 * interface typeMap { // can also be a type
 *   string: string;
 *   number: number;
 *   boolean: boolean;
 * }
 * ```
 *
 * Now, we can use `keyof typeMap` to introduce the `'string' | 'number' | 'boolean'` in our `PrimitiveOrConstructor`, and index into `typeMap` to get the appropriate type for `GuardedType` in the primitive case:
 *
 * ```typescript
 * type PrimitiveOrConstructor =
 *   | { new (...args: any[]): any }
 *   | keyof typeMap;
 *
 * type GuardedType<T extends PrimitiveOrConstructor>
 *   = T extends { new(...args: any[]): infer U; }
 *     ? U
 *     : T extends keyof typeMap
 *       ? typeMap[T]
 *       : never;
 * ```
 *
 * A few things to note here:
 *
 * `keyof` is a keyword that takes a type and returns a union of the names of properties of that type. In our case `keyof typeMap` is exactly what we need: `'string' | 'number' | 'boolean'`. This is why the names of `typeMap`'s properties are the same as their types (i.e the string property has type `string`, and likewise for `number` and `boolean`).
 *
 * `GuardedType<T>` now uses nested ternary ifs: we first check if the type we're guarding has a constructor (`T` is the type we're given that provides the constructor, `U` is the type actually created by that constructor - they could be the same), then we check if `T` is one of the primitive types, in which case we use it to index into our `typeMap` and go from `'string'` to `string`.
 *
 * If both of these conditions fail, the type never is used in the last branch because we will never get to it.
 *
 * It would have been simpler to avoid the second if altogether and do this:
 *
 * ```typescript
 * type GuardedType<T extends PrimitiveOrConstructor>
 *   = T extends { new(...args: any[]): infer U; }
 *       ? U
 *       : typeMap[T];
 * ```
 *
 * But we get this error: `Type 'T' cannot be used to index type 'typeMap'`. In the case where `T` is not a constructor type, the compiler still doesn't narrow `T` down to `keyof typeMap`, and so tells us that we cannot safely use `T` as an index of `typeMap`. We will see this problem again later, it's an open issue that I feel is worth mentioning. I'll expand on it in an addendum.
 *
 * Now that we've properly defined GuardedType for a given T extends PrimitiveOrConstructor, we can go back to our implementation of typeGuard:
 *
 * ```typescript
 * function typeGuard<T extends PrimitiveOrConstructor>(o, className: T):
 *   o is GuardedType<T> {
 *     if (typeof className === 'string') {
 *     return typeof o === className;
 *   }
 *   return o instanceof className;
 * }
 * ```
 *
 * Our `className` parameter is now of type `T extends PrimitiveOrConstructor`, so `GuardedType<T>` resolves into the actual type we want to guard for - a class or a primitive type. We're still not done, though, because we get an error on that last line:
 *
 * ```typescript
 * return o instanceof className; // The right-hand side of an 'instanceof' expression must be of type 'any' or of a type assignable to the 'Function' interface type.
 * ```
 *
 * The issue here is similar to what happened when defining `GuardedType`. Here, `className`'s type is `T extends PrimitiveOrConstructor` throughout the function body, even though we would like it to narrow to `'string' | 'number' | 'boolean'` inside the if clause, and to `new (...args: any[]) => any` after it. Instead what we have to do is assign `className` to a local variable with type `PrimitiveOrConstructor`, and use that variable because its type will be narrowed by the compiler:
 *
 * ```typescript
 * function typeGuard<T extends PrimitiveOrConstructor>(o, className: T):
 *   o is GuardedType<T> {
 *     // to allow for type narrowing, and therefore type guarding:
 *     const localPrimitiveOrConstructor: PrimitiveOrConstructor = className;
 *     if (typeof localPrimitiveOrConstructor === 'string') {
 *     return typeof o === localPrimitiveOrConstructor;
 *   }
 *   return o instanceof localPrimitiveOrConstructor;
 * }
 *
 * ```
 *
 *
 *
 *
 *
 * <br/><br/>
 *
 * <h1 id="together">Putting it all together</h1>
 *
 * Whew, that seemed like a lot to get through. Let's put it all together so we can discern the bigger picture:
 *
 * ```typescript
 * interface typeMap { // for mapping from strings to types
 *   string  : string;
 *   number  : number;
 *   boolean : boolean;
 * }
 *
 * type PrimitiveOrConstructor = // 'string' | 'number' | 'boolean' | constructor
 *   | { new (...args: any[]): any }
 *   | keyof typeMap;
 *
 * // infer the guarded type from a specific case of PrimitiveOrConstructor
 * type GuardedType<T extends PrimitiveOrConstructor> = T extends { new(...args: any[]): infer U; } ? U : T extends keyof typeMap ? typeMap[T] : never;
 *
 * // finally, guard ALL the types!
 * function typeGuard<T extends PrimitiveOrConstructor>(o, className: T):
 *   o is GuardedType<T> {
 *     const localPrimitiveOrConstructor: PrimitiveOrConstructor = className;
 *     if (typeof localPrimitiveOrConstructor === 'string') {
 *     return typeof o === localPrimitiveOrConstructor;
 *   }
 *   return o instanceof localPrimitiveOrConstructor;
 * }
 * ```
 *
 * And to test it out, let's use the same examples as before, only now the type guarding will actually work and give us `string`, `number`, `A` or `B` as appropriate:
 *
 * ```
 * class A {
 *   a: string = 'a';
 * }
 *
 * class B extends A {
 *   b: number = 5;
 * }
 *
 * console.log(typeGuard(5, 'number'), 'true'); // typeGuard<"number">(o: any, className: "number"): o is number
 * console.log(typeGuard(5, 'string'), 'false'); // typeGuard<"string">(o: any, className: "string"): o is string
 *
 * console.log(typeGuard(new A(), A), 'true'); // typeGuard<typeof A>(o: any, className: typeof A): o is A
 * console.log(typeGuard(new B(), A), 'true');
 *
 * console.log(typeGuard(new A(), B), 'false'); // typeGuard<typeof B>(o: any, className: typeof B): o is B
 * console.log(typeGuard(new B(), B), 'true');
 *
 * console.log(typeGuard(new B(), 'string'), 'false');
 * ```
 *
 *
 *
 *
 *
 * <br/><br/>
 *
 * <h1 id="summary">In summary</h1>
 *
 * Having gone through all of the above, I realize that it would almost always be simpler to test for particular cases with `instanceof`, for interfaces with user-defined type guards, and for primitives with `typeof`.
 *
 * I did learn a lot from trying to solve this problem myself, and especially from a StackOverflow answer by user jcalz. This article is mostly going through their answer and explaining the different parts of it. Going through the steps of this implementation involves understanding typescript's typing system, generics, type guards, useful keywords like `keyof` and `infer`, union types, and index types.
 *
 *
 *
 *
 *
 *
 * <br/><br/>
 *
 * <h2 id="sources">Sources</h2>
 *
 * * StackOverflow answer about trying to call instanceof on a generic type
 * * Referencing the constructor of a type in typeScript (generically)
 *
 *
 *
 *
 *
 *
 * <br/><br/>
 *
 * <h2 id="addendum">Addendum</h2>
 *
 * When we used `T extends PrimitiveOrConstructor` in both `GuardedType` and `typeGuard`, we saw that conditions about `T`'s type (e.g extending a constructor vs. extending `keyof typeMap`) didn't help the compiler narrow down `T`'s type, even though we defined `PrimitiveOrConstructor` to either be a constructor type or a valid property name of `typeMap`.
 *
 * In the definition of `GuardedType` the else branch of checking for the case of a constructor type didn't let us index into `typeMap`, despite that being the only other option for `T`. In the implementation of the `typeGuard` function we tried to do the same in reverse order - we checked for typeof `className === 'string'` which covers the case of `T extends keyof typeMap`, but outside this clause `T` was not narrowed down to a constructor type.
 *
 * For defining `GuardedType`, we had to explicitly write a second ternary if to let the compiler know that `T extends keyof typeMap` so we could resolve the type as `typeMap[T]`. For implementing `typeGuard`, we needed to assign `className` (with type `T extends PrimitiveOrConstructor`) to a local variable with type `PrimitiveOrConstructor`. This variable's type narrowed as necessary to `'string' | 'number' | 'boolean'` inside the `if` clause, and to `new (...args: any[]) => any` after it.
 *
 * The problem in both cases is that `T` is a generic type which extends the union type `PrimitiveOrConstructor`. As of now (2019-04-07) this is an open issue. This is luckily also mentioned in jcalz's StackOverflow answer.
 *
 * <br/><br/>
 *
 */

const z_tutorial = () => '';
// it'll get tree shaken out anyway





export {
  typeMap,
  PrimitiveOrConstructor,
  GuardedType,
  typeGuard,
  z_tutorial
};
