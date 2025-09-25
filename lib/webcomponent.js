var styleContent = "\n:host {\n	display: flex;\n	flex-direction: column;\n	position: relative;\n	width: 100%;\n}\n.stackedit-no-overflow {\n	overflow: hidden;\n}\n\n.stackedit-iframe {\n	display: block;\n	width: 100%;\n	height: 100%;\n	border: 0;\n	flex: 1 1 auto;\n}\n", origin = `${window.location.protocol}//${window.location.host}`, urlParser = document.createElement("a"), StackeditWebComponent = class extends HTMLElement {
	$options = { url: "https://stackedit.io/app" };
	$listeners = {};
	$origin;
	$iframeEl;
	$messageHandler;
	$styleAdded = !1;
	constructor() {
		super(), this.attachShadow({ mode: "open" });
	}
	connectedCallback() {
		let e = this.getAttribute("text") || "", t = this.getAttribute("name") || void 0;
		this.openFile({
			name: t,
			content: { text: e }
		});
	}
	$createStyle() {
		if (this.$styleAdded) return;
		let t = document.createElement("style");
		t.type = "text/css", t.innerHTML = styleContent, this.shadowRoot.appendChild(t), this.$styleAdded = !0;
	}
	on(e, t) {
		let n = this.$listeners[e] || [];
		n.push(t), this.$listeners[e] = n;
	}
	off(e, t) {
		let n = this.$listeners[e] || [], r = n.indexOf(t);
		r >= 0 && (n.splice(r, 1), n.length ? this.$listeners[e] = n : delete this.$listeners[e]);
	}
	$trigger(e, ...t) {
		(this.$listeners[e] || []).forEach((e) => setTimeout(() => e(...t), 1));
	}
	openFile(e = {}, r = !1) {
		this.close(), urlParser.href = this.$options.url || "", this.$origin = `${urlParser.protocol}//${urlParser.host}`;
		let i = e.content || {}, a = {
			origin,
			fileName: e.name,
			contentText: i.text,
			contentProperties: !i.yamlProperties && i.properties ? JSON.stringify(i.properties) : i.yamlProperties,
			silent: r ? "true" : void 0
		};
		urlParser.hash = `#${Object.keys(a).filter((e) => a[e] !== void 0).map((e) => `${e}=${encodeURIComponent(a[e] || "")}`).join("&")}`, this.$createStyle(), this.$iframeEl = document.createElement("iframe"), this.$iframeEl.className = "stackedit-iframe", this.$iframeEl.src = urlParser.href, this.shadowRoot.appendChild(this.$iframeEl), this.$messageHandler = (e) => {
			if (e.origin === this.$origin && e.source === this.$iframeEl.contentWindow) switch (e.data.type) {
				case "ready": break;
				case "fileChange": {
					let t = e.data.payload, n = t?.content?.text;
					this.$trigger("fileChange", n, t), r && this.close();
					break;
				}
				case "close":
				default: this.close();
			}
		}, window.addEventListener("message", this.$messageHandler);
	}
	close() {
		this.$messageHandler && this.$iframeEl && (window.removeEventListener("message", this.$messageHandler), this.shadowRoot.removeChild(this.$iframeEl), this.$messageHandler = void 0, this.$iframeEl = void 0, this.$trigger("close"));
	}
};
customElements.define("stackedit-component", StackeditWebComponent);
var webcomponent_default = StackeditWebComponent;
export { webcomponent_default as default };
