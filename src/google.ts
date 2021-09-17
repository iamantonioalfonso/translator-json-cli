import { v2 } from '@google-cloud/translate';

export class GoogleTranslate {
  public readonly apikey: string;
  public readonly googleTranslate: any;

  constructor(apikey: string) {
    this.apikey = apikey;
    this.googleTranslate = new v2.Translate({ key: this.apikey });
  }

  public async isValidLocale(targetLocale: string): Promise<boolean> {
    try {
      await this.googleTranslate.translate("home", targetLocale);
      return true;
    } catch (error) {
      if (error.message === "Invalid Value") { return false; }
      throw error;
    }
  }

  public async translateText(text: string, targetLocale: string): Promise<string> {
    const args = text.match(/{(.*?)}/g);

    // replace arguments with numbers
    args?.forEach((arg, index) => {
      text = text.replace(arg, "{" + index + "}");
    });

    let result = "";
    try {
      result = (await this.googleTranslate.translate(text, targetLocale))[0];
    } catch (error) {
      console.error(error.message === "Invalid Value" ? `Invalid Locale ${targetLocale}` : error.message);
    }

    // replace arguments with numbers
    args?.forEach((arg, index) => {
      result = result.replace(`{${index}}`, arg);
    });

    return result;
  }
}
