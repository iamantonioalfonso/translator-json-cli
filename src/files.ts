import { dirname, basename } from 'path';
import { readdirSync, writeFile, promises } from 'fs';

export class Files {
  public readonly folderPath: string;
  public readonly sourceLocale: string;
  public readonly targetLocales: Array<string>;

  constructor(filePath: string) {
    this.folderPath = dirname(filePath);
    this.sourceLocale = this.getLocaleFromFilename(basename(filePath));
    this.targetLocales = this.getTargetLocales();
  }

  private getLocaleFromFilename(fileName: string): string {
    return fileName.replace(".json", "");
  }

  private getTargetLocales(): string[] {
    const locales = [];
    const files = readdirSync(this.folderPath);

    files.forEach((file) => {
      const locale = this.getLocaleFromFilename(file);
      if (locale !== this.sourceLocale) {
        locales.push(locale);
      }
    });

    return locales;
  }

  async loadJsonFromLocale(locale: string): Promise<any> {
    return JSON.parse(await this.readFileAsync(`${this.folderPath}/${locale}.json`) || "{}");
  }

  private readFileAsync(filename: string): Promise<string> {
    return promises.readFile(filename, { encoding: 'utf8'});
  }

  public saveJsonToLocale(locale: string, file: any): void {
    writeFile(
      `${this.folderPath}/${locale}.json`,
      JSON.stringify(file, null, "  "),
      { encoding: 'utf8' },
      () => null
    );
  }
}
