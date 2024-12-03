import React, { PropsWithChildren, useEffect, useState } from 'react';
import {
    Button,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Text,
    Subheading,
    Flex,
    Box,
} from '@contentful/f36-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';
import { TagsEditor } from '@contentful/field-editor-tags';
import { DeleteIcon, PlusCircleIcon } from '@contentful/f36-icons';
import { SingleLineEditor } from '@contentful/field-editor-single-line';
import SortableCardList from './SortableCardList';
import { getStubbedFieldAPI } from '../get-stubbed-field-api';

interface FieldProps {
    sdk: FieldExtensionSDK;
}

interface EnhancedRepeaterField {
    items: Item[];
    args: string[];
}

/** An Item which represents an list item of the repeater app */
type Item = {
    id: string;
    data: Record<string, string>;
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
*/
function createItem(): Item {
    return {
        id: uuid(),
        data: {},
    };
}

const HideCharacterCount = ({ children }: PropsWithChildren) => (
    <div style={{ maxHeight: '2.51rem', overflow: 'hidden'}}>
        <div style={{ transform: 'translateY(-0rem)'}}>
            {children}
        </div>
    </div>
)

const createLogger = (enableDebugging: boolean) => {
    if (enableDebugging) {
        console.log('[Repeater fields]: Debugging enabled!')
        return (...args: any[]) => console.log('[Repeater fields]: ', ...args)
    }
    console.log('[Repeater fields]: Debugging disabled!')
    return () => {}
}

/** The Field component is the Repeater App which shows up 
 * in the Contentful field.
 * 
 * The Field expects and uses a `Contentful JSON field`
 */
export const RepeaterField = (props: FieldProps) => {
    const { enableDebugging = false, defaultKeyNames: defaultKeyNamesString, allowAdditionalKeyNames } = props.sdk.parameters.instance as any;

    const defaultKeyNames = defaultKeyNamesString ? (defaultKeyNamesString as string).split(',').map(str => str.trim()) : [];

    const log = createLogger(enableDebugging)
    log('value', props.sdk.field.getValue())
    const [items, setItems] = useState<Item[]>([]);
    const [args, setArgs] = useState<string[]>(defaultKeyNames);


    useEffect(() => {
        // Every time we change the value on the field, we update internal state
        const unsubscribe = props.sdk.field.onValueChanged((value: EnhancedRepeaterField | undefined) => {
            log('onchange', {value})
            if (!value) return;
            setItems(value.items);
            setArgs(value.args);
        });
        return () => {
            unsubscribe()
        }
    });

    const getCurrentFieldState = (): EnhancedRepeaterField => ({
        items,
        args,
    })

    const setFieldValue = (args: Partial<EnhancedRepeaterField>) => {
        const currentFieldState = getCurrentFieldState();
        const newValue = { ...currentFieldState, ...args }
        log({ newValue })
        return props.sdk.field.setValue(newValue);
    }
    
    /** Adds another item to the list */
    const addNewItem = () => {
        setFieldValue({ items: [...items, createItem()] });
    };

    const setNewItemOrder = (newItems: Item[]) => {
        setFieldValue({ items: newItems });
    }

    const setArgsValue = (newArgs: string[]) => {
        log('setting newArgs! ', args)
        if (newArgs.length < args.length) {
            const deletedArg = args.find(arg => !newArgs.includes(arg))
            log({ deletedArg})
            if (deletedArg) {
                return setFieldValue({
                    args: newArgs,
                    items: items.map(item => {
                        delete item.data[deletedArg]
                        return item
                    })
                })
            }
        }
        return setFieldValue({ args: newArgs });
    }

    const createSetDataValue = (item: Item, property: string) => (value: string) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);

        itemList.splice(index, 1, { ...item, data: {
                ...item.data,
                [property]: value,
            }
        });

        return setFieldValue({ items: itemList });
    }

    /** Deletes an item from the list */
    const deleteItem = (item: Item) => {
        setFieldValue({ items: items.filter((i) => i.id !== item.id) });
    };

    const stubbedArgsFieldSdk = getStubbedFieldAPI(props.sdk.field, {
        ...props.sdk.field,
        id: props.sdk.field.id + '.args',
        name: props.sdk.field.name + ' Arguments',
        getValue: () => props.sdk.field.getValue()?.args ?? [],
        setValue: (value: any) => setArgsValue(value as string[]),
        removeValue: () => {
            setArgsValue([])
            return Promise.resolve()
        },
        onValueChanged: (callback: (value: any) => void) => () => callback(props.sdk.field.getValue()?.args ?? []),
    })
    return (
        <div>
            { allowAdditionalKeyNames && <TagsEditor field={stubbedArgsFieldSdk} isInitiallyDisabled={false} /> }
            <Subheading>Items</Subheading>
            <SortableCardList<Item> items={items} onSortEnd={setNewItemOrder}>
            {
                items.map((item: Item, itemIdx) => (
                    <SortableCardList.Card key={item.id} item={item}>
                        <Box padding="spacingS">
                            <Flex flexDirection='row' justifyContent='space-between' alignItems='center' marginBottom="spacingS">
                                <Subheading marginBottom='none'>
                                    Item {itemIdx + 1}
                                </Subheading>
                                <Button
                                    variant="negative"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => deleteItem(item)}
                                    >
                                    
                                    Delete Item
                                </Button>
                            </Flex>
                            <Table layout='inline' style={{ borderRadius: 0 }}>
                                <TableBody>
                                    {
                                        args.map((arg, argIdx) => {
                                            const setDataValue = createSetDataValue(item, arg)
                                            const getValue = () => props.sdk.field.getValue()?.items?.[itemIdx]?.data[arg] || ''
                                            
                                            return (
                                                <TableRow key={arg + argIdx}>
                                                    <TableCell>
                                                        <Text fontWeight="fontWeightDemiBold" as="p" style={{ verticalAlign: 'middle', lineHeight: '2rem'}}>
                                                            {arg}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell>
                                                        <HideCharacterCount>
                                                            <SingleLineEditor 
                                                                isInitiallyDisabled={false}
                                                                withCharValidation={false}
                                                                locales={props.sdk.locales}
                                                                field={getStubbedFieldAPI(props.sdk.field, {
                                                                    id: `${props.sdk.field.name}.items[${itemIdx}]`,
                                                                    type: 'Symbol',
                                                                    name: `Item ${itemIdx + 1}`,
                                                                    getValue: () => {
                                                                        const value = getValue()
                                                                        log({value})
                                                                        return value
                                                                    },
                                                                    setValue: (value: any) => setDataValue(value as string),
                                                                    removeValue: () => {
                                                                        setDataValue('')
                                                                        return Promise.resolve()
                                                                    },
                                                                    onValueChanged: (callback: (value: any) => void) => () => callback(getValue()),

                                                                })}
                                                            />
                                                        </HideCharacterCount>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </Box>
                    </SortableCardList.Card>
                ))
            }
            </SortableCardList>
            <Button
                variant="transparent"
                onClick={addNewItem}
                startIcon={<PlusCircleIcon />}
                style={{ marginTop: tokens.spacingS }}
            >
                Add Item
            </Button>
        </div>
    );
};