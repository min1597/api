process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
/* Import module */

/* Module */
    @Entity()
    export class Macros {
        @PrimaryGeneratedColumn('increment', { comment: 'Serial number' })
        srl: number

        @PrimaryGeneratedColumn('uuid', { comment: 'Token UUID' })
        uuid: string

        /* :: Macro data :: */
            @Column({ type: 'int', array: true, nullable: false, comment: 'macro type' })
            type: Array<number>

            @Column({ type: 'varchar', length: 100, nullable: false, comment: 'macro option' })
            option: string

            @Column({ type: 'varchar', length: 3, nullable: false, comment: 'macro coin' })
            coin: string


        /* :: Metadata :: */
            @Column({ type: 'uuid', nullable: true, default: null, comment: 'User UUID' })
            user_id: string
        

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