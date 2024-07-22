import React from 'react';
import { createRoot } from 'react-dom/client';

import { FieldExtensionSDK, init, locations } from '@contentful/app-sdk';

import Field from './components/Field';

init((sdk) => {
    const container = document.getElementById('root')!;
    const root = createRoot(container);
    const ComponentLocationSettings = [
        {
            location: locations.LOCATION_ENTRY_FIELD,
            component: <Field sdk={sdk as FieldExtensionSDK} />,
        },
    ];

    // Select a component depending on a location in which the app is rendered.
    ComponentLocationSettings.forEach((componentLocationSetting) => {
        if (sdk.location.is(componentLocationSetting.location)) {
            root.render(componentLocationSetting.component);
        }
    });
});
