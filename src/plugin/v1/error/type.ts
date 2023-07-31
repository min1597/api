process.env.TZ = 'Etc/Universal'

/* Module */
    export enum ErrorTypes {
        OK = 'ok', // 200
        INVALID_REQUEST = 'invalid_request', // 400
        DUPLICATED_DATA = 'duplicated_data', // 400
        INVALID_TOKEN = 'invalid_token', // 400
        INVALID_SESSION = 'invalid_session', // 400
        UNAUTHORIZED = 'unauthorized', // 401
        WRONG_USERNAME = 'wrong_username', // 401
        WRONG_PASSWORD = 'wrong_password', // 401
        WRONG_CREDENTIAL = 'wrong_credential', // 401
        WRONG_TYPE = 'wrong_type', // 401
        FORBIDDEN = 'forbidden', // 403
        NOT_FOUND = 'not_found', // 404
        RATE_LIMITED = 'rate_limited', // 429
        INTERNAL_SERVER_ERROR = 'internal_server_error', // 500
        NOT_IMPLEMENTED = 'not_implemented', // 501
    }
/* Module */