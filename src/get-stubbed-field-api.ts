import { FieldAPI } from "@contentful/app-sdk"

export const getStubbedFieldAPI = (fieldSDK: FieldAPI, options: Partial<FieldAPI>): FieldAPI => {
  return {
      ...fieldSDK,
      // default empty implementations that you can overwrite as needed
      getValue: fieldSDK.getValue,
      setValue: fieldSDK.setValue,
      removeValue: fieldSDK.removeValue,
      onValueChanged: fieldSDK.onValueChanged,
      validations: [],
      onSchemaErrorsChanged: () => () => {},
      onIsDisabledChanged: () => () => {},
      getIsDisabled: () => false,
      getSchemaErrors: () => [],
      ...options,
  } as FieldAPI
}
