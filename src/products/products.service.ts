import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class ProductsService {
	constructor(private readonly db: DatabaseService) {}

	async create() {}
}
