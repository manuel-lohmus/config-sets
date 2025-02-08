declare module 'config-sets' {

    export default function configSet(name: string, configSet: object): object;

    export function assign(target: any, source: any, overwriteChanges?: boolean): any;
    export function arg_options(): object;
    export function print_help(): void;

    export const isProduction: boolean;
    export const production: object;
    export const development: object;
    export const isSaveChanges: boolean;
}
