process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'

    import userRouter from './user'
    import * as Module from '../../../../module'
    import { Plugin } from '../../../..'
import { putNoticeHandler } from './notice'
import { getMacroHandler, postMacroHandler } from './macro'
/* Import module */

/* Initialization */
    const Router: Express.Router = Express.Router()
/* Initialization */

/* Module */
    Router.use(async function (request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
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
            if(token.isLogin() == false) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.FORBIDDEN, { ko: '로그인이 필요합니다3.', en: 'Login is required.' })
            const user_id = token.getUserID()
            if(typeof user_id !== 'object') throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.FORBIDDEN, { ko: '로그인이 필요합니다2.', en: 'Login is required.' })

            const percheck = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).find({ where: { uuid: user_id.uuid } })
            if(percheck.length !== 1) throw new Error('An unknown error has occured.')
            if(percheck[0].permission == false) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.UNAUTHORIZED, { ko: '권한이 부족합니다.', en: 'Need permission.' })

            next()
        } catch(error) {
            try {
                if((error as Plugin.V1.Error.LunaError)._isLuna) next(error)
                else if(typeof error == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: error })) } else throw new Error('An unknown error has occured.')
            } catch(error) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '로그인이 필요합니다1.', en: 'Login is required1.' })) }
        }
    })
    Router.use('/user', userRouter)
    Router.put('/notice', putNoticeHandler)
    Router.get('/macro', getMacroHandler)
    Router.post('/macro', postMacroHandler)

    export default Router
/* Module */