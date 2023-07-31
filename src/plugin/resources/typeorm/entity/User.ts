process.env.TZ = 'Etc/Universal'

/* Import module */
    import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
/* Import module */

/* Module */
    @Entity()
    export class Users {
        @PrimaryGeneratedColumn('increment', { comment: 'Serial number' })
        srl: number

        @PrimaryGeneratedColumn('uuid', { comment: 'Token UUID' })
        uuid: string

        /* :: Credential :: */
            @Column({ type: 'varchar', length: 30, comment: 'name' })
            name: string

            @Column({ type: 'varchar', length: 30, comment: 'Username' })
            username: string

            @Column({ type: 'varchar', length: 32, comment: 'Hash salt' })
            salt: string

            @Column({ type: 'varchar', length: 512, comment: 'Hashed password (SHA256)' })
            hashed_password: string

            @Column({ type: 'varchar', nullable: true, default: null, length: 100, comment: 'Bybis ID' })
            bybis_id: string | null

            @Column({ type: 'varchar', nullable: true, default: null, length: 100, comment: 'Bybis PW' })
            bybis_pw: string | null

            @Column({ type: 'varchar', nullable: true, default: null, length: 100, comment: 'Bybis OTP' })
            bybis_otp: string | null

            @Column({ type: 'text', comment: 'Address' })
            address: string

            @Column({ type: 'text', comment: 'Phone number' })
            phone: string

            @Column({ type: 'boolean', comment: 'Admin permission' })
            permission: boolean


        /* :: Metadata :: */
            @Column({ type: 'timestamptz', comment: 'Delete date' })
            expires_date: Date
        

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