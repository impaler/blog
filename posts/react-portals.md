---
title: React Portals
layout: Post
tagline: Control the dom structure of your React app with Portals
tags: react, frontend
---

In React most apps are built by consuming component libraries in [jsx][jsx].
This abstracts the dom and treats it's actual dom structure in the browser,
as a [side-effect][side-effect].

Entire React apps can be built without ever looking or thinking about the
dom element structure. If you have done a fair bit of it, you may agree
that it is more often true that the [React dev tools][react devtools] are
more useful than the [dom-inspector][dom inspector] :/

One pattern I noticed when first inspecting the dom of React apps,
was a single root dom element. It seemed strange to structure your html markup
like this way. I couldn't think of any practical reasons as to why anyone
would write html this way. Most React apps still look something like this:

```html
<html>
<head />
<body>
    <div id="root">
    <!-- ...the entire app's dom soup under one element
            ...<div class="unreadable" ...
                ...<div class="gobbidly" ...
                    ...<div class="goop" ...
    -->
    </div>
</body>
</html>
```

The Html specification offers you the ability to write semantic markup with
accessibility in mind. If you look up the mdn best practices to html
[Document and website structure][mdn-intro-to-html] it suggests you create a
dom structure that is more like this:

```html
<html>
<head />
<body>
    <header />
    <nav />
    <main>
        <article />
        <aside />
    </main>
    <footer />
</body>
</html>
```

To be fair though, a semantic and accessible html dom structure that follows
the mdn docs, was never the first priority of React.

With React becoming a more general purpose server-side templating solution.
Constraints like this matter also when you are asking a more conservative
html & css developer to adopt it. Not many or none, of the competing view
templating languages have the same kind of constraints that React has over
dom structure.

Now with React 16 Portals, you can now more easily create a structure like this.
 That is, one that is not limited to one dom element tree. This is good news
 not only for writing a more semantic and accessible html structure but also
 for implementing ui features such as overlays and loading bars.

In a nutshell Portals allows you to render specific parts of your React app,
to different elements in the dom. The api is similar to how all React apps
have an entry file which renders the entire app to the one dom element.
The main difference being that you use Portals in a Component's render method.
Let's see it side by side:

```jsx
// Inside a typical React entry file
ReactDOM.render(
  <h1>Hello, world!</h1>,
  document.getElementById('root')
)

// A Portal rendering to a specific dom element
render() {
    return ReactDOM.createPortal(
        this.props.children,
        document.getElementById('your-fragment'),
    )
}
```

The best thing about portals is not only that you can render practically
anywhere in the browser's `dom` structure, it doesn;t really change how
your Components are implemented. React apis like context and props work
the same.

The [React docs][react-portals] now have a [great example][portal-example] of
how Portals even allow for event bubbling to propagate through :)

So for a basic usage example, let's render some React components in a
portal component, start by creating the two root elements for the React app:

```html
<html>
  <body>
    <!-- Two dom entry elements for React -->
    <div id="modal"></div>
    <div id="root"></div>
  </body>
</html>
```

Now create a Portal component that references the element with id 'modal':

```jsx
export class ModalPortal extends React.Component {
  render () {
    return ReactDOM.createPortal(
      this.props.children,
      document.getElementById('modal'),
    )
  }
}
```

The ModalPortal will now work practically just like any other component.
Lets use it in another component and some p elements for testing:

```jsx
export class App extends React.Component {
  render() {
    return <>
      <ModalPortal>
        <p>Rendered in the dom element with #modal</p>
      </ModalPortal>
      <p>In the root element</p>
    </>
  }
}
```

Couple this with a regular React render for on the element with id 'root':

```jsx
ReactDOM.render(
  <App />,
  document.getElementById('root')
)
```

The resulting dom structure will be:

```html
<body>
    <div id="modal"><p>Rendered in the dom element with #modal</p></div>
    <div id="root"><p>In the root element</p></div>
</body>
```

Thanks to Portals you can now control the dom hierarchy and structure of
your app :)

[react devtools]: https://github.com/facebook/react-devtools "React Devtools github"
[jsx]: https://reactjs.org/docs/introducing-jsx.html
[side-effect]: https://en.wikipedia.org/wiki/Side_effect_(computer_science)
[mdn-intro-to-html]: https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure
[dom-inspector]: https://en.wikipedia.org/wiki/DOM_Inspector
[portal-example]: https://codepen.io/gaearon/pen/jGBWpE
[react-portals]: https://reactjs.org/docs/portals.html
