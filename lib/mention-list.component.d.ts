import { ElementRef, EventEmitter, TemplateRef, AfterContentChecked } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
export declare class MentionListComponent implements AfterContentChecked {
    private element;
    labelKey: string;
    itemTemplate: TemplateRef<any>;
    listAriaLabel: string;
    itemClick: EventEmitter<any>;
    itemActivated: EventEmitter<any>;
    list: ElementRef;
    defaultItemTemplate: TemplateRef<any>;
    items: any[];
    activeIndex: number;
    hidden: boolean;
    dropUp: boolean;
    styleOff: boolean;
    private coords;
    private offset;
    constructor(element: ElementRef);
    ngAfterContentChecked(): void;
    position(nativeParentElement: HTMLInputElement, iframe?: HTMLIFrameElement): void;
    get activeItem(): any;
    activateNextItem(): void;
    activatePreviousItem(): void;
    reset(): void;
    private checkBounds;
    private positionElement;
    private getBlockCursorDimensions;
    static ɵfac: i0.ɵɵFactoryDeclaration<MentionListComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MentionListComponent, "mention-list", never, { "labelKey": { "alias": "labelKey"; "required": false; }; "itemTemplate": { "alias": "itemTemplate"; "required": false; }; "listAriaLabel": { "alias": "listAriaLabel"; "required": false; }; }, { "itemClick": "itemClick"; "itemActivated": "itemActivated"; }, never, never, false, never>;
}
//# sourceMappingURL=mention-list.component.d.ts.map