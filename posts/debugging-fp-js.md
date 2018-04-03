---
title: Debugging Functional Javascript
layout: Post
tagline: Working through errors and stacktraces to debug functional style javascript
tags: fp, js, debugging
---

After exploring functional style programming in Javascript I'd like to write
about some trade offs worth thinking about when debugging. This post is rather
opinionated but offers some techniques to make thing's easier.

I will assume some familiarity with basic functional programming concepts.
Some of the issues I bring up are not specific to functional pattens per-se.

If you write 100% typo freee, perfect code all the time, you may find this
a little dry. Or if you think it would be ok for Apple to remove the backspace
key like they did with the escape key, you should probably move on :/

The purpose of this is not to discourage anyone from writing in a more
functional style. Nor is it to discourage the use of one of the great quality
functional libraries out there like [Ramda][ramda], [lodash_fp][lodash_fp] or
[Sanctuary][Sanctuary]. I enjoy writing code in a more functional style and
understand many good reasons to use and promote it. 

_Enough with the disclaimers_.

I have found that in certain contexts, particularly with using a
[tacit / point-free][tacit-programming] programming style in Javascript,
it can lead to obfuscation of stack traces and barriers to debugging.

Lets start by looking at a stack trace from an unexpected error in some
functional style code. It's probably just some silly typo, in this case it's
from some something rather "simple" using the [Ramda][ramda] library:

![Functional exception example](/assets/fp-debugging/example-fp-ramda-exception.png)

When seeing this kind of thing, I can't help but be reminded of the
frustration I have seen and experienced myself while writing and debugging
`Angularjs 1.x` console errors.

In this situation it can be pretty tempting to naively think:

>"If an Error's Call Stack only shows lines from a dependency,
> the error therefore must be a bug in the dependency!"

> - A thought no programmer ever had <-- Sarcasm

How many issues on github and so on have you seen closed from someone commenting
something like:
> "Woops sorry my fault, I didn't see the..."

Wishful thinking aside, you need to solve this error whether it is your
code or not. From the message it's probably hard to tell where in your code
something named as generically as "name" is being referenced. For all you
know, it could be some smarts that is using the name property on
the [function prototype][mdn-function-name].

What we can see in the call stack are function names from very
common functional patterns like `pipe`, `curry` and `map`. Problem is,
you are probably using these all over your codebase. So this is about as
good as knowing that a code path is using `if` and `else` statements.
Useless, if this came from production, good luck in knowing where to
effectively start debugging the issue.

So why would a more functional style of programming lead to an obfuscated
stack trace like this?

It is a combination of: 

- [Function currying][currying]
- [Tacit / Point-free][tacit-programming] styles
- The dynamic nature of Javascript
- Async methods
- Large amounts of library code

All of this has the side effect of filling the call stack with function names
that are usually anonymous or from a dependency if they are not totally mangled
from some magnification. Now the browser's call stack size is after all
limited. I'll show you how to increase it a little further on.

### Comparing imperative and functional examples

This is all easier to think about with a simple code example. Code from less
trivial and larger codebases will most likely, have longer stack traces and
if you just walked in, it could be even harder to reason about.

In this example, imagine we are given the following object from a service.

```js
const response = {
  messages: [
    {
      user: {
        role: 'The first ones',
        name: 'Kosh',
        species: 'Vorlon'
      },
      text: 'Who are you?'
    }
  ]
}
```

We are required to display some comma separated text in a view. The text must
contain a list of all the user names and their species. Each user needs to be
in the following format:

```js
`${userName} is a ${species}`

// Eg =>  Kosh is a Vorlon, ...
```

To illustrate, let's implement this using a couple of different styles.

#### Functional point-free

```js
const userDisplayText = R.pipe(
  R.prop(['user']),
  R.props(['name', 'species']),
  R.intersperse('is a'),
  R.join(' ')
)

const messagesDisplayText = R.pipe(
  R.prop('messages'),
  R.map(userDisplayText),
  R.join(', ')
)
```

#### Imperative

```js
function messagesDisplayText(response) {
  var users = []
  for (var i = 0; i < response.messages.length; i++) {
    var user = response.messages[i].user
    var details = [
      user.name,
      'is a',
      user.species
    ]
    users.push(details.join(' '))
  }
  return users.join(', ');
}
```

Yes these are strange and imperfect ways to implement this, it's only
intended to describe the differences. However they both output the same
required string. Now *for* because errors happen, apparently a valid value
for the user in the response is also null:

```js
const response = {
  messages: [
    {
      user: {
        name: 'Kosh',
        species: 'Vorlon'
      },
      text: 'Who are you?'
    },
    {
      user: null,
      text: 'What do you want?',
    },
  ]
}
```

How were we to know? :(

If you guessed it, yes this is the cause of the error you first saw
at the start of the post.

Lets see this while using "Pause on Exception" in Chromium and compare the
styles side by side:

Functional:

![Functional exception example](/assets/fp-debugging/example-fp-ramda-exception.png)

Imperative:

![Imperative exception example](/assets/fp-debugging/example-imperative-exception.png)

In this particular scenario, it's almost like black and white. The imperative
call stack shows you the exact function name and line number you need to
understand the issue.

### Why continue with a functional style?

It is ironic that one reason people become interested in functional programming,
 is that the code can be easier to reason about. In this case something that
 was ok to read in an imperative style, now produces errors that seem way
 more complicated in a functional one.

Outside of this example, the cause of the issue may not be from something as
simple, or as unlikely, as a server response returning an unexpected payload
signature. Knowing why the value was `null` can be far less trivial.

From what I know so far, I'll try to describe a functional programmer's worst
nightmare. Consider the error happens inside a class with deep inheritance,
on property with imperative style code. This code is mutating a complex
local state, that can also be influenced by undocumented, hard to infer and
predict, side-effects. In this scenario, it is often difficult to follow and
reproduce object states. Especially states that you first see only after
development in qa or production. Even worse are states that only seem to be
happening on every other machine but your own.

The `Functional vs Imperative` discussion is out of the scope of this post.
So put away your fighting gloves, it has probably all been said before ;)

Anyway, hope is not lost in understanding Errors like this, lets work through
some techniques for debugging.

### Devtools Black boxing

Just like any other Javascript project with a lot of dependencies, we can use
the [black boxing][devtools-black-box] feature that most mainstream browser's
devtools provide. Effectively we can filter out from view stack lines from the
dependencies we are not currently concerned with.

So using the example above, here is the "Pause on Uncaught Exceptions" of the
functional example with all the Ramda lines blackboxed:

![Black boxing Ramda](/assets/fp-debugging/example-blacklist-ramda-exception.png)

Yay in this case, after hiding 20 frames of Ramda, you can now see where I
wrote code on `main.tsx:24`. This is exactly where I invoked the point-free method that leads to the exception.

It's useful to know that these filters can be stay persistent on reload and
also support a Regex if you need to filter out something more specific.
Blackboxing also has [these effects][blackboxing-chrome] to be aware of:

> - Exceptions thrown from library code will not pause (if Pause on exceptions is enabled),
> - Stepping into/out/over bypasses the library code,
> - Event listener breakpoints don't break in library code,
> - The debugger will not pause on any breakpoints set in library code.

### Stack trace limit

If you are writing a lot of functional style code, it's common for the stack
trace to be quite large. For obvious performance reasons, browsers set limits.
So if you are in real pinch, some browsers like Chromium allow you to
increase the stack trace limit through this global api:

```js
Error.stackTraceLimit = number
```

Be mindful that this api is not something designed for you to use in production.

### Wrapping named functions

The advantage of knowing a function name in the stack trace of an
Unexpected Error provides obvious benefits. Best case is that if you are
familiar with the function names, you might immediately guess what is happening
given a particular error message.

Stacktraces themselves can also be useful if you are using some advanced error
logging tools. Perhaps you may want to group or search for particular errors
by a particular function name. This may show other insights like correlations
in the time it occurred.

You can add a named function to the stack trace of a point-free styled
function just by wrapping it in one:

```js
function namedMessagesDisplayText(response) {
  // the point-free style function
  return messagesDisplayText(response)
}
```

Now inspecting the call stack, you should see the function name
`namedMessagesDisplayText`:

![Black boxing Ramda](/assets/fp-debugging/example-named-function-exception.png)

With this in mind, you could avoid the redundant function by holding back on
the purely `point-free` style and write this instead:

```js
function messagesDisplayText (response) {
  return R.pipe(
    R.prop('messages'),
    R.map(userDisplayText),
    R.join(', ')
  )(response)
}
```

### Logging helpers

It won't help you improve a stack trace, but it can be an invaluable tool
in understanding an error or following data in a functional style control flow.

The gist is to simply create logging functions that you can insert into
your compositions:

```js
const traceUser = (data) => {
  console.log('the user', data)
  return data
}

const userLabelText = R.pipe(
  R.prop(['user']),
  traceUser, // <-- just another part of the pipe :)
  R.props(['name', 'species']),
  R.intersperse('is a'),
  R.join(' ')
)
```

Now in your console or logging utils you can see what's happening:

```
// the user {role: "The first ones", name: "Kosh", species: "Vorlon"}
// main.tsx:26 the user null
```

### Breakpoints

If you want to use a break point in a functional composition, in this example
I think it is less straight forward compared to the imperative style code.

If you tried to put a break point on a line in a pipe or compose it just wont work. Or if you try to "step into" a functional pattern like a [R.cond][ramda-cond]
that essentially encapsulates a `if/else, if/else`, you will have to
step through library code increasing the call stack size. If it was just an
`if {} else ..` or perhaps a `switch` statement, the debugger is only going
to step through your code.

Thankfully Blackboxing in devtools as shown above, can help avoid this
by automatically telling the debugger to step over blackboxed lines.

To be more precise in a composition however, you can always make use of the
[debugger][debugger-statement] statement. So expanding on the logging
function idea, just add it to a helper function:

```js
const debug = item => {
  debugger // <-- break here
  return item
}

const userLabelText = R.pipe(
  R.prop(['user']),
  debug, // <-- put this wherever in the pipe you need to
  R.props(['name', 'species']),
  R.intersperse('is a'),
  R.join(' ')
)
```

I find this particularly useful when learning the apis and thinking in
the functional style.

If you haven't used it before, the [debugger statement][debugger-statement]
instructs the the devtools to break. This will only happen if you have a
devtools window open and connected. The great part about using it is that
there is no need to manually find the line and insert it the break point
manually. With something like hot reloading, often you just hit save on the
keyboard and wait for a devtools window take focus exactly where you wanted
it to be.

Since this is just like any other statement in your code, you can also wrap
it in any expression to have a conditional break point:

```js
const debug = item => {
  if (item === null) debugger
  return item
}
```

### Monkey patching

An interesting approach intended for development only, is to wrap a
higher order function to capture context like the function name and custom
stack trace by throwing and capturing an error. `@jacobp100` has a
[cool example using Ramda pipe][monkey-patching-example] worth checking out.
I imagine this idea could be useful in other creative ways.

### Runtime type system

To provide some more useful error messages extra context from the runtime can
help. [Sanctuary][sanctuary-type-checking] allows messages and documentation 
in place. They are similar to a [power assert like][power-assert] error message:

```
S.add(2, true);
// ! TypeError: Invalid value
//
//   add :: FiniteNumber -> FiniteNumber -> FiniteNumber
//                          ^^^^^^^^^^^^
//                               1
//
//   1)  true :: Boolean
//
//   The value at position 1 is not a member of ‘FiniteNumber’.
//
//   See https://github.com/sanctuary-js/sanctuary-def/tree/v0.14.0#FiniteNumber for information about the sanctuary-def/FiniteNumber type.
```

### Compile time type checking

[Typescript][typescript] can be of huge benefit to a functional style for
catching errors at compile time or in your ide. Typescript can't really help
you with runtime errors.

It should be said that incorrectly typed code, can lead to introducing errors
that only show up in the runtime. For example, if you cast something as `any`
this tells Typescript to ignore the type. Now if you were to pass something
invalid through `any`, you will only see an error in the runtime. Keep in mind
blindly trusting complex types or leaving functions parameters as `any` can
lead to a false sense of security and runtime errors.

In some scenarios, I have found that strictly typing everything religiously can
be quite cumbersome with little return. For example, think about strictly typing
a large [pipe][ramda-pipe] or [compose][ramda-compose] with [Generics][ts-generics]
from the Ramda [@types/ramda][@types/ramda] definitions.

For a reasonably large pipe, consider strict compliance with this interface:

```ts
pipe<V0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    fn0: (x0: V0) => T1,
    fn1: (x: T1) => T2,
    fn2: (x: T2) => T3,
    fn3: (x: T3) => T4,
    fn4: (x: T4) => T5,
    fn5: (x: T5) => T6,
    fn6: (x: T6) => T7,
    fn7: (x: T7) => T8,
    fn8: (x: T8) => T9): (x0: V0) => T9;
```

Another smaller example, without the line breaks:

```ts
compose<V0, T1, T2, T3, T4, T5, T6>(fn5: (x: T5) => T6, fn4: (x: T4) => T5, fn3: (x: T3) => T4, fn2: (x: T2) => T3, fn1: (x: T1) => T2, fn0: (x: V0) => T1): (x: V0) => T6
```

I think this is quite prone to user error and frustration. Your Types most
probably have names longer than two characters, so you may need
text wrapping on. I found that it can take longer to write in the Generics
than it does to write the composition itself.

Rather than typing the entire compose, I'd suggest it is more
important to wrap it in a named function, strictly type all the input
and output and add a reasonable amount of test coverage.

Don't let this scare you from the [@types/ramda][@types/ramda] though. I am
probably cherry picking the worst case. It's actually mostly, wonderful to use
and can be invaluable when you need to refactor code.

### Final thoughts

While error stack traces may not always be the only, nor the most helpful
way to understand errors, they are still useful in development, qa
and production. Being ready to handle errors for Javascript running in
cross-platform and multi-vendor web browsers I think is a must. Consider
also other external factors like conflicting browser extensions,
local network topologies and connectivity, it is hard not to describe
this as a volatile environment. 

With this in mind, an entire industry of tooling now exists to provide some
powerful ways to capture errors, user breadcrumbs and error stack traces as
they happen. If you aren't using anything, a great solution to checkout is
[sentry][sentry-github] which is also BSD3 licenced.

A functional programming style is no silver bullet, especially when you use
it in browsers and Javascript. If you are writing a lot of functional code
in a large complex codebase. My recommendation is not to start out by using
an entirely [point-free][tacit-programming] style. Instead make sure to couple
a healthy use of named functions on the main business logic and public apis.
Also look into typing those functions properly with [Typescript][typescript]
or [Flow][flow] so that it is easier to maintain and refactor.

I couldn't find too much else written about this kind of thing.
So I encourage others to. Unless you suggest people invest in a monitor stand
that supports Portrait mode.
That way all of the Call Stack can fit into the view ;)

I'd like to credit a fantastic book on functional programming
[mostly adequate guide][mostly-adequate-debugging], the logging technique
is also mentioned in the debugging section.

[tacit-programming]: https://en.wikipedia.org/wiki/Tacit_programming
[imperative-programming]: https://en.wikipedia.org/wiki/Imperative_programming
[oo-programming]: https://en.wikipedia.org/wiki/Object-oriented_programming
[watch-custom-expressions]: https://developers.google.com/web/tools/chrome-devtools/javascript/reference#watch
[conditional-breakpoint]: https://developers.google.com/web/tools/chrome-devtools/javascript/breakpoints#conditional-loc
[lodash_fp]: https://github.com/lodash/lodash/wiki/FP-Guide
[ramda]: http://ramdajs.com/
[sanctuary]: https://sanctuary.js.org/
[sentry-github]: https://github.com/getsentry/sentry
[devtools-black-box]: https://developer.chrome.com/devtools/docs/blackboxing
[ramda-cond]: http://ramdajs.com/docs/#cond
[ramda-pipe]: http://ramdajs.com/docs/#pipe
[ramda-compose]: http://ramdajs.com/docs/#compose
[currying]: https://en.wikipedia.org/wiki/Currying
[mostly-adequate-debugging]: https://mostly-adequate.gitbooks.io/mostly-adequate-guide/ch05.html#debugging
[monkey-patching-example]: https://medium.com/@jacobp100/debugging-functional-libraries-in-javascript-f586cdf8ea4
[power-assert]: https://github.com/power-assert-js/power-assert
[sanctuary-type-checking]: https://github.com/sanctuary-js/sanctuary#type-checking
[debugger-statement]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger
[blackboxing-chrome]: https://developer.chrome.com/devtools/docs/blackboxing#what-happens
[typescript]: http://www.typescriptlang.org/
[flow]: https://flow.org/
[mdn-function-name]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
[ts-generics]: https://www.typescriptlang.org/docs/handbook/generics.html
[@types/ramda]: https://github.com/types/npm-ramda
