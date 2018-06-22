import{XtallatX}from"./node_modules/xtal-latx/xtal-latx.js";var from="from",copy="copy",noshadow="noshadow";export var CC=function(_XtallatX){babelHelpers.inherits(CC,_XtallatX);function CC(){var _this;babelHelpers.classCallCheck(this,CC);_this=babelHelpers.possibleConstructorReturn(this,(CC.__proto__||Object.getPrototypeOf(CC)).apply(this,arguments));_this._originalChildren=[];return _this}babelHelpers.createClass(CC,[{key:"attributeChangedCallback",value:function attributeChangedCallback(name,oldValue,newValue){switch(name){case copy:this._copy=null!==newValue;break;case from:this._prevId=oldValue;this._from=newValue;break;case noshadow:this._noshadow=null!==newValue;break;}this.onPropsChange()}},{key:"connectedCallback",value:function connectedCallback(){var _this2=this;this._upgradeProperties([copy,from]);this.childNodes.forEach(function(node){_this2._originalChildren.push(node.cloneNode(!0))});this.innerHTML="";this._connected=!0;this.onPropsChange()}},{key:"getCEName",value:function getCEName(templateId){return"c-c-"+templateId.split("_").join("-")}},{key:"createCE",value:function createCE(template){if(this._noshadow){customElements.define(this.getCEName(template.id),function(_HTMLElement){babelHelpers.inherits(_class,_HTMLElement);function _class(){babelHelpers.classCallCheck(this,_class);return babelHelpers.possibleConstructorReturn(this,(_class.__proto__||Object.getPrototypeOf(_class)).apply(this,arguments))}babelHelpers.createClass(_class,[{key:"connectedCallback",value:function connectedCallback(){this.appendChild(template.content.cloneNode(!0))}}]);return _class}(HTMLElement))}else{customElements.define(this.getCEName(template.id),function(_HTMLElement2){babelHelpers.inherits(_class2,_HTMLElement2);function _class2(){var _this3;babelHelpers.classCallCheck(this,_class2);_this3=babelHelpers.possibleConstructorReturn(this,(_class2.__proto__||Object.getPrototypeOf(_class2)).call(this));_this3.attachShadow({mode:"open"});_this3.shadowRoot.appendChild(template.content.cloneNode(!0));return _this3}return _class2}(HTMLElement))}}},{key:"getHost",value:function getHost(el,level,maxLevel){var parent;do{parent=el.parentNode;if(11===parent.nodeType){var newLevel=level+1;if(newLevel===maxLevel)return parent.host;return this.getHost(parent.host,newLevel,maxLevel)}else if("BODY"===parent.tagName){return parent}}while(parent)}},{key:"onPropsChange",value:function onPropsChange(){var _this4=this;if(!this._copy||!this._from||!this._connected||this.disabled)return;var fromTokens=this._from.split("/"),fromName=fromTokens[0]||fromTokens[1],newCEName=this.getCEName(fromName);if(!customElements.get(newCEName)){if(!CC.registering[newCEName]){CC.registering[newCEName]=!0;var template;if(!fromTokens[0]){template=self[fromName]}else{var host=this.getHost(this,0,fromTokens.length);if(host){if(host.shadowRoot){template=host.shadowRoot.getElementById(fromName);if(!template)template=host.getElementById(fromName)}else{template=host.getElementById(fromName)}}}if(template.dataset.src&&!template.hasAttribute("loaded")){var mutationObserver=new MutationObserver(function(){_this4.createCE(template);mutationObserver.disconnect()});mutationObserver.observe(template,{attributeFilter:["loaded"],attributes:!0})}else{this.createCE(template)}}}customElements.whenDefined(newCEName).then(function(){if(_this4._prevId){var _prevEl=_this4.querySelector(_this4.getCEName(_this4._prevId));if(_prevEl)_prevEl.style.display="none"}var prevEl=_this4.querySelector(newCEName);if(prevEl){prevEl.style.display="block"}else{var ce=document.createElement(newCEName);_this4._originalChildren.forEach(function(child){ce.appendChild(child.cloneNode(!0))});_this4.appendChild(ce)}})}},{key:"copy",get:function get(){return this._copy},set:function set(val){this.attr(copy,val,"")}},{key:"from",get:function get(){return this._from},set:function set(val){this.attr(from,val)}},{key:"noshadow",get:function get(){return this._noshadow},set:function set(val){this.attr(noshadow,val,"")}}],[{key:"is",get:function get(){return"c-c"}},{key:"observedAttributes",get:function get(){return[copy,from,noshadow]}}]);return CC}(XtallatX(HTMLElement));CC.registering={};if(!customElements.get(CC.is)){customElements.define("c-c",CC)}