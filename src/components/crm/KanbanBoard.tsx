import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal } from 'lucide-react';

interface KanbanTask {
    id: string;
    content: string;
    company?: string;
    value?: string;
}

interface KanbanColumn {
    id: string;
    title: string;
    taskIds: string[];
}

interface KanbanData {
    tasks: Record<string, KanbanTask>;
    columns: Record<string, KanbanColumn>;
    columnOrder: string[];
}

const initialData: KanbanData = {
    tasks: {
        'task-1': { id: 'task-1', content: 'The Backyard Warrior', company: 'Jacob', value: '$12,450' },
        'task-2': { id: 'task-2', content: 'Pacific Landscaping', company: '', value: '$8,200' },
        'task-3': { id: 'task-3', content: 'Selva Garden and Design', company: 'Jonny', value: '$5,000' },
        'task-4': { id: 'task-4', content: 'Busy Wombats Landscaping', company: '', value: '$3,100' },
        'task-5': { id: 'task-5', content: 'Nature Scene Landscaping', company: 'Anthony', value: '$1,200' },
    },
    columns: {
        'lead': {
            id: 'lead',
            title: 'Lead',
            taskIds: ['task-1'],
        },
        'negotiation': {
            id: 'negotiation',
            title: 'Negotiation',
            taskIds: ['task-2'],
        },
        'onboarding': {
            id: 'onboarding',
            title: 'Onboarding',
            taskIds: ['task-3', 'task-4', 'task-5'],
        },
        'in-progress': {
            id: 'in-progress',
            title: 'In Progress',
            taskIds: [],
        },
        'finished': {
            id: 'finished',
            title: 'Finished',
            taskIds: [],
        },
    },
    columnOrder: ['lead', 'negotiation', 'onboarding', 'in-progress', 'finished'],
};

export const KanbanBoard: React.FC = () => {
    const [data, setData] = useState(initialData);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const start = data.columns[source.droppableId];
        const finish = data.columns[destination.droppableId];

        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...start,
                taskIds: newTaskIds,
            };

            setData({
                ...data,
                columns: {
                    ...data.columns,
                    [newColumn.id]: newColumn,
                },
            });
            return;
        }

        // Moving from one list to another
        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = {
            ...start,
            taskIds: startTaskIds,
        };

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = {
            ...finish,
            taskIds: finishTaskIds,
        };

        setData({
            ...data,
            columns: {
                ...data.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        });
    };

    const getColumnColor = (columnId: string) => {
        switch (columnId) {
            case 'lead': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
            case 'negotiation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'onboarding': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'in-progress': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
            case 'finished': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    return (
        <div className="h-full overflow-x-auto bg-slate-50 dark:bg-zinc-900 p-6">
            <div className="flex gap-6 h-full min-w-max">
                <DragDropContext onDragEnd={onDragEnd}>
                    {data.columnOrder.map((columnId) => {
                        const column = data.columns[columnId];
                        const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                        return (
                            <div key={column.id} className="w-80 flex flex-col bg-transparent rounded-lg h-full">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${getColumnColor(column.id)}`}>
                                        {column.title}
                                        <span className="ml-2 opacity-75">{tasks.length}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-500 dark:text-zinc-400">
                                            <Plus size={16} />
                                        </button>
                                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-500 dark:text-zinc-400">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-slate-100 dark:bg-zinc-800/50' : ''}`}
                                        >
                                            {tasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`
                                p-4 mb-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700
                                hover:shadow-md transition-shadow group
                                ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 rotate-1' : ''}
                              `}
                                                            style={{ ...provided.draggableProps.style }}
                                                        >
                                                            <div className="font-medium text-slate-800 dark:text-zinc-100 mb-1">{task.content}</div>
                                                            {task.company && (
                                                                <div className="text-sm text-slate-500 dark:text-zinc-400 mb-2">{task.company}</div>
                                                            )}
                                                            {task.value && (
                                                                <div className="text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-700 inline-block px-2 py-1 rounded">
                                                                    {task.value}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            <button className="w-full py-2 mt-2 flex items-center justify-center gap-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 border-dashed">
                                                <Plus size={16} />
                                                New page
                                            </button>
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </DragDropContext>
            </div>
        </div>
    );
};
