process.env.TZ = 'Etc/Universal'

/* Import modules */
    import { ObjectLiteral, EntityTarget } from 'typeorm'
    import { Tokens } from '../resources/typeorm'
    import { getDatabaseClient, connectDatabase } from '../resources/database'
    import dayjs from 'dayjs'
    import { getRandomStrings } from '../../module/Utils'
/* Import modules */

/* Module */
    export class Token {
        private _config: { database: { client: Function, token: EntityTarget<ObjectLiteral> }, utils: { random: Function }, security: { max_session: number } } = { database: { client: getDatabaseClient, token: Tokens }, utils: { random: getRandomStrings }, security: { max_session: 1 } }

        private _state: 'Initializing' | 'Normal' | 'Expired' | 'Broken' = 'Initializing'
        private _token: string
        private _uuid?: string = undefined

        private _metadata: { user_uuid?: string } = { user_uuid: undefined }

        private _hooks: Array<{ type: Array<'state_change' | 'login' | 'logout'>, function: Function }> = new Array()

        private _hook(type: 'state_change' | 'login' | 'logout') {
            switch (type) {
                case 'state_change':
                    this._hooks.forEach((hook) => {
                        if(hook.type.indexOf(type) !== -1) hook.function({ type: 'state_change', data: this._state })
                    })
                    break
                case 'login':
                    this._hooks.forEach((hook) => {
                        if(hook.type.indexOf(type) !== -1) hook.function({ type: 'login', data: { user_id: this._metadata.user_uuid } })
                    })
                    break
                case 'logout':
                    this._hooks.forEach((hook) => {
                        if(hook.type.indexOf(type) !== -1) hook.function({ type: 'logout', data: null })
                    })
                    break
            }
        }

        private _set(type: 'state', data: any) {
            try {
                switch (type) {
                    case 'state':
                        if([ 'Initializing', 'Normal', 'Expired', 'Broken' ].indexOf(data) == -1) throw 'Wrong data type.'
                        if(this._state !== data) {
                            this._state = data
                            this._hook('state_change')
                        }
                        return this._state
                }
            } catch(error) { return typeof error == 'string' ? error : false }
        }

        private _parse(type: 'Basic', data: string): { id: string, password: string } | boolean | string {
            try {
                switch (type) {
                    case 'Basic':
                        const decoded = atob(data).split(':')
                        if(decoded.length !== 2) throw 'Wrong Basic token format.'
                        return { id: decoded[0], password: decoded[1] }
                }
            } catch(error) { return typeof error == 'string' ? error : false }
        }

        private async _issue(): Promise<{ token: string } | boolean | string> {
            try {
                while (true) {
                    const token = this._config.utils.random(128, 'abcdefghijklnmopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789_-')
                    if((await this._config.database.client().manager.getRepository(this._config.database.token).find({ where: { token: token } })).length == 0) { return { token: token } }
                }
            } catch(error) { return typeof error == 'string' ? error : false }
        }

        private async _find(token: string, token_type: 'Bearer' | 'Basic'): Promise<{ uuid: string, token: string, expires_date: Date, user_uuid?: string } | boolean | string> {
            try {
                switch (token_type) {
                    case 'Basic':
                        if(true) {
                            const data = this._parse('Basic', token)
                            if(typeof data == 'string') throw data
                            else if(typeof data == 'boolean') throw new Error('An unknown error has occured.')
        
                            const response = await this._config.database.client().manager.getRepository(Tokens).find({ where: { uuid: data.id, token: data.password, is_active: true } })
                            if(response.length !== 1) throw 'Wrong or invalid token.'
                            
                            if(response[0].state == 'Expired' || dayjs(response[0].created_date).add(response[0].valid_time, 'millisecond').diff(dayjs(), 'millisecond') <= 0) {
                                await this._config.database.client().manager.getRepository(this._config.database.token).update({ token: data.id }, { state: 'Expired' })
                                throw 'Expired token.'
                            }
                            if(response[0].state == 'Suspend') throw 'Suspended token.'
        
                            if(typeof response[0].user_id == 'string') this._metadata.user_uuid == response[0].user_id
                            
                            return {
                                uuid: response[0].uuid,
                                token: response[0].token,
                                expires_date: new Date(dayjs(response[0].created_date).add(response[0].valid_time, 'millisecond').format()),

                                user_uuid: response[0].user_id ? response[0].user_id : undefined
                            }
                        }
                    case 'Bearer':
                        if(true) {
                            const response = await this._config.database.client().manager.getRepository(Tokens).find({ where: { token: token, is_active: true } })
                            if(response.length !== 1) throw 'Wrong or invalid token.'
                            
                            if(response[0].state == 'Expired' || dayjs(response[0].created_date).add(response[0].valid_time, 'millisecond').diff(dayjs(), 'millisecond') <= 0) {
                                await this._config.database.client().manager.getRepository(this._config.database.token).update({ token: token }, { state: 'Expired' })
                                throw 'Expired token.'
                            }
                            if(response[0].state == 'Suspend') throw 'Suspended token.'

                            if(typeof response[0].user_id == 'string') this._metadata.user_uuid == response[0].user_id

                            return {
                                uuid: response[0].uuid,
                                token: response[0].token,
                                expires_date: new Date(dayjs(response[0].created_date).add(response[0].valid_time, 'millisecond').format()),

                                user_uuid: response[0].user_id ? response[0].user_id : undefined
                            }
                        }
                }
            } catch(error) {
                console.log(error)
                if(typeof error == 'string') {
                    switch (error) {
                        case 'Expired token.':
                            this._set('state', 'Expired')
                            break
                        default:
                            this._set('state', 'Broken')
                            break
                    }
                }
                return typeof error == 'string' ? error : false
            }
        }

        private async _save(token: string, valid_time: number = 0): Promise<{ uuid: string, token: string, expires_date: Date } | boolean | string> {
            try {
                if(valid_time < 0) throw '"valid_time" must be a natural number.'
                const _token = new Tokens()
                _token.token = token

                _token.valid_time = Number(valid_time.toFixed())

                const response = await this._config.database.client().manager.getRepository(this._config.database.token).save(_token)

                return {
                    uuid: response.uuid,
                    token: response.token,
                    expires_date: new Date(dayjs(response.created_date).add(response.valid_time, 'millisecond').format())
                }
            } catch(error) { return typeof error == 'string' ? error : false }
        }

        /* Functions */
            constructor (token?: string, token_type: 'Bearer' | 'Basic' = 'Bearer') {
                if(typeof token == 'string') {
                    this._find(token, token_type).then((_response) => {
                        if(typeof _response == 'string') throw token
                        if(typeof _response == 'boolean') throw new Error('An unknown error has occured.')
                        this._token = _response.token
                        this._uuid = _response.uuid

                        if(typeof _response.user_uuid == 'string') this._metadata.user_uuid = _response.user_uuid
                        this._set('state', 'Normal')
                    }).catch(error => { if(this._state !== 'Expired') this._set('state', 'Broken') })
                } else {
                    this._issue().then((_token) => {
                        if(typeof _token == 'string') throw token
                        if(typeof _token == 'boolean') throw new Error('An unknown error has occured.')
        
                        this._save(_token.token, 3600000).then((_response) => {
                            if(typeof _response == 'string') throw _response
                            if(typeof _response == 'boolean') throw new Error('An unknown error has occured.')
                            this._token = _response.token
                            this._uuid = _response.uuid
                            this._set('state', 'Normal')
                        }).catch(error => { if(this._state !== 'Expired') this._set('state', 'Broken') })
                    }).catch(error => { if(this._state !== 'Expired') this._set('state', 'Broken') })
                }
            }

            on(type: Array<'state_change' | 'login' | 'logout'>, hook: Function) {
                this._hooks.push({ type: type, function: hook })
            }

            isLogin(): boolean { return typeof this._metadata.user_uuid == 'string' ? true : false }

            async formatAsync(token_type: 'Bearer' | 'Basic'): Promise<{ token: string, token_type: 'Bearer' | 'Basic' } | boolean | string> {
                try {
                    switch (this._state) {
                        case 'Initializing': throw 'Still initializing.'
                        case 'Expired': throw 'Expired token.'
                        case 'Broken': throw 'Wrong or invalid token.'
                    }
                    return new Promise((resolve, reject) => {
                        this._find(this._token, 'Bearer').then((response) => {
                            if(typeof response == 'string') throw response
                            if(typeof response == 'boolean') throw new Error('An unknown error has occured.')

                            resolve({
                                token: token_type == 'Basic' ? btoa([response.uuid, response.token].join(':')).replace(/=/g, '') : response.token,
                                token_type: token_type
                            })
                        })
                    })
                } catch(error) { return typeof error == 'string' ? error : false }
            }

            format(token_type: 'Bearer' | 'Basic'): { token: string, token_type: 'Bearer' | 'Basic' } | boolean | string {
                try {
                    switch (this._state) {
                        case 'Initializing': throw 'Still initializing.'
                        case 'Expired': throw 'Expired token.'
                        case 'Broken': throw 'Wrong or invalid token.'
                    }

                    return {
                        token: token_type == 'Basic' ? btoa([this._uuid, this._token].join(':')).replace(/=/g, '') : this._token,
                        token_type: token_type
                    }
                } catch(error) { return typeof error == 'string' ? error : false }
            }

            getToken(): { token: string } | boolean | string {
                try {
                    switch (this._state) {
                        case 'Initializing': throw 'Still initializing.'
                        case 'Expired': throw 'Expired token.'
                        case 'Broken': throw 'Wrong or invalid token.'
                    }

                    return { token: this._token }
                } catch(error) { return typeof error == 'string' ? error : false }
            }

            async getExpiresDate(): Promise<{ expires_date: Date, expires_in: number } | boolean | string> {
                try {
                    const validate = await this.isValid()
                    if(typeof validate == 'string') throw validate
                    if(validate == false) throw new Error('An unknown error has occured.')

                    const response = await this._config.database.client().manager.getRepository(Tokens).find({ where: { uuid: this._uuid, token: this._token, state: 'Normal', is_active: true } })
                    if(response.length !== 1) throw 'Wrong or invalid token.'
                    
                    const temporary = dayjs(response[0].created_date).add(response[0].valid_time, 'millisecond').toDate()
                    return {
                        expires_date: temporary,
                        expires_in: (temporary.getTime() - new Date().getTime()) / 1000
                    }
                } catch(error) { return typeof error == 'string' ? error : false }
            }

            async isValid(): Promise<boolean | string> {
                try {
                    if(this._state !== 'Normal') {
                        switch (this._state) {
                            case 'Initializing': throw 'Initialization has not yet taken place.'
                            case 'Broken': throw 'Wrong or invalid token'
                            case 'Expired': throw 'Expired token.'
                        }
                    }
                    const response = await this._find(this._token, 'Bearer')
                    if(typeof response == 'string') throw response
                    if(typeof response == 'boolean') throw new Error('An unknown error has occured.')

                    return true
                } catch(error) {
                    if(this._state == 'Initializing' || this._state == 'Normal') this._set('state', 'Broken')
                    return typeof error == 'string' ? error : false
                }
            }

            async login(user_uuid: string) {
                try {
                    const validate = await this.isValid()
                    if(typeof validate == 'string') throw validate
                    if(validate == false) throw new Error('An unknown error has occured.')

                    if(typeof this._metadata.user_uuid == 'string') throw 'Already logged in.'

                    const sessions = await this._config.database.client().manager.getRepository(this._config.database.token).find({ where: { user_id: user_uuid } })
                    if(sessions.length !== 0) {
                        let session_cnt: number = 0
                        for(const temporary of sessions) {
                            if(dayjs(temporary.created_date).add(temporary.valid_time, 'millisecond').diff(new Date(), 'millisecond') >= 0) session_cnt ++
                            else await this._config.database.client().manager.getRepository(this._config.database.token).update({ uuid: temporary.uuid }, { state: 'Expired' })
                        }
                        // if(['88d28f49-1b68-4db6-b1b8-815b196bfa7d', '8b19fdb9-b6f8-4877-b0a2-be95a03ad087'].indexOf(user_uuid) == -1) {
                        //     if(this._config.security.max_session < (session_cnt + 1)) throw 'Exceeded maximum number of sessions.'
                        // }
                    }

                    await this._config.database.client().manager.getRepository(this._config.database.token).update({ uuid: this._uuid }, { user_id: user_uuid })

                    this._metadata.user_uuid = user_uuid

                    this._hook('login')
                    return true
                } catch(error) { return typeof error == 'string' ? error : false }
            }

            async logout(): Promise<boolean | string> {
                try {
                    const validate = await this.isValid()
                    if(typeof validate == 'string') throw validate
                    if(validate == false) throw new Error('An unknown error has occured.')

                    if(this._metadata.user_uuid == undefined) throw 'Login is required.'

                    await this._config.database.client().manager.getRepository(this._config.database.token).update({ uuid: this._uuid }, { user_id: null })

                    this._metadata.user_uuid = undefined

                    this._hook('logout')
                    return true
                } catch(error) { return typeof error == 'string' ? error : false }
            }

            getUserID(): { uuid: string } | boolean | string {
                try {
                    if(typeof this._metadata.user_uuid == 'string') return { uuid: this._metadata.user_uuid }
                    else throw 'Login is required.'
                } catch(error) { return typeof error == 'string' ? error : false }
            }
        /* Functions */
    }
/* Module */