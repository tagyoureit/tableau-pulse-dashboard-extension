export interface ISettings {
  caClientId: string;
  caSecretId: string;
  caSecretValue: string;
  siteName: string;
  tableauUrl: string;
  userName: string;
}


// url: tableauUrl + "/api/-/pulse/subscriptions?user_id=" + userId,
export interface IListSubscriptionResponse {
  subscriptions: ISubscription[];
  next_page_token: string;
}
interface IFollower {
  user_id: string;
  group_id: string;
}

interface ISubscription {
  id: string;
  metric_id: string;
  follower: IFollower;
  create_time: string;
  update_time: string;
}

// https://help.tableau.com/current/api/rest_api/en-us/REST/TAG/index.html#tag/Pulse-Methods/operation/MetricQueryService_GetMetric
// url: tableauUrl + "/api/-/pulse/metrics/" + n


export interface IGetMetricResponse {
  metric: IGetMetricResponseItem
}

interface IGetMetricResponseItem {
  id: string;
  specification: IMetricSpecification;
  definition_id: string;
  is_default: boolean;
  schema_version: string;
}

interface IMetricSpecification { 
  filters: IFilter[];
  measurement_period: IMeasurementPeriod;
  comparison: { comparison: TimeComparison };
}

enum TimeComparison {
  UNSPECIFIED = 'TIME_COMPARISON_UNSPECIFIED',
  NONE = 'TIME_COMPARISON_NONE',
  PREVIOUS_PERIOD = 'TIME_COMPARISON_PREVIOUS_PERIOD',
  YEAR_AGO_PERIOD = 'TIME_COMPARISON_YEAR_AGO_PERIOD'
}

interface IFilter {
  field: string;
  operator: string;
  categorical_values: { string_value: string; bool_value: boolean; null_value: string }[];
}

interface IMeasurementPeriod {
  granularity: Granularity;
  range: RangeType;
}
enum Granularity {
  UNSPECIFIED = "GRANULARITY_UNSPECIFIED",
  YEAR = "GRANULARITY_BY_YEAR",
  QUARTER = "GRANULARITY_BY_QUARTER",
  MONTH = "GRANULARITY_BY_MONTH",
  WEEK = "GRANULARITY_BY_WEEK",
  DAY = "GRANULARITY_BY_DAY"
}
enum RangeType {
  UNSPECIFIED = "RANGE_UNSPECIFIED",
  CURRENT_PARTIAL = "RANGE_CURRENT_PARTIAL",
  LAST_COMPLETE = "RANGE_LAST_COMPLETE"
}

// https://help.tableau.com/current/api/rest_api/en-us/REST/TAG/index.html#tag/Pulse-Methods/operation/MetricQueryService_ListDefinitions 
// url: tableauUrl + "/api/-/pulse/definitions/" + i + "?view=DEFINITION_VIEW_BASIC",

export interface IMetricMultipleDefinitionsResponse {
  definitions: IMetricDefinition[];
  next_page_token: string;
  total_available: number;
  offset: number;
}
export interface IMetricSingleDefinitionResponse {
  definition: IMetricDefinition;
}

interface IMetricDefinition {
  comparisons: {comparison: {compare_config: TimeComparison}},
  metadata: IMetricDefinitionsMetaData;
  specification: IMetricDefinitionSpecification;
  extension_options: IExtensionOptions;
  metrics: IGetMetricResponse[];
  total_metrics: number;
  representation_options: IRepresentationOptions;
  insights_options: { settings: IInsightSetting[] };
}

interface IMetricDefinitionsMetaData {
  name: string;
  description: string;
  id: string;
  schema_version: string;
  definition_version: number;
}
interface IMetricDefinitionSpecification {
  datasource: { id: string };
  basic_specification: IMetricDefinitionBasicSpecification;
  viz_state_specification: { viz_state_string: string };
  is_running_total: boolean;
}

interface IMetricDefinitionBasicSpecification {
  measure: { field: string; aggregation: "AGGREGATION_UNSPECIFIED"|"AGGREGATION_SUM"|"AGGREGATION_AVERAGE"|"AGGREGATION_MEDIAN"|"AGGREGATION_MAX"|"AGGREGATION_MIN"|"AGGREGATION_COUNT"|"AGGREGATION_COUNT_DISTINCT" };
  time_dimension: { field: string };
  filters: IFilter[];
}

interface IExtensionOptions {
  allowed_dimensions: string[];
  allowed_granularities: Granularity[]; 
  offset_from_today?: number;
}

interface IRepresentationOptions {
  type: string;
  number_units: INumberUnits;
  sentiment_type: "SENTIMENT_TYPE_UNSPECIFIED"|"SENTIMENT_TYPE_NONE"|"SENTIMENT_TYPE_UP_IS_GOOD"|"SENTIMENT_TYPE_DOWN_IS_GOOD";
  row_level_id_field: IRowLevelIdField;
  row_level_entity_names: IRowLevelEntityNames;
}

interface INumberUnits {
  singular_noun: string;
  plural_noun: string;
}

interface IRowLevelIdField {
  identifier_col: string;
  identifier_label: string;
}

interface IRowLevelEntityNames {
  entity_name_singular: string;
  entity_name_plural: string;
}

interface IInsightSetting {
  type: "INSIGHT_TYPE_UNSPECIFIED"|"INSIGHT_TYPE_RISKY_MONOPOLY"|"INSIGHT_TYPE_TOP_DRIVERS"|"INSIGHT_TYPE_RECORD_LEVEL_OUTLIERS"|"INSIGHT_TYPE_CURRENT_TREND"|"INSIGHT_TYPE_NEW_TREND"|"INSIGHT_TYPE_TOP_DIMENSION_MEMBER_MOVERS"|"INSIGHT_TYPE_METRIC_FORECAST"|"INSIGHT_TYPE_BOTTOM_CONTRIBUTORS"|"INSIGHT_TYPE_TOP_DETRACTORS";
  disabled: boolean;
}

// https://help.tableau.com/current/api/rest_api/en-us/REST/TAG/index.html#tag/Pulse-Methods/operation/PulseInsightsService_GenerateInsightBundleBAN
// url: tableauUrl + "/api/-/pulse/insights/ban",

export interface IInsightBundleRequest {
  bundle_request: IBundleRequest;
}

interface IBundleRequest {
  version: number;
  options: IBundleRequestOptions;
  input: {
      metadata?: IInsightBundleMetaData;
      metric?: IInsightBundleInputMetric;
  };
}

interface IInsightBundleMetaData {
  name: string; 
  metric_id: string; 
  definition_id: string 
}
interface IBundleRequestOptions { 
  output_format: OutputFormat; 
  now?: string;
  time_zone: string 
}
interface IInsightBundleInputMetric {
  definition: IMetricDefinitionSpecification;
  metric_specification: IMetricSpecification;
  extension_options: IExtensionOptions;
  representation_options: IRepresentationOptions;
  insights_options: {settings: IInsightSetting[]};
}
export enum OutputFormat {
  UNSPECIFIED = "OUTPUT_FORMAT_UNSPECIFIED",
  HTML = "OUTPUT_FORMAT_HTML",
  TEXT = "OUTPUT_FORMAT_TEXT"
}

// https://help.tableau.com/current/api/rest_api/en-us/REST/TAG/index.html#tag/Pulse-Methods/operation/PulseInsightsService_GenerateInsightBundleDetail
// url: tableauUrl + "/api/-/pulse/insights/detail",

export interface IInsightBundleBanResponse {
  bundle_response: IInsightBundleDetailResponse;
}

interface IInsightBundleDetailResponse {
  result: IInsightBundleResponseResult;
  error: IInsightBundleResponseError;
}
interface IInsightBundleResponseResult {
  insight_groups: IInsightGroup[];
  has_errors: boolean;
  characterization: "CHARACTERIZATION_UNSPECIFIED"|"CHARACTERIZATION_NORMAL"|"CHARACTERIZATION_UNUSUAL";
}

interface IInsightBundleResponseError {
  code: string;
  message: string;
}

interface IInsightGroup {
  type: 'springboard'|'detail'|'ban';
  insights: {result: IInsightResult, error: IError}[];
  summaries: {result: ISummary, error:IError}[];
}

interface IInsightResult {
  type: 'popc'|'riskmo'|'top-contributors'|'bottom-contributors'|'top-drivers'|'top-detractors'|'unusualchange'|'currenttrend'|'newtrend';
  version: number;
  markup: string;
  viz: IViz;
  facts: IFacts;
  characterization: string;
  question: string;
  score: number;
  id: string;
}

interface IError {
  code: string;
  message: string;
}

interface IField {}

interface IViz {
  fields: Record<string, IField>;
}

interface IFacts {
  fields: Record<string, IField>;
}

interface ISummary {
  result: ISummaryResult;
  error: IError;
}

interface ISummaryResult {
  id: string;
  markup: string;
  viz: IViz;
  generation_id: string;
  timestamp: string;
  last_attempted_timestamp: string;
}


// NOT YET USED


/*


interface __IGetMetricResponse {
  datasource: IDataSource;
  viz_state_specification: IVizStateSpecification;
}
interface ___IGetMetricResponse {
  id: string;
  specification: IMetricSpecification;
  definition_id: string;
  is_default: boolean;
  schema_version: string;
}


interface IDataSource {
  id: string;
}

interface IVizStateSpecification {
  viz_state_string: string;
}

interface IDataModelColumn {
  name: {
      component: string[];
  };
  fieldType: string;
  vtagg: string;
  pivotStrategy: string;
  role: string;
  dataType: string;
  instance: {
      baseColumn: {
          component: string[];
      };
      agg: string;
  };
}

interface IDataModelDataSource {
  columnsToAdd: IDataModelColumn[];
}

interface IDataModelContextSpecification {
  sampleCount: number;
  sampleUnits: string;
  normalization: string;
}

interface IDataModel {
  dataSource: IDataModelDataSource[];
  parameters: { name: { component: string[] }; value: { real: number } }[];
  contextSpecification: IDataModelContextSpecification;
  name: string;
  displayMemberAliases: boolean;
}













interface IInsightsOptions {
  show_insights: boolean;
  settings: any[]; // Define settings type
}




















interface INumberUnits {
  singular_noun: string;
  plural_noun: string;
}

interface IRowLevelIdField {
  identifier_col: string;
  identifier_label: string;
}

interface IRowLevelEntityNames {
  entity_name_singular: string;
  entity_name_plural: string;
}















interface IInsight {
  result: IInsightResult;
  error: IInsightError;
}












*/