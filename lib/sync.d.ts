export declare const watch: (syncer: any) => Promise<unknown>;
export declare const diffLocalChanges: (syncer: any) => any[] | undefined;
export declare const syncDiff: (diffSet: any) => {
    source: string;
    destination: string;
};
export declare const syncDiffSetBackToExternal: (differences: Array<any>) => {
    source: string;
    destination: string;
}[];
