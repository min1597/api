process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'

    import credentialRouter from './credential'
/* Import module */

/* Initialization */
    const Router: Express.Router = Express.Router()
/* Initialization */

/* Module */
    Router.use('/credential', credentialRouter)

    export default Router
/* Module */