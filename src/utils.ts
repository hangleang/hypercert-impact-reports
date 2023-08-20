import { SUFFIX_FORMATTED_TITLE, UNTIL_SYMBOL } from "./constants";
import { Empty } from "./types";

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
    end ? getDateFormat(end) : "indefinite"
  }`;
