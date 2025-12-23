
import { Calendar, Tag, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import type { Workflow } from '../types';

interface WorkflowCardProps {
    workflow: Workflow;
    isAdmin: boolean;
    onEdit: (workflow: Workflow) => void;
    onDelete: (id: string) => void;
    onClick: (workflow: Workflow) => void;
}

export function WorkflowCard({ workflow, isAdmin, onEdit, onDelete, onClick }: WorkflowCardProps) {
    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a] transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer h-full"
            onClick={() => onClick(workflow)}
        >
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-gray-900 border-b border-white/5">
                <img
                    src={workflow.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop'}
                    alt={workflow.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/60 backdrop-blur-sm px-2 py-1 text-xs font-medium text-white border border-white/10">
                        {workflow.category}
                    </span>
                </div>

                <div className="absolute top-3 left-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold text-black border ${workflow.difficulty === 'Beginner' ? 'bg-green-400 border-green-500' :
                        workflow.difficulty === 'Intermediate' ? 'bg-yellow-400 border-yellow-500' :
                            'bg-red-400 border-red-500'
                        }`}>
                        {workflow.difficulty}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(workflow.date_added).toLocaleDateString()}
                    </span>
                </div>

                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                    {workflow.title}
                </h3>

                <p className="mb-4 text-sm text-gray-400 line-clamp-2 flex-1">
                    {workflow.brief_description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {workflow.tags?.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                                <Tag className="h-3 w-3" />
                                {tag}
                            </span>
                        ))}
                        {workflow.tags && workflow.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{workflow.tags.length - 2}</span>
                        )}
                    </div>

                    <button className="flex items-center gap-1 text-sm font-medium text-purple-400 transition-colors group-hover:text-purple-300 whitespace-nowrap">
                        View Details <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Admin Controls */}
            {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(workflow); }}
                        className="rounded-full bg-black/60 p-2 text-blue-400 backdrop-blur-sm hover:bg-black/80 transition-colors border border-white/10"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(workflow.id); }}
                        className="rounded-full bg-black/60 p-2 text-red-400 backdrop-blur-sm hover:bg-black/80 transition-colors border border-white/10"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
