process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Plugin } from '../../..'
/* Import module */

/* Module */
    export interface Config {
        node: {
            environment: Plugin.V1.Interface.NodeEnvironment
        },
        express: {
            port: number,
            address: string,
            cors?: {
                origin?: string,
                allowedHeaders?: string[]
            }
        },
        sentry?: {
            serverName?: string,
            dsn: string
        }
    }
/* Module */