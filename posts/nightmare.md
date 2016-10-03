---
title: Nightmare browser automation
layout: Post
tagline: Browser automation with Electron
tags: automation, nodejs, js, npm
---

After enjoying using [Nightmare](https://github.com/segmentio/nightmare) to automate the downloading of my [bandcamp music collection](https://github.com/impaler/nightmare-bandcamp). I want more people to see the power of it. With some basic javascript and web development experience you can automate and or test just about anything that runs in a browser. In this post I'll show the basics of the api and then highlight some of the impressive debugging workflow.

Nightmare is built upon the shoulders of [Electron](https://github.com/electron/electron), [Node.js](https://nodejs.org/) and [Chromium](http://www.chromium.org). Previously it was using the headless browser PhantomJS which may have something to do with it's name. The tests you write in Nightmare run in a real web browser so general web development knowledge can be utilised. The main Nightmare script you write is run from nodejs, so you can also take advantage of the almost endless [nodejs npm](https://www.npmjs.com/) ecosystem. Most web developers should feel right at home in this stack.

<style>
img[alt=nightmare-stack] {
    max-height: 300px;
}
</style>

### Getting started with Nightmare   

Like starting anything from *scratch* first you will need a couple of things:

- [Nodejs & npm installed](https://nodejs.org/en/download/).
- An internet connection ready to download the 50mb or so for the Electron dependency.

As a basic example, we'll write a simple script to get the top news article from [hacker news website](https://news.ycombinator.com/).

1) Create a new project and install nightmare from npm:

```shell
npm i nightmare --save
```

The npm install may take a little while to run, it downloads Electron which includes a bundled version of Chromium and Nodejs. You will see a binary added to the standard npm .bin location ```./node_modules/.bin/electron``` folder.

2) In the root of your project, create a new example.js file with the following code:

```javascript
const Nightmare = require('nightmare')
Nightmare()
    .goto('https://news.ycombinator.com/')
    .evaluate(() => document.querySelector('.storylink').innerText)
    .end()
    .then(result => {
        console.log(`The top news story on Hacker News currently is:\n${result}`)
    })
    .catch(error => console.error(error))
```
 
 3) Run the script in node:
 
 ```shell
 node example.js
 ```
 
In your terminal you should now see the Hacker News story:
 
 ```shell
 > node example.js
The top news story on Hacker News currently is:
Critical Behavior from Deep Dynamics: A Hidden Dimension in Natural Language
 ```

Pretty easy hey, Nightmare provides a lot of handy api methods to do most things a user will do on a browser. Some of which are typing text, click and element and wait for something to appear.

## Debugging in Nightmare

This is where I think Nightmare shines, a developer already familiar with debugging Chrome with dev tools and debugging nodejs already knows how to debug nightmare. You can use the same skills from web and nodejs development to write complex browser automation scripts.

- Since Nightmare uses Electron and node you can debug the script with regular debugging tools like node-inspector, webstorm.

- As Electron bundles the Chromium browser you can get right into the DOM just like a regular browser. Electron exposes the dev tools ui in Chromium to work just like debugging in any other Chrome window.

Lets demonstrate debugging the browser:

First you need to know about options nightmare exposes in the constructor parameter.
 
 - ***show*** (Boolean) true to show the browser window, the default is headless
 - ***openDevTools*** (Boolean) true to automatically open the dev tools
 - ***waitTimeout*** (Number) ms value to change the default timeout for the browser window to terminate
 
Next well make use of a Nightmare api called [evaluate](https://github.com/segmentio/nightmare#evaluatefn-arg1-arg2) to demonstrate debugging. The code in evaluate is run in the context of the browser so a standard [debugger statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger).

1) Now lets put all this in a new script file:

```javascript
const Nightmare = require('nightmare')
const HACKER_NEWS_URL = 'https://news.ycombinator.com/'
const STORY_SELECTOR = '.storylink'

Nightmare({
    show: true,
    openDevTools: true,
    waitTimeout: 90000000 // increase the default timeout to test things
})
    .goto(HACKER_NEWS_URL)
    .evaluate(storySelector => { // storySelector is passed in as the second paramater
        var storyElements = [].slice.call(document.querySelectorAll(storySelector))
        var storyTitles = storyElements.map(storyElement => storyElement.innerText)
        debugger // this statement sets a break point that will show immediatley with openDevTools set to true
        return storyTitles
    }, STORY_SELECTOR) // storySelector is passed in here for the browser context evaluate runs in
    .end()
    .then(result => console.log(result))
    .catch(error => console.error(error))
```

2) Run the script in node just as before:

```shell
node debug-example.js
```

You should now see a browser window like below with the dev tools stopped in a breakpoint:

![Chrome dev tools](/assets/nightmare/nightmare-dev-tools.png "Nightmare browser with chrome dev tools")

See it's just like regular development in the Chrome browser and the [DevTools](https://developers.google.com/web/tools/chrome-devtools/?hl=en)!

This example also demonstrates perhaps the most powerful Nightmare api `.evaluate()`. Evaluate lets you inject and execute any arbitrary Javascript into the running browser window.

### Extending Nightmare

Nightmare is also an automation stack that lets you extend it's core functionality to domain specific apis. The fluent like api can be extended with custom actions, see [extending Nightmare](https://github.com/segmentio/nightmare#extending-nightmare). Custom actions can help you make your automations scripts less repetitive and easier to maintain. 

Some more creative examples of extending Nightmare include [generating an animated gif](https://www.npmjs.com/package/nightmare-animated-gif) of the browser between actions to running [gremlin tests](https://www.npmjs.com/package/nightmare-gremlins) on your website.

### Electron as an automation platform

Electron makes use of some fantastic engineering in node's [multi-context](https://strongloop.com/strongblog/whats-new-node-js-v0-12-multiple-context-execution/) feature to provide a single event loop that both node and chromium share. The added benefit is that the javascript you write runs in the same javascript engine. This engine is a very recent version of v8 thanks to Nightmare being kept up to date with the upstream work in Electron.

Cross browser testing is not the goal of Nightmare, it is coupled to the work with Chromium and node in Electron. The success of Electron itself, may make see this with compatible apis like [positron](https://github.com/mozilla/positron) popping up. 
If cross browser testing is important to you, there are libraries compatible with selenium grids that have a very similar api to Nightmare:
 
 - [Nightwatchjs](http://nightwatchjs.org/guide#extending)
 - [Webdriver io](http://webdriver.io/)

### Further reading

- [Nightmare api](https://github.com/segmentio/nightmare#api)
- [Rosshinkley Nightmare examples repository](https://github.com/rosshinkley/nightmare-examples)
- Bulk download a [bandcamp music collection](https://github.com/impaler/nightmare-bandcamp).

So that's it, you have now seen the power of Nightmare. Go forth and automate the web!