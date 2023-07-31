process.env.TZ = 'Etc/Universal'

/* Module Import */
    const { Plugin } = require('.')
/* Module Import */

/* Module */
    module.exports = {
        node: {
            environment: 'development'
        },
        express: {
            port: 4000,
            address: '0.0.0.0',
            cors: {
                origin: ['*']
                // allowedHeaders: ['Content-Type','Authorization']
            }
        },
        database: {
            host: ''
        },
        sentry: {
            serverName: undefined,
            dsn: 'https://51137e2ca13a4426bc4a0c65ba0ee6ba@o4504378185285632.ingest.sentry.io/4504378189086724',
        },
        crypto: {
            secretKey: 'k?hW#W+Z7Asf(dy',
            algorithm: 'sha256'
        },
        token: {
            generators: {
                default: {
                    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                    length: 128
                },
                tokens: {
                    internal_session: {
                        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                        length: 256,
                        type: 'bearer'
                    },
                    internal_access: {
                        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                        length: 128,
                        type: 'bearer'
                    },
                    external_access: {
                        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                        length: 128,
                        type: 'bearer'
                    },
                    external_refresh: {
                        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                        length: 128,
                        type: 'bearer'
                    },
                    authorize_code: {
                        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                        length: 256,
                        type: 'bearer'
                    }
                },
                invalidate: {
                    internal_session: 31536000,
                    internal_access: 216000,
                    external_access: 7200,
                    external_refresh: 31536000,
                    authorize_code: 1800
                }
            },
            version: 1
        },
        certification: {
            generators: {
                invalidate: {
                    e_mail_address: {
                        code: 3600,
                        force: 0,
                        pass: 0,
                        other: 0
                    },
                    phone_number: {
                        code: 300,
                        force: 0,
                        pass: 0,
                        other: 0
                    }
                },
                certifications: {
                    phone_number: {
                        chars: '0123456789',
                        length: 6
                    },
                    e_mail_address: {
                        chars: '0123456789',
                        length: 6
                    }
                }
            }
        },
        notification: {
            smtp: {
                service: 'Luna Mail',
                hostname: 'smtp.naver.com',
                port: 587,
                useTls: true,
                auth: {
                    username: 'minjae10005',
                    password: '8CKH38XX11WR'
                },
                OutGoing: 'minjae10005@naver.com'
            },
            sms: {
                ncp: {
                    access :'7PFncAgEh9FQ0HorJ5K6',
                    secret: '5d6yJV4qqNlWetiBrK7jL455Zf2OmxVNj4mX7LlP',
                    serviceId: 'ncp:sms:kr:263391763173:luna-accounts'
                },
                OutGoing: '+82 70-4517-8261'
            }
        },
        tossPayments: {
            client: 'test_ck_OALnQvDd2VJPO0jBgvO8Mj7X41mN',
            secret: 'test_sk_YZ1aOwX7K8mXd6EoA4qryQxzvNPG'
        }
    }
/* Module */