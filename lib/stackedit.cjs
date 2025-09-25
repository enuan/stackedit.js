var e=`
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
`,t=`
<div class="stackedit-iframe-container">
  <iframe class="stackedit-iframe"></iframe>
  <a href="javascript:void(0)" class="stackedit-close-button" title="Close">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
      <path fill="#777" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
  </a>
</div>
`,n=`${window.location.protocol}//${window.location.host}`,r=document.createElement(`a`),i=class{$options={url:`https://stackedit.io/app`};$listeners={};$origin;$containerEl;$messageHandler;get $target(){return this.$options.target||document.body}$styleAdded=!1;$createStyle(){if(this.$styleAdded)return;let t=document.createElement(`style`);t.type=`text/css`,t.innerHTML=e,this.$target===document.body?document.head.appendChild(t):this.$target.insertBefore(t,this.$target.firstChild),this.$styleAdded=!0}constructor(e={}){Object.assign(this.$options,e)}on(e,t){let n=this.$listeners[e]||[];n.push(t),this.$listeners[e]=n}off(e,t){let n=this.$listeners[e]||[],r=n.indexOf(t);r>=0&&(n.splice(r,1),n.length?this.$listeners[e]=n:delete this.$listeners[e])}$trigger(e,t){(this.$listeners[e]||[]).forEach(e=>setTimeout(()=>e(t),1))}openFile(e={},i=!1){this.close(),r.href=this.$options.url||``,this.$origin=`${r.protocol}//${r.host}`;let a=e.content||{},o={origin:n,fileName:e.name,contentText:a.text,contentProperties:!a.yamlProperties&&a.properties?JSON.stringify(a.properties):a.yamlProperties,silent:i?`true`:void 0};r.hash=`#${Object.keys(o).filter(e=>o[e]!==void 0).map(e=>`${e}=${encodeURIComponent(o[e]||``)}`).join(`&`)}`,this.$createStyle(),this.$containerEl=document.createElement(`div`),this.$containerEl.className=i?`stackedit-hidden-container`:`stackedit-container`,this.$containerEl.innerHTML=t,this.$target.appendChild(this.$containerEl);let s=this.$containerEl.querySelector(`iframe`);s.src=r.href;let c=this.$containerEl.querySelector(`a`);c.addEventListener(`click`,()=>this.close()),this.$messageHandler=e=>{if(e.origin===this.$origin&&e.source===s.contentWindow)switch(e.data.type){case`ready`:c.parentNode?.removeChild(c);break;case`fileChange`:this.$trigger(`fileChange`,e.data.payload),i&&this.close();break;case`close`:default:this.close()}},window.addEventListener(`message`,this.$messageHandler),i||(this.$target===document.body?document.body.className+=` stackedit-no-overflow`:this.$target.className+=` stackedit-no-overflow`)}close(){this.$messageHandler&&this.$containerEl&&(window.removeEventListener(`message`,this.$messageHandler),this.$target.removeChild(this.$containerEl),this.$messageHandler=void 0,this.$containerEl=void 0,this.$target===document.body?document.body.className=document.body.className.replace(/\sstackedit-no-overflow\b/,``):this.$target.className=this.$target.className.replace(/\sstackedit-no-overflow\b/,``),this.$trigger(`close`))}},a=i;module.exports=a;