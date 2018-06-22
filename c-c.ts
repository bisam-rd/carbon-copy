import {XtallatX} from 'xtal-latx/xtal-latx.js'
const from = 'from';
const copy = 'copy';
const noshadow = 'noshadow';

/**
* `carbon-copy`
* Dependency free web component that allows copying templates.
* 
*
* @customElement
* @polymer
* @demo demo/index.html
*/
export class CC extends XtallatX(HTMLElement){
    static get is(){return 'c-c';}
    static get observedAttributes() {
        return [copy, from, noshadow];
    }
    static registering : {[key: string]: boolean} = {};

    _copy: boolean;
    /**
     * @type{boolean}
     * Must be true / present for template copy to proceed.
     */
    get copy(){
        return this._copy;
    }
    set copy(val: boolean){
        this.attr(copy, val, '');
    }
    _from: string;
    _prevId: string;
    /**
     * Id of template to import.
     * If from has no slash, the search for the matching template is done within the shadow DOM of the c-c element.  
     * If from starts with "../" then the search is done one level up, etc.
     */
    get from(){
        return this._from;
    }
    set from(val){
        this.attr(from, val);
    }

    _noshadow: boolean;
    /**
     * Don't use shadow DOM 
     */
    get noshadow(){
        return this._noshadow;
    }
    set noshadow(val){
        this.attr(noshadow, val, '');
    }
   
    attributeChangedCallback(name: string, oldValue: string, newValue: string){
        switch(name){
            case copy:
                this._copy = newValue !== null;
                break;
            case from:
                this._prevId = oldValue;
                this._from = newValue;
                break;
            case noshadow:
                this._noshadow = newValue !== null;
                break;
        }
        this.onPropsChange();
    }

    _connected: boolean;
    _originalChildren = [];
    connectedCallback(){
        this._upgradeProperties([copy, from]);
        //this._originalChildren = this.childNodes;
        this.childNodes.forEach(node =>{
            this._originalChildren.push(node.cloneNode(true));
        })
        this.innerHTML = '';
        this._connected = true;
        this.onPropsChange();
    }
    //_ceName:string;
    getCEName(templateId: string){
        return 'c-c-' + templateId.split('_').join('-');
    }
    createCE(template: HTMLTemplateElement){
        if(this._noshadow){
            customElements.define(this.getCEName(template.id), class extends HTMLElement{
                connectedCallback(){
                    this.appendChild(template.content.cloneNode(true));
                }
            })
        }else{
            customElements.define(this.getCEName(template.id), class extends HTMLElement{
                constructor(){
                    super();
                    this.attachShadow({ mode: 'open' });
                    this.shadowRoot.appendChild(template.content.cloneNode(true));
                }
            })
        }

    }
    getHost(el: HTMLElement, level: number, maxLevel : number){
        let parent : HTMLElement;
        do{
            parent = el.parentNode as HTMLElement;
            if(parent.nodeType === 11){
                const newLevel = level + 1;
                if(newLevel === maxLevel) return parent['host'];
                return this.getHost(parent['host'], newLevel, maxLevel);
            }else if(parent.tagName === 'BODY'){
                return parent;
            }
        }while(parent)
    }
    onPropsChange(){
        if(!this._copy || !this._from || !this._connected || this.disabled) return;
        //this._alreadyRegistered = true;
        const fromTokens = this._from.split('/');
        const fromName = fromTokens[0] || fromTokens[1];
        const newCEName = this.getCEName(fromName);
        if(!customElements.get(newCEName)){
            if(!CC.registering[newCEName]){
                CC.registering[newCEName] = true;
                let template: HTMLTemplateElement;
                if(!fromTokens[0]){
                    template = self[fromName];
                }else{
                    //const path = this._from.split('/');
                    //const id = path[path.length - 1];
                    const host = this.getHost(<any>this as HTMLElement, 0, fromTokens.length);
                    if(host){
                        if(host.shadowRoot){
                            template = host.shadowRoot.getElementById(fromName);
                            if(!template) template = host.getElementById(fromName);
                        }else{
                            template = host.getElementById(fromName);
                        }
                    }

                }
                
                if(template.dataset.src && !template.hasAttribute('loaded')){
                    const config : MutationObserverInit = {
                        attributeFilter: ['loaded'],
                        attributes: true,
                    }
                    const mutationObserver = new MutationObserver((mr: MutationRecord[])  =>{
                        this.createCE(template);
                        mutationObserver.disconnect();
                    });
                    mutationObserver.observe(template, config);
                }else{
                    this.createCE(template);
                }
               
            }
        }
        customElements.whenDefined(newCEName).then(() =>{
            //const name = newCEName;
            if(this._prevId){
                const prevEl = this.querySelector(this.getCEName(this._prevId)) as HTMLElement;
                if(prevEl) prevEl.style.display = 'none';
            }
            const prevEl = this.querySelector(newCEName) as HTMLElement;
            if(prevEl){
                prevEl.style.display = 'block';
            }else{
                const ce = document.createElement(newCEName);
                this._originalChildren.forEach(child => {
                    ce.appendChild(child.cloneNode(true));
                })
                // while (this.childNodes.length > 0) {
                //     ce.appendChild(this.childNodes[0]);
                // }
                this.appendChild(ce);
            }

        })

    }
    _lightChildren: {[key: string]: HTMLElement};

}
if(!customElements.get(CC.is)){
    customElements.define('c-c', CC);
}
