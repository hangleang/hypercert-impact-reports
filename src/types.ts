import { HypercertMetadata } from "@hypercerts-org/sdk";

type Bool = "Yes" | "No";
export enum Empty {
  NA = "NA",
  no = "no",
  No = "No",
  none = "none",
  NO = "NO",
}

export type VVImpactStoryRowData = {
  impact_uid: string;
  state_name: string;
  full_name: string;
  issue: string;
  impact_cc_verification_call: Bool;
  concerns_about_cc_achieving_impact: string | Bool | Empty;
  impact_corroboration_call: Bool;
  impact_corroboration_details: string | Empty;
  impact_achieved_description: string;
  impact_other_direct_role: string | Empty;
  impact_help_from_other_sources: string | Empty;
  impact_date: string;
  people_involved: number;
  people_impacted: number;
  villages_impacted: number;
  sharing_video_helped_in_impact?: Bool;
  how_did_sharing_video_helped?: string | Empty;
  impact_and_advocacy_team_intervention?: Bool;
  impact_due_to_impact_and_advocacy_team?: string | Bool;
  details_of_impact?: string | Empty;
  impact_facebook_url?: string;
  impact_facebook_publish_date?: string;
  impact_youtube_url?: string;
  impact_youtube_publish_date?: string;
  impact_website_url?: string;
  impact_website_publish_date?: string;
};

export interface VVImpactStoryFormattedRowData
  extends Omit<HypercertMetadata, "hypercert"> {
  uid: string;
  youtube_url?: string;
  animation_url?: string;
  work_scope?: string;
  work_timeframe?: string;
  impact_scope?: string;
  impact_timeframe?: string;
  contributors?: string;
  rights?: string;
}
