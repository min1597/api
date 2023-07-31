process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
/* Import module */

/* Module */
    @Entity()
    export class Notices {
        @PrimaryGeneratedColumn('increment', { comment: 'Serial number' })
        srl: number

        @PrimaryGeneratedColumn('uuid', { comment: 'Token UUID' })
        uuid: string

        /* :: Metadata :: */
            @Column({ type: 'text', comment: 'Notice title' })
            title: string

            @Column({ type: 'text', comment: 'Notice content' })
            content: string
        

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