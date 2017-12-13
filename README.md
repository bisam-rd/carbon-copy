[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/bahrus/carbon-copy)

# \<carbon-copy\>

Copy an HTML Template into DOM, and more, with this 1.9kb (gzipped, minified) web component.

There are a number of scenarios where a snippet of HTML must be copied (repeatedly) into the DOM tree.  This is partly what the Template Element [was designed for:](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template)

>  Think of a template as a content fragment that is being stored for subsequent use in the document. While the parser does process the contents of the \<template\> element while loading the page, it does so only to ensure that those contents are valid; the element's contents are not rendered, however.

Out of the box, the template must be imported programmatically.  This can disrupt the flow when inspecting a document.

The carbon copy element, \<carbon-copy\> or \<c-c\> for short, allows one to declaratively copy contents from an external HTML template (or one already defined in the main document) into the tag's innerHTML.

Why is this useful?

1) In the age of HTTP/2, the need for a robust client-side include increases, as it can benefit from the superior caching that HTTP/2 affords without too much penalty from breaking up a page.  This can be extremely useful for static content generators, where common markup appears multiple times.

2) \<c-c\> allows you to define a Polymer component from an HTML file, without the help of the (deprecated?) HTMLImport proposal.  While it may be some time before Chrome removes native HTMLImport support, and while the polyfill could be used ad infinitum, this web component is ~55% the size, and we believe is a more "intuitive" library, especially for those who are looking for a traditional client-side include capability.

3)  It can also be useful when utilizing a functional renderer like lit-html.  If large sections of the output are not bound to any client-side dynamic properties, those large sections could be referenced via the c-c element.   This would allow those sections to be encoded in HTML, and parsed by the fast c++ compiler, rather than the not [quite so fast JavaScript parser](https://youtu.be/Io6JjgckHbg?t=1143). 

To keep things small and simple, c-c does provide support for dynamically inserting different data into each instance, but the syntax for doing so is a little clumsy compared to other templating engines.  I would not even categorize c-c as a templating engine.  It's just a custom element that has some hooks for plugging in content.

Note that there are other client-side include web components you may want to compare this one with -- e.g. github's [include-fragment-element](https://github.com/github/include-fragment-element) and [Juicy's juicy-html](https://www.webcomponents.org/element/Juicy/juicy-html) or [xtal-fetch](https://www.webcomponents.org/element/bahrus/xtal-fetch) if carbon-copy doesn't meet your needs.

The syntax for this element, at its simplest level, is as follows:

```html
<c-c href="/myPath/toTemplate/myHTMLFile.html#myTemplateId">
</c-c>
```

If no url is specified before the hash symbol, then the code will assume the id exists and is searchable via document.getElementById().

If the href before the hash is "_host", then the search for the template with the given id will be done within the first ancestor parent which has shadow DOM.  

You can specify parameters the referenced template can retrieve via the set attribute, which is a semi-colon delimited list of name/value pairs (using the colon as the assignment operator):

```html
    <c-c href="#noMatter" set="verb:do"></c-c><br>
    <c-c href="#noMatter" set="verb:say"></c-c>
```

The referenced template can retrieve these parameters via the get attribute, also semicolon delimited:

```html
<template id="noMatter">No matter what we <c-c get="verb"></c-c> (no matter what we <c-c get="verb"></c-c>)</template>
```

You can also set attributes and classes similarly.

```html
    <c-c href="#noMatter" verb-props="parentNode.contentEditable:true" set="verb:do;"></c-c>
```

### Defining a Polymer component in an html file without using HTMLImports

In a separate html, define an HTML template:

```html
<template id="newPolymerElementTest">
    <dom-module id='my-component'>
        <template>
            I am here
        </template>
    </dom-module>
    <script type="module">
        class MyComponent extends Polymer.Element{
            static get is(){return 'my-component';}
        }
        customElements.define(MyComponent.is, MyComponent);
    </script>
</template>
```

Then in the referencing file, just add:

```html
<c-c href="path/to/include.html#newPolymerElementTest"></c-c>
<my-component></my-component>
```

*et voilà!*

### Changing href

By default, if the href attribute / property changes for an existing c-c element instance, the new template will be appended to the inner content of the c-c element.  Even if you go back to the original template, it will keep getting appended repeatedly.

However, the attribute stamp-href modifies the behavior in the following ways:

- Previous template imports will be hidden
- If you go back to the original template import href, it will unhide what was there.  Thus any editing or navigation done within that DOM tree will persist.

This allows one to switch between already loaded pages instantaneously, similar to Polymer's iron-pages element.


### Child Property Propagation

When we dynamically add elements in the DOM, these added elements don't immediately benefit from the usual property flow paradigm.  We would like to be able to wire that up via markup.  The solution is described below. 

In the containing document, we turn the c-c element into a property setter c-c element by utilizing "set-props" attribute:

```html
<c-c href="JsonEditorSnippet.html#jes" set-props my-json="[[generatedJson]]"></c-c>
```

The boolean attribute/property set-props indicates that, after appending DOM content, it should search for elements with attributes like shown below:

```html
<xtal-json-editor get-props="watch:myJson" notify-props></xtal-json-editor>
```

The *c-c* element will set the watch property of *xtal-json-editor* to the value of the myJson property.

The my-json attribute shown above is an example of a binding within a Polymer -- [or Oracle Jet?](https://blogs.oracle.com/developers/announcing-oracle-jet-40-and-web-components) -- element.  But that is not required.  What is key is that somehow if get-props is set to "watch:myJson" then the developer is responsible for ensuring that the c-c element's myJson property gets assigned (and receives updates of) the value in question.

The combination of the set-props c-c element and the get-props attribute on a child DOM node creates a "live" connection so updates in the container get passed down repeatedly.

### Event bubbling

The c-c element also searches for child custom element tags with attribute notify-props.  For each such element, *c-c* checks if (for now) the custom element uses the Polymer static properties getter to provide reflection on the properties of the custom element.  Support for other custom element libraries, like SkateJS, Stencil, etc. will be forthcoming assuming they support similar reflection.  *c-c* sifts through these properties, and sets up a listener on each property which is marked "notify", which will then pass the value to the host element using the Polymer convention "[property-name]-changed".  See demo/PolymerTests/PolymerTest.html for an example.

### Event attaching

The c-c element bubbles an event up when it clones the HTML Template.  One can attach (in a Polymer element) an event handler for this event declaratively:

```html
                <c-c href="IncludeFolder/JsonEditorSnippet.html#jes" on-dom-change="onClone"
                ></c-c>
```
  This allows the host element to establish event listeners, based on declarative markup within the content the c-c element loaded:

```JavaScript
    onClone: function (e) {
        const myCCElement = e.srcElement;
        myCCElement.attachEventHandlers(this, e.detail.clone);
    },
```

As you can see, a c-c instance has a built-in method called attachEventHandlers.  **It is important to note that attachEvent expects slightly different mark-up to support specifying event listeners. It differs from the Polymer way of declaratively attaching event handlers**. c-c uses:

```html
<span call-myMethodName-on="click">Click here</span>
```

as opposed to the more familiar Polymer syntax:

```html
<span on-click="myMethodName">Click here</span>
```

This deviation allows the code base for the c-c element to be smaller and faster (maybe).

You can have multiple events map to the same method by using a pipe delimited list in the value of the attribute, e.g. "blur|click"

### Preprocessing


If a document being imported contains lines like this in the header:

```html
<header>
    ...
    <meta name="preprocessor" content="cc_resolver">
    <meta name="preprocessor" content="zenmu">
    ...
</header>
```

then some preprocessing functions: cc_resolver, and zenmu (described below) will be performed on the import before creating the reusable HTMLTemplates.  They will be passed the referenced document as well as the referring carbon-copy element, and these preprocessing functions can manipulate the document.  By being passed the carbon-copy element, one can infer the url context from which the file was referenced, and hence one can recusively modify the relative url's contained within the file. These preprocessing functions are separate JavaScript files from carbon_copy.js, so users will only incur the performance hit from downloading these functions if the benefits of the preprocessor outweigh the costs.  Users of the carbon-copy element can create their own preprocessor function(s) and add it to the processing pipeline, using these two useful preprocessor functions as a guide.

Note:  This preprocessing could be done on the server-side level just (or almost) as easily, and/or during the optimizing build.  That would mean less JavaScript processing, but, at least in some cases (zenmu below) there could be advantages of doing the processing on the client, too, so the right place to do the processing may vary depending on the use case.   If done server-side or during the build, the meta tag above should be removed before passing down to the client.  Another option to consider would be to do the preprocessing within a service worker.

The biggest benefit, of course, of allowing the processing to be done by client-side JavaScript is that it doesn't add any additional build steps during development.

Carbon-copy will only load the client-side JavaScript processor if it sees the meta tag present.

The functions cc_resolver and zenmu (in this case) must be put into global scope and loaded before the carbon element is utilized (if you add the meta tags as shown above).

cc_resolver recursively resolves carbon copy (cc) elements, stylesheets, HTMLImports, script tags and IFrames. (More testing needed.)

### zenmu 

The particular function zenmu (in zenmu.js) that comes with this component  might be of interest to those trying to reduce the verbosity of web component markup.

One of the aspects that make Vue, Angular, Aurelia, Riot, popular is their compact template syntax.

Lack of support for the "is" attribute, as well as the requirement that custom elements only be defined at the tag level (not attribute level -- i.e. no custom attribute standard has been ratified), for now,  means similar syntax is relatively verbose when using custom elements.  

This preprocessor allows us to have our cake and eat it too.  We can utilize compact syntax, which gets expanded during processing.


#### Preprocessing directive # 1:  Inner Wrapping

We need the ability to wrap elements while importing.  We draw inspiration from  emmet / zen markup to achieve compact notation:

```html
<dom-bind wraps="template#myId(inner-stuff.myClass1.myClass2@href://cnn.com@condensed">
    <span>Spans rule!</span>
    <div>Divs divide and conquer!</div>
</dom-bind>
```
becomes:

```html
    <dom-bind>
        <template id="myId">
            <inner-stuff class="myClass1 myClass2" href="//cnn.com" condensed>
                <span>Spans rule!</span>
                <div>Divs divide and conquer!</div>
            </inner-stuff>
        </template>
    </dom-bind>
```

Emmet syntax treats the div tag special -- because div is the most frequently used tag.

zenmu gives similar special treatment to the template tag.  So the markup above could be further reduced as follows:

```html
<dom-bind wraps="#myId(inner-stuff.myClass1.myClass2@href://cnn.com@condensed">
    <span>Spans rule!</span>
    <div>Divs divide and conquer!</div>
</dom-bind>
```


#### Preprocessing directive # 2:  Outer Wrapping

```html
  <li wrap-in="dom-if@if:[[myTest]](template">
    <span>[[myName]]</span>
  </li>
```

becomes

```html
<dom-if if="[[myTest]]">
    <template>
        <li>
            <span>[[myName]]</span>
        </li>
    </template>
</dom-if>
```

We think it is a common pattern to have the primary attribute match the second part of the custom element tag name.  This, combined with the assumption of the template tag name, allows the markup to be shortened even further:

```html
  <li wrap-in="dom-if@:[[myTest]](">
    <span>[[someInfo]]</span>
  </li>
```


One could fret about the fact that we could easily run into scenarios where the zenmu syntax breaks down due to one of the special characters -- . @ or # needing to appear in an unusual place -- e.g. an attribute value needs to contain the @ character.  Rather than create difficult to remember rules for these scenarios, simply revert to more verbose syntax.



## Future enhancements:

### const exporter preprocessor

file:  https://domain.com/path/to/myFile.html

```html
<script type="module" id="scriptA">
        export const foo = 'hello';
</script>
```

transforms into:

```html
    <script type="module" id="scriptA">
        (function () {
            const exportconst = {};
            const foo = exportconst.foo = 'hello'
            import.meta['exports'] = exportconst; 
        })();
    </script>
```


### Polymer specific template stamping

TBD


### Content protection

TBD

### Content merging

TBD

#### Replace

TBD



### Inserting into slots
 
TBD

### Other
- [ ] Do all set properties in one step (Polymer, other libraries)
- [ ] (Possibly) Explore integrating with streaming ideas.


### Implementation

The implementation of this was originally done using HTMLImports (for external files).  In light of recent announcements regarding the future of HTMLImports, and partly inspired by this [interesting article](https://jakearchibald.com/2016/fun-hacks-faster-content/), a hidden iFrame was tried.  The streaming-element the article describes features many obscure tricks I wasn't aware of, [but it does require a fair amount of code](https://github.com/bahrus/streaming-element/blob/master/streaming-element.js).  While the use of IFrames may be ideal in some problem domains, a quick performance test indicates the performance of Fetch/ShadowDom/innerHTML greatly exceeds that of iframes (and objects) when applied repeatedly.

So the current approach is to use fetch / create ShadowDOM / set innerHTML inside the shadowDOM.  This allows id's from different documents to not get confused.


## Installation

Install the component using [Bower](http://bower.io/):
```sh
$ bower install carbon-copy --save
```

## Viewing Your Element

```sh
$ polymer serve
Open http://127.0.0.1:8081/components/carbon-copy
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
