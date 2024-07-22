import React, { PropsWithChildren, CSSProperties } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  verticalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { Card, CardProps, DragHandle, Flex, Stack } from '@contentful/f36-components';
import { CSS } from '@dnd-kit/utilities';

interface DragableItem {
  id: string;
}

// interface DragProps {
//   withDragHandle: true;
//   isDragging: boolean;
//   // style: React.CSSProperties;
//   // dragHandleRender: CardProps['dragHandleRender'];
//   ref: (node: HTMLElement | null) => void;
// }

// type RenderItemFn = (item: DragableItem) => JSX.Element;

type SortableCardListProps<T extends DragableItem> = {
  onSortEnd: (result: T[]) => void;
  items: T[];
};

function DragableItem<T extends DragableItem,>({ item, children, }: PropsWithChildren<{
  item: T;
}>){
  const { id } = item;
  const { attributes, listeners, setNodeRef, transform, transition, active } =
    useSortable({
      id,
    });
  
  const zIndex = active && active.id === id ? 1 : 0;

  const style = {
    position: 'relative' as CSSProperties['position'],
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex,
  };

  return (
    <Card
      ref={setNodeRef}
      withDragHandle
      // isDragging={isDragging}
      dragHandleRender={() => (
        <DragHandle
          as="button"
          style={{alignSelf: 'stretch'}}
          label="Move card"
          {...attributes}
          {...listeners}
        />
      )}
      padding="none"
      style={style}
    >
      {children}
    </Card>
  )
}


export default function SortableCardList<T extends DragableItem,>({ onSortEnd, items, children }: PropsWithChildren<SortableCardListProps<T>>) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = items.findIndex((item: DragableItem) => item.id === active.id);
      const newIndex = items.findIndex((item: DragableItem) => item.id === over.id);
      const result = arrayMove(items, oldIndex, newIndex);
      onSortEnd?.(result);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <Stack flexDirection="column">
          { children }
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

SortableCardList.Card = DragableItem;