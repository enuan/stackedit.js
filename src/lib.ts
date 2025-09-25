const styleContent = `
.stackedit-no-overflow {
  overflow: hidden;
}

.stackedit-container {
  background-color: rgba(160, 160, 160, 0.5);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
}

.stackedit-hidden-container {
  position: absolute;
  width: 10px;
  height: 10px;
  left: -99px;
}

.stackedit-iframe-container {
  background-color: #fff;
  position: absolute;
  margin: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: 98%;
  width: 98%;
  max-width: 1280px;
  border-radius: 2px;
  overflow: hidden;
}

.stackedit-iframe {
  position: absolute;
  height: 100%;
  width: 100%;
  border: 0;
  border-radius: 2px;
}

@media (max-width: 740px) {
  .stackedit-iframe-container {
    height: 100%;
    width: 100%;
    border-radius: 0;
  }

  .stackedit-iframe {
    border-radius: 0;
  }
}

.stackedit-close-button {
  position: absolute !important;
  box-sizing: border-box !important;
  width: 38px !important;
  height: 36px !important;
  margin: 4px !important;
  padding: 0 4px !important;
  text-align: center !important;
  vertical-align: middle !important;
  text-decoration: none !important;
}
`;

const containerHtml = `
<div class="stackedit-iframe-container">
  <iframe class="stackedit-iframe"></iframe>
  <a href="javascript:void(0)" class="stackedit-close-button" title="Close">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
      <path fill="#777" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
  </a>
</div>
`;

const origin = `${window.location.protocol}//${window.location.host}`;
const urlParser = document.createElement("a");

export interface StackeditFileContent {
  text?: string;
  yamlProperties?: string;
  properties?: Record<string, unknown>;
}

export interface StackeditFile {
  name?: string;
  content?: StackeditFileContent;
}

export interface StackeditOptions {
  url?: string;
  target?: HTMLElement;
}

type Listener = (payload?: any) => void;

type EventMap = {
  fileChange: (payload: any) => void;
  close: () => void;
  [key: string]: Listener;
};

class Stackedit {
  private $options: StackeditOptions = {
    url: "https://stackedit.io/app",
  };
  private $listeners: { [K: string]: Listener[] } = {};
  private $origin?: string;
  private $containerEl?: HTMLDivElement;
  private $messageHandler?: (event: MessageEvent) => void;
  private get $target(): HTMLElement {
    return this.$options.target || document.body;
  }
  private $styleAdded = false;

  private $createStyle(): void {
    if (this.$styleAdded) return;
    const styleEl = document.createElement("style");
    styleEl.type = "text/css";
    styleEl.innerHTML = styleContent;
    if (this.$target === document.body) {
      document.head.appendChild(styleEl);
    } else {
      this.$target.insertBefore(styleEl, this.$target.firstChild);
    }
    this.$styleAdded = true;
  }

  constructor(opts: StackeditOptions = {}) {
    Object.assign(this.$options, opts);
  }

  on<T extends keyof EventMap>(type: T, listener: EventMap[T]): void {
    const listeners = this.$listeners[type] || [];
    listeners.push(listener);
    this.$listeners[type] = listeners;
  }

  off<T extends keyof EventMap>(type: T, listener: EventMap[T]): void {
    const listeners = this.$listeners[type] || [];
    const idx = listeners.indexOf(listener);
    if (idx >= 0) {
      listeners.splice(idx, 1);
      if (listeners.length) {
        this.$listeners[type] = listeners;
      } else {
        delete this.$listeners[type];
      }
    }
  }

  private $trigger(type: string, payload?: any): void {
    const listeners = this.$listeners[type] || [];
    listeners.forEach((listener) => setTimeout(() => listener(payload), 1));
  }

  openFile(file: StackeditFile = {}, silent = false): void {
    this.close();
    urlParser.href = this.$options.url || "";
    this.$origin = `${urlParser.protocol}//${urlParser.host}`;
    const content = file.content || {};
    const params: Record<string, string | undefined> = {
      origin,
      fileName: file.name,
      contentText: content.text,
      contentProperties:
        !content.yamlProperties && content.properties
          ? JSON.stringify(content.properties)
          : content.yamlProperties,
      silent: silent ? "true" : undefined,
    };
    const serializedParams = Object.keys(params)
      .filter((key) => params[key] !== undefined)
      .map((key) => `${key}=${encodeURIComponent(params[key] || "")}`)
      .join("&");
    urlParser.hash = `#${serializedParams}`;

    this.$createStyle();
    this.$containerEl = document.createElement("div");
    this.$containerEl.className = silent
      ? "stackedit-hidden-container"
      : "stackedit-container";
    this.$containerEl.innerHTML = containerHtml;
    this.$target.appendChild(this.$containerEl);

    const iframeEl = this.$containerEl.querySelector("iframe")!;
    iframeEl.src = urlParser.href;

    const closeButton = this.$containerEl.querySelector("a")!;
    closeButton.addEventListener("click", () => this.close());

    this.$messageHandler = (event: MessageEvent) => {
      if (
        event.origin === this.$origin &&
        event.source === iframeEl.contentWindow
      ) {
        switch (event.data.type) {
          case "ready":
            closeButton.parentNode?.removeChild(closeButton);
            break;
          case "fileChange":
            this.$trigger("fileChange", event.data.payload);
            if (silent) {
              this.close();
            }
            break;
          case "close":
          default:
            this.close();
        }
      }
    };
    window.addEventListener("message", this.$messageHandler);

    if (!silent) {
      if (this.$target === document.body) {
        document.body.className += " stackedit-no-overflow";
      } else {
        this.$target.className += " stackedit-no-overflow";
      }
    }
  }

  close(): void {
    if (this.$messageHandler && this.$containerEl) {
      window.removeEventListener("message", this.$messageHandler);
      this.$target.removeChild(this.$containerEl);
      this.$messageHandler = undefined;
      this.$containerEl = undefined;
      if (this.$target === document.body) {
        document.body.className = document.body.className.replace(
          /\sstackedit-no-overflow\b/,
          ""
        );
      } else {
        this.$target.className = this.$target.className.replace(
          /\sstackedit-no-overflow\b/,
          ""
        );
      }
      this.$trigger("close");
    }
  }
}

export default Stackedit;
