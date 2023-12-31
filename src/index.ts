import { spreadsheet } from "./config.js";
import { VV_FORMATTED_SHEET_ID } from "./constants.js";
import { mintHypercert } from "./utils.js";
import { ImpactStoryFormattedRowData } from "./types.js";
import puppeteer from "puppeteer";

const main = async (opts: { limit?: number; offset?: number }) => {
  await spreadsheet.loadInfo(); // loads document properties and worksheets
  console.log(`load-spreadsheet: ${spreadsheet.title}`);

  const sheet = spreadsheet.sheetsByIndex[VV_FORMATTED_SHEET_ID];
  console.log(`using-sheet: ${sheet.title}`);
  console.log(`total-stories: ${sheet.rowCount}`);

  const dataset = await sheet.getRows<ImpactStoryFormattedRowData>(opts);
  console.log(
    `minting ${opts.limit || 0} impacts, offset by ${opts.offset || 0}`
  );

  const browser = await puppeteer.launch({ headless: "new" });
  // Store the endpoint to be able to reconnect to the browser.
  const browserWSEndpoint = browser.wsEndpoint();

  await Promise.all(
    dataset.map(
      async (impact, idx, _) =>
        await mintHypercert(impact.toObject(), browserWSEndpoint)
    )
  );

  // Disconnect puppeteer from the browser.
  browser.disconnect();
};

main({ limit: 1, offset: 10 });
