process.env.TZ = 'Etc/Universal'

/* Import module */
    import WebSocket from 'ws'
    import Http from 'http'
/* Import module */

/* Module */
    let server: WebSocket.Server

    export async function createServer(app: Http.Server) {
        if(server) throw new Error('The websocket server is already created.')
        else return server = new WebSocket.Server({ server: app })
    }
    export function getWebSocketServer(): WebSocket.Server {
        if(!server) throw new Error('A websocket server is missing.')
        else return server
    }
    /* Module */