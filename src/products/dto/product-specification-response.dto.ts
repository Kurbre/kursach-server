import { ApiPropertyOptional } from '@nestjs/swagger'

export class ProductSpecificationResponseDto {
	@ApiPropertyOptional({
		example: 6.7,
		description: 'Диагональ экрана в дюймах'
	})
	screen_diagonal?: number

	@ApiPropertyOptional({
		example: '2796x1290',
		description: 'Разрешение экрана'
	})
	screen_resolution?: string

	@ApiPropertyOptional({ example: 'OLED', description: 'Тип матрицы экрана' })
	screen_type?: string

	@ApiPropertyOptional({
		example: 120,
		description: 'Частота обновления экрана (Гц)'
	})
	screen_refresh_rate?: number

	@ApiPropertyOptional({
		example: 'Apple A17 Pro',
		description: 'Модель процессора'
	})
	processor?: string

	@ApiPropertyOptional({
		example: 6,
		description: 'Количество ядер процессора'
	})
	num_cores?: number

	@ApiPropertyOptional({ example: 'iOS', description: 'Операционная система' })
	os?: string

	@ApiPropertyOptional({
		example: '17',
		description: 'Версия операционной системы'
	})
	os_version?: string

	@ApiPropertyOptional({
		example: 48,
		description: 'Разрешение основной камеры (Мп)'
	})
	main_camera_mp?: number

	@ApiPropertyOptional({
		example: 12,
		description: 'Разрешение фронтальной камеры (Мп)'
	})
	front_camera_mp?: number

	@ApiPropertyOptional({
		example: true,
		description: 'Оптическая стабилизация'
	})
	has_optical_stabilization?: boolean

	@ApiPropertyOptional({
		example: 4422,
		description: 'Емкость аккумулятора (мА·ч)'
	})
	battery_capacity?: number

	@ApiPropertyOptional({
		example: 27,
		description: 'Мощность быстрой зарядки (Вт)'
	})
	fast_charging_power_w?: number

	@ApiPropertyOptional({ example: true, description: 'Беспроводная зарядка' })
	has_wireless_charging?: boolean

	@ApiPropertyOptional({ example: 1, description: 'Количество SIM-карт' })
	sim_count?: number

	@ApiPropertyOptional({ example: true, description: 'Поддержка eSIM' })
	has_esim?: boolean

	@ApiPropertyOptional({ example: true, description: 'Наличие NFC' })
	has_nfc?: boolean

	@ApiPropertyOptional({ example: true, description: 'Поддержка 5G' })
	has_5g?: boolean

	@ApiPropertyOptional({ example: 'IP68', description: 'Класс защиты' })
	protection_rating?: string

	@ApiPropertyOptional({
		example: 'Стекло / Титан',
		description: 'Материалы корпуса'
	})
	body_material?: string

	@ApiPropertyOptional({ example: 221, description: 'Вес пристройства (г)' })
	weight_g?: number
}
