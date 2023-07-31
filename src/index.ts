process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Plugin, Handler } from '.'
    import Express from 'express'
    import 'reflect-metadata'
    import { v4 } from 'uuid'
    import Http from 'http'
    import chalk from 'chalk'
    import Figlet from 'figlet'
    import * as Module from './module'
    import OTPAuth from 'otpauth'
    import { Job, scheduleJob } from 'node-schedule'
/* Import module */

/* Initialize */
    const app: Express.Application = Express()
    let server: Http.Server
/* Initialize */

/* Module */
    export * as Plugin from './plugin'
    export * as Handler from './handler'

    export let macroActivate: boolean = false
    export function macroActivateControl() {
        console.log(':: Macro Activate is changed ::')
        console.log('Before state:', macroActivate)
        macroActivate = !macroActivate
        console.log('After state:', macroActivate)
    }

    async function main() {
        const currentEnv = Plugin.Resources.config.node.environment
    
        console.log(Figlet.textSync(Plugin.nameStylized, 'Small Slant'))
        console.log()
        // console.log(`${chalk.bold(Plugin.nameStylized)} - ${chalk.italic(`ver. ${Plugin.Resources.packageJson.version}`)}`)
        // console.log(chalk.cyan(chalk.underline(Plugin.Resources.packageJson.repository)))
        console.log()
        console.log(`Developed by ${chalk.magenta('Luna Co')} ${chalk.blue('Develop Team')}.`)
        console.log()
        console.log('Distributed under ' + chalk.bold('Luna Team License'))
        console.log('Copyrights 2022-' + new Date().getFullYear() + ' Luna Co. All rights reserved.')
        console.log()

        if(Plugin.Resources.config.node.environment === Plugin.V1.Interface.NodeEnvironment.Development) {
            console.log(
                chalk.yellow('Launching in Development mode, ') +
                chalk.bgYellowBright(chalk.black(chalk.bold(' DO NOT USE THIS IN PRODUCTION. '))),
            )
            console.log()
        }

        Module.Terminal.info('Registering for Express Module...')
        app.use(Express.json())
    
        Module.Terminal.info('Registering for Express Handler...')
        app.use(function (request: Express.Request, response: Express.Response, next: Express.NextFunction) {
            response.setHeader('Access-Control-Allow-Origin', (Plugin.Resources.config.express.cors && Array.isArray(Plugin.Resources.config.express.cors.origin)) ? Plugin.Resources.config.express.cors.origin.join(',') : '*')
            response.setHeader('Access-Control-Allow-Headers', (Plugin.Resources.config.express.cors && Array.isArray(Plugin.Resources.config.express.cors.allowedHeaders)) ? Plugin.Resources.config.express.cors.allowedHeaders.join(',') : '*')
            response.setHeader('Access-Control-Request-Method', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS')
            
            response.setHeader('request-uuid', v4())
            const requestedAt = new Date()
            response.setHeader('request-date', requestedAt.getTime())
            response.setHeader('path', request.path)
            
            // Module.Terminal.request('A new request has been confirmed.\n     ↳ Request UID : ' + response.getHeader('request-uuid') + '\n     ↳ RequestedAt : ' + Module.DayJS.dateFormat(requestedAt, Module.DayJS.Timezone.UTC, Module.DayJS.Timezone.KST, true) + '\n     ↳ IP Address : ' + (request.headers['x-forwarded-for'] || request.connection.remoteAddress) + '\n     ↳ Path : ' + request.path)

            response.on('close', function() {
                // if(response.statusCode >= 200 && response.statusCode < 300) Module.Terminal.finish('Request processing complete.\n     ↳ Request UID : ' + response.getHeader('request-uuid') + '\n     ↳ completedAt : ' + Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) + '\n     ↳ Status Code : ' + response.statusCode + '\n     ↳ Duration of time : ' + (new Date().getTime() - Number(response.getHeader('request-date'))) + 'ms')
                // else Module.Terminal.error('Failed to process request.\n     ↳ Request UID : ' + response.getHeader('request-uuid') + '\n     ↳ FailedAt : ' + Module.DayJS.getNow(Module.DayJS.Timezone.KST, true) + '\n     ↳ Status Code : ' + response.statusCode + '\n     ↳ Duration of time : ' + (new Date().getTime() - Number(response.getHeader('request-date'))) + 'ms')
            })

            next()
        })
        app.use(Handler.default)
        Module.Terminal.ok('Express Handler Registered.')
        
        // if (Plugin.V1.Sentry.isSentryAvailable()) {
        //     PluginV1.Terminal.Log.info('Registering Sentry...');
        //     app.register(PluginV1.Sentry.registerSentryPlugin.V1.FX.AoN.transaction);
        // }

        Module.Terminal.info('Initiating database connection...')
        await Plugin.Resources.connectDatabase()
        if(!await Plugin.Resources.testDatabase()) {
            Module.Terminal.error('Failed to connect! Please check if database is online.')
            process.exit(1)
        }
        Module.Terminal.ok('Database connection and initiating succeeded.')
        
        Module.Terminal.info('Starting up Express...')
        server = Http.createServer(app)
        server.listen(Plugin.Resources.config.express.port, Plugin.Resources.config.express.address, async function () {
            Module.Terminal.ok('Back-end API Server has started up.')

            Module.Terminal.info('Starting up Web Socket Server...')
            Plugin.Resources.createServer(server)
            Module.Terminal.ok('Web Socket Server has started up.')

            Module.Terminal.info('Starting up Macro Server...')


            function patton(results: { own: Array<{ round: string, position: string, amount: number, result: string }>, global: Array<{ round: string, result: string }> }, type: number) {
                switch (type) {
                    case 0:
                    case 1:
                        if(results.own.length == 0) {
                            if(results.global[0].result !== 'Waiting' && results.global[1].result !== 'Waiting') {
                                if((type == 0 && results.global[0].result == 'Down' && results.global[1].result == 'Up') || (type == 1 && results.global[0].result == 'Up' && results.global[1].result == 'Down')) return true
                            }
                        } else {
                            if(results.global[0].result !== 'Waiting' && results.global[1].result !== 'Waiting' && results.own[0].result !== 'Waiting') {
                                if((type == 0 && results.global[0].result == 'Down' && results.global[1].result == 'Up') || (type == 1 && results.global[0].result == 'Up' && results.global[1].result == 'Down')) return true
                            }
                        }
                        return false
                    case 2:
                    case 3:
                        // if(results.own.length !== 0) {
                        //     if(results.own[0].result !== 'Waiting') {
                        //         if([results.global[0].result, results.global[1].result, results.global[2].result].indexOf('Waiting') == -1) {
                        //             if(results.own[0].round == results.global[0].round) {
                        //                 if((type == 2 && results.own[0].position == 'Up') || (type == 3 && results.own[0].position == 'Down')) return true
                        //             } else if((results.global[0].result !== results.global[1].result) && (results.global[1].result !== results.global[2].result) && (results.global[2].result !== results.global[3].result)) {
                        //                 if(type == 2 && results.global[0].result == 'Up' || type == 3 && results.global[0].result == 'Down') return true
                        //             }
                        //         }
                        //     }
                        // } else {
                        //     if((results.global[0].result !== results.global[1].result) && (results.global[1].result !== results.global[2].result) && (results.global[2].result !== results.global[3].result)) {
                        //         if(type == 2 && results.global[0].result == 'Up' || type == 3 && results.global[0].result == 'Down') return true
                        //     }
                        // }
                        // return false
                        if(results.own.length == 0) {
                            if(results.global[0].result !== 'Waiting') {
                                if((type == 2 && results.global[0].result == 'Up' && results.global[1].result == 'Up') || (type == 3 && results.global[0].result == 'Down' && results.global[1].result == 'Down')) return true
                            }
                        } else {
                            if([results.global[0].result, results.global[1].result, results.own[0].result].indexOf('Waiting') == -1) {
                                if((type == 2 && results.global[0].result == 'Up' && results.global[1].result == 'Up') || (type == 3 && results.global[0].result == 'Down' && results.global[1].result == 'Down')) {
                                    return true
                                }
                            }
                        }
                        return false
                }
            }
            const sessions: Array<{ uuid: string, mainToken: string, token: string, session: string, schedule: Job }> = new Array()
            const histories: Array<string> = new Array()
            scheduleJob('30 * * * * *', async function () {
                console.log(':: Schedule Action ::')
                console.log('Macro Activate :', macroActivate)
                if(macroActivate == true) {
                    const response = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).find({ where: { is_active: true } })
                    Module.Terminal.ok(response.length, 'Macros loaded.')
                    
                    const actives: Array<string> = response.map((data) => { return data.uuid })

                    sessions.forEach(function (data) {
                        if(actives.indexOf(data.uuid) == -1) {
                            data.schedule.cancel()
                        }
                    })

                    response.forEach(async function (macro) {
                        if(sessions.filter((data) => { return data.uuid == macro.uuid }).length == 0) {
                            const credential = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).find({ where: { uuid: macro.user_id, is_active: true } })
                            if(credential.length !== 1) return
                            if(typeof credential[0].bybis_id !== 'string' || typeof credential[0].bybis_pw !== 'string') return
                            const loginResult = await Plugin.V1.FX.Credential.login(credential[0].bybis_id, credential[0].bybis_pw)
                            if(typeof loginResult == 'object') {
                                console.log(':: Login Log :: New login action catched by Normal Credential', 'Macro ID :', macro.uuid, 'Email address :', credential[0].bybis_id)
                                if(loginResult.token.indexOf('Token') == -1) {
                                    const convertResult = await Plugin.V1.FX.AoN.convertSession({ token: loginResult.token })
                                    console.log(convertResult)
                                    if(typeof convertResult == 'object') {
                                        console.log(':: Converted Success!')
                                        let martin: Array<number> = []
                                        const _martin = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Martins).find({ where: { user_id: credential[0].uuid, is_active: true } })
                                        if(_martin.length == 1) {
                                            martin = JSON.parse(_martin[0].martin)
                                        }
                                        const schedule = scheduleJob('45 * * * * *', async () => {
                                            if(macroActivate == true) {
                                                console.log('Macro Started :: ', macro.uuid)
                                                let cWL = false
                                                let win: boolean | number = false
                                                let lose: boolean | number = false
                                                try {
                                                    const option = JSON.parse(macro.option)
                                                    if(option.timer !== false) {
                                                        if((new Date(macro.created_date).getTime() + Number(option.timer) * 60 * 1000) < new Date().getTime()) {
                                                            await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                                            return
                                                        }
                                                    }
                                                    if(option.lose !== false || option.win !== false) {
                                                        cWL = true
                                                        if(option.win !== false && option.win !== 0) {
                                                            win = Number(option.win)
                                                        }
                                                        if(option.lose !== false && option.lose !== 0) {
                                                            lose = Number(option.lose)
                                                        }
                                                    }
                                                } catch(err) { }
                                                try {
                                                    const result = await Plugin.V1.FX.AoN.getResults(convertResult.session, macro.coin)
                                
                                                    if(typeof result == 'object') {
                                                        let betting = 5
                                                        if(martin.length !== 0) {
                                                            let lose_cnt = 0
                                                            let vdc = true
                                                            let sonek = 0
                                                            for(let i=0; i<result.own.length; i++) {
                                                                if(result.own[i].result == 'Lose') {
                                                                    if(histories.indexOf(macro.uuid + String(Number(result.own[i].round.split('.')[1]))) !== -1) {
                                                                        if(vdc) lose_cnt ++
                                                                        sonek -= result.own[i].amount
                                                                    }
                                                                } else {
                                                                    if(histories.indexOf(macro.uuid + String(Number(result.own[i].round.split('.')[1]))) !== -1) {
                                                                        sonek += result.own[i].amount
                                                                        vdc = false
                                                                    }
                                                                }
                                                            }
                                                            while ((lose_cnt + 1) > martin.length) {
                                                                lose_cnt = lose_cnt - martin.length
                                                            }
                                                            betting = martin[lose_cnt]
                                                            if(lose !== false) {
                                                                if((sonek < 0 ? sonek * -1 : sonek) >= (lose as number)) {
                                                                    await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                                                    console.log(macro.uuid + 'Returned')
                                                                    return
                                                                }
                                                            }
                                                            if(win !== false) {
                                                                if(sonek >= (win as number)) {
                                                                    await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                                                    console.log(macro.uuid + 'Returned')
                                                                    return
                                                                }
                                                            }
                                                        }
                                                        let position = result.global[0].result
                                                        let bet = false
                                                        for(const type of macro.type) {
                                                            if(patton(result, type) == true) {
                                                                bet = true
                                                                if(type == 0 || type == 1) position = (position == 'Up' ? 'Down' : 'Up')
                                                            }
                                                        }
                                                        console.log(macro.uuid, 'Betting result : ', bet, ' Money : ', betting, ' Coin : ' + macro.coin, ' Position : ' + (result.global[0].result == 'Up' ? 'BUY' : 'SELL'))
                                                        if(bet) {
                                                            histories.push(macro.uuid + String(Number(result.global[0].round.split('.')[1]) + 1) + (betting == 0 ? (result.global[0].result == 'Up' ? 'BUY' : 'SELL') : ''))
                                                            if(betting !== 0) Plugin.V1.FX.AoN.transaction({ token: convertResult.token }, convertResult.session, result.global[0].result == 'Up' ? 'BUY' : 'SELL', macro.coin as 'BTC' | 'ETH' | 'XRP', betting)
                                                        }
                                                    } else throw new Error()
                                                } catch(err) {
                                                    await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                                    sessions.filter(function (data) { return data.uuid == macro.uuid })[0].schedule.cancel()
                                                }
                                            }
                                        })
                                        sessions.push({ uuid: macro.uuid, mainToken: loginResult.token, token: convertResult.token, session: convertResult.session, schedule: schedule })
                                    }
                                } else {
                                    if((loginResult as { token: string, otp: 'SMS' | 'TOTP', session: string }).otp == 'TOTP') {
                                        if(typeof credential[0].bybis_otp == 'string') {
                                            let totp = new OTPAuth.TOTP({ issuer: 'Bybis', label: 'Bybis', algorithm: 'SHA1', digits: 6, period: 30, secret: credential[0].bybis_otp })
                                            const verifyResult = await Plugin.V1.FX.Credential.verifyOTP(loginResult.token, totp.generate())
                                            console.log(verifyResult)
                                            if(typeof verifyResult == 'object') {
                                                const convertResult = await Plugin.V1.FX.AoN.convertSession({ token: verifyResult.token })
                                                console.log(convertResult)
                                                if(typeof convertResult == 'object') {
                                                    console.log(':: Converted Success!')
                                                    let martin: Array<number> = []
                                                    const _martin = await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Martins).find({ where: { user_id: credential[0].uuid, is_active: true } })
                                                    if(_martin.length == 1) {
                                                        martin = JSON.parse(_martin[0].martin)
                                                    }
                                                    const schedule = scheduleJob('45 * * * * *', async () => {
                                                        if(macroActivate == true) {
                                                            console.log('Macro Started :: ', macro.uuid)
                                                            let cWL = false
                                                            let win: boolean | number = false
                                                            let lose: boolean | number = false
                                                            try {
                                                                const option = JSON.parse(macro.option)
                                                                if(option.timer !== false) {
                                                                    if((new Date(macro.created_date).getTime() + Number(option.timer) * 60 * 1000) < new Date().getTime()) {
                                                                        await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                                                        return
                                                                    }
                                                                }
                                                                if(option.lose !== false || option.win !== false) {
                                                                    cWL = true
                                                                    if(option.win !== false && option.win !== 0) {
                                                                        win = Number(option.win)
                                                                    }
                                                                    if(option.lose !== false && option.lose !== 0) {
                                                                        lose = Number(option.lose)
                                                                    }
                                                                }
                                                            } catch(err) { }
                                                            try {
                                                                const result = await Plugin.V1.FX.AoN.getResults(convertResult.session, macro.coin)
                                            
                                                                if(typeof result == 'object') {
                                                                    let betting = 5
                                                                    if(martin.length !== 0) {
                                                                        let lose_cnt = 0
                                                                        let vdc = true
                                                                        let sonek = 0
                                                                        for(let i=0; i<result.own.length; i++) {
                                                                            if(result.own[i].result == 'Lose') {
                                                                                if(histories.indexOf(macro.uuid + String(Number(result.own[i].round.split('.')[1]))) !== -1) {
                                                                                    if(vdc) lose_cnt ++
                                                                                    sonek -= result.own[i].amount
                                                                                }
                                                                            } else {
                                                                                if(histories.indexOf(macro.uuid + String(Number(result.own[i].round.split('.')[1]))) !== -1) {
                                                                                    sonek += result.own[i].amount
                                                                                    vdc = false
                                                                                }
                                                                            }
                                                                        }
                                                                        while ((lose_cnt + 1) > martin.length) {
                                                                            lose_cnt = lose_cnt - martin.length
                                                                        }
                                                                        betting = martin[lose_cnt]
                                                                        if(lose !== false) {
                                                                            if((sonek < 0 ? sonek * -1 : sonek) >= (lose as number)) {
                                                                                await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                                                                console.log(macro.uuid + 'Returned')
                                                                                return
                                                                            }
                                                                        }
                                                                        if(win !== false) {
                                                                            if(sonek >= (win as number)) {
                                                                                await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                                                                console.log(macro.uuid + 'Returned')
                                                                                return
                                                                            }
                                                                        }
                                                                    }
                                                                    let position = result.global[0].result
                                                                    let bet = false
                                                                    for(const type of macro.type) {
                                                                        if(patton(result, type) == true) {
                                                                            bet = true
                                                                            if(type == 0 || type == 1) position = (position == 'Up' ? 'Down' : 'Up')
                                                                        }
                                                                    }
                                                                    console.log(macro.uuid, 'Betting result : ', bet, ' Money : ', betting, ' Coin : ' + macro.coin, ' Position : ' + (position == 'Up' ? 'BUY' : 'SELL'))
                                                                    if(bet) {
                                                                        histories.push(macro.uuid + String(Number(result.global[0].round.split('.')[1]) + 1) + (betting == 0 ? (position == 'Up' ? 'BUY' : 'SELL') : ''))
                                                                        if(betting !== 0) Plugin.V1.FX.AoN.transaction({ token: convertResult.token }, convertResult.session, position == 'Up' ? 'BUY' : 'SELL', macro.coin as 'BTC' | 'ETH' | 'XRP', betting)
                                                                    }
                                                                } else throw new Error()
                                                            } catch(err) {
                                                                await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                                                sessions.filter(function (data) { return data.uuid == macro.uuid })[0].schedule.cancel()
                                                            }
                                                        }
                                                    })
                                                    sessions.push({ uuid: macro.uuid, mainToken: loginResult.token, token: convertResult.token, session: convertResult.session, schedule: schedule })
                                                }
                                            }
                                        }
                                    } else {
                                        await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).update({ uuid: macro.user_id }, { bybis_id: null, bybis_pw: null, bybis_otp: null })
                                        await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                        return
                                    }
                                }
                            } else {
                                console.log(':: Login Failed :: ', 'Macro ID :', macro.uuid, 'Email address :', credential[0].bybis_id)

                                try {
                                    if(typeof loginResult == 'string') {
                                        console.log(':: Wrong Credential :: ', 'Macro ID :', macro.uuid, 'Email address :', credential[0].bybis_id)
                                        if(loginResult == 'WRONG_USER') await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Users).update({ uuid: macro.user_id }, { bybis_id: null, bybis_pw: null, bybis_otp: null })
                                    }
                                } catch(err) {}
                                await Plugin.Resources.getDatabaseClient().manager.getRepository(Plugin.Resources.Model.Macros).update({ uuid: macro.uuid }, { is_active: false })
                                return
                            }
                        }
                    })
                }
            })
            Module.Terminal.ok('Web Macro Server has started up.')
        })
    }
    main().then()
/* Module */