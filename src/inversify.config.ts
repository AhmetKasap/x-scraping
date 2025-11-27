import { Container } from "inversify"
import { Config, type IConfig } from "./config"
import { SERVICE_TYPES } from "./service.types"
import App from "./app"
import AppRouter from "./app-router"
import LoginService from "./services/login.service"
import type { ILoginService } from "./services/login.service.interface"


const container = new Container()

//! Bindings - Config
container.bind<IConfig>(SERVICE_TYPES.IConfig).to(Config)

//! Bindings - Controllerss


//! Bindings - Services
container.bind<ILoginService>(SERVICE_TYPES.LoginService).to(LoginService)


//! Bindings - Routers


//! Bindings - App
container.bind(SERVICE_TYPES.IAppRouter).to(AppRouter).inSingletonScope()
container.bind(SERVICE_TYPES.IApp).to(App).inSingletonScope()

export { container }
