import {
  IHypercertMinter,
  chainId,
  hypercertContract,
  provider,
  rpcURL,
  signer,
  spreadsheet,
} from "./config.js";
import { VV_FORMATTED_SHEET_ID } from "./constants.js";
import { getMintHypercertParams } from "./utils.js";
import { ImpactStoryFormattedRowData } from "./types.js";
import puppeteer from "puppeteer";
import { storeMetadata } from "./ipfs.js";
import { ethers } from "ethers";

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

  const browser = await puppeteer.launch({
    headless: "new",
    protocolTimeout: 270_000,
  });
  // Store the endpoint to be able to reconnect to the browser.
  const browserWSEndpoint = browser.wsEndpoint();

  const params = await Promise.all(
    dataset.map(
      async (impact) =>
        await getMintHypercertParams(impact.toObject(), browserWSEndpoint)
    )
  );

  // Disconnect puppeteer from the browser.
  browser.disconnect();

  const cid = await storeMetadata(params.map((v) => v!.data));
  console.log(`ROOT CID: ${cid}`);

  const senderAddress = await hypercertContract.signer.getAddress();
  // const nonce = await provider.getTransactionCount(senderAddress);
  // const requests = params.map(async (v, idx) => {
  //   let txn = {
  //     type: 2,
  //     chainId: chainId,
  //     nonce: nonce + idx,
  //     to: hypercertContract.address,
  //     value: ethers.constants.Zero,
  //     data: IHypercertMinter.encodeFunctionData("mintClaim", [
  //       senderAddress,
  //       v?.totalUnits,
  //       cid.concat(v?.data.uid),
  //       v?.transferRestriction,
  //     ]),
  //     gasLimit: "300000",
  //     maxPriorityFeePerGas: ethers.utils.parseUnits("1.5", "gwei"),
  //     maxFeePerGas: ethers.utils.parseUnits("1.5", "gwei"),
  //   };
  //   // sign and serialize the transaction
  //   const signed = await signer.signTransaction(txn);
  //   const rawTxn = ethers.utils.serializeTransaction(txn);
  //   return {
  //     jsonrpc: "2.0",
  //     method: "eth_sendRawTransaction",
  //     params: [rawTxn],
  //     id: idx,
  //   };
  // });

  // const res = await fetch(rpcURL, {
  //   method: "POST",
  //   body: JSON.stringify(requests),
  //   headers: { "Content-Type": "application/json" },
  // });
  // return await res.json();

  const txn: any[] = [];
  let seq = Promise.resolve();
  params.forEach((v) => {
    seq = seq
      .then(() =>
        hypercertContract.mintClaim(
          senderAddress,
          v?.totalUnits,
          cid.concat(`/${v?.data.uid}`),
          v?.transferRestriction
        )
      )
      .then((tx) => tx.wait())
      .then((receipt) => {
        txn.push(receipt);
      });
  });

  seq.then(() => {
    console.log(txn);
  });

  process.exit(0);
};

main({ limit: 50, offset: 25 });
