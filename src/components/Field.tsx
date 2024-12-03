import React, { useEffect, useState } from 'react';
import { Box, GlobalStyles } from '@contentful/f36-components';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { ToggleVisibility } from './ToggleVisibility';
import { RepeaterField } from './RepeaterField';

interface FieldProps {
    sdk: FieldExtensionSDK;
}

const createLogger = (enableDebugging: boolean) => {
    if (enableDebugging) {
        console.log('[Repeater fields: Field]: Debugging enabled!')
        return (...args: any[]) => console.log('[Repeater fields: Field]: ', ...args)
    }
    console.log('[Repeater fields: Field]: Debugging disabled!')
    return () => {}
}

/** The Field component is the Repeater App which shows up 
 * in the Contentful field.
 * 
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = ({ sdk }: FieldProps) => {
    const { enableDebugging = false, toggleVisbilityField, defaultKeyNames: defaultKeyNamesString } = sdk.parameters.instance;
    const [showRepeaterField, setShowRepeaterField] = useState(false);
    useEffect(() => {
        sdk.window.startAutoResizer();
    })
    useEffect(() => {
        if (!toggleVisbilityField) {
            setShowRepeaterField(true);
            return;
        }
        const unsubscribe = sdk.entry.fields[toggleVisbilityField]?.onValueChanged((value) => {
            setShowRepeaterField(value);
        })
        return () => unsubscribe();
    }, [toggleVisbilityField, sdk])

    const log = createLogger(enableDebugging);
    
    const hasVisibilityControls = Boolean(toggleVisbilityField)
    
    if (!hasVisibilityControls) {
        log('No visibility controls found. Showing repeater field by default.')
    }

    if (!showRepeaterField) {
        log('Repeater field is hidden.')
    }
    return (
        <Box>
            <GlobalStyles />
            { hasVisibilityControls && (
                <ToggleVisibility sdk={sdk} fieldId={toggleVisbilityField}/>
            )}
            {
                showRepeaterField && (
                    <RepeaterField sdk={sdk} />
                )
            }
        </Box>
    )
};

export default Field;
