import * as i0 from '@angular/core';
import { EventEmitter, Component, Input, Output, ViewChild, Directive, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';

// configuration structure, backwards compatible with earlier versions

// DOM element manipulation functions...
//
function setValue(el, value) {
    //console.log("setValue", el.nodeName, "["+value+"]");
    if (isInputOrTextAreaElement(el)) {
        el.value = value;
    }
    else {
        el.textContent = value;
    }
}
function getValue(el) {
    return isInputOrTextAreaElement(el) ? el.value : el.textContent;
}
function insertValue(el, start, end, text, iframe, noRecursion = false) {
    //console.log("insertValue", el.nodeName, start, end, "["+text+"]", el);
    if (isTextElement(el)) {
        let val = getValue(el);
        setValue(el, val.substring(0, start) + text + val.substring(end, val.length));
        setCaretPosition(el, start + text.length, iframe);
    }
    else if (!noRecursion) {
        let selObj = getWindowSelection(iframe);
        if (selObj && selObj.rangeCount > 0) {
            var selRange = selObj.getRangeAt(0);
            var position = selRange.startOffset;
            var anchorNode = selObj.anchorNode;
            // if (text.endsWith(' ')) {
            //   text = text.substring(0, text.length-1) + '\xA0';
            // }
            insertValue(anchorNode, position - (end - start), position, text, iframe, true);
        }
    }
}
function isInputOrTextAreaElement(el) {
    return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA');
}
;
function isTextElement(el) {
    return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA' || el.nodeName == '#text');
}
;
function setCaretPosition(el, pos, iframe = null) {
    //console.log("setCaretPosition", pos, el, iframe==null);
    if (isInputOrTextAreaElement(el) && el.selectionStart) {
        el.focus();
        el.setSelectionRange(pos, pos);
    }
    else {
        let range = getDocument(iframe).createRange();
        range.setStart(el, pos);
        range.collapse(true);
        let sel = getWindowSelection(iframe);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}
function getCaretPosition(el, iframe = null) {
    //console.log("getCaretPosition", el);
    if (isInputOrTextAreaElement(el)) {
        var val = el.value;
        return val.slice(0, el.selectionStart).length;
    }
    else {
        var selObj = getWindowSelection(iframe); //window.getSelection();
        if (selObj.rangeCount > 0) {
            var selRange = selObj.getRangeAt(0);
            var preCaretRange = selRange.cloneRange();
            preCaretRange.selectNodeContents(el);
            preCaretRange.setEnd(selRange.endContainer, selRange.endOffset);
            var position = preCaretRange.toString().length;
            return position;
        }
    }
}
// Based on ment.io functions...
//
function getDocument(iframe) {
    if (!iframe) {
        return document;
    }
    else {
        return iframe.contentWindow.document;
    }
}
function getWindowSelection(iframe) {
    if (!iframe) {
        return window.getSelection();
    }
    else {
        return iframe.contentWindow.getSelection();
    }
}
function getContentEditableCaretCoords(ctx) {
    let markerTextChar = '\ufeff';
    let markerId = 'sel_' + new Date().getTime() + '_' + Math.random().toString().substr(2);
    let doc = getDocument(ctx ? ctx.iframe : null);
    let sel = getWindowSelection(ctx ? ctx.iframe : null);
    let prevRange = sel.getRangeAt(0);
    // create new range and set postion using prevRange
    let range = doc.createRange();
    range.setStart(sel.anchorNode, prevRange.startOffset);
    range.setEnd(sel.anchorNode, prevRange.startOffset);
    range.collapse(false);
    // Create the marker element containing a single invisible character
    // using DOM methods and insert it at the position in the range
    let markerEl = doc.createElement('span');
    markerEl.id = markerId;
    markerEl.appendChild(doc.createTextNode(markerTextChar));
    range.insertNode(markerEl);
    sel.removeAllRanges();
    sel.addRange(prevRange);
    let coordinates = {
        left: 0,
        top: markerEl.offsetHeight
    };
    localToRelativeCoordinates(ctx, markerEl, coordinates);
    markerEl.parentNode.removeChild(markerEl);
    return coordinates;
}
function localToRelativeCoordinates(ctx, element, coordinates) {
    let obj = element;
    let iframe = ctx ? ctx.iframe : null;
    while (obj) {
        if (ctx.parent != null && ctx.parent == obj) {
            break;
        }
        coordinates.left += obj.offsetLeft + obj.clientLeft;
        coordinates.top += obj.offsetTop + obj.clientTop;
        obj = obj.offsetParent;
        if (!obj && iframe) {
            obj = iframe;
            iframe = null;
        }
    }
    obj = element;
    iframe = ctx ? ctx.iframe : null;
    while (obj !== getDocument(null).body && obj != null) {
        if (ctx.parent != null && ctx.parent == obj) {
            break;
        }
        if (obj.scrollTop && obj.scrollTop > 0) {
            coordinates.top -= obj.scrollTop;
        }
        if (obj.scrollLeft && obj.scrollLeft > 0) {
            coordinates.left -= obj.scrollLeft;
        }
        obj = obj.parentNode;
        if (!obj && iframe) {
            obj = iframe;
            iframe = null;
        }
    }
}

/* From: https://github.com/component/textarea-caret-position */
/* jshint browser: true */
// (function () {
// We'll copy the properties below into the mirror div.
// Note that some browsers, such as Firefox, do not concatenate properties
// into their shorthand (e.g. padding-top, padding-bottom etc. -> padding),
// so we have to list every single property explicitly.
var properties = [
    'direction', // RTL support
    'boxSizing',
    'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
    'height',
    'overflowX',
    'overflowY', // copy the scrollbar for IE
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration', // might not make a difference, but better be safe
    'letterSpacing',
    'wordSpacing',
    'tabSize',
    'MozTabSize'
];
var isBrowser = (typeof window !== 'undefined');
var isFirefox = (isBrowser && window['mozInnerScreenX'] != null);
function getCaretCoordinates(element, position, options) {
    if (!isBrowser) {
        throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
    }
    var debug = options && options.debug || false;
    if (debug) {
        var el = document.querySelector('#input-textarea-caret-position-mirror-div');
        if (el)
            el.parentNode.removeChild(el);
    }
    // The mirror div will replicate the textarea's style
    var div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div';
    document.body.appendChild(div);
    var style = div.style;
    var computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle; // currentStyle for IE < 9
    var isInput = element.nodeName === 'INPUT';
    // Default textarea styles
    style.whiteSpace = 'pre-wrap';
    if (!isInput)
        style.wordWrap = 'break-word'; // only for textarea-s
    // Position off-screen
    style.position = 'absolute'; // required to return coordinates properly
    if (!debug)
        style.visibility = 'hidden'; // not 'display: none' because we want rendering
    // Transfer the element's properties to the div
    properties.forEach(function (prop) {
        if (isInput && prop === 'lineHeight') {
            // Special case for <input>s because text is rendered centered and line height may be != height
            if (computed.boxSizing === "border-box") {
                var height = parseInt(computed.height);
                var outerHeight = parseInt(computed.paddingTop) +
                    parseInt(computed.paddingBottom) +
                    parseInt(computed.borderTopWidth) +
                    parseInt(computed.borderBottomWidth);
                var targetHeight = outerHeight + parseInt(computed.lineHeight);
                if (height > targetHeight) {
                    style.lineHeight = height - outerHeight + "px";
                }
                else if (height === targetHeight) {
                    style.lineHeight = computed.lineHeight;
                }
                else {
                    style.lineHeight = '0';
                }
            }
            else {
                style.lineHeight = computed.height;
            }
        }
        else {
            style[prop] = computed[prop];
        }
    });
    if (isFirefox) {
        // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
        if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
    }
    else {
        style.overflow = 'hidden'; // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
    }
    div.textContent = element.value.substring(0, position);
    // The second special handling for input type="text" vs textarea:
    // spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
    if (isInput)
        div.textContent = div.textContent.replace(/\s/g, '\u00a0');
    var span = document.createElement('span');
    // Wrapping must be replicated *exactly*, including when a long word gets
    // onto the next line, with whitespace at the end of the line before (#7).
    // The  *only* reliable way to do that is to copy the *entire* rest of the
    // textarea's content into the <span> created at the caret position.
    // For inputs, just '.' would be enough, but no need to bother.
    span.textContent = element.value.substring(position) || '.'; // || because a completely empty faux span doesn't render at all
    div.appendChild(span);
    var coordinates = {
        top: span.offsetTop + parseInt(computed['borderTopWidth']),
        left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
        height: parseInt(computed['lineHeight'])
    };
    if (debug) {
        span.style.backgroundColor = '#aaa';
    }
    else {
        document.body.removeChild(div);
    }
    return coordinates;
}
// if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
//   module.exports = getCaretCoordinates;
// } else if(isBrowser) {
//   window.getCaretCoordinates = getCaretCoordinates;
// }
// }());

const _c0 = ["list"];
const _c1 = ["defaultItemTemplate"];
const _c2 = a0 => ({ "item": a0 });
function MentionListComponent_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const item_r1 = ctx.item;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", item_r1[ctx_r1.labelKey], " ");
} }
function MentionListComponent_li_4_ng_template_2_Template(rf, ctx) { }
function MentionListComponent_li_4_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 4)(1, "span", 5);
    i0.ɵɵlistener("mousedown", function MentionListComponent_li_4_Template_span_mousedown_1_listener($event) { const i_r4 = i0.ɵɵrestoreView(_r3).index; const ctx_r1 = i0.ɵɵnextContext(); ctx_r1.activeIndex = i_r4; ctx_r1.itemClick.emit(); return i0.ɵɵresetView($event.preventDefault()); });
    i0.ɵɵtemplate(2, MentionListComponent_li_4_ng_template_2_Template, 0, 0, "ng-template", 6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const i_r4 = ctx.index;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active", ctx_r1.activeIndex == i_r4)("mention-active", !ctx_r1.styleOff && ctx_r1.activeIndex == i_r4);
    i0.ɵɵattribute("aria-selected", ctx_r1.activeIndex == i_r4);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("mention-item", !ctx_r1.styleOff);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", ctx_r1.itemTemplate)("ngTemplateOutletContext", i0.ɵɵpureFunction1(9, _c2, item_r5));
} }
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
class MentionListComponent {
    constructor(element) {
        this.element = element;
        this.labelKey = 'label';
        this.itemClick = new EventEmitter();
        this.items = [];
        this.activeIndex = 0;
        this.hidden = false;
        this.dropUp = false;
        this.styleOff = false;
        this.coords = { top: 0, left: 0 };
        this.offset = 0;
    }
    ngAfterContentChecked() {
        if (!this.itemTemplate) {
            this.itemTemplate = this.defaultItemTemplate;
        }
    }
    // lots of confusion here between relative coordinates and containers
    position(nativeParentElement, iframe = null) {
        if (isInputOrTextAreaElement(nativeParentElement)) {
            // parent elements need to have postition:relative for this to work correctly?
            this.coords = getCaretCoordinates(nativeParentElement, nativeParentElement.selectionStart, null);
            this.coords.top = nativeParentElement.offsetTop + this.coords.top - nativeParentElement.scrollTop;
            this.coords.left = nativeParentElement.offsetLeft + this.coords.left - nativeParentElement.scrollLeft;
            // getCretCoordinates() for text/input elements needs an additional offset to position the list correctly
            this.offset = this.getBlockCursorDimensions(nativeParentElement).height;
        }
        else if (iframe) {
            let context = { iframe: iframe, parent: iframe.offsetParent };
            this.coords = getContentEditableCaretCoords(context);
        }
        else {
            let doc = document.documentElement;
            let scrollLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
            let scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
            // bounding rectangles are relative to view, offsets are relative to container?
            let caretRelativeToView = getContentEditableCaretCoords({ iframe: iframe });
            let parentRelativeToContainer = nativeParentElement.getBoundingClientRect();
            this.coords.top = caretRelativeToView.top - parentRelativeToContainer.top + nativeParentElement.offsetTop - scrollTop;
            this.coords.left = caretRelativeToView.left - parentRelativeToContainer.left + nativeParentElement.offsetLeft - scrollLeft;
        }
        // set the default/inital position
        this.positionElement();
    }
    get activeItem() {
        return this.items[this.activeIndex];
    }
    activateNextItem() {
        // adjust scrollable-menu offset if the next item is out of view
        let listEl = this.list.nativeElement;
        let activeEl = listEl.getElementsByClassName('active').item(0);
        if (activeEl) {
            let nextLiEl = activeEl.nextSibling;
            if (nextLiEl && nextLiEl.nodeName == "LI") {
                let nextLiRect = nextLiEl.getBoundingClientRect();
                if (nextLiRect.bottom > listEl.getBoundingClientRect().bottom) {
                    listEl.scrollTop = nextLiEl.offsetTop + nextLiRect.height - listEl.clientHeight;
                }
            }
        }
        // select the next item
        this.activeIndex = Math.max(Math.min(this.activeIndex + 1, this.items.length - 1), 0);
    }
    activatePreviousItem() {
        // adjust the scrollable-menu offset if the previous item is out of view
        let listEl = this.list.nativeElement;
        let activeEl = listEl.getElementsByClassName('active').item(0);
        if (activeEl) {
            let prevLiEl = activeEl.previousSibling;
            if (prevLiEl && prevLiEl.nodeName == "LI") {
                let prevLiRect = prevLiEl.getBoundingClientRect();
                if (prevLiRect.top < listEl.getBoundingClientRect().top) {
                    listEl.scrollTop = prevLiEl.offsetTop;
                }
            }
        }
        // select the previous item
        this.activeIndex = Math.max(Math.min(this.activeIndex - 1, this.items.length - 1), 0);
    }
    // reset for a new mention search
    reset() {
        this.list.nativeElement.scrollTop = 0;
        this.checkBounds();
    }
    // final positioning is done after the list is shown (and the height and width are known)
    // ensure it's in the page bounds
    checkBounds() {
        let left = this.coords.left, top = this.coords.top, dropUp = this.dropUp;
        const bounds = this.list.nativeElement.getBoundingClientRect();
        // if off right of page, align right
        if (bounds.left + bounds.width > window.innerWidth) {
            left -= bounds.left + bounds.width - window.innerWidth + 10;
        }
        // if more than half off the bottom of the page, force dropUp
        // if ((bounds.top+bounds.height/2)>window.innerHeight) {
        //   dropUp = true;
        // }
        // if top is off page, disable dropUp
        if (bounds.top < 0) {
            dropUp = false;
        }
        // set the revised/final position
        this.positionElement(left, top, dropUp);
    }
    positionElement(left = this.coords.left, top = this.coords.top, dropUp = this.dropUp) {
        const el = this.element.nativeElement;
        top += dropUp ? 0 : this.offset; // top of list is next line
        el.className = dropUp ? 'dropup' : null;
        el.style.position = "absolute";
        el.style.left = left + 'px';
        el.style.top = top + 'px';
    }
    getBlockCursorDimensions(nativeParentElement) {
        const parentStyles = window.getComputedStyle(nativeParentElement);
        return {
            height: parseFloat(parentStyles.lineHeight),
            width: parseFloat(parentStyles.fontSize)
        };
    }
    static { this.ɵfac = function MentionListComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MentionListComponent)(i0.ɵɵdirectiveInject(i0.ElementRef)); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MentionListComponent, selectors: [["mention-list"]], viewQuery: function MentionListComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 7);
            i0.ɵɵviewQuery(_c1, 7);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.list = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.defaultItemTemplate = _t.first);
        } }, inputs: { labelKey: "labelKey", itemTemplate: "itemTemplate", listAriaLabel: "listAriaLabel" }, outputs: { itemClick: "itemClick" }, standalone: false, decls: 5, vars: 7, consts: [["defaultItemTemplate", ""], ["list", ""], ["role", "listbox", 1, "dropdown-menu", "scrollable-menu", 3, "hidden"], ["role", "option", "tabindex", "-1", 3, "active", "mention-active", 4, "ngFor", "ngForOf"], ["role", "option", "tabindex", "-1"], [1, "dropdown-item", 3, "mousedown"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"]], template: function MentionListComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵtemplate(0, MentionListComponent_ng_template_0_Template, 1, 1, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementStart(2, "ul", 2, 1);
            i0.ɵɵtemplate(4, MentionListComponent_li_4_Template, 3, 11, "li", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("mention-menu", !ctx.styleOff)("mention-dropdown", !ctx.styleOff && ctx.dropUp);
            i0.ɵɵproperty("hidden", ctx.hidden);
            i0.ɵɵattribute("aria-label", ctx.listAriaLabel);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngForOf", ctx.items);
        } }, dependencies: [i1.NgForOf, i1.NgTemplateOutlet], styles: [".mention-menu[_ngcontent-%COMP%]{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:11em;padding:.5em 0;margin:.125em 0 0;font-size:1em;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25em}.mention-item[_ngcontent-%COMP%]{display:block;padding:.2em 1.5em;line-height:1.5em;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.mention-active[_ngcontent-%COMP%] > a[_ngcontent-%COMP%]{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}.scrollable-menu[_ngcontent-%COMP%]{display:block;height:auto;max-height:292px;overflow:auto}[hidden][_ngcontent-%COMP%]{display:none}.mention-dropdown[_ngcontent-%COMP%]{bottom:100%;top:auto;margin-bottom:2px}"] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MentionListComponent, [{
        type: Component,
        args: [{ selector: 'mention-list', template: `
    <ng-template #defaultItemTemplate let-item="item">
      {{item[labelKey]}}
    </ng-template>
    <ul #list [hidden]="hidden" class="dropdown-menu scrollable-menu" role="listbox" [attr.aria-label]="listAriaLabel"
      [class.mention-menu]="!styleOff" [class.mention-dropdown]="!styleOff && dropUp">
      <li *ngFor="let item of items; let i = index" role="option" tabindex="-1"
        [class.active]="activeIndex==i" [class.mention-active]="!styleOff && activeIndex==i" [attr.aria-selected]="activeIndex==i">
        <span class="dropdown-item" [class.mention-item]="!styleOff"
          (mousedown)="activeIndex=i;itemClick.emit();$event.preventDefault()">
          <ng-template [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="{'item':item}"></ng-template>
        </span>
      </li>
    </ul>
  `, standalone: false, styles: [".mention-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:11em;padding:.5em 0;margin:.125em 0 0;font-size:1em;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25em}.mention-item{display:block;padding:.2em 1.5em;line-height:1.5em;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.mention-active>a{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}.scrollable-menu{display:block;height:auto;max-height:292px;overflow:auto}[hidden]{display:none}.mention-dropdown{bottom:100%;top:auto;margin-bottom:2px}\n"] }]
    }], () => [{ type: i0.ElementRef }], { labelKey: [{
            type: Input
        }], itemTemplate: [{
            type: Input
        }], listAriaLabel: [{
            type: Input
        }], itemClick: [{
            type: Output
        }], list: [{
            type: ViewChild,
            args: ['list', { static: true }]
        }], defaultItemTemplate: [{
            type: ViewChild,
            args: ['defaultItemTemplate', { static: true }]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(MentionListComponent, { className: "MentionListComponent", filePath: "lib/mention-list.component.ts", lineNumber: 34 }); })();

const KEY_BACKSPACE = 8;
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_ESCAPE = 27;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_BUFFERED = 229;
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
class MentionDirective {
    set mention(items) {
        this.mentionItems = items;
    }
    constructor(_element, _viewContainerRef) {
        this._element = _element;
        this._viewContainerRef = _viewContainerRef;
        // the provided configuration object
        this.mentionConfig = { items: [] };
        this.DEFAULT_CONFIG = {
            items: [],
            triggerChar: '@',
            labelKey: 'label',
            maxItems: -1,
            allowSpace: false,
            returnTrigger: false,
            mentionSelect: (item, triggerChar) => {
                return this.activeConfig.triggerChar + item[this.activeConfig.labelKey];
            },
            mentionFilter: (searchString, items) => {
                const searchStringLowerCase = searchString.toLowerCase();
                return items.filter(e => e[this.activeConfig.labelKey].toLowerCase().startsWith(searchStringLowerCase));
            }
        };
        this.listAriaLabel = 'Suggestions';
        // event emitted whenever the search term changes
        this.searchTerm = new EventEmitter();
        // event emitted when an item is selected
        this.itemSelected = new EventEmitter();
        // event emitted whenever the mention list is opened or closed
        this.opened = new EventEmitter();
        this.closed = new EventEmitter();
        this.triggerChars = {};
    }
    ngOnChanges(changes) {
        // console.log('config change', changes);
        if (changes['mention'] || changes['mentionConfig']) {
            this.updateConfig();
        }
    }
    updateConfig() {
        let config = this.mentionConfig;
        this.triggerChars = {};
        // use items from directive if they have been set
        if (this.mentionItems) {
            config.items = this.mentionItems;
        }
        this.addConfig(config);
        // nested configs
        if (config.mentions) {
            config.mentions.forEach(config => this.addConfig(config));
        }
    }
    // add configuration for a trigger char
    addConfig(config) {
        // defaults
        let defaults = Object.assign({}, this.DEFAULT_CONFIG);
        config = Object.assign(defaults, config);
        // items
        let items = config.items;
        if (items && items.length > 0) {
            // convert strings to objects
            if (typeof items[0] == 'string') {
                items = items.map((label) => {
                    let object = {};
                    object[config.labelKey] = label;
                    return object;
                });
            }
            if (config.labelKey) {
                // remove items without an labelKey (as it's required to filter the list)
                items = items.filter(e => e[config.labelKey]);
                if (!config.disableSort) {
                    items.sort((a, b) => a[config.labelKey].localeCompare(b[config.labelKey]));
                }
            }
        }
        config.items = items;
        // add the config
        this.triggerChars[config.triggerChar] = config;
        // for async update while menu/search is active
        if (this.activeConfig && this.activeConfig.triggerChar == config.triggerChar) {
            this.activeConfig = config;
            this.updateSearchList();
        }
    }
    setIframe(iframe) {
        this.iframe = iframe;
    }
    stopEvent(event) {
        //if (event instanceof KeyboardEvent) { // does not work for iframe
        if (!event.wasClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }
    blurHandler(event) {
        this.stopEvent(event);
        this.stopSearch();
    }
    inputHandler(event, nativeElement = this._element.nativeElement) {
        if (this.lastKeyCode === KEY_BUFFERED && event.data) {
            let keyCode = event.data.charCodeAt(0);
            this.keyHandler({ keyCode, inputEvent: true }, nativeElement);
        }
    }
    // @param nativeElement is the alternative text element in an iframe scenario
    keyHandler(event, nativeElement = this._element.nativeElement) {
        this.lastKeyCode = event.keyCode;
        if (event.isComposing || event.keyCode === KEY_BUFFERED) {
            return;
        }
        let val = getValue(nativeElement);
        let pos = getCaretPosition(nativeElement, this.iframe);
        let charPressed = event.key;
        if (!charPressed) {
            let charCode = event.which || event.keyCode;
            if (!event.shiftKey && (charCode >= 65 && charCode <= 90)) {
                charPressed = String.fromCharCode(charCode + 32);
            }
            // else if (event.shiftKey && charCode === KEY_2) {
            //   charPressed = this.config.triggerChar;
            // }
            else {
                // TODO (dmacfarlane) fix this for non-alpha keys
                // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
                charPressed = String.fromCharCode(event.which || event.keyCode);
            }
        }
        if (event.keyCode == KEY_ENTER && event.wasClick && pos < this.startPos) {
            // put caret back in position prior to contenteditable menu click
            pos = this.startNode.length;
            setCaretPosition(this.startNode, pos, this.iframe);
        }
        //console.log("keyHandler", this.startPos, pos, val, charPressed, event);
        let config = this.triggerChars[charPressed];
        if (config) {
            this.activeConfig = config;
            this.startPos = event.inputEvent ? pos - 1 : pos;
            this.startNode = (this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()).anchorNode;
            this.searching = true;
            this.searchString = null;
            this.showSearchList(nativeElement);
            this.updateSearchList();
            if (config.returnTrigger) {
                this.searchTerm.emit(config.triggerChar);
            }
        }
        else if (this.startPos >= 0 && this.searching) {
            if (pos <= this.startPos) {
                this.searchList.hidden = true;
            }
            // ignore shift when pressed alone, but not when used with another key
            else if (event.keyCode !== KEY_SHIFT &&
                !event.metaKey &&
                !event.altKey &&
                !event.ctrlKey &&
                pos > this.startPos) {
                if (!this.activeConfig.allowSpace && event.keyCode === KEY_SPACE) {
                    this.startPos = -1;
                }
                else if (event.keyCode === KEY_BACKSPACE && pos > 0) {
                    pos--;
                    if (pos == this.startPos) {
                        this.stopSearch();
                    }
                }
                else if (this.searchList.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopSearch();
                        return;
                    }
                }
                else if (!this.searchList.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopEvent(event);
                        // emit the selected list item
                        this.itemSelected.emit(this.searchList.activeItem);
                        // optional function to format the selected item before inserting the text
                        const text = this.activeConfig.mentionSelect(this.searchList.activeItem, this.activeConfig.triggerChar);
                        // value is inserted without a trailing space for consistency
                        // between element types (div and iframe do not preserve the space)
                        insertValue(nativeElement, this.startPos, pos, text, this.iframe);
                        // fire input event so angular bindings are updated
                        if ("createEvent" in document) {
                            let evt = document.createEvent("HTMLEvents");
                            if (this.iframe) {
                                // a 'change' event is required to trigger tinymce updates
                                evt.initEvent("change", true, false);
                            }
                            else {
                                evt.initEvent("input", true, false);
                            }
                            // this seems backwards, but fire the event from this elements nativeElement (not the
                            // one provided that may be in an iframe, as it won't be propogate)
                            this._element.nativeElement.dispatchEvent(evt);
                        }
                        this.startPos = -1;
                        this.stopSearch();
                        return false;
                    }
                    else if (event.keyCode === KEY_ESCAPE) {
                        this.stopEvent(event);
                        this.stopSearch();
                        return false;
                    }
                    else if (event.keyCode === KEY_DOWN) {
                        this.stopEvent(event);
                        this.searchList.activateNextItem();
                        return false;
                    }
                    else if (event.keyCode === KEY_UP) {
                        this.stopEvent(event);
                        this.searchList.activatePreviousItem();
                        return false;
                    }
                }
                if (charPressed.length != 1 && event.keyCode != KEY_BACKSPACE) {
                    this.stopEvent(event);
                    return false;
                }
                else if (this.searching) {
                    let mention = val.substring(this.startPos + 1, pos);
                    if (event.keyCode !== KEY_BACKSPACE && !event.inputEvent) {
                        mention += charPressed;
                    }
                    this.searchString = mention;
                    if (this.activeConfig.returnTrigger) {
                        const triggerChar = (this.searchString || event.keyCode === KEY_BACKSPACE) ? val.substring(this.startPos, this.startPos + 1) : '';
                        this.searchTerm.emit(triggerChar + this.searchString);
                    }
                    else {
                        this.searchTerm.emit(this.searchString);
                    }
                    this.updateSearchList();
                }
            }
        }
    }
    // exposed for external calls to open the mention list, e.g. by clicking a button
    startSearch(triggerChar, nativeElement = this._element.nativeElement) {
        triggerChar = triggerChar || this.mentionConfig.triggerChar || this.DEFAULT_CONFIG.triggerChar;
        const pos = getCaretPosition(nativeElement, this.iframe);
        insertValue(nativeElement, pos, pos, triggerChar, this.iframe);
        this.keyHandler({ key: triggerChar, inputEvent: true }, nativeElement);
    }
    stopSearch() {
        if (this.searchList && !this.searchList.hidden) {
            this.searchList.hidden = true;
            this.closed.emit();
        }
        this.activeConfig = null;
        this.searching = false;
    }
    updateSearchList() {
        let matches = [];
        if (this.activeConfig && this.activeConfig.items) {
            let objects = this.activeConfig.items;
            // disabling the search relies on the async operation to do the filtering
            if (!this.activeConfig.disableSearch && this.searchString && this.activeConfig.labelKey) {
                if (this.activeConfig.mentionFilter) {
                    objects = this.activeConfig.mentionFilter(this.searchString, objects);
                }
            }
            matches = objects;
            if (this.activeConfig.maxItems > 0) {
                matches = matches.slice(0, this.activeConfig.maxItems);
            }
        }
        // update the search list
        if (this.searchList) {
            this.searchList.items = matches;
            this.searchList.hidden = matches.length == 0;
        }
    }
    showSearchList(nativeElement) {
        this.opened.emit();
        if (this.searchList == null) {
            let componentRef = this._viewContainerRef.createComponent(MentionListComponent);
            this.searchList = componentRef.instance;
            this.searchList.itemTemplate = this.mentionListTemplate;
            this.searchList.listAriaLabel = this.listAriaLabel;
            componentRef.instance['itemClick'].subscribe(() => {
                nativeElement.focus();
                let fakeKeydown = { key: 'Enter', keyCode: KEY_ENTER, wasClick: true };
                this.keyHandler(fakeKeydown, nativeElement);
            });
        }
        this.searchList.labelKey = this.activeConfig.labelKey;
        this.searchList.dropUp = this.activeConfig.dropUp;
        this.searchList.styleOff = this.mentionConfig.disableStyle;
        this.searchList.activeIndex = 0;
        this.searchList.position(nativeElement, this.iframe);
        window.requestAnimationFrame(() => this.searchList.reset());
    }
    static { this.ɵfac = function MentionDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MentionDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.ViewContainerRef)); }; }
    static { this.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: MentionDirective, selectors: [["", "mention", ""], ["", "mentionConfig", ""]], hostAttrs: ["autocomplete", "off"], hostBindings: function MentionDirective_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown", function MentionDirective_keydown_HostBindingHandler($event) { return ctx.keyHandler($event); })("input", function MentionDirective_input_HostBindingHandler($event) { return ctx.inputHandler($event); })("blur", function MentionDirective_blur_HostBindingHandler($event) { return ctx.blurHandler($event); });
        } }, inputs: { mention: "mention", mentionConfig: "mentionConfig", mentionListTemplate: "mentionListTemplate", listAriaLabel: "listAriaLabel" }, outputs: { searchTerm: "searchTerm", itemSelected: "itemSelected", opened: "opened", closed: "closed" }, standalone: false, features: [i0.ɵɵNgOnChangesFeature] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MentionDirective, [{
        type: Directive,
        args: [{
                selector: '[mention], [mentionConfig]',
                host: {
                    '(keydown)': 'keyHandler($event)',
                    '(input)': 'inputHandler($event)',
                    '(blur)': 'blurHandler($event)',
                    'autocomplete': 'off'
                },
                standalone: false
            }]
    }], () => [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }], { mention: [{
            type: Input,
            args: ['mention']
        }], mentionConfig: [{
            type: Input
        }], mentionListTemplate: [{
            type: Input
        }], listAriaLabel: [{
            type: Input
        }], searchTerm: [{
            type: Output
        }], itemSelected: [{
            type: Output
        }], opened: [{
            type: Output
        }], closed: [{
            type: Output
        }] }); })();

class MentionModule {
    static { this.ɵfac = function MentionModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MentionModule)(); }; }
    static { this.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MentionModule }); }
    static { this.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [CommonModule] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MentionModule, [{
        type: NgModule,
        args: [{
                declarations: [
                    MentionDirective,
                    MentionListComponent
                ],
                imports: [
                    CommonModule
                ],
                exports: [
                    MentionDirective
                ]
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MentionModule, { declarations: [MentionDirective,
        MentionListComponent], imports: [CommonModule], exports: [MentionDirective] }); })();

/*
 * Public API Surface of angular-mentions
 */

/**
 * Generated bundle index. Do not edit.
 */

export { MentionDirective, MentionModule };
//# sourceMappingURL=angular-mentions.mjs.map
