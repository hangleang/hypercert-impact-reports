import { ContractCallContext, Multicall } from "ethereum-multicall";
import { chainId, operator, provider } from "./config.js";
import { DEPLOYMENTS } from "./constants.js";
import { HypercertMinterABI, SupportedChainIds } from "@hypercerts-org/sdk";
import { CallContext } from "ethereum-multicall/dist/esm/models";

export const getContractCallContext = async (
  calls: CallContext[]
): Promise<ContractCallContext> => {
  const _chainId = await chainId();
  return {
    reference: "HypercertMinter",
    contractAddress: DEPLOYMENTS[_chainId as SupportedChainIds].contractAddress,
    abi: HypercertMinterABI,
    calls,
  };
};

export const multicall = new Multicall({
  ethersProvider: provider,
  tryAggregate: true,
});
