process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import { Plugin } from '../../../..'
    import * as Module from '../../../../module'
/* Import module */

/* Module */
    export async function postMartinHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(!Module.Utils.Express.validateParameter(request, [
                { path: [ 'martin' ], name: 'Macro active', type: Module.Utils.Express.ParameterTypes.array_number, isRequired: true }
            ])) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_REQUEST, { ko: '필수 파라미터가 누락되었습니다.', en: 'A required parameter is missing.' })

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

            const martin: Array<number> = new Array()

            for(const temporary of request.body.martin) {
                martin.push(Number(temporary))
            }

            if(martin.length == 0) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_REQUEST, { ko: '잘못된 마틴 정보입니다.', en: 'Invalid martin information.' })

            const entity = new Plugin.Resources.Model.Martins()
            entity.martin = JSON.stringify(martin)
            entity.user_id = (token.getUserID() as { uuid: string }).uuid

            await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Martins).update({ user_id: entity.user_id }, { is_active: false })
            await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Martins).save(entity)
            
            response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: null, requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
        } catch(err) {
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }

    export async function getMartinHandler(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
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

            const _response = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Martins).find({ where: { user_id: (token.getUserID() as { uuid: string }).uuid, is_active: true }})
            if(_response.length == 1) {
                response.status(200).json({ success: true, error: { type: Plugin.V1.Error.ErrorTypes.OK, description: { ko: '요청이 정상적으로 처리되었습니다.', en: 'Your request has been processed successfully.' } }, data: JSON.parse(_response[0].martin), requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) })
            } else throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.UNAUTHORIZED, { ko: '등록된 마틴 정보가 존재하지 않습니다.', en: 'Registered martin information does not exist.' })            
        } catch(err) {
            try {
                if((err as Plugin.V1.Error.LunaError)._isLuna) next(err)
                else if(typeof err == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: err })) } else throw new Error('An unknown error has occured.')
            } catch(err) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { ko: '알수 없는 오류가 발생하였습니다.', en: 'An unknown error has occured.' })) }
        }
    }
/* Module */