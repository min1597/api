process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Plugin } from '../../..'
/* Import module */

/* Module */
    export function getStatusCode(ErrorTypes: Plugin.V1.Error.ErrorTypes): number {
        switch (ErrorTypes) {
            case Plugin.V1.Error.ErrorTypes.INVALID_REQUEST:
            case Plugin.V1.Error.ErrorTypes.INVALID_TOKEN:
            case Plugin.V1.Error.ErrorTypes.INVALID_SESSION:
            case Plugin.V1.Error.ErrorTypes.DUPLICATED_DATA:
                return 400
                
            case Plugin.V1.Error.ErrorTypes.UNAUTHORIZED:
            case Plugin.V1.Error.ErrorTypes.WRONG_USERNAME:
            case Plugin.V1.Error.ErrorTypes.WRONG_PASSWORD:
            case Plugin.V1.Error.ErrorTypes.WRONG_CREDENTIAL:
            case Plugin.V1.Error.ErrorTypes.WRONG_TYPE:
                return 401

            case Plugin.V1.Error.ErrorTypes.FORBIDDEN:
                return 403

            case Plugin.V1.Error.ErrorTypes.NOT_FOUND:
                return 404

            case Plugin.V1.Error.ErrorTypes.RATE_LIMITED:
                return 429

            case Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR:
                return 500

            case Plugin.V1.Error.ErrorTypes.NOT_IMPLEMENTED:

                return 501
            default: return 500
        }
    }
/* Module */