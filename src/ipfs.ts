import { HypercertMetadata } from "@hypercerts-org/sdk";
import { CIDString } from "nft.storage";
import { nftStorageClient } from "./config.js";

export const storeMetadata = async (
  list: (HypercertMetadata & { uid: string })[]
): Promise<CIDString> => {
  // new Blob([JSON.stringify(data)], { type: "application/json" })
  const files = list.map((data) => {
    const { uid, ...metadata } = data;
    return new File([JSON.stringify(metadata)], uid, {
      type: "application/json",
    });
  });

  //   const cid: CIDString = await nftStorageClient.storeBlob(blob);
  const cid: CIDString = await nftStorageClient.storeDirectory(files);
  if (!cid) {
    throw new Error("Failed to store metadata");
  }

  return cid;
};
