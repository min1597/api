process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import { Plugin } from '../../../../..'
    import * as Module from '../../../../../module'
    import CryptoJS from 'crypto-js'
/* Import module */

/* Module */
    export async function generateHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(!Module.Utils.Express.validateParameter(request, [
                { path: [ 'credential', 'username' ], name: 'Account username', type: Module.Utils.Express.ParameterTypes.string, isRequired: true },
                { path: [ 'credential', 'password' ], name: 'Account password', type: Module.Utils.Express.ParameterTypes.string, isRequired: true },

                { path: [ 'expiresDate' ], name: 'Account expires date', type: Module.Utils.Express.ParameterTypes.string, isRequired: true },

                { path: [ 'permission' ], name: 'is admin', type: Module.Utils.Express.ParameterTypes.boolean, isRequired: true },
                { path: [ 'address' ], name: 'address', type: Module.Utils.Express.ParameterTypes.string, isRequired: true },
                { path: [ 'phone' ], name: 'phone number', type: Module.Utils.Express.ParameterTypes.string, isRequired: true },
                
                { path: [ 'name' ], name: 'Name', type: Module.Utils.Express.ParameterTypes.string, isRequired: true },
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

            if((await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).find({ where: { username: request.body.credential.username } })).length !== 0) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.UNAUTHORIZED, { ko: '중복된 ID입니다.', en: 'This is a duplicate ID.' })

            const entity = new Plugin.Resources.Model.Users()
            entity.username = request.body.credential.username
            entity.salt = Module.Utils.getRandomStrings(32)
            entity.hashed_password = CryptoJS.HmacSHA256(request.body.credential.password, entity.salt).toString()
            entity.name = request.body.name
            entity.expires_date = new Date(request.body.expiresDate)
            entity.phone = request.body.phone
            entity.address = request.body.address
            entity.permission = request.body.permission

            const _response = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).save(entity)

            response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: { user_id: _response.uuid }, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
        } catch(err) {
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
/* Module */