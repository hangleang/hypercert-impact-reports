import { spreadsheet } from "../src/config";
import {
  BLANK_TEXT,
  HEADERS_TITLE,
  RIGHTS,
  VV_LOGO_URL,
  VV_SHEET_ID,
  VV_WORK_SCOPE,
} from "../src/constants";
import {
  VVImpactStoryFormattedRowData,
  VVImpactStoryRowData,
} from "../src/types";
import {
  getFormattedSheetTitle,
  getTimeframe,
  getYoutubeOembedURL,
  isNotEmpty,
} from "../src/utils";

async function main(opts: { limit?: number; offset?: number }) {
  await spreadsheet.loadInfo(); // loads document properties and worksheets
  console.log(`data-source: ${spreadsheet.title}`);

  // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  const VVSheet = spreadsheet.sheetsByIndex[VV_SHEET_ID];
  console.log(`from-sheet: ${VVSheet.title}`);
  console.log(`total-stories: ${VVSheet.rowCount}`);

  // load/check if formatted sheet exists
  const formattedTitle = getFormattedSheetTitle(VVSheet.title);
  let formattedVVSheet = spreadsheet.sheetsByTitle[formattedTitle];
  if (!formattedVVSheet) {
    // create new sheet for formatted data, set the header row for that
    formattedVVSheet = await spreadsheet.addSheet({
      title: formattedTitle,
      headerValues: HEADERS_TITLE,
    });
  }

  // getting original data from sources
  console.log(
    `formating ${opts.limit || 0} records, offset by ${opts.offset || 0}`
  );
  const dataset = await VVSheet.getRows<VVImpactStoryRowData>(opts); // can pass in { limit, offset }
  //   console.table(dataset);

  // format data to be include into each row
  const formattedDataset = await Promise.all(
    dataset.map(async (row, idx, _list) => {
      const report = row.toObject();

      // metadata
      let name = BLANK_TEXT;
      let image = VV_LOGO_URL;
      const uid = report.impact_uid;
      const youtubeURL = report.impact_youtube_url;
      if (youtubeURL) {
        try {
          const response = await fetch(getYoutubeOembedURL(youtubeURL));
          const youtubeMetadata = await response.json();
          // console.log(youtubeMetadata);
          name = youtubeMetadata["title"];
          image = youtubeMetadata["thumbnail_url"];
        } catch (error) {
          console.error("fetch error:", error);
        }
      }

      // description
      const people = report.people_impacted;
      const villages = report.villages_impacted;
      const details = report.details_of_impact;
      const other = report.impact_other_direct_role;
      const peopleInVillages = `${people || BLANK_TEXT} people/${
        villages || BLANK_TEXT
      } villages`;

      const listDescription = [
        report.impact_achieved_description,
        `#### Scope: ${peopleInVillages}`,
      ];
      if (isNotEmpty(details)) listDescription.push(`#### Details: ${details}`);
      if (isNotEmpty(other)) listDescription.push(other);
      const description = listDescription.join(`
      
      `);

      // hypercert impact dimension fields
      const impactDate = report.impact_date;
      const issue = report.issue;
      const stateName = report.state_name;
      const workTimeframe = getTimeframe(impactDate!, impactDate);
      const impactScope = `${peopleInVillages}, ${issue} ^ ${stateName}`;
      const impactTimeframe = getTimeframe(impactDate!);

      // contributors / rights
      const reporter = report.full_name;
      const involved = report.people_involved;
      const otherSourceHelp = report.impact_help_from_other_sources;
      const contributors = [reporter!, `${involved || BLANK_TEXT} people`];
      if (isNotEmpty(otherSourceHelp)) {
        contributors.push(otherSourceHelp!);
      }

      const data = {
        uid: uid!,
        name,
        description,
        image,
        external_url: youtubeURL!,
        youtube_url: youtubeURL!,
        animation_url: "",
        work_scope: VV_WORK_SCOPE,
        work_timeframe: workTimeframe,
        impact_scope: impactScope,
        impact_timeframe: impactTimeframe,
        contributors: contributors.join(", "),
        rights: RIGHTS,
      };
      console.log(`Impact #${idx}`);
      console.log(data);
      return data;
    })
  );

  // insert those data into the newly created sheet
  formattedVVSheet.addRows(formattedDataset);
}

main({ limit: 100, offset: 0 });
