process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Plugin } from '../../..'
/* Import module */

/* Module */
    export enum TokenTypes {
        Bearer = 'Bearer',
        Basic = 'Basic'
    }

    export interface Token {
        token: string,
        token_type: TokenTypes,

        user_id?: string,

        created_date?: Date,
        expires_date?: Date
    }
/* Module */