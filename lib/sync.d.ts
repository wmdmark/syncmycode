export declare const watch: (syncer: any) => Promise<unknown>;
export declare const diffLocalChanges: (syncer: any) => import("dir-compare").Difference[] | undefined;
export declare const syncDiff: (diffSet: any) => {
    source: string;
    destination: string;
};
export declare const syncDiffSetBackToExternal: (differences: Array<any>) => {
    source: string;
    destination: string;
}[];
