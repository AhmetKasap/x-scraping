import * as puppeteer from "puppeteer";

export interface ILoginService {
	loginToTwitter(page: puppeteer.Page): Promise<boolean>;
}
