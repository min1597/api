process.env.TZ = 'Etc/Universal'

/* Import module */
    import speakeasy from 'speakeasy'
/* Import module */

/* Module */
    export function issue(name: string, issuer: string, display_name: string, algorithm: speakeasy.Algorithm): { hex: string, base32: string, ascii: string, url: string } | boolean | string {
        try {
            const secret = speakeasy.generateSecret({
                length: 32,
                name: name,
                issuer: issuer
            })
            const encoding = speakeasy.otpauthURL({
                secret: secret.ascii,
                issuer: display_name,
                label: 'Luna Security',
                algorithm: algorithm,
                period: 300
            })
            return {
                hex: secret.hex,
                base32: secret.base32,
                ascii: secret.ascii,
                url: encoding
            }
        } catch(err) {
            return typeof err == 'string' ? err : false
        }
    }
/* Module */