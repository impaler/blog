---
title: React Fragments
layout: Post
tagline: Avoiding a div soup with React Fragments
tags: react, frontend
---

Have you ever inspected the dom of a website and wondered why someone would
choose to have an endless tree of incomprehensible divs? You may have seen
this described as `div soup`. Here is a good summary:

> When `<div>s` are used more often than semantic HTML elements;
> often by nesting `<div>s` inside of `<div>s`, inside of `<div>s`, etc.
> This is typically done for styling reasons and results in markup
> that is more difficult to read and maintain.
[div-soup-hack-term][@garcialo]

Now if in the same way you have inspected the dom of a React application,
you may have seen a similar structure. In this post we will go over how the
new Fragments api in __React 16__ gives you more control over extraneous
divs and elements.

Part of the 16 release includes new return types for the Components render api.
You can now simply return a `String`, `Number` and an `Array`. That means all
of these functions are now valid React Components:

```jsx
const RenderString = () => 'string'
const RenderNumber = () => 777
const RenderArray = () => [
  45636556,
  'words',
  <p>2</p>,
]
```

> A note to typescript users, right now you might get a type error if you try
> it out in jsx for now, you may have to cast the function to `any`. It might
be resolved from changes in the [compiler][typescript-fragments].

As an example, lets say you are required to create a description list element
in React. Here is a gist from the [mdn][mdn-dl-element] docs:

```html
<dl>
  <dt>Name</dt>
  <dd>Godzilla</dd>
  <dt>Born</dt>
  <dd>1952</dd>
  <dt>Birthplace</dt>
  <dd>Japan</dd>
  <dt>Color</dt>
  <dd>Green</dd>
  <!-- ...More meta data -->
</dl>
```

As you can see, description lists can have any number of child
`<dt />` and `<dd>` elements.

We are now required to also render it all this from a data set like this:

```js
const metaData = [
  {term: 'Name', description: 'Godzilla'},
  {term: 'Born', description: '1952'},
  {term: 'Diet', description: 'Nuclear Energy'},
]
```

To implement this, you might try something like:

```jsx
const MonsterData = () => {
  return <dl>{
    metaData.map(data => {
      return <dt>{item.term}</dt>
        <dd>{item.description}</dd>
    })
  }</dl>
}
```

If have tried your luck on it before, you maybe familiar with
this error message:

> Uncaught Error: Parse Error: Line 38: Adjacent JSX elements must be
> wrapped in an enclosing tag

Until React 16, you would have probably just added another enclosing `<div />`
element and moved on:

```jsx
const MonsterData = () => {
  return <dl>{
    metaData.map(data => {
      return <div> {/* <-- I am here because React left me no option :( */}
        <dt>{item.term}</dt>
        <dd>{item.description}</dd>
      </div>
    })
  }</dl>
}
```

So we can now avoid this limitation by using the `<Fragment />` Component that
is shipped with React. Thankfully it is as easy to use as adding the div was
`<div />`, just add it in it's place:

```jsx
const MonsterData = () => <dl>{
    metaData.map(data => {
      return <Fragment>
        <dt>{item.term}</dt>
        <dd>{item.description}</dd>
      </Fragment>
    })
  }</dl>
```

When React renders to the dom, no html element is added in place of the
`<Fragment />` Component.

As a bonus, you can also use a new JSX Fragment syntax sugar. It looks like
this `<>...</>`.

So the following is also equivalent to using `<Fragment />`:

```jsx
const MonsterData = () => <dl>{
    metaData.map(data => {
      return <>
        <dt>{item.term}</dt>
        <dd>{item.description}</dd>
      </>
    })
  }</dl>
```

> This syntax may need to be supported in your tooling. It is available in the
> latest versions of Babel, Typescript and most IDE's should now have plugins
> updated to use. 

A limitation of the `<></>` syntax is that attributes are not supported.
This is annoying if you need a keyed fragment. [Keys][react-keys] help React
identify which items have changed, are added, or are removed. So if you need to
use the key attribute, you have to use `<Fragment />` Component instead.

Returning an `Array` in particular is also useful in avoiding a `div soup`.
Lets say you just want to have a Component that adds only a couple of anchor
links to the dom. Just write `jsx` elements in an array like any other value
in an array:

```jsx
const AnchorLinks = () => ([
  <a key="first" href="#first">First</a>,
  <a key="second" href="#second">Second</a>
])
```

Thanks to Fragments and Array return types, you can now have less reasons to
add `divs, for divs sake` when using React :)

[fragments-react-16]: https://reactjs.org/docs/fragments.html
[div-soup-hack-term]: https://www.hackterms.com/div%20soup "(div soup | @garcialo)"
[mdn-dl-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl
[react-keys]: https://reactjs.org/docs/lists-and-keys.html#keys
[typescript-fragments]: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20356