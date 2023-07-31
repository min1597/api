process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Plugin } from '../../..'
/* Import module */

/* Module */
    export interface ErrorResponse {
        success: boolean,
        error: {
            type: Plugin.V1.Error.ErrorTypes,
            description?: {
                ko?: string,
                en?: string
            },
            
            details?: any,
            debug?: any,
            stack?: string,
          
            code?: string,
            url?: string
        },
        data: null,

        requestedAt: string,
        requestdPath: string,
        rid: null | string
    }
/* Module */