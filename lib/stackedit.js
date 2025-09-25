var styleContent = "\n.stackedit-no-overflow {\n  overflow: hidden;\n}\n\n.stackedit-container {\n  background-color: rgba(160, 160, 160, 0.5);\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 9999;\n}\n\n.stackedit-hidden-container {\n  position: absolute;\n  width: 10px;\n  height: 10px;\n  left: -99px;\n}\n\n.stackedit-iframe-container {\n  background-color: #fff;\n  position: absolute;\n  margin: auto;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  height: 98%;\n  width: 98%;\n  max-width: 1280px;\n  border-radius: 2px;\n  overflow: hidden;\n}\n\n.stackedit-iframe {\n  position: absolute;\n  height: 100%;\n  width: 100%;\n  border: 0;\n  border-radius: 2px;\n}\n\n@media (max-width: 740px) {\n  .stackedit-iframe-container {\n    height: 100%;\n    width: 100%;\n    border-radius: 0;\n  }\n\n  .stackedit-iframe {\n    border-radius: 0;\n  }\n}\n\n.stackedit-close-button {\n  position: absolute !important;\n  box-sizing: border-box !important;\n  width: 38px !important;\n  height: 36px !important;\n  margin: 4px !important;\n  padding: 0 4px !important;\n  text-align: center !important;\n  vertical-align: middle !important;\n  text-decoration: none !important;\n}\n", containerHtml = "\n<div class=\"stackedit-iframe-container\">\n  <iframe class=\"stackedit-iframe\"></iframe>\n  <a href=\"javascript:void(0)\" class=\"stackedit-close-button\" title=\"Close\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\">\n      <path fill=\"#777\" d=\"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z\" />\n    </svg>\n  </a>\n</div>\n", origin = `${window.location.protocol}//${window.location.host}`, urlParser = document.createElement("a"), lib_default = class {
	$options = { url: "https://stackedit.io/app" };
	$listeners = {};
	$origin;
	$containerEl;
	$messageHandler;
	get $target() {
		return this.$options.target || document.body;
	}
	$styleAdded = !1;
	$createStyle() {
		if (this.$styleAdded) return;
		let t = document.createElement("style");
		t.type = "text/css", t.innerHTML = styleContent, this.$target === document.body ? document.head.appendChild(t) : this.$target.insertBefore(t, this.$target.firstChild), this.$styleAdded = !0;
	}
	constructor(e = {}) {
		Object.assign(this.$options, e);
	}
	on(e, t) {
		let n = this.$listeners[e] || [];
		n.push(t), this.$listeners[e] = n;
	}
	off(e, t) {
		let n = this.$listeners[e] || [], r = n.indexOf(t);
		r >= 0 && (n.splice(r, 1), n.length ? this.$listeners[e] = n : delete this.$listeners[e]);
	}
	$trigger(e, t) {
		(this.$listeners[e] || []).forEach((e) => setTimeout(() => e(t), 1));
	}
	openFile(e = {}, i = !1) {
		this.close(), urlParser.href = this.$options.url || "", this.$origin = `${urlParser.protocol}//${urlParser.host}`;
		let a = e.content || {}, o = {
			origin,
			fileName: e.name,
			contentText: a.text,
			contentProperties: !a.yamlProperties && a.properties ? JSON.stringify(a.properties) : a.yamlProperties,
			silent: i ? "true" : void 0
		};
		urlParser.hash = `#${Object.keys(o).filter((e) => o[e] !== void 0).map((e) => `${e}=${encodeURIComponent(o[e] || "")}`).join("&")}`, this.$createStyle(), this.$containerEl = document.createElement("div"), this.$containerEl.className = i ? "stackedit-hidden-container" : "stackedit-container", this.$containerEl.innerHTML = containerHtml, this.$target.appendChild(this.$containerEl);
		let s = this.$containerEl.querySelector("iframe");
		s.src = urlParser.href;
		let c = this.$containerEl.querySelector("a");
		c.addEventListener("click", () => this.close()), this.$messageHandler = (e) => {
			if (e.origin === this.$origin && e.source === s.contentWindow) switch (e.data.type) {
				case "ready":
					c.parentNode?.removeChild(c);
					break;
				case "fileChange":
					this.$trigger("fileChange", e.data.payload), i && this.close();
					break;
				case "close":
				default: this.close();
			}
		}, window.addEventListener("message", this.$messageHandler), i || (this.$target === document.body ? document.body.className += " stackedit-no-overflow" : this.$target.className += " stackedit-no-overflow");
	}
	close() {
		this.$messageHandler && this.$containerEl && (window.removeEventListener("message", this.$messageHandler), this.$target.removeChild(this.$containerEl), this.$messageHandler = void 0, this.$containerEl = void 0, this.$target === document.body ? document.body.className = document.body.className.replace(/\sstackedit-no-overflow\b/, "") : this.$target.className = this.$target.className.replace(/\sstackedit-no-overflow\b/, ""), this.$trigger("close"));
	}
};
export { lib_default as default };
