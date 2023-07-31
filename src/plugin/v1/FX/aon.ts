process.env.TZ = 'Etc/Universal'

/* Import modules */
    import axios from 'axios'
    import { login, verifyOTP, verifySMS } from './credential'
    import { getHeaders, httpRequest } from './utils'
    import { Timezone, dateFormat } from '../../../module/dayjs'
    import iconv from 'iconv-lite'
    import otpauth from 'otpauth'
/* Import modules */

/* Module */
    export async function convertSession(token: { token: string, token_type?: 'Bearer' | 'Basic' }): Promise<{ session: string, token: string } | boolean | string> {
        try {
            const response = await httpRequest('aon.bybis.com', '/index?theme=dark&utm_source=partner&c1=' + token.token, 'get', undefined, undefined, { useSSL: true })
            const response_ = await axios.get('https://aon.bybis.com/en/trade', { headers: { Cookie: 'SESSION=' + response.rawHeaders.filter(function (data_: string) { return data_.indexOf('SESSION=') !== -1 })[0].split('SESSION=')[1].split(';')[0], ... getHeaders() } })
            if(response.statusCode == 302 && response_.status == 200) {
                return {
                    session: response.rawHeaders.filter(function (data_: string) { return data_.indexOf('SESSION=') !== -1 })[0].split('SESSION=')[1].split(';')[0],
                    token: response_.data.split('Bearer ')[1].split("'")[0]
                }
            } else throw new Error('An unknown error has occured.')
        } catch(err) {
            console.log(err)
            return typeof err == 'string' ? err : false
        }
    }
    export async function balance(session: string): Promise<{ coin: string, amount: number } | boolean | string> {
        try {
            const response = await axios.get('https://aon.bybis.com/en/trade/balance?coinSymbol=USDT', { headers: { Cookie: 'SESSION=' + session, ... getHeaders() } })
            if(response.status == 200) {
                if(typeof response.data.data == 'object') {
                    console.log('BALANCE ISSUED::' + response.data.data.balance)
                    return {
                        coin: response.data.data.coin,
                        amount: Number(response.data.data.balance)
                    }
                } else {
                    throw new Error('An unknown error has occured.')
                }
            } else throw new Error('An unknown error has occured.')
        } catch(err) {
            console.log(err)
            return typeof err == 'string' ? err : false
        }
    }
    export async function getResults(session: string, coin: string): Promise<{ own: Array<{ round: string, position: string, amount: number, result: string }>, global: Array<{ round: string, result: string }> } | boolean | string> {
        try {
            const response = await axios.get('https://aon.bybis.com/en/trade?symbol=' + coin.toLowerCase() + 'usdt&pointCoin=USDT', { headers: { Cookie: 'SESSION=' + session, ... getHeaders() } })
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
                    } catch(err) {}
                }
                return { own: results_, global: results }
            } else throw new Error('An unknown error has occured.')
        } catch(err) { return typeof err == 'string' ? err : false }
    }
    export async function transaction(token: { token: string, token_type?: 'Bearer' | 'Basic' }, session: string, position: 'BUY' | 'SELL', method: 'BTC' | 'ETH' | 'XRP', amount: number): Promise<void | { position: 'BUY' | 'SELL', amount: number, round: string } | boolean | string> {
        try {
            if(!token.token_type) token.token_type = 'Bearer'

            if(amount == 0) return
            // console.log('MARTIN INFO :: ', amount)
            const date = new Date()
            let data: Array<string> = new Array()
            const data_obj = {
                flag: position.toLowerCase(),
                cnt: String(amount / 10),
                amount: String(amount),
                symbol: method.toLowerCase() + 'usdt',
                duration: 1,
                coinSymbol: 'USDT',
                st: (date.getTime() - (date.getMilliseconds() + (date.getSeconds() * 1000)) + 60000)
            }
            for(const temporary in data_obj) {
                data.push(temporary + '=' + (data_obj as any)[temporary])
            }
            console.log(data.join('&'))
            const response = await axios.post('https://aon.bybis.com/api/v1/purchase', data.join('&'), { headers: { 'Content-Type': 'application/x-www-form-urlencoded', authorization: token.token_type + ' ' + token.token, Cookie: 'SESSION=' + session + ';POINTCOIN=USDT', ... getHeaders() } })
            // console.log('data', response.data)
            // console.log('status', response.status)
            // console.log('req', response.request)
            // console.log('header', response.headers)
            if(response.status == 200) {
                if (response.data.op === 'maintenanceStatus') {
                    throw 'under maintenance'
                } else if (response.data.op === 'GAME_PURCHASE') {
                    if (!response.data.success && response.data.error === 'not_enough_points') {
                        throw 'Assets are scarce.'
                    } else {
                        return {
                            position: position,
                            amount: response.data.data.check,

                            round: dateFormat(new Date((date.getTime() - (date.getMilliseconds() + (date.getSeconds() * 1000)) + 60000)), Timezone.UTC, Timezone.KST)
                        }
                    }
                } else if (response.data.op === 'error') {
                    if (response.data.err === 'ONLY_ONE_COIN') {
                        throw 'It is not possible to trade by using two or more assets simultaneously for the same round.'
                    } else throw new Error('An unknown error has occured.')
                } else throw new Error('An unknown error has occured.')
            } else throw new Error('An unknown error has occured.')
        } catch(err) {
            console.log(err)
            return typeof err == 'string' ? err : false
        }
    }
/* Module */