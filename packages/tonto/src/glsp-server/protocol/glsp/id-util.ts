export const LEFT_PORT_SUFFIX = "___left";
export const RIGHT_PORT_SUFFIX = "___right";

export function createLeftPortId(id: string): string {
    return id + LEFT_PORT_SUFFIX;
}

export function createRightPortId(id: string): string {
    return id + RIGHT_PORT_SUFFIX;
}

export function isLeftPortId(id: string): boolean {
    return id.endsWith(LEFT_PORT_SUFFIX);
}

export function isRightPortId(id: string): boolean {
    return id.endsWith(RIGHT_PORT_SUFFIX);
}

export function isPortId(id: string): boolean {
    return isLeftPortId(id) || isRightPortId(id);
}
