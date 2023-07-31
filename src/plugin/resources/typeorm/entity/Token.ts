process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
/* Import module */

/* Module */
    enum State { Normal = 'Normal', Expired = 'Expired', Broken = 'Broken', Suspend = 'Suspend' }
    @Entity()
    export class Tokens {
        @PrimaryGeneratedColumn('increment', { comment: 'Serial number' })
        srl: number

        @PrimaryGeneratedColumn('uuid', { comment: 'Token UUID' })
        uuid: string

        /* :: Token data :: */
            @Column({ type: 'varchar', length: 256, nullable: false, comment: 'Token' })
            token: string

            @Column({ type: 'int', nullable: false, default: 0, comment: 'Token valid time (milliseconds)' })
            valid_time: number


        /* :: Metadata :: */
            @Column({ type: 'uuid', nullable: true, default: null, comment: 'User UUID' })
            user_id: string
        

        @Column({ type: 'enum', enum: State, default: State.Normal, comment: 'Token state' })
        state: State

        @Column({ type: 'boolean', default: true, comment: 'Data validity' })
        is_active: boolean

        @CreateDateColumn({ type: 'timestamptz', comment: 'Creation date' })
        created_date: Date

        @UpdateDateColumn({ type: 'timestamptz', comment: 'Update date' })
        updated_date: Date

        @Column({ type: 'timestamptz', nullable: true, default: null, comment: 'Delete date' })
        deleted_date: Date
    }
/* Module */