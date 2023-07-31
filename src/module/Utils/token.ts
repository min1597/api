process.env.TZ = 'Etc/Universal'

/* Module */
    export function tokenTypeSwitch(type: string): 'Basic' | 'Bearer' | 'Undefined' {
        switch (type.toUpperCase()) {
            case 'BASIC': return 'Basic'
            case 'BEARER': return 'Bearer'
            default: return 'Undefined'
        }
    }

    export function tokenParser(original: string): { token: string, token_type: 'Basic' | 'Bearer' } {
        if(original.split(' ').length !== 2) throw 'Not match the Token Format.'
        const tokenType = tokenTypeSwitch(original.split(' ')[0])
        if(tokenType == 'Undefined') throw 'Wrong token type.'
        return { token: original.split(' ')[1], token_type: tokenType }
    }
/* Module */