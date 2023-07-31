process.env.TZ = 'Etc/Universal'

/* Import module */
    import chalk from 'chalk'
/* Import module */

/* Module */
    export function info(...msg: any[]): void {
        console.log(`${chalk.cyanBright(chalk.bold('i'))}`, ...msg)
    }
    export function warn(...msg: any[]): void {
        console.log(`${chalk.yellowBright(chalk.bold('!'))}`, ...msg)
    }
    export function error(...msg: any[]): void {
        console.log(`${chalk.redBright(chalk.bold('×'))}`, ...msg)
    }
    export function ok(...msg: any[]): void {
        console.log(`${chalk.greenBright(chalk.bold('√'))}`, ...msg)
    }
    export function request(...msg: any[]): void {
        console.log(`${chalk.blueBright(chalk.bold('⇌'))}`, ...msg)
    }
    export function finish(...msg: any[]): void {
        console.log(`${chalk.greenBright(chalk.bold('⇌'))}`, ...msg)
    }
    export function fail(...msg: any[]): void {
        console.log(`${chalk.bgRed(chalk.bold('⇌'))}`, ...msg)
    }
/* Module */