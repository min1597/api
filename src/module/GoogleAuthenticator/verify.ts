process.env.TZ = 'Etc/Universal'

/* Import module */
    import speakeasy from 'speakeasy'
/* Import module */

/* Module */
    export function verify(secret: string, encoding: speakeasy.Encoding, code: string): boolean | string {
        try {
            const result = speakeasy.totp.verify({
                secret: secret,
                token: code,
                encoding: encoding
            })
            return result
        } catch(err) {
            return typeof err == 'string' ? err : false
        }
    }
/* Module */