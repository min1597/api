process.env.TZ = 'Etc/Universal'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' 

import axios from 'axios'
/* Import modules */
    import * as FX from './'
    import { login, verifyOTP } from './credential'
    import { balance, convertSession, transaction } from './aon'
    import otpauth from 'otpauth'
    import WebSocket from 'ws'
    import { w3cwebsocket } from 'websocket'
/* Import modules */

/* Module */
    export enum Pattern {
        AttachSecond,
        ThreeSequence,
        FiveSequence,
        AttachSecond_time
    }

    async function getResults(session: string): Promise<{ own: Array<{ round: string, position: string, amount: number, result: string }>, global: Array<{ round: string, result: string }> } | boolean | string> {
        try {
            const response = await axios.get('https://aon.bybis.com/en/trade', { headers: { Cookie: 'SESSION=' + session } })
            if(response.status == 200) {
                const results: Array<{ round: string, result: string }> = []
                const temporary = response.data.split('<table class="table-custom" data-role="game-round-list">')[1].replace(/ /g, '').replace(/\n/g, '').split('</table>')[0].split('<tbody>')[1].split('</tbody>')[0].split('</tr>')
                for(const _result of temporary) {
                    try {
                        results.push({
                            round: _result.split('<td>')[1].split('</td>')[0],
                            result: _result.split('<span')[1].split('</span>')[0].split('>')[1]
                        })
    
                    } catch(err) {}
                }
                const temporary_ = response.data.split('<table class="table-custom" data-role="game-investment-list">')[1].replace(/ /g, '').replace(/\n/g, '').split('</table>')[0].split('<tbody>')[1].split('</tbody>')[0].split('</tr>')
                const results_: Array<{ round: string, position: string, amount: number, result: string }> = []
                for(const _result of temporary_) {
                    try {
                        results_.push({
                            round: _result.split('<td>')[1].split('</td>')[0],
                            position: _result.split('<span')[1].split('</span>')[0].split('>')[1],
                            amount: Number(_result.split('<td>')[3].split('</td>')[0].replace('USDT', '')),
                            result: _result.split('<span')[2].split('</span>')[0].split('>')[1]
                        })
                    } catch(err) { console.log(err) }
                }
                return { own: results_, global: results }
            } else throw new Error('An unknown error has occured.')
        } catch(err) { return typeof err == 'string' ? err : false }
    }

    function pattern(type: Pattern) {
        switch (type) {

        }
    }

    // async function register()

    const martin = [5,10,20,45,95]
    const start = new Date().getTime()
    import scheduler from 'node-schedule'
    const macros = [
        { username: 'wpgnszz@naver.com', password: 'Rlaalsdnr1!', type: '1', secret: 'CC6WIVOXRVNKPIQMHSXFWVYAFKYG4ARX' },
        { username: 'minjae10005@naver.com', password: 'Minjae1180!', type: '2', secret: 'V4GXL7QPA2QJBIRWIMKMSID2MRCF6SAR' }
    ]
    scheduler.scheduleJob('10 * * * * *', function () {
        macros.forEach(credential => {
            login(credential.username, credential.password).then(res => {
                if(typeof res == 'object') {
                    let totp = new otpauth.TOTP({
                        issuer: 'ByBIS',
                        label: 'ByBIS',
                        algorithm: 'SHA1',
                        digits: 6,
                        period: 30,
                        secret: credential.secret
                    })
                    verifyOTP(res.token, totp.generate()).then(res_ => {
                        if(typeof res_ == 'object') {
                            convertSession({ token: res_.token }).then(res__ => {
                                if(typeof res__ == 'object') {
                                    getResults(res__.session).then(res___ => {
                                        if(typeof res___ == 'object') {
                                            let betting = 5
                                            if(martin.length !== 0) {
                                                let lose_cnt = 0
                                                for(let i=0; i<res___.own.length; i++) {
                                                    if(res___.own[i].result == 'Lose') {
                                                        lose_cnt ++
                                                    } else {
                                                        break
                                                    }
                                                }
                                                while ((lose_cnt + 1) > martin.length) {
                                                    lose_cnt = lose_cnt - martin.length
                                                }
                                                betting = martin[lose_cnt]
                                            }
                                            switch (credential.type) {
                                                case '1':
                                                    if(res___.own.length == 0) {
                                                        if(res___.global[0].result !== 'Waiting') { transaction({ token: res__.token }, res__.session, res___.global[0].result == 'Up' ? 'BUY' : 'SELL', 'BTC', betting) }
                                                    } else {
                                                        if(res___.global[0].result !== 'Waiting' && res___.own[0].result !== 'Waiting') { transaction({ token: res__.token }, res__.session, res___.global[0].result == 'Up' ? 'BUY' : 'SELL', 'BTC', betting) }
                                                    }
                                                    break
                                                case '2':
                                                    if(res___.own.length == 0) {
                                                        if(res___.global[1].round == res___.own[0].round) {
                                                            if(res___.own[0].result == 'Profit') {
                                                                transaction({ token: res__.token }, res__.session, res___.global[0].result == 'Up' ? 'BUY' : 'SELL', 'BTC', 5)
                                                            } else {
                                                                if(res___.global[2].round == res___.own[1].round) {
                                                                    if(res___.own[1].result == 'Lose' && res___.own[1].position !== res___.own[0].position) {
                                                                        transaction({ token: res__.token }, res__.session, res___.global[0].result == 'Up' ? 'BUY' : 'SELL', 'BTC', 5)
                                                                    }
                                                                } else {
                                                                    transaction({ token: res__.token }, res__.session, res___.global[0].result == 'Up' ? 'BUY' : 'SELL', 'BTC', 5)
                                                                }
                                                            }
                                                        } else {
                                                            if(res___.global[2].result == 'Up') {
                                                                if(res___.global[1].result == 'Down' && res___.global[0].result == 'Up') {
                                                                    transaction({ token: res__.token }, res__.session, 'BUY', 'BTC', 5)
                                                                }
                                                            } else {
                                                                if(res___.global[1].result == 'Up' && res___.global[0].result == 'Down') {
                                                                    transaction({ token: res__.token }, res__.session, 'SELL', 'BTC', 5)
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        if(res___.global[2].result == 'Up') {
                                                            if(res___.global[1].result == 'Down' && res___.global[0].result == 'Up') {
                                                                transaction({ token: res__.token }, res__.session, 'BUY', 'BTC', 5)
                                                            }
                                                        } else {
                                                            if(res___.global[1].result == 'Up' && res___.global[0].result == 'Down') {
                                                                transaction({ token: res__.token }, res__.session, 'SELL', 'BTC', 5)
                                                            }
                                                        }
                                                    }
                                                    break
                                                case '3':
                                                    if(res___.own.length == 0) {
                                                        if(res___.global[1].round == res___.own[0].round) {
                                                            if(res___.own[0].result == 'Profit') {
                                                                transaction({ token: res__.token }, res__.session, res___.global[0].result == 'Up' ? 'BUY' : 'SELL', 'BTC', betting)
                                                            } else {
                                                                if(res___.global[2].round == res___.own[1].round) {
                                                                    if(res___.own[1].result == 'Lose' && res___.own[1].position !== res___.own[0].position) {
                                                                        transaction({ token: res__.token }, res__.session, res___.global[0].result == 'Up' ? 'BUY' : 'SELL', 'BTC', betting)
                                                                    }
                                                                } else {
                                                                    transaction({ token: res__.token }, res__.session, res___.global[0].result == 'Up' ? 'BUY' : 'SELL', 'BTC', betting)
                                                                }
                                                            }
                                                        } else {
                                                            if(res___.global[4].result == 'Up') {
                                                                if(res___.global[3].result == 'Down' && res___.global[2].result == 'Up' && res___.global[1].result == 'Down' && res___.global[0].result == 'Up') {
                                                                    transaction({ token: res__.token }, res__.session, 'BUY', 'BTC', betting)
                                                                }
                                                            } else {
                                                                if(res___.global[3].result == 'Up' && res___.global[2].result == 'Down' && res___.global[1].result == 'Up' && res___.global[0].result == 'Down') {
                                                                    transaction({ token: res__.token }, res__.session, 'SELL', 'BTC', betting)
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        if(res___.global[4].result == 'Up') {
                                                            if(res___.global[3].result == 'Down' && res___.global[2].result == 'Up' && res___.global[1].result == 'Down' && res___.global[0].result == 'Up') {
                                                                transaction({ token: res__.token }, res__.session, 'BUY', 'BTC', betting)
                                                            }
                                                        } else {
                                                            if(res___.global[3].result == 'Up' && res___.global[2].result == 'Down' && res___.global[1].result == 'Up' && res___.global[0].result == 'Down') {
                                                                transaction({ token: res__.token }, res__.session, 'SELL', 'BTC', betting)
                                                            }
                                                        }
                                                    }
                                                    break
                                                case '4':
                                                    break
                                            }
                                        }
                                    })
                                    // balance(res__.session).then(response => {
                                    //     console.log(response)
                                    // })
                                    // transaction({ token: res__.token }, res__.session, 'BUY', 'BTC', 5).then(response => {
                                    //     console.log(response)
                                    // })
                                    
                                }
                            })
                        }
                    })
                }
            })
        })
    })

/* Module */