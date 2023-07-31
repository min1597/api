process.env.TZ = 'Etc/Universal'

/* Import modules */
    import axios from 'axios'
import { getHeaders } from './utils'
import { balance, convertSession } from './aon'
import otpauth from 'otpauth'
/* Import modules */

/* Module */
    export async function login(username: string, password: string): Promise<{ token: string, session?: string } | { token: string, otp: 'SMS' | 'TOTP', session: string } | boolean | string> {
        try {
            const response = await axios.post('https://bybis.com/rest/v1.0/auth/signIn', { device: 'browser', email: btoa(username).replace(/=/g, ''), password: btoa(password).replace(/=/g, ''), reCaptcha: '' }, { headers: { 'Content-Type': 'application/json', ... getHeaders() } })
            if(response.status == 200) {
                if(response.data.success == true) {
                    const session = (response.headers['set-cookie'] as Array<string>).filter(function (data) { return data.indexOf('SESSION=') !== -1 })[0].split(';').filter(function (data) { return data.indexOf('SESSION=') !== -1 })[0].split('=')[1] ?? undefined
                    if(response.data.data.requireVerifyPlatform == true) {
                        return {
                            token: response.data.data.token,
                            otp: 'SMS',
                            session: session
                        }
                    } else if(response.data.data.requireOtp == true) {
                        return {
                            token: response.data.data.token,
                            otp: 'TOTP',
                            session: session
                        }
                    } else {
                        return {
                            token: response.data.data.user.token,
                            session: session
                        }
                    }
                } else throw response.data.message
            } else throw new Error('An unknown error has occured.')
        } catch(err) {
            console.log(err)
            return typeof err == 'string' ? err : false
        }
    }

    export async function verifySMS(token: string, otp: string): Promise<boolean | string> {
        try {
            const response = await axios.post('https://bybis.com/rest/v1.0/auth/verifyPlatform', { code: otp }, { headers: { 'Content-Type': 'application/json', Authorization: token, ... getHeaders() } })
            if(response.status == 200) {
                if(response.data.success == true) {
                    return true
                } else throw response.data.message
            } else throw new Error('An unknown error has occured.')
        } catch(err) {
            return typeof err == 'string' ? err : false
        }
    }

    export async function verifyOTP(token: string, otp: string): Promise<{ token: string } | boolean | string> {
        try {
            const response = await axios.post('https://bybis.com/rest/v1.0/auth/signInWithOtp', { device: 'browser', code: otp }, { headers: { Authorization: token, ... getHeaders() } })
            if(response.status == 200) {
                if(response.data.success == true) {
                    return {
                        token: response.data.data.user.token
                    }
                } else throw response.data.message
            } else throw new Error('An unknown error has occured.')
        } catch(err) {
            return typeof err == 'string' ? err : false
        }
    }
/* Module */