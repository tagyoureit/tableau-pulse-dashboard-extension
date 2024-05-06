"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputFormat = void 0;
var TimeComparison;
(function (TimeComparison) {
    TimeComparison["UNSPECIFIED"] = "TIME_COMPARISON_UNSPECIFIED";
    TimeComparison["NONE"] = "TIME_COMPARISON_NONE";
    TimeComparison["PREVIOUS_PERIOD"] = "TIME_COMPARISON_PREVIOUS_PERIOD";
    TimeComparison["YEAR_AGO_PERIOD"] = "TIME_COMPARISON_YEAR_AGO_PERIOD";
})(TimeComparison || (TimeComparison = {}));
var Granularity;
(function (Granularity) {
    Granularity["UNSPECIFIED"] = "GRANULARITY_UNSPECIFIED";
    Granularity["YEAR"] = "GRANULARITY_BY_YEAR";
    Granularity["QUARTER"] = "GRANULARITY_BY_QUARTER";
    Granularity["MONTH"] = "GRANULARITY_BY_MONTH";
    Granularity["WEEK"] = "GRANULARITY_BY_WEEK";
    Granularity["DAY"] = "GRANULARITY_BY_DAY";
})(Granularity || (Granularity = {}));
var RangeType;
(function (RangeType) {
    RangeType["UNSPECIFIED"] = "RANGE_UNSPECIFIED";
    RangeType["CURRENT_PARTIAL"] = "RANGE_CURRENT_PARTIAL";
    RangeType["LAST_COMPLETE"] = "RANGE_LAST_COMPLETE";
})(RangeType || (RangeType = {}));
var OutputFormat;
(function (OutputFormat) {
    OutputFormat["UNSPECIFIED"] = "OUTPUT_FORMAT_UNSPECIFIED";
    OutputFormat["HTML"] = "OUTPUT_FORMAT_HTML";
    OutputFormat["TEXT"] = "OUTPUT_FORMAT_TEXT";
})(OutputFormat || (exports.OutputFormat = OutputFormat = {}));
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
//# sourceMappingURL=Interface.js.map