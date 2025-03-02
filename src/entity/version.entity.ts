import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Unique,
} from "typeorm";

import { Service } from "./service.entity";

/**
 * Version data entity.
 */
@Entity()
@Unique(['name', 'service']) // Enforces uniqueness on (name, service_id)
export class Version {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Service, (service) => service.versions, { onDelete: "CASCADE" })
    @JoinColumn({ name: "service_id" })
    service: Service;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ type: 'varchar', length: 500, nullable: false })
    description: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}