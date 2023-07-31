process.env.TZ = 'Etc/Universal'

/* Import modules */
    import http from 'http'
    import https from 'https'
    import randomUseragent from 'random-useragent'
/* Import modules */

/* Module */
    // export function getHeaders() {
    //     return {
    //         "Accept": "*/*", "Accept-Encoding": "gzip, deflate, br", "Accept-Language": "en-GB,en;q=0.9,ko-KR;q=0.8,ko;q=0.7,ja-JP;q=0.6,ja;q=0.5,zh-TW;q=0.4,zh;q=0.3,en-US;q=0.2", "Cache-Control": "no-cache", "Connection": "keep-alive", "Pragma": "no-cache", "Sec-Fetch-Dest": "empty", "Sec-Fetch-Mode": "cors", "Sec-Fetch-Site": "same-site", "X-Forwarded-For": "218.144." +  Array(2).fill(0).map((_, i) => Math.floor(Math.random() * 254) + (i === 1 ? 1 : 0)).join('.'), "User-Agent": randomUseragent.getRandom(), "X-Requested-With": "XMLHttpRequest",
    //     }
    // }
    export function getHeaders() {
        return {
            "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }
    }

    export async function httpRequest(hostname: string, path: string, method: 'get' | 'post', data?: object, headers?: http.OutgoingHttpHeaders, config: { useSSL: boolean } = { useSSL: false }): Promise<any> {
        try {
            const option: https.RequestOptions = {
                hostname: hostname,
                path: path,
                headers: {
                    ... headers,
                    ... getHeaders()
                },
                method: method !== 'get' ? method : undefined
            }
            if(config.useSSL) {
                const response = await new Promise(function (resolve, reject) {
                    switch (method) {
                        case 'get':
                            https.get(option, function (response) {
                                let data = ''
                                response.on('data', function (chunk) { data += chunk })
                                response.on('end', function () { resolve({ ...response, data: data }) })
                            })
                            .on('error', function (error) { reject(error) })
                            break
                        case 'post':
                            https.request(option, function (response) {
                                let data = ''
                                response.on('data', function (chunk) { data += chunk })
                                response.on('end', function () { resolve({ ...response, data: data }) })
                            })
                            .on('error', function (error) { reject(error) })
                            break
                    }
                })
                return response
            } else {
                const response = await new Promise(function (resolve, reject) {
                    switch (method) {
                        case 'get':
                            http.get(option, function (response) {
                                let data = ''
                                response.on('data', function (chunk) { data += chunk })
                                response.on('end', function () { resolve({ ...response, data: data }) })
                            })
                            .on('error', function (error) { reject(error) })
                            break
                        case 'post':
                            http.request(option, function (response) {
                                let data = ''
                                response.on('data', function (chunk) { data += chunk })
                                response.on('end', function () { resolve({ ...response, data: data }) })
                            })
                            .on('error', function (error) { reject(error) })
                            break
                    }
                })
                return response
            }
        } catch(err) {
            throw err
        }
    }
/* Module */