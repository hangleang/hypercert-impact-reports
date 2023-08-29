export const SPREADSHEET_ID = "1uTXcOefrEmtOOQwsaqprHJ-WMEi3W6tJP7nE6uPIAQc";
export const SUFFIX_FORMATTED_TITLE = "-formatted";
export const SUFFIX_HYPERCERTS_GENERATED_TITLE = "-hypercerts-generated";
export const BLANK_TEXT = "unknown";
export const CGNET_SHEET_ID = 1;
export const VV_SHEET_ID = 2;
export const VV_FORMATTED_SHEET_ID = 5;
export const VV_LOGO_URL =
  "https://yt3.googleusercontent.com/ytc/AOPolaSqGbnPkRIeGF2rNSRF08Dm4kCCv6482rKxff387w=s176-c-k-c0x00ffffff-no-rj";
export const HEADERS_TITLE = [
  "uid",
  "name",
  "description",
  "image",
  "external_url",
  "youtube_url",
  "animation_url",
  "work_scope",
  "work_timeframe",
  "impact_scope",
  "impact_timeframe",
  "contributors",
  "rights",
  "properties",
  "hidden_properties",
];
export const HYPERCERTS_GENERATED_TITLE = [
  "uid",
  "hypercert_creation_url",
  "hypercert_artwork_base64",
];
export const RIGHTS = "Public Display";
export const VV_WORK_SCOPE = "Video Volunteers Impact Report";
export const CGNET_WORK_SCOPE = "CGNet Swara Impact Report";
export const UNTIL_SYMBOL = "→";
export const INDEFINITE = "indefinite";
export const VERSION = "0.1.0";
export const HYPERCERT_CREATE_URL = "https://hypercerts.org/app/create/#";

export const PAGE_VIEWPORT = {
  width: 1680,
  height: 1050,
  deviceScaleFactor: 1.5,
};
export const SCREENSHOT_CLIP = {
  x: 987,
  y: 310,
  width: 320,
  height: 400,
};

// Goerli is default if nothing specified
const DEFAULT_CHAIN_ID = 5;

const DEFAULT_GRAPH_BASE_URL =
  "https://api.thegraph.com/subgraphs/name/hypercerts-admin";

export type SupportedChainIds = 5 | 10;
export type Deployment = {
  /** The ID of the network on which the contract is deployed. */
  chainId: number;
  /** The name of the network on which the contract is deployed. */
  chainName: string;
  /** The address of the deployed contract. */
  contractAddress: string;
  /** The url to the subgraph that indexes the contract events. Override for localized testing */
  graphUrl: string;
};

// These are the deployments we manage
export const DEPLOYMENTS: { [key in SupportedChainIds]: Deployment } = {
  5: {
    chainId: 5,
    chainName: "goerli",
    contractAddress: "0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07",
    graphUrl: `${DEFAULT_GRAPH_BASE_URL}/hypercerts-testnet`,
  } as const,
  10: {
    chainId: 10,
    chainName: "optimism-mainnet",
    contractAddress: "0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07",
    graphUrl: `${DEFAULT_GRAPH_BASE_URL}/hypercerts-optimism-mainnet`,
  } as const,
};
