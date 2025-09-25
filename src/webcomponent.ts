/**
 * Available attributes for <stackedit-component>
 */
export type StackeditComponentAttributes = {
  /** Initial markdown text */
  text?: string;
  /** File name (optional) */
  name?: string;
  /** Custom stackedit URL (optional) */
  url?: string;
  // onChange deprecato: usa l'evento 'change' invece
};
import { LitElement, html, css } from "lit";
import type { PropertyValueMap } from "lit";
import { customElement, property } from "lit/decorators.js";

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
  url: string;
}

@customElement("stackedit-component")
export class StackeditComponent extends LitElement {
  @property({ type: String }) text = "";
  @property({ type: String }) name?: string;
  @property({ type: String }) url = "https://stackedit.io/app";

  private _iframeEl?: HTMLIFrameElement;
  private _origin?: string;
  private _listenerAdded = false;
  private _boundMessageHandler: (event: MessageEvent) => void;

  constructor() {
    super();
    this._boundMessageHandler = this._handleMessage.bind(this);
  }

  static styles = css`
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

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this._openFile({
      name: this.name,
      content: { text: this.text },
    });
  }

  render() {
    return html`<iframe class="stackedit-iframe"></iframe>`;
  }

  private _openFile(file: StackeditFile = {}, silent = false): void {
    this._removeMessageHandler();
    const origin = `${window.location.protocol}//${window.location.host}`;
    const urlParser = document.createElement("a");
    urlParser.href = this.url || "";
    this._origin = `${urlParser.protocol}//${urlParser.host}`;
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

    this.updateComplete.then(() => {
      const iframe = this.shadowRoot?.querySelector(
        ".stackedit-iframe"
      ) as HTMLIFrameElement;
      if (iframe) {
        iframe.src = urlParser.href;
        this._iframeEl = iframe;
        if (!this._listenerAdded) {
          window.addEventListener("message", this._boundMessageHandler);
          this._listenerAdded = true;
        }
      }
    });
  }

  private _removeMessageHandler(): void {
    if (this._listenerAdded) {
      window.removeEventListener("message", this._boundMessageHandler);
      this._listenerAdded = false;
    }
    if (this._iframeEl) {
      this._iframeEl.src = "about:blank";
      this._iframeEl = undefined;
    }
  }

  private _handleMessage(event: MessageEvent): void {
    if (
      !this._iframeEl ||
      event.origin !== this._origin ||
      event.source !== this._iframeEl.contentWindow
    )
      return;
    switch (event.data.type) {
      case "ready":
        break;
      case "fileChange": {
        const payload = event.data.payload;
        const text = payload?.content?.text;
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: { text, payload },
            bubbles: true,
            composed: true,
          })
        );
        // Support onchange as HTML attribute: <stackedit-component onchange="functionName">
        const onchangeAttr = this.getAttribute("onchange");
        if (
          onchangeAttr &&
          typeof (window as any)[onchangeAttr] === "function"
        ) {
          try {
            ((window as any)[onchangeAttr] as Function)(text, payload);
          } catch (e) {}
        }
        // ...
        break;
      }
      case "close":
      default:
        this._removeMessageHandler();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._removeMessageHandler();
  }
}
