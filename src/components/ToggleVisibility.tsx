import React from 'react';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { getStubbedFieldAPI } from '../get-stubbed-field-api';
import { BooleanEditor } from '@contentful/field-editor-boolean';
import { Box, Text } from '@contentful/f36-components';

interface ToggleVisibilityProps {
  fieldId: string;
  sdk: FieldExtensionSDK;
}


export const ToggleVisibility: React.FC<ToggleVisibilityProps> = ({ fieldId, sdk }) => {
  const visibilityFieldApi = sdk.entry.fields[fieldId].getForLocale(sdk.locales.default);
  const stubbedFieldApi = getStubbedFieldAPI(visibilityFieldApi, {
    getValue: () => sdk.entry.fields[fieldId].getValue(),
    setValue: (value) => sdk.entry.fields[fieldId].setValue(value),
  })
  
  return (
    <Box marginBottom="spacingS">
      <Text
        marginBottom="spacingXs"
        fontColor="gray900"
        fontWeight="fontWeightMedium"
        fontSize="fontSizeM"
        lineHeight="lineHeightM"
      >
        {visibilityFieldApi.name}
      </Text>
      <BooleanEditor field={stubbedFieldApi} isInitiallyDisabled={false}/>
    </Box>

  )
};
