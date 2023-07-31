process.env.TZ = 'Etc/Universal'

/* Import module */
  import { ConnectionOptions, DataSource } from 'typeorm'
  import { join } from 'path'
/* Import module */

/* Module */
  export const connectionOptions: ConnectionOptions = {
    type: "postgres",
    host: "129.154.194.255",
    port: 5432,
    username: "admin",
    password: "minjae1180!",
    database: "luna-development",
    entities: [
        join(__dirname + '/**/*.ts'),
        'plugin/resources/typeorm/entity/*.ts'
    ],
    migrationsTableName: 'migrations',
    migrations: [ 'plugin/resources/typeorm/migrations/*.ts' ],
    synchronize: false,
    logging: true
  }

  export const AppDataSource: DataSource = new DataSource({
    ...connectionOptions
  })

  export default AppDataSource
/* Module */