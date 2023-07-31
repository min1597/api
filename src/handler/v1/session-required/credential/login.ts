process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import { Plugin } from '../../../..'
    import * as Module from '../../../../module'
    import CryptoJS from 'crypto-js'
/* Import module */

/* Module */
    export async function loginHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(!Module.Utils.Express.validateParameter(request, [
                { path: [ 'credential', 'username' ], name: 'Account username', type: Module.Utils.Express.ParameterTypes.string, isRequired: true },
                { path: [ 'credential', 'password' ], name: 'Account password', type: Module.Utils.Express.ParameterTypes.string, isRequired: true }
            ])) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_REQUEST, { ko: '필수 파라미터가 누락되었습니다.', en: 'A required parameter is missing.' })

            if(!request.headers.authorization) throw new Error('A required parameter does not exist.')

            const parsed_token = Module.Utils.Token.tokenParser(request.headers.authorization)
            const token: Plugin.V1.Token = await new Promise(function (resolve, reject) {
                const _token = new Plugin.V1.Token(parsed_token.token, parsed_token.token_type)
                _token.on([ 'state_change' ], function (data: { type: 'state_change', data: 'Initializing' | 'Normal' | 'Expired' | 'Broken' }) {
                    if(data.data == 'Normal') resolve(_token)
                    else reject(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '만료되거나 잘못된 토큰입니다.', en: 'Expired or wrong token.' }))
                })
            })
            if(typeof token.format('Bearer') !== 'object') throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '잘못된 세션입니다.', en: 'Wrong session.' })
            if(token.isLogin() == true) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_REQUEST, { ko: '이미 로그인 되어있습니다.', en: 'You are already logged in.' })

            const _user_query = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).find({ where: { username: request.body.credential.username, is_active: true } })
            if(_user_query.length == 1) {
                if(CryptoJS.HmacSHA256(request.body.credential.password, _user_query[0].salt).toString() == _user_query[0].hashed_password) {
                    if(new Date(_user_query[0].expires_date).getTime() >= new Date().getTime()) {
                        const _login_response = await token.login(_user_query[0].uuid)
                        if(_login_response == true) {
                            response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: { username: null }, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
                            return
                        } else {
                            switch (_login_response) {
                                case 'Exceeded maximum number of sessions.': throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.FORBIDDEN, { ko: '최대 세션을 초과하였습니다.', en: 'Exceeded max sessions.' })
                                default: throw new Error('An unknown error has occured.')
                            }
                        }
                    } else throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.FORBIDDEN, { ko: '존재하지 않거나 잘못된 사용자 정보입니다.', en: 'Non-existent or incorrect user information.' })
                } else throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.FORBIDDEN, { ko: '존재하지 않거나 잘못된 사용자 정보입니다.', en: 'Non-existent or incorrect user information.' })
            } else throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.FORBIDDEN, { ko: '존재하지 않거나 잘못된 사용자 정보입니다.', en: 'Non-existent or incorrect user information.' })
        } catch(err) {
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
/* Module */