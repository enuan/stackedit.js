# @enuan/stackedit-js

> Integrate StackEdit into any website as a JavaScript library or Web Component.

## Installation

npm install @enuan/stackedit-js

### Usage as JavaScript library (ESM/CommonJS)

```js
// Import as ES module
import Stackedit from "@enuan/stackedit-js";

// Or CommonJS
// const Stackedit = require('@enuan/stackedit-js').default;

const el = document.querySelector("textarea");
const stackedit = new Stackedit();

stackedit.openFile({
  name: "Filename.md",
  content: {
    text: el.value,
  },
});

stackedit.on("fileChange", (file) => {
  el.value = file.content.text;
});
```

### Usage as Web Component

```js
// Import the web component (ESM)
import "@enuan/stackedit-js/webcomponent";
```

In your HTML markup:

```html
<stackedit-component
  name="README.md"
  text="# Welcome to StackEdit"
></stackedit-component>
```
