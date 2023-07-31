process.env.TZ = 'Etc/Universal'

/* Import module */
  import Express, { response } from 'express'
  import { Plugin } from '../../..'
/* Import module */

/* Module */
  export async function errorHandler(_err: Error, request: Express.Request, response: Express.Response, next: Express.NextFunction) {
    const err = _err as Error

    if ((err as Plugin.V1.Error.LunaError)._isLuna === true) {
      const laError = err as Plugin.V1.Error.LunaError

      // if (laError.type === Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR) sentryErrorHandler(err, req, rep)
      return laError.sendExpress(response)
    } else {
      const error = new Plugin.V1.Error.LunaError(Plugin.V1.Error.ErrorTypes.INTERNAL_SERVER_ERROR)
      error.loadError(_err)

      return error.sendExpress(response)
    }
  }
/* Module */