process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import { Plugin, macroActivate, macroActivateControl } from '../../../..'
    import * as Module from '../../../../module'
    import CryptoJS from 'crypto-js'
/* Import module */

/* Module */
    export async function getMacroHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: macroActivate, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
        } catch(err) {
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
    export async function postMacroHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            macroActivateControl()
            response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: macroActivate, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
        } catch(err) {
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
/* Module */