process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import { Plugin } from '../..'
    import * as Module from '../../module'
/* Import module */

/* Module */
    export async function sessionHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(typeof request.headers.authorization !== 'string') {
                try {
                    const token: Plugin.V1.Token = await new Promise(function (resolve, reject) {
                        const _token = new Plugin.V1.Token()
                        _token.on([ 'state_change' ], function (data: { type: 'state_change', data: 'Initializing' | 'Normal' | 'Expired' | 'Broken' }) {
                            if(data.data == 'Normal') resolve(_token)
                            else reject('Expired or wrong token.')
                        })
                    })
                    
                    response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: { token: (token.getToken() as { token: string }).token, tokenType: 'Bearer' }, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
                } catch(_error) {
                    throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: 'Expired or wrong token.', en: '만료되거나 잘못된 토큰입니다.' })
                }
            } else {
                const parsed_token = Module.Utils.Token.tokenParser(request.headers.authorization as string)
                try {
                    const token: Plugin.V1.Token = await new Promise(function (resolve, reject) {
                        const _token = new Plugin.V1.Token(parsed_token.token, parsed_token.token_type)
                        _token.on([ 'state_change' ], function (data: { type: 'state_change', data: 'Initializing' | 'Normal' | 'Expired' | 'Broken' }) {
                            if(data.data == 'Normal') resolve(_token)
                            else reject(new Error('Expired or wrong token.'))
                        })
                    })
                    const expires_date = await token.getExpiresDate()
                    if(typeof expires_date == 'string') throw expires_date
                    if(typeof expires_date == 'boolean') throw new Error('An unknown error has occured.')
    
                    let permission = false
                    if(token.isLogin()) {
                        const userinfo = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).find({ where: { uuid: (token.getUserID() as { uuid: string }).uuid } })
                        if(userinfo.length !== 1) throw new Error('An unknown error has occured.')
                        else {
                            if(userinfo[0].permission == true) {
                                permission = true
                            }
                        }
                    }

                    response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: { token: (token.getToken() as { token: string }).token, tokenType: 'Bearer', expiresIn: expires_date.expires_in, loggedIn: token.isLogin(), permission: permission }, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
                } catch(_error) {
                    throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: 'Expired or wrong token.', en: '만료되거나 잘못된 토큰입니다.' })
                }

            }
        } catch(error) {
            try {
                if((error as Plugin.V1.Error.LunaError)._isLuna) next(error)
                else if(typeof error == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: error })) } else throw new Error('An unknown error has occured.')
            } catch(error) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
/* Module */