import { Entity, ObjectID, ObjectIDColumn, Column } from "typeorm";

@Entity()
export class Item {
	@PrimaryGeneratedColumn()
	id;
}
