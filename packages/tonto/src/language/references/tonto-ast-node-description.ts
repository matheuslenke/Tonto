import { AstNodeDescription } from "langium";

/**
 * Custom node description that wraps a given description under a potentially new name and also stores the package id for faster access.
 */
export class PackageAstNodeDescription implements AstNodeDescription {
    constructor(
        public packageId: string,
        public name: string,
        public delegate: AstNodeDescription,
        public node = delegate.node,
        public nameSegment = delegate.nameSegment,
        public selectionSegment = delegate.selectionSegment,
        public type = delegate.type,
        public documentUri = delegate.documentUri,
        public path = delegate.path
    ) { }
}

/**
 * Custom class to represent package-local descriptions without the package name so we can do easier instanceof checks.
 */
export class PackageLocalAstNodeDescription extends PackageAstNodeDescription {
    constructor(packageName: string, name: string, delegate: AstNodeDescription) {
        super(packageName, name, delegate);
    }
}

/**
 * Custom class to represent package-external descriptions with the package name so we can do easier instanceof checks.
 */
export class GlobalAstNodeDescription extends PackageAstNodeDescription {
    constructor(packageName: string, name: string, delegate: AstNodeDescription) {
        super(packageName, name, delegate);
    }
}