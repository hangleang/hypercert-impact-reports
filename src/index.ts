import {
  HypercertClient,
  HypercertMetadata,
  formatHypercertData,
  TransferRestrictions,
} from "@hypercerts-org/sdk";
import { ethers, BigNumberish } from "ethers";

// NOTE: you should replace this with your own JSON-RPC provider to the network
// This should have signing abilities and match the `chainId` passed into HypercertClient
const operator = ethers.providers.getDefaultProvider("goerli");

const client = new HypercertClient({
  chainId: 5, // goerli testnet
  operator,
  //   nftStorageToken,
  //   web3StorageToken,
});

const mintHypercert = async () => {
  // Validate and format your Hypercert metadata
  const {
    data: metadata,
    valid,
    errors,
  } = formatHypercertData({
    name: "",
  });

  // Check on errors
  if (!valid || !metadata) {
    return console.error(errors);
  }

  // Set the total amount of units available
  const totalUnits: BigNumberish = 10_000_000;

  // Define the transfer restriction
  const transferRestrictions: TransferRestrictions =
    TransferRestrictions.FromCreatorOnly;

  // Mint your Hypercert!
  const tx = await client.mintClaim(metadata, totalUnits, transferRestrictions);
};
