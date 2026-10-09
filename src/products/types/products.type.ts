export type Product = {
	id: string
	sku: string
	is_active: boolean
	images_path: string[]
	model_id: string
	created_at: Date
	updated_at: Date
}

export type ProductVariant = {
	id: string
	product_id: string
	color_id: string
	ram_gb: number
	storage_gb: number
	stock_quantity: number
	price: number
	discount: number
}

export type ProductSpecification = {
	id: string
	product_id: string
	screen_diagonal: number
	screen_resolution: string
	screen_type: string
	screen_refresh_rate: number
	processor: string
	num_cores: number
	os: string
	os_version: string
	main_camera_mp: number
	front_camera_mp: number
	has_optical_stabilization: boolean
	battery_capacity: number
	fast_charging_power_w: number
	has_wireless_charging: boolean
	sim_count: number
	has_esim: boolean
	has_nfc: boolean
	has_5g: boolean
	protection_rating: string
	body_material: string
	weight_g: number
}
