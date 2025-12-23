
import type { Workflow } from '../types';
import { WorkflowCard } from './WorkflowCard';
import { Loader2 } from 'lucide-react';

interface WorkflowGridProps {
    workflows: Workflow[];
    isLoading: boolean;
    isAdmin: boolean;
    onEdit: (workflow: Workflow) => void;
    onDelete: (id: string) => void;
    onClick: (workflow: Workflow) => void;
}

export function WorkflowGrid({ workflows, isLoading, isAdmin, onEdit, onDelete, onClick }: WorkflowGridProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            </div>
        );
    }

    if (workflows.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p className="text-lg">No workflows found.</p>
                <p className="text-sm">Try adjusting your search or categories.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
                <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={onClick}
                />
            ))}
        </div>
    );
}
