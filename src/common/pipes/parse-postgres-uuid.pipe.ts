import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class ParsePostgresUuidPipe implements PipeTransform<string, string> {
	transform(value: string): string {
		if (
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				value
			)
		) {
			throw new BadRequestException('Validation failed (UUID is expected)')
		}

		return value
	}
}
