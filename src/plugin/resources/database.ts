process.env.TZ = 'Etc/Universal'

/* Import module */
    import 'reflect-metadata'
    import { DataSource } from 'typeorm'
    import * as Entities from './typeorm'
/* Import module */

/* Module */
    let client: DataSource

    export async function connectDatabase() {
        if(client) throw new Error('The database is already connected.')
        else return client = await generateDatabase().initialize()
    }
    export function getDatabaseClient(): DataSource {
        if(!client) throw new Error('A database connection is required.')
        else return client
    }

    export async function testDatabase(): Promise<boolean> {
        try {
            await getDatabaseClient().query('SELECT * FROM pg_catalog.pg_tables;')
            return true
        } catch (err) {
            return false
        }
    }
    
    function generateDatabase(): DataSource {
        return new DataSource({
            type: "postgres",
            host: "64.176.226.9",
            port: 5432,
            username: "admin",
            password: "!as123123",
            database: "macro",
            entities: Entities,
            migrationsTableName: 'migrations',
            migrations: [ 'typeorm/migrations/*.ts' ],
            synchronize: true,
            logging: false
        })
    }
    
    export * as Model from './typeorm'
/* Module */