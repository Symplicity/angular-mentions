import {
  Component, ElementRef, Output, EventEmitter, ViewChild, Input, TemplateRef, AfterContentChecked
} from '@angular/core';

import { isInputOrTextAreaElement, getContentEditableCaretCoords } from './mention-utils';
import { getCaretCoordinates } from './caret-coords';

/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
@Component({
  selector: 'mention-list',
  styleUrls: ['./mention-list.component.scss'],
  template: `
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
  `,
  standalone: false
})
export class MentionListComponent implements AfterContentChecked {
  @Input() labelKey: string = 'label';
  @Input() itemTemplate: TemplateRef<any>;
  @Input() listAriaLabel: string;
  @Output() itemClick = new EventEmitter();
  @ViewChild('list', { static: true }) list: ElementRef;
  @ViewChild('defaultItemTemplate', { static: true }) defaultItemTemplate: TemplateRef<any>;
  items = [];
  activeIndex: number = 0;
  hidden: boolean = false;
  dropUp: boolean = false;
  styleOff: boolean = false;
  private coords: {top:number, left:number} = {top:0, left:0};
  private offset: number = 0;
  constructor(private element: ElementRef) {}

  ngAfterContentChecked() {
    if (!this.itemTemplate) {
      this.itemTemplate = this.defaultItemTemplate;
    }
  }

  // lots of confusion here between relative coordinates and containers
  position(nativeParentElement: HTMLInputElement, iframe: HTMLIFrameElement = null) {
    if (isInputOrTextAreaElement(nativeParentElement)) {
      // parent elements need to have postition:relative for this to work correctly?
      this.coords = getCaretCoordinates(nativeParentElement, nativeParentElement.selectionStart, null);
      this.coords.top = nativeParentElement.offsetTop + this.coords.top - nativeParentElement.scrollTop;
      this.coords.left = nativeParentElement.offsetLeft + this.coords.left - nativeParentElement.scrollLeft;
      // getCretCoordinates() for text/input elements needs an additional offset to position the list correctly
      this.offset = this.getBlockCursorDimensions(nativeParentElement).height;
    }
    else if (iframe) {
      let context: { iframe: HTMLIFrameElement, parent: Element } = { iframe: iframe, parent: iframe.offsetParent };
      this.coords = getContentEditableCaretCoords(context);
    }
    else {
      let doc = document.documentElement;
      let scrollLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
      let scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
      // bounding rectangles are relative to view, offsets are relative to container?
      let caretRelativeToView = getContentEditableCaretCoords({ iframe: iframe });
      let parentRelativeToContainer: ClientRect = nativeParentElement.getBoundingClientRect();
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
    let listEl: HTMLElement = this.list.nativeElement;
    let activeEl = listEl.getElementsByClassName('active').item(0);
    if (activeEl) {
      let nextLiEl: HTMLElement = <HTMLElement> activeEl.nextSibling;
      if (nextLiEl && nextLiEl.nodeName == "LI") {
        let nextLiRect: ClientRect = nextLiEl.getBoundingClientRect();
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
    let listEl: HTMLElement = this.list.nativeElement;
    let activeEl = listEl.getElementsByClassName('active').item(0);
    if (activeEl) {
      let prevLiEl: HTMLElement = <HTMLElement> activeEl.previousSibling;
      if (prevLiEl && prevLiEl.nodeName == "LI") {
        let prevLiRect: ClientRect = prevLiEl.getBoundingClientRect();
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
  private checkBounds() {
    let left = this.coords.left, top = this.coords.top, dropUp = this.dropUp;
    const bounds: ClientRect = this.list.nativeElement.getBoundingClientRect();
    // if off right of page, align right
    if (bounds.left + bounds.width > window.innerWidth) {
      left -= bounds.left + bounds.width - window.innerWidth + 10;
    }
    // if more than half off the bottom of the page, force dropUp
    // if ((bounds.top+bounds.height/2)>window.innerHeight) {
    //   dropUp = true;
    // }
    // if top is off page, disable dropUp
    if (bounds.top<0) {
      dropUp = false;
    }
    // set the revised/final position
    this.positionElement(left, top, dropUp);
  }

  private positionElement(left:number=this.coords.left, top:number=this.coords.top, dropUp:boolean=this.dropUp) {
    const el: HTMLElement = this.element.nativeElement;
    top += dropUp ? 0 : this.offset; // top of list is next line
    el.className = dropUp ? 'dropup' : null;
    el.style.position = "absolute";
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  private getBlockCursorDimensions(nativeParentElement: HTMLInputElement) {
    const parentStyles = window.getComputedStyle(nativeParentElement);
    return {
      height: parseFloat(parentStyles.lineHeight),
      width: parseFloat(parentStyles.fontSize)
    };
  }
}
