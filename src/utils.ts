import { BigNumberish } from "ethers";
import puppeteer, { ScreenshotClip, Viewport } from "puppeteer";
import {
  HYPERCERT_CREATE_URL,
  INDEFINITE,
  SUFFIX_FORMATTED_TITLE,
  UNTIL_SYMBOL,
  VERSION,
  VV_LOGO_URL,
  PAGE_VIEWPORT,
  SCREENSHOT_CLIP,
} from "./constants";
import { Empty, ImpactStoryFormattedRowData } from "./types";
import querystring from "node:querystring";
import { formatHypercertData, transferRestrictions } from "./hypercert";
import { getClient } from "./config";

export const getFormattedSheetTitle = (currentTitle: string) => {
  if (currentTitle.includes(SUFFIX_FORMATTED_TITLE)) return currentTitle;
  return `${currentTitle}${SUFFIX_FORMATTED_TITLE}`;
};

export const getYoutubeOembedURL = (youtubeURL: string) =>
  `https://www.youtube.com/oembed?url=${youtubeURL}&format=json`;

export const isNotEmpty = (value?: string) => value && !(value in Empty);

const getDateFormat = (date: string) =>
  new Date(date).toISOString().substring(0, 10);

export const getTimeframe = (start: string, end?: string) =>
  `${getDateFormat(start)} ${UNTIL_SYMBOL} ${
    end ? getDateFormat(end) : INDEFINITE
  }`;

export const getHypercertCreateURL = <T extends ImpactStoryFormattedRowData>(
  impact: Partial<T>,
  logoUrl: string
): string => {
  const {
    external_url,
    image,
    impact_scope,
    impact_timeframe,
    work_scope,
    work_timeframe,
    properties,
    uid,
    rights,
    ...metadata
  } = impact;
  const [workTimeStart, workTimeEnd] = work_timeframe!
    .split(UNTIL_SYMBOL)
    .map((v) => v.trim());
  const [impactTimeStart, impactTimeEnd] = impact_timeframe!
    .split(UNTIL_SYMBOL)
    .map((v) => v.trim());
  // const url = `name=${data.name}&description=${data.description}&externalLink=${data.external_url}&logoUrl=${logoUrl}&bannerUrl=${data.image}&impactScopes=${data.impact_scope}&impactTimeStart=${impactStartTime}&impactTimeEnd=${impactEndTime}&workScopes=${data.work_scope}&workTimeStart=${workStartTime}&workTimeEnd=${workEndTime}&rights=${data.rights}&contributors=${data.contributors}&allowlistPercentage=50&backgroundColor=blue&backgroundVectorArt=contours`;
  const queryString = querystring.encode({
    ...metadata,
    externalLink: external_url,
    logoUrl,
    bannerUrl: image,
    "impactScopes%5B0%5D": impact_scope,
    impactTimeStart,
    impactTimeEnd,
    workScopes: work_scope,
    workTimeStart,
    workTimeEnd,
    "rights%5B0%5D": rights,
    allowlistPercentage: 50,
  });
  return HYPERCERT_CREATE_URL.concat(queryString);
};

export const takeScreenshotOf = async (
  browserWSEndpoint: string,
  url: string,
  name: string,
  viewport: Viewport,
  clip?: ScreenshotClip
): Promise<string> => {
  // connect/load browser
  const browser = await puppeteer.connect({ browserWSEndpoint });
  const page = await browser.newPage();
  await page.setViewport(viewport);

  // Navigate the page to a URL
  await page.goto(url);
  await page.waitForNetworkIdle();

  // take screenshot
  const imageEncoding = await page.screenshot({
    type: "png",
    path: `${name}.png`,
    encoding: "base64",
    clip,
    omitBackground: true,
  });

  // disconnect/close
  await page.close();
  await browser.close();
  return `data:image/png;base64,${imageEncoding}`;
};

export const mintHypercert = async <T extends ImpactStoryFormattedRowData>(
  impact: Partial<T>,
  browserWSEndpoint: string
) => {
  // pass query to hypercert create form, then after loaded, take screenshot with base64encoding
  const hypercertCreateURL = getHypercertCreateURL(impact, VV_LOGO_URL);
  console.log(`create-url: ${hypercertCreateURL}`);
  const imageEncodingURL = await takeScreenshotOf(
    browserWSEndpoint,
    hypercertCreateURL,
    impact.uid!,
    PAGE_VIEWPORT,
    SCREENSHOT_CLIP
  );
  console.log(`base64imageUrl: ${imageEncodingURL}`);

  // Validate and format your Hypercert metadata
  const {
    name,
    description,
    external_url,
    impact_scope,
    impact_timeframe,
    work_scope,
    work_timeframe,
    contributors,
    rights,
    uid,
    properties,
    ...rest
  } = impact;
  const dateToTimestamp = (dateString: string) => {
    const date = dateString.trim();
    if (date === INDEFINITE) return 0;
    return Math.floor(Date.parse(date) / 1000);
  };
  const [workTimeStart, workTimeEnd] = work_timeframe!
    .split(UNTIL_SYMBOL)
    .map(dateToTimestamp);
  const [impactTimeStart, impactTimeEnd] = impact_timeframe!
    .split(UNTIL_SYMBOL)
    .map(dateToTimestamp);
  const {
    data: metadata,
    valid,
    errors,
  } = await formatHypercertData({
    ...rest,
    name: name!,
    description: description!,
    external_url: external_url!,
    image: imageEncodingURL,
    version: VERSION,
    impactScope: impact_scope!.split(", "),
    impactTimeframeStart: impactTimeStart,
    impactTimeframeEnd: impactTimeEnd,
    workScope: work_scope!.split(", "),
    workTimeframeStart: workTimeStart,
    workTimeframeEnd: workTimeEnd,
    contributors: contributors!.split(", "),
    rights: rights!.split(", "),
    excludedImpactScope: [],
    excludedWorkScope: [],
    excludedRights: [],
  });

  // Check on errors
  if (!valid || !metadata) {
    return console.error(errors);
  }

  console.log(`Impact Story: ${uid}`);
  console.log(metadata);

  // Set the total amount of units available
  const totalUnits: BigNumberish = 1_000;

  // Define the transfer restriction
  // const transferRestrictions: TransferRestrictions =
  //   TransferRestrictions.FromCreatorOnly;

  // Mint your Hypercert!
  // const client = await getClient();
  // const tx = await client.mintClaim(metadata, totalUnits, 2);
  return getClient().then((client) =>
    client.mintClaim(metadata, totalUnits, 2)
  );
  // return tx;
};
