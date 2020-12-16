export declare const loadPackage: (packagePath: string) => any;
export declare const diffPackages: (source: string, ...externalSources: Array<string>) => {
    additions: any;
    conflicts: any;
    resolved: any;
};
export declare const needsPackageSync: (packageDiff: any) => boolean;
export declare const diffDependencies: (sourcePath: string, syncers: Array<any>) => {
    additions: any;
    conflicts: any;
    resolved: any;
};
export declare const syncDependencies: (sourcePath: string, syncers: any) => void;
