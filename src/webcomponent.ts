declare global {
  interface HTMLElementTagNameMap {
    "stackedit-component": StackeditWebComponent;
  }
}

const styleContent = `
:host {
	display: flex;
	flex-direction: column;
	position: relative;
	width: 100%;
}
.stackedit-no-overflow {
	overflow: hidden;
}

.stackedit-iframe {
	display: block;
	width: 100%;
	height: 100%;
	border: 0;
	flex: 1 1 auto;
}
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
}

type FileChangePayload = {
  id: string;
  name: string;
  content: {
    text: string;
    html: string;
    properties: {
      extentions: Record<string, unknown>;
    };
    yamlProperties: string;
  };
};

type Listener = (...args: unknown[]) => void;
type FileChangeListener = (text: string, payload: FileChangePayload) => void;

interface EventMap {
  close: () => void;
  fileChange: FileChangeListener;
  [key: string]: Listener | FileChangeListener;
}

class StackeditWebComponent extends HTMLElement {
  private $options: StackeditOptions = {
    url: "https://stackedit.io/app",
  };
  private $listeners: { [K in keyof EventMap]?: Array<EventMap[K]> } & {
    [key: string]: Array<Listener | FileChangeListener>;
  } = {};
  private $origin?: string;
  private $iframeEl?: HTMLIFrameElement;
  private $messageHandler?: (event: MessageEvent) => void;
  private $styleAdded = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    const text = this.getAttribute("text") || "";
    const name = this.getAttribute("name") || undefined;
    this.openFile({
      name,
      content: { text },
    });
  }

  private $createStyle(): void {
    if (this.$styleAdded) return;
    const styleEl = document.createElement("style");
    styleEl.type = "text/css";
    styleEl.innerHTML = styleContent;
    this.shadowRoot!.appendChild(styleEl);
    this.$styleAdded = true;
  }

  on<T extends keyof EventMap>(type: T, listener: EventMap[T]): void {
    const listeners =
      (this.$listeners[type] as Array<EventMap[T]> | undefined) || [];
    listeners.push(listener);
    this.$listeners[type] = listeners;
  }

  off<T extends keyof EventMap>(type: T, listener: EventMap[T]): void {
    const listeners =
      (this.$listeners[type] as Array<EventMap[T]> | undefined) || [];
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

  private $trigger(type: string, ...args: unknown[]): void {
    const listeners =
      (this.$listeners[type] as
        | Array<Listener | FileChangeListener>
        | undefined) || [];
    listeners.forEach((listener) =>
      setTimeout(() => (listener as any)(...args), 1)
    );
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
    // Crea direttamente l'iframe senza container
    this.$iframeEl = document.createElement("iframe");
    this.$iframeEl.className = "stackedit-iframe";
    this.$iframeEl.src = urlParser.href;
    this.shadowRoot!.appendChild(this.$iframeEl);

    this.$messageHandler = (event: MessageEvent) => {
      if (
        event.origin === this.$origin &&
        event.source === this.$iframeEl!.contentWindow
      ) {
        switch (event.data.type) {
          case "ready":
            break;
          case "fileChange": {
            const payload = event.data.payload;
            const text = payload?.content?.text;
            this.$trigger("fileChange", text, payload);
            if (silent) {
              this.close();
            }
            break;
          }
          case "close":
          default:
            this.close();
        }
      }
    };
    window.addEventListener("message", this.$messageHandler);
  }

  close(): void {
    if (this.$messageHandler && this.$iframeEl) {
      window.removeEventListener("message", this.$messageHandler);
      this.shadowRoot!.removeChild(this.$iframeEl);
      this.$messageHandler = undefined;
      this.$iframeEl = undefined;
      this.$trigger("close");
    }
  }
}

customElements.define("stackedit-component", StackeditWebComponent);

export default StackeditWebComponent;
