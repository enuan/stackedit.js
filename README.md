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

#### Usage with a custom target

You can specify a target element other than `document.body` to mount Stackedit in a specific container:

```js
import Stackedit from "@enuan/stackedit-js";

const el = document.querySelector("textarea");
const container = document.getElementById("my-stackedit-container");
const stackedit = new Stackedit({ target: container });

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

Make sure the `#my-stackedit-container` element is present in the DOM.

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
  url="https://stackedit.io/app"
  <!--
  optional
  --
>
  onchange="onStackeditChange"
  <!-- optional: global function name -->

  ></stackedit-component
>
<script>
  function onStackeditChange(text, payload) {
    console.log("Changed text:", text);
    // payload contains additional details
  }
</script>
```

Or via JavaScript/TypeScript:

```js
const el = document.querySelector("stackedit-component");
el.addEventListener("change", (event) => {
  // event.detail.text contains the updated text
  // event.detail.payload contains additional details
  console.log("Changed text:", event.detail.text);
});
```

---

### Usage in React

To integrate the web component in React, you can use `useRef` and add the listener via `addEventListener`:

```jsx
import React, { useRef, useEffect } from "react";
import "@enuan/stackedit-js/webcomponent";

export default function StackeditReactExample() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      const handler = (event) => {
        console.log("Changed text:", event.detail.text);
        // event.detail.payload contains additional details
      };
      el.addEventListener("change", handler);
      return () => el.removeEventListener("change", handler);
    }
  }, []);

  return (
    <stackedit-component
      ref={ref}
      name="README.md"
      text="# Welcome to StackEdit"
    ></stackedit-component>
  );
}
```
