process.env.TZ = 'Etc/Universal'

/* Import module */
    import dayjs from 'dayjs'
    import timezone from 'dayjs/plugin/timezone'
    import utc from 'dayjs/plugin/utc'
/* Import module */

/* Init */
    dayjs.extend(utc)
    dayjs.extend(timezone)
/* Init */

/* Module */
    export enum Timezone {
        UTC = 'Etc/UTC', // Default
        GMT = 'Etc/GMT',
        KST = 'Asia/Seoul',
        JST = 'Asia/Tokyo',
        CST = 'Asia/Shanghai'
    } 
    export function getNow(tz: Timezone, msYn: boolean = false) {
        return dayjs(new Date()).tz(tz).format(msYn ? 'YYYY-MM-DDTHH:mm:ss.SSSZ' : 'YYYY-MM-DDTHH:mm:ssZ')
    }
    export function dateFormat(date: Date, fromTz: Timezone, toTz: Timezone, msYn: boolean = false) {
        return dayjs.tz(date, fromTz).tz(toTz).format(msYn ? 'YYYY-MM-DDTHH:mm:ss.SSSZ' : 'YYYY-MM-DDTHH:mm:ssZ')
    }
/* Module */