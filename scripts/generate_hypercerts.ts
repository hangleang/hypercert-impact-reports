import puppeteer from "puppeteer";
import { spreadsheet } from "../src/config.js";
import {
  HYPERCERTS_GENERATED_TITLE,
  VV_FORMATTED_SHEET_ID,
} from "../src/constants.js";
import { ImpactStoryFormattedRowData } from "../src/types.js";
import {
  generateHypercert,
  getGeneratedHypercertSheetTitle,
} from "../src/utils.js";

async function main(opts: { limit?: number; offset?: number }) {
  await spreadsheet.loadInfo(); // loads document properties and worksheets
  console.log(`load-spreadsheet: ${spreadsheet.title}`);

  const sheet = spreadsheet.sheetsByIndex[VV_FORMATTED_SHEET_ID];
  console.log(`using-sheet: ${sheet.title}`);
  console.log(`total-stories: ${sheet.rowCount}`);

  const dataset = await sheet.getRows<ImpactStoryFormattedRowData>(opts);
  console.log(
    `minting ${opts.limit || 0} impacts, offset by ${opts.offset || 0}`
  );

  // load/check if formatted sheet exists
  const formattedTitle = getGeneratedHypercertSheetTitle(sheet.title);
  let generatedHypercertsSheet = spreadsheet.sheetsByTitle[formattedTitle];
  if (!generatedHypercertsSheet) {
    // create new sheet for formatted data, set the header row for that
    generatedHypercertsSheet = await spreadsheet.addSheet({
      title: formattedTitle,
      headerValues: HYPERCERTS_GENERATED_TITLE,
    });
  }

  // const browser = await puppeteer.launch({ headless: "new" });
  // // Store the endpoint to be able to reconnect to the browser.
  // const browserWSEndpoint = browser.wsEndpoint();
  // // Disconnect puppeteer from the browser.
  // browser.disconnect();

  const generatedHypercerts = await Promise.all(
    dataset.map(
      async (impact, idx, _) => await generateHypercert(impact.toObject())
    )
  );

  // insert those data into the newly created sheet
  generatedHypercertsSheet.addRows(generatedHypercerts);
}

main({ limit: 500, offset: 500 });
