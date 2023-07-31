process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import { Plugin } from '../../../..'
    import * as Module from '../../../../module'
/* Import module */

/* Module */
    export async function logoutHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(!request.headers.authorization) throw new Error('A required parameter does not exist.')

            const parsed_token = Module.Utils.Token.tokenParser(request.headers.authorization)
            const token: Plugin.V1.Token = await new Promise(function (resolve, reject) {
                const _token = new Plugin.V1.Token(parsed_token.token, parsed_token.token_type)
                _token.on([ 'state_change' ], function (data: { type: 'state_change', data: 'Initializing' | 'Normal' | 'Expired' | 'Broken' }) {
                    if(data.data == 'Normal') resolve(_token)
                })
            })
            if(typeof token.format('Bearer') !== 'object') throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '잘못된 세션입니다.', en: 'Wrong session.' })
            if(token.isLogin() == false) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_REQUEST, { ko: '로그인이 필요합니다.', en: 'Login is required.' })

            const _logout_response = await token.logout()
            if(_logout_response == true) {
                response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: null, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
                return
            } else throw new Error('An unknown error has occured.')
        } catch(err) {
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
/* Module */