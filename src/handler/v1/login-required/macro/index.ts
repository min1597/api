process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    
    import { statusHandler } from './status'
    import { manageHandler } from './manage'
    import { getMartinHandler, postMartinHandler } from './martin'
    import { getBybisHandler, postBybisHandler } from './bybis'
/* Import module */

/* Initialization */
    const Router: Express.Router = Express.Router()
/* Initialization */

/* Module */
    Router.get('/status', statusHandler)
    Router.post('/manage', manageHandler)

    Router.get('/martin', getMartinHandler)
    Router.post('/martin', postMartinHandler)
    
    Router.get('/bybis', getBybisHandler)
    Router.post('/bybis', postBybisHandler)

    export default Router
/* Module */