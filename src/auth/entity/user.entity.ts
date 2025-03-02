import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * User data entity.
 */
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;
}