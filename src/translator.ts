#! /usr/bin/env node
import * as minimist from 'minimist';
import { Files } from "./files";
import { GoogleTranslate } from "./google";

(async () => await translator(process.argv))();

// translate GoogleKey --path=./i18n/en --keep --verbose
async function translator(argv: string[]) {
  const params = minimist(argv.slice(2));
  const [ apikey ] = params._;

  // check that we have a google api key
  if (!apikey) {
    console.warn("You must provide a Google API key first.");
    return;
  }
  if (!params.path) {
    console.warn("You must provide a valid path first.");
    return;
  }

  const googleTranslate = new GoogleTranslate(apikey);
  const files = new Files(params.path);

  try {
    // log locale info
    params.verbose && console.log("Source locale = " + files.sourceLocale);
    params.verbose &&  console.log("Target locales = " + files.targetLocales);
  } catch (error) {
    console.error(error, "Opening Files: ");
    return;
  }

  // load source JSON
  try {
    const source = await files.loadJsonFromLocale(files.sourceLocale);
    // Iterate target Locales
    files.targetLocales.map(async (targetLocale) => {
      try {
        if (!(await googleTranslate.isValidLocale(targetLocale))) {
          throw Error(targetLocale + " is not supported. Skipping.");
        }

        // save target
        files.saveJsonToLocale(
          targetLocale,
          await recurseNode( // Iterate source terms
            source,
            await files.loadJsonFromLocale(targetLocale),
            params.keep,
            targetLocale,
            googleTranslate
          )
        );

        params.verbose && console.log(`Translated locale ${ targetLocale }`);
      } catch (error) {
        console.error(error.message);
        return;
      }
    }).forEach((promise) => promise.then());

  } catch (error) {
    console.error(error, "Source file malfored");
    return;
  }
}

async function recurseNode(
  source: any,
  original: any,
  keepTranslations = true,
  locale: string,
  googleTranslate: GoogleTranslate
): Promise<any> {
  const destination: any = {};

  for (let term in source) {
    const node = source[term];
    try {
      if (typeof node !== "string") {
        destination[term] = await recurseNode(
          node,
          original[term] ?? {},
          keepTranslations,
          locale,
          googleTranslate
        );
      } else {
        destination[term] = capitalizeFirstLetter(
          // if we already have a translation, keep it
            keepTranslations && original[term]
            ? original[term]
            : await googleTranslate.translateText(node, locale)
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  return destination;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


