import { hypercertContract, operator, spreadsheet } from "./config.js";
import { VV_FORMATTED_SHEET_ID } from "./constants.js";
import { getMintHypercertParams } from "./utils.js";
import { ImpactStoryFormattedRowData } from "./types.js";
import puppeteer from "puppeteer";
import { getContractCallContext, multicall } from "./multicall.js";
import { storeMetadata } from "./ipfs.js";
import { CallContext } from "ethereum-multicall/dist/esm/models";

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
  // Disconnect puppeteer from the browser.
  browser.disconnect();

  const params = await Promise.all(
    dataset.map(
      async (impact, idx, _) =>
        await getMintHypercertParams(impact.toObject(), browserWSEndpoint)
    )
  );
  const cid = await storeMetadata(params.map((v) => v!.data));
  console.log(`ROOT CID: ${cid}`);
  const senderAddress = await (await hypercertContract()).signer.getAddress();
  const callsData: CallContext[] = params.map((v) => ({
    reference: "mintClaimCall",
    methodName: "mintClaim",
    methodParameters: [
      senderAddress,
      v?.totalUnits,
      cid.concat(v?.data.uid!),
      v?.transferRestriction,
    ],
  }));
  const callsContext = await getContractCallContext(callsData);

  const results = await multicall.call(callsContext);
  console.log(results);
};

main({ limit: 1, offset: 0 });
