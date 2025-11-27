import { inject, injectable } from "inversify"

import { SERVICE_TYPES } from "../../service.types"
import { IConfig } from "../../config"

@injectable()
export class LoginService {
	constructor(
	
		@inject(SERVICE_TYPES.IConfig)
		private readonly config: IConfig,
		
	) {}
	async login(
		login: any
	): Promise<any> {
		
	}


}
