import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    JoinColumn
} from "typeorm";
import { Service } from "./service.entity";

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

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}