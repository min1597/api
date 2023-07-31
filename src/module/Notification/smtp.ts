process.env.TZ = 'Etc/Universal'

/* Import module */
    import nodemailer from 'nodemailer'
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
    export async function send(data: Array<{ emailAddress: string, title: string, content: string }>): Promise<Array<{ success: boolean, emailAddress: string, requestDate?: string }> | boolean | string> {
        try {
            const mailer = nodemailer.createTransport({ host: Config.smtp.hostname, port: Config.smtp.port, requireTLS: true, auth: { user: Config.smtp.auth.username, pass: Config.smtp.auth.password } })
            const responses: Array<{ success: boolean, emailAddress: string, requestDate?: string }> = []
            for await (const sendData of data) {
                try {
                    mailer.sendMail({ from: Config.smtp.out_going, to: sendData.emailAddress, subject: sendData.title, html: sendData.content })
                    responses.push({ success: true, emailAddress: sendData.emailAddress, requestDate: dayjs.tz(new Date(), 'Asia/Seoul').tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ss.SSSZ') })
                } catch(e) { responses.push({ success: false, emailAddress: sendData.emailAddress}) }
            }
            return responses
        } catch(err) {
            return typeof err == 'string' ? err : false
        }
    }
/* Module */