process.env.TZ = 'Etc/Universal'

/* Module */
    export function isValidEmail(emailAddress: string): boolean {
        if (typeof emailAddress !== 'string') return false

        const emailRegex = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
        emailRegex.lastIndex = 0
        return emailRegex.test(emailAddress)
    }

    export function getRandomStrings(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'): string {
        let string = ''
        for (let i=0; i<length; i++) {
            string += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return string
    }
/* Module */