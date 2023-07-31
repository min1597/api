process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import { Plugin } from '../..'
    import sessionRequiredHandler from './session-required'
    import loginRequiredHandler from './login-required'
    import * as Module from '../../module'

    import { sessionHandler } from './session'
/* Import module */

/* Initialization */
    const Router: Express.Router = Express.Router()
    const SessionRequiredRouter: Express.Router = Express.Router()
    const LoginRequiredRouter: Express.Router = Express.Router()
/* Initialization */

/* Module */
    Router.all('/session', sessionHandler)

    SessionRequiredRouter.use(async function (request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(Module.Utils.Express.getPathsByRouter(SessionRequiredRouter).filter(function (path) { if(request.path == path.path && path.method.indexOf(request.method)) return true }).length < 1) next()
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

            next()
        } catch(error) {
            try {
                if((error as Plugin.V1.Error.LunaError)._isLuna) next(error)
                else if(typeof error == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: error })) } else throw new Error('An unknown error has occured.')
            } catch(error) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '잘못된 세션 토큰 또는 세션 토큰을 찾을 수 없습니다.', en: 'Invalid session token or session token not found.' })) }
        }
    })

    SessionRequiredRouter.use(sessionRequiredHandler)

    LoginRequiredRouter.use(async function (request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        try {
            if(Module.Utils.Express.getPathsByRouter(LoginRequiredRouter).filter(function (path) { if(request.path == path.path && path.method.indexOf(request.method)) return true }).length < 1) next()
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
            if(token.isLogin() == false) throw new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.FORBIDDEN, { ko: '로그인이 필요합니다22.', en: 'Login is required.' })

            next()
        } catch(error) {
            try {
                if((error as Plugin.V1.Error.LunaError)._isLuna) next(error)
                else if(typeof error == 'string') { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR, { en: error })) } else throw new Error('An unknown error has occured.')
            } catch(error) { next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INVALID_SESSION, { ko: '로그인이 필요합니다11.', en: 'Login is required.' })) }
        }
    })

    LoginRequiredRouter.use(loginRequiredHandler)


    SessionRequiredRouter.use(LoginRequiredRouter)
    Router.use(SessionRequiredRouter)

    export default Router
    export { sessionRequiredHandler, loginRequiredHandler, SessionRequiredRouter, LoginRequiredRouter }
/* Module */