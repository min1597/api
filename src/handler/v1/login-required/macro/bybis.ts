process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import { Plugin } from '../../../..'
    import * as Module from '../../../../module'
/* Import module */

/* Module */
    export async function getBybisHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(!request.headers.authorization) throw new Error('A required parameter does not exist.')

            const parsed_token = Module.Utils.Token.tokenParser(request.headers.authorization)
            const token: Plugin.V1.Token = await new Promise(function (resolve, reject) {
                const _token = new Plugin.V1.Token(parsed_token.token, parsed_token.token_type)
                _token.on([ 'state_change' ], function (data: { type: 'state_change', data: 'Initializing' | 'Normal' | 'Expired' | 'Broken' }) {
                    if(data.data == 'Normal') resolve(_token)
                    else reject(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '잘못된 세션입니다.', en: 'Wrong session.' }))
                })
            })
            if(typeof token.format('Bearer') !== 'object') throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '잘못된 세션입니다.', en: 'Wrong session.' })

            const uuid = token.getUserID()
            if(typeof uuid == 'string') throw uuid
            if(typeof uuid == 'boolean') throw new Error('An unknown error has occured.')
            const _response = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).find({ where: { uuid: uuid.uuid } })
            console.log(_response)
            if(_response.length == 1) {
                response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: (typeof _response[0].bybis_id == 'string' && typeof _response[0].bybis_pw == 'string') ? { id: _response[0].bybis_id, otp: (typeof _response[0].bybis_otp == 'string' ? _response[0].bybis_otp : undefined) } : null, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
            } else throw new Error('An unknown error has occured.')
        } catch(err) {
            console.log(err)
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
    export async function postBybisHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(!Module.Utils.Express.validateParameter(request, [
                { path: [ 'credential', 'username' ], name: 'Bybis ID', type: Module.Utils.Express.ParameterTypes.string, isRequired: true },
                { path: [ 'credential', 'password' ], name: 'Bybis PW', type: Module.Utils.Express.ParameterTypes.string, isRequired: true },
                
                { path: [ 'otp' ], name: 'Bybis OTP Secret', type: Module.Utils.Express.ParameterTypes.string, isRequired: false },
            ])) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_REQUEST, { ko: '필수 파라미터가 누락되었습니다.', en: 'A required parameter is missing.' })

            if(!request.headers.authorization) throw new Error('A required parameter does not exist.')

            const parsed_token = Module.Utils.Token.tokenParser(request.headers.authorization)
            const token: Plugin.V1.Token = await new Promise(function (resolve, reject) {
                const _token = new Plugin.V1.Token(parsed_token.token, parsed_token.token_type)
                _token.on([ 'state_change' ], function (data: { type: 'state_change', data: 'Initializing' | 'Normal' | 'Expired' | 'Broken' }) {
                    if(data.data == 'Normal') resolve(_token)
                    else reject(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '잘못된 세션입니다.', en: 'Wrong session.' }))
                })
            })
            if(typeof token.format('Bearer') !== 'object') throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '잘못된 세션입니다.', en: 'Wrong session.' })

            const uuid = token.getUserID()
            if(typeof uuid == 'string') throw uuid
            if(typeof uuid == 'boolean') throw new Error('An unknown error has occured.')
            await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).update({ uuid: uuid.uuid }, { bybis_id: request.body.credential.username, bybis_pw: request.body.credential.password })
            if(typeof request.body.otp == 'string') {
                await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).update({ uuid: uuid.uuid }, { bybis_otp: request.body.otp })
            } else {
                await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).update({ uuid: uuid.uuid }, { bybis_otp: null })
            }
            response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: null, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
        } catch(err) {
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
/* Module */