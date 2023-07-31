process.env.TZ = 'Etc/Universal'

/* Import module */
    import Express from 'express'

    import { loginHandler } from './login'
    import { logoutHandler } from './logout'
/* Import module */

/* Initialization */
    const Router: Express.Router = Express.Router()
/* Initialization */

/* Module */
    Router.post('/login', loginHandler)
    Router.post('/logout', logoutHandler)

    export default Router
/* Module */