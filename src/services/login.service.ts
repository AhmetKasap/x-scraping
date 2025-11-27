import { inject, injectable } from "inversify";
import * as puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import type { IConfig } from "../config";
import type { ILoginService } from "./login.service.interface";
import { SERVICE_TYPES } from "../service.types";

dotenv.config();

@injectable()
export default class LoginService implements ILoginService {
	private readonly COOKIES_PATH = path.join(
		process.cwd(),
		"twitter_cookies.json",
	);
	private readonly DOWNLOADS_PATH = path.join(process.cwd(), "downloads");
	private readonly DOWNLOAD_SCRIPT_PATH = "twitter";

	private twitterUsername: string;
	private twitterPassword: string;

	constructor(
		@inject(SERVICE_TYPES.IConfig)
		private readonly config: IConfig,
	) {
		this.twitterUsername = this.config.TWITTER_USERNAME;
		this.twitterPassword = this.config.TWITTER_PASSWORD;

		// Create downloads directory if it doesn't exist
		if (!fs.existsSync(this.DOWNLOADS_PATH)) {
			fs.mkdirSync(this.DOWNLOADS_PATH, { recursive: true });
		}

		// Create scripts directory if it doesn't exist
		const scriptDir = path.dirname(this.DOWNLOAD_SCRIPT_PATH);
		if (!fs.existsSync(scriptDir)) {
			fs.mkdirSync(scriptDir, { recursive: true });
		}
	}

	private delay(ms: number): Promise<void> {
		return new Promise((res) => setTimeout(res, ms));
	}

	/* Login Transactions */
	private async saveCookies(page: puppeteer.Page): Promise<void> {
		const cookies = await page.cookies();
		fs.writeFileSync(this.COOKIES_PATH, JSON.stringify(cookies, null, 2));
	}

	private async loadCookies(page: puppeteer.Page): Promise<boolean> {
		if (fs.existsSync(this.COOKIES_PATH)) {
			const cookies = JSON.parse(
				fs.readFileSync(this.COOKIES_PATH, "utf8"),
			);
			await page.setCookie(...cookies);
			return true;
		}
		return false;
	}

	async loginToTwitter(page: puppeteer.Page): Promise<boolean> {
		await page.goto("https://twitter.com/", {
			waitUntil: "networkidle2",
		});

		if (await this.loadCookies(page)) {
			await page.reload({ waitUntil: "networkidle2" });
			await this.delay(1000);

			try {
				// Check if logged in by looking for home timeline or user menu
				await page.waitForSelector('a[data-testid="AppTabBar_Home_Link"]', {
					timeout: 2000,
				});
				return true;
			} catch (e) {}
		}

		// Navigate to login page
		await page.goto("https://twitter.com/i/flow/login", {
			waitUntil: "networkidle2",
		});

		// Wait for username input
		await page.waitForSelector('input[autocomplete="username"]', {
			timeout: 10000,
		});

		// Enter username
		await page.type('input[autocomplete="username"]', this.twitterUsername, {
			delay: 100,
		});

		// Click next button
		const nextButton = await page.$('div[role="button"]');
		if (nextButton) {
			const text = await page.evaluate((el: Element) => el.textContent, nextButton);
			if (text && (text.includes('Next') || text.includes('İleri'))) {
				await nextButton.click();
				await this.delay(2000);
			}
		}

		// Handle unusual activity check (if appears)
		try {
			const unusualActivityInput = await page.$('input[data-testid="ocfEnterTextTextInput"]');
			if (unusualActivityInput) {
				// This might require phone/email verification
				// For now, we'll skip this step
				await this.delay(2000);
			}
		} catch (err) {}

		// Wait for password input
		await page.waitForSelector('input[name="password"]', {
			timeout: 10000,
		});

		// Enter password
		await page.type('input[name="password"]', this.twitterPassword, {
			delay: 100,
		});

		// Click login button
		await page.click('div[data-testid="LoginForm_Login_Button"]');
		await page.waitForNavigation({ waitUntil: "networkidle2" });
		await this.delay(2000);

		// Handle any popups or modals that might appear
		try {
			// Close any "Turn on notifications" popup
			const buttons = await page.$$('div[role="button"]');
			for (const button of buttons) {
				const text = await page.evaluate((el: Element) => el.textContent, button);
				if (text && (text.includes('Skip') || text.includes('Atla'))) {
					await button.click();
					await this.delay(1000);
					break;
				}
			}
		} catch (err) {}

		// Verify login success
		try {
			await page.waitForSelector('a[data-testid="AppTabBar_Home_Link"]', {
				timeout: 5000,
			});
			await this.saveCookies(page);
			return true;
		} catch (e) {
			// Login might have failed
			return false;
		}
	}
}
