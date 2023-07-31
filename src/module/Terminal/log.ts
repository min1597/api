process.env.TZ = 'Etc/Universal'

/* Import module */
    import chalk from 'chalk'
/* Import module */

/* Module */
    export const Log = {
        info: function (...msg: any[]) {
            console.log(`${chalk.cyanBright(chalk.bold('i'))}`, ...msg)
        },
        warn: function (...msg: any[]) {
            console.log(`${chalk.yellowBright(chalk.bold('!'))}`, ...msg)
        },
        error: function (...msg: any[]) {
            console.log(`${chalk.redBright(chalk.bold('×'))}`, ...msg)
        },
        ok: function (...msg: any[]) {
            console.log(`${chalk.greenBright(chalk.bold('√'))}`, ...msg)
        },
        req: function (...msg: any[]) {
            console.log(`${chalk.blueBright(chalk.bold('⇌'))}`, ...msg)
        },
        fin: function (...msg: any[]) {
            console.log(`${chalk.greenBright(chalk.bold('⇌'))}`, ...msg)
        },
        err: function (...msg: any[]) {
            console.log(`${chalk.bgRed(chalk.bold('⇌'))}`, ...msg)
        }
    }
/* Module */