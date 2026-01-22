export enum FeishuBitableFieldType {
  TEXT = 1,
  NUMBER = 2,
  BOOLEAN = 3,
  DATE = 4,
  DATETIME = 5,
  TIME = 6,
  SELECT = 7,
  MULTI_SELECT = 8,
  USER = 11,
  EMAIL = 13,
  PHONE = 15,
  URL = 17,
  FILE = 19,
  LINK = 21,
  LOCATION = 22,
  GROUP = 23,
}

export enum FeishuBitableFieldUiType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
}

export interface FeishuBitableFieldInfo {
  field_id: string;
  field_name: string;
  is_hidden: boolean;
  is_primary: boolean;
  type: FeishuBitableFieldType;
  ui_type: FeishuBitableFieldUiType;
}