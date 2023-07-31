process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import { Plugin } from '../../../..'
    import * as Module from '../../../../module'
/* Import module */

/* Module */
    export async function statusHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(!request.headers.authorization) throw new Error('A required parameter does not exist.')

            const parsed_token = Module.Utils.Token.tokenParser(request.headers.authorization)
            const token: Plugin.V1.Token = await new Promise(function (resolve, reject) {
                const _token = new Plugin.V1.Token(parsed_token.token, parsed_token.token_type)
                _token.on([ 'state_change' ], function (data: { type: 'state_change', data: 'Initializing' | 'Normal' | 'Expired' | 'Broken' }) {
                    if(data.data == 'Normal') resolve(_token)
                    else throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '잘못된 세션입니다.', en: 'Wrong session.' })
                })
            })
            if(typeof token.format('Bearer') !== 'object') throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '잘못된 세션입니다.', en: 'Wrong session.' })

            const uuid = token.getUserID()
            if(typeof uuid == 'string') throw uuid
            if(typeof uuid == 'boolean') throw new Error('An unknown error has occured.')
            const _response = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).find({ where: { user_id: uuid.uuid, is_active: true } })
            if(_response.length >= 1) {
                let macros: Array<{ uuid: string, coin: string, type: Array<string> }> = new Array()
                let reps: { btc: { type: Array<number>, option: string } | null, eth: { type: Array<number>, option: string } | null, xrp: { type: Array<number>, option: string } | null } = {
                    btc: null,
                    eth: null,
                    xrp: null
                }
                for(const temporary of _response) {
                    // if(temporary.coin == 'BTC') {
                    //     reps.btc = {
                    //         type: temporary.type,
                    //         option: temporary.option
                    //     }
                    // } else if(temporary.coin == 'ETH') {
                    //     reps.eth = {
                    //         type: temporary.type,
                    //         option: temporary.option
                    //     }
                    // } else if(temporary.coin == 'XRP') {
                    //     reps.xrp = {
                    //         type: temporary.type,
                    //         option: temporary.option
                    //     }
                    // }
                    macros.push({ uuid: temporary.uuid, coin: temporary.coin, type: temporary.type.map(function (data) { switch (data) {
                        case 0: return 'A'
                        case 1: return 'B'
                        case 2: return 'C'
                        case 3: return 'D'
                        default: return 'E'
                    } }) })
                }
                response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: { enabled: true, macros: macros }, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
            } else {
                response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: { enabled: false }, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
            }
        } catch(err) {
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
/* Module */