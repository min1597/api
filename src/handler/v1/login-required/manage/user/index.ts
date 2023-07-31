process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'
    
    import { generateHandler } from './generate'
    import { manageHandler } from './manage'
    import { statusHandler } from './status'

/* Import module */

/* Initialization */
    const Router: Express.Router = Express.Router()
/* Initialization */

/* Module */
    Router.post('/generate', generateHandler)
    Router.post('/manage', manageHandler)
    Router.get('/status', statusHandler)

    export default Router
/* Module */