import { ElementRef, TemplateRef, ViewContainerRef } from "@angular/core";
import { EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { MentionConfig } from "./mention-config";
import * as i0 from "@angular/core";
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
export declare class MentionDirective implements OnChanges {
    private _element;
    private _viewContainerRef;
    private mentionItems;
    set mention(items: any[]);
    mentionConfig: MentionConfig;
    private activeConfig;
    private DEFAULT_CONFIG;
    mentionListTemplate: TemplateRef<any>;
    listAriaLabel: string;
    searchTerm: EventEmitter<string>;
    itemSelected: EventEmitter<any>;
    opened: EventEmitter<any>;
    closed: EventEmitter<any>;
    private triggerChars;
    private searchString;
    private startPos;
    private startNode;
    private searchList;
    private searching;
    private iframe;
    private lastKeyCode;
    constructor(_element: ElementRef, _viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    updateConfig(): void;
    private addConfig;
    setIframe(iframe: HTMLIFrameElement): void;
    stopEvent(event: any): void;
    blurHandler(event: any): void;
    inputHandler(event: any, nativeElement?: HTMLInputElement): void;
    keyHandler(event: any, nativeElement?: HTMLInputElement): boolean;
    startSearch(triggerChar?: string, nativeElement?: HTMLInputElement): void;
    stopSearch(): void;
    updateSearchList(): void;
    showSearchList(nativeElement: HTMLInputElement): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MentionDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MentionDirective, "[mention], [mentionConfig]", never, { "mention": { "alias": "mention"; "required": false; }; "mentionConfig": { "alias": "mentionConfig"; "required": false; }; "mentionListTemplate": { "alias": "mentionListTemplate"; "required": false; }; "listAriaLabel": { "alias": "listAriaLabel"; "required": false; }; }, { "searchTerm": "searchTerm"; "itemSelected": "itemSelected"; "opened": "opened"; "closed": "closed"; }, never, never, false, never>;
}
//# sourceMappingURL=mention.directive.d.ts.map