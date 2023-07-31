process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'

    import macroRouter from './macro'
    import manageRouter from './manage'
    import { passwordHandler } from './password'
/* Import module */

/* Initialization */
    const Router: Express.Router = Express.Router()
/* Initialization */

/* Module */
    Router.use('/macro', macroRouter)
    Router.use('/manage', manageRouter)
    Router.post('/password', passwordHandler)

    export default Router
/* Module */