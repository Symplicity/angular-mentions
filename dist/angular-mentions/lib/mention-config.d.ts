export interface MentionConfig extends Mentions {
    mentions?: Mentions[];
    disableStyle?: boolean;
}
export interface Mentions {
    items?: any[];
    triggerChar?: string;
    labelKey?: string;
    maxItems?: number;
    disableSort?: boolean;
    disableSearch?: boolean;
    dropUp?: boolean;
    allowSpace?: boolean;
    returnTrigger?: boolean;
    mentionSelect?: (item: any, triggerChar?: string) => (string);
    mentionFilter?: (searchString: string, items?: any) => (any[]);
}
//# sourceMappingURL=mention-config.d.ts.map