process.env.TZ = 'Etc/Universal'

/* Import module */
    import CryptoJS from 'crypto-js'
    import Base64 from 'crypto-js/enc-base64'
    import axios from 'axios'
    import libphonenumber from 'libphonenumber-js'
    import Config from './config'
    import dayjs from 'dayjs'
    import utc from 'dayjs/plugin/utc'
    import timezone from 'dayjs/plugin/timezone'
/* Import module */

/* Initialize */
    dayjs.extend(timezone)
    dayjs.extend(utc)
/* Initialize */

/* Module */
    export async function send(data: Array<{ phoneNumber: string, content: string }>): Promise<Array<{ success: boolean, phoneNumber: string, requestId?: string, requestDate?: string }> | boolean | string> {
        try {
            const responses: Array<{ success: boolean, phoneNumber: string, requestId?: string, requestDate?: string }> = []
            for await (const sendData of data) {
                if(!libphonenumber(sendData.phoneNumber)?.isValid()) responses.push({ success: false, phoneNumber: sendData.phoneNumber })
                else {
                    try {
                        const response = await axios.post('https://sens.apigw.ntruss.com/sms/v2/services/' + Config.sms.NCP.serviceId + '/messages', { type: 'sms', contentType: 'comm', countryCode: libphonenumber(sendData.phoneNumber)?.countryCallingCode, from: libphonenumber(Config.sms.out_going)?.format('NATIONAL').replace(/\D/g, ''), content: sendData.content, messages: [ { to: libphonenumber(sendData.phoneNumber)?.format('NATIONAL').split('-').join(''), content: sendData.content } ] }, { headers: { 'Contenc-Type': 'application/json; charset=utf-8', 'x-ncp-iam-access-key': Config.sms.NCP.access, 'x-ncp-apigw-timestamp': String(new Date().getTime()), 'x-ncp-apigw-signature-v2': Base64.stringify(CryptoJS.HmacSHA256('POST /sms/v2/services/' + Config.sms.NCP.serviceId + '/messages\n' + String(new Date().getTime()) + '\n' + Config.sms.NCP.access, Config.sms.NCP.secret)) } })
                        if(response.status == 202 && response.data.statusName == 'success') responses.push({ success: true, phoneNumber: sendData.phoneNumber, requestId: response.data.requestId, requestDate: dayjs.tz(new Date(response.data.requestTime), 'Asia/Seoul').tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ss.SSSZ') })
                        else responses.push({ success: false, phoneNumber: sendData.phoneNumber })
                    } catch(e) { responses.push({ success: false, phoneNumber: sendData.phoneNumber }) }
                }
            }
            return responses
        } catch(err) {
            return typeof err == 'string' ? err : false
        }
    }
/* Module */