import * as path from 'path';

export function getTemplatesPath(): string {
    // This approach is compatible with both CommonJS and ES Modules
    // as it relies on the current working directory, which is consistent
    // in both environments.
    return path.join(process.cwd(), 'src', 'cli', 'templates');
}
