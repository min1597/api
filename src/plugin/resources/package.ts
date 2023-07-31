process.env.TZ = 'Etc/Universal'

/* Import module */
    import fs from 'fs'
/* Import module */

/* Module */
    export const packageJson = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }))
/* Module */