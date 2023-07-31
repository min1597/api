process.env.TZ = 'Etc/Universal'

/* Module */
    import { V1 } from '.'

    export * as V1 from './v1'
    export * as Resources from './resources'
    export const nameStylized: string = 'FX Macro'
    export const nodeEnvironment: V1.Interface.NodeEnvironment = V1.Interface.NodeEnvironment.Development
/* Module */