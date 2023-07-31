export default {
    smtp: {
        service: 'Luna Mail',
        hostname: 'smtp.naver.com',
        port: 587,
        use_tls: true,
        auth: {
            username: 'minjae10005',
            password: '8CKH38XX11WR'
        },
        out_going: 'minjae10005@naver.com'
    },
    sms: {
        NCP: {
            access :'7PFncAgEh9FQ0HorJ5K6',
            secret: '5d6yJV4qqNlWetiBrK7jL455Zf2OmxVNj4mX7LlP',
            serviceId: 'ncp:sms:kr:263391763173:luna-accounts'
        },
        out_going: '+82 70-4517-8261'
    }
}