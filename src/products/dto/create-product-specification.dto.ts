import { ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsBoolean,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min
} from 'class-validator'

export class CreateProductSpecificationDto {
	@ApiPropertyOptional({
		example: 6.7,
		description: 'Диагональ экрана в дюймах'
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(15)
	screen_diagonal?: number

	@ApiPropertyOptional({
		example: '2796x1290',
		description: 'Разрешение экрана'
	})
	@IsOptional()
	@IsString()
	screen_resolution?: string

	@ApiPropertyOptional({ example: 'OLED', description: 'Тип матрицы экрана' })
	@IsOptional()
	@IsString()
	screen_type?: string

	@ApiPropertyOptional({
		example: 120,
		description: 'Частота обновления экрана (Гц)'
	})
	@IsOptional()
	@IsInt()
	screen_refresh_rate?: number

	@ApiPropertyOptional({
		example: 'Apple A17 Pro',
		description: 'Модель процессора'
	})
	@IsOptional()
	@IsString()
	processor?: string

	@ApiPropertyOptional({
		example: 6,
		description: 'Количество ядер процессора'
	})
	@IsOptional()
	@IsInt()
	num_cores?: number

	@ApiPropertyOptional({ example: 'iOS', description: 'Операционная система' })
	@IsOptional()
	@IsString()
	os?: string

	@ApiPropertyOptional({
		example: '17',
		description: 'Версия операционной системы'
	})
	@IsOptional()
	@IsString()
	os_version?: string

	@ApiPropertyOptional({ example: 48, description: 'Основная камера (Мп)' })
	@IsOptional()
	@IsInt()
	main_camera_mp?: number

	@ApiPropertyOptional({ example: 12, description: 'Фронтальная камера (Мп)' })
	@IsOptional()
	@IsInt()
	front_camera_mp?: number

	@ApiPropertyOptional({
		example: true,
		description: 'Оптическая стабилизация'
	})
	@IsOptional()
	@IsBoolean()
	has_optical_stabilization?: boolean

	@ApiPropertyOptional({
		example: 4422,
		description: 'Емкость аккумулятора (мА·ч)'
	})
	@IsOptional()
	@IsInt()
	battery_capacity?: number

	@ApiPropertyOptional({
		example: 27,
		description: 'Мощность быстрой зарядки (Вт)'
	})
	@IsOptional()
	@IsInt()
	fast_charging_power_w?: number

	@ApiPropertyOptional({ example: true, description: 'Беспроводная зарядка' })
	@IsOptional()
	@IsBoolean()
	has_wireless_charging?: boolean

	@ApiPropertyOptional({ example: 1, description: 'Количество SIM-карт' })
	@IsOptional()
	@IsInt()
	sim_count?: number

	@ApiPropertyOptional({ example: true, description: 'Поддержка eSIM' })
	@IsOptional()
	@IsBoolean()
	has_esim?: boolean

	@ApiPropertyOptional({ example: true, description: 'Наличие NFC' })
	@IsOptional()
	@IsBoolean()
	has_nfc?: boolean

	@ApiPropertyOptional({ example: true, description: 'Поддержка 5G' })
	@IsOptional()
	@IsBoolean()
	has_5g?: boolean

	@ApiPropertyOptional({
		example: 'IP68',
		description: 'Класс защиты от пыли и влаги'
	})
	@IsOptional()
	@IsString()
	protection_rating?: string

	@ApiPropertyOptional({
		example: 'Стекло / Титан',
		description: 'Материалы корпуса'
	})
	@IsOptional()
	@IsString()
	body_material?: string

	@ApiPropertyOptional({ example: 221, description: 'Вес устройства (г)' })
	@IsOptional()
	@IsInt()
	weight_g?: number
}
