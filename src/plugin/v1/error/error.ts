process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Plugin } from '../../..'
    import Express from 'express'
    import * as Module from '../../../module'
/* Import module */

/* Module */
    export let error_history: Array<{
        idx: number,
        rid?: string,
        request_date: string,
        error?: {
            en?: string,
            ko?: string
        },
        path: string
    }> = []
    export class LunaError extends Error {
        public _isLuna = true

        public type: Plugin.V1.Error.ErrorTypes
        public description?: {
            ko?: string,
            en?: string
        }
        public rid: string | null
        public path: string

        constructor(errorType: Plugin.V1.Error.ErrorTypes, description?: { ko?: string, en?: string }) {
            const internalDesc: string = description?.en ? description.en : errorType
            super(internalDesc)
            this.type = errorType
            this.name = 'Luna Error'
            this.message = internalDesc
            this.description = description
        }

        public toString() {
            return this.description
        }

        public static load(error: LunaError) {
            const laError = new LunaError(error.type, { en: error.description?.en })

            return laError
        }
        public loadError(error: Error) {
            this.name = error.name
            this.message = error.message
            this.description = { en: error.message }
            this.stack = error.stack
        }
        
        public serialize(): Plugin.V1.Interface.Error.ErrorResponse {
            let base: Plugin.V1.Interface.Error.ErrorResponse = {
                success: false,
                error: {
                    type: this.type,
                    description: this.description
                },
                data: null,
                
                requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true),
                requestdPath: this.path,
                rid: this.rid ? this.rid : null
            }
        
            if (Plugin.Resources.config.node.environment === Plugin.V1.Interface.NodeEnvironment.Development) {
                base.error.stack = this.stack
            }
        
            return base
        }
        
        public getStatusCode(): number {
            const type = this.type
            return Plugin.V1.Error.getStatusCode(type)
        }
        
        public sendExpress(response: Express.Response) {
            const rid = response.getHeader('request-uuid') as string | undefined
            this.rid = rid ? rid : null
            this.path = response.getHeader('path') as string
            const errordata = this.serialize()
            error_history.push({
                idx: error_history.length,
                rid: rid,
                request_date: errordata.requestedAt,
                error: errordata.error.description,
                path: errordata.requestdPath
            })
            response.status(this.getStatusCode()).setHeader('Content-Type', 'application/json').json(errordata)
        }
    }
/* Module */