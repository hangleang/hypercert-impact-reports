export const formatHypercertData = (args: any) =>
  import("@hypercerts-org/sdk").then(({ formatHypercertData: fn }) => fn(args));

export const transferRestrictions = () =>
  import("@hypercerts-org/sdk").then(({ TransferRestrictions: type }) => type);
