process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    import V1 from './v1'
    import * as Module from '../module'
    import { Plugin } from '..'
/* Import module */

/* Initialization */
    const Router: Express.Router = Express.Router()
/* Initialization */

/* Module */
    export * as V1 from './v1'

    Router.options('*', async function (request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        response.status(200)
        response.json({
            success: true,
            error: {
                type: 'CORS',
                description: {
                    ko: '요청이 정상적으로 처리되었습니다.',
                    en: 'Your request has been processed successfully.'
                }
            },
            data: null,
            requestedAt: Module.DayJS.getNow(Module.DayJS.Timezone.KST, true)
        })
    })

    Router.use('/v1', V1)

    Router.all('*', async function (request: Express.Request, response: Express.Response, next: Express.NextFunction) {
        next(new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.NOT_FOUND, { en: 'Not found page.', ko: '페이지를 찾을 수 없습니다.' }))
    })
    
    Router.use(Plugin.V1.Error.errorHandler)

    export default Router
/* Module */