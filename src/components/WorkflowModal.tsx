import { useEffect } from 'react';
import { X, Calendar, Tag, Layers, Link as LinkIcon, Download } from 'lucide-react';
import type { Workflow } from '../types';

interface WorkflowModalProps {
    workflow: Workflow | null;
    isOpen: boolean;
    onClose: () => void;
}

export function WorkflowModal({ workflow, isOpen, onClose }: WorkflowModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !workflow) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl shadow-purple-500/20 custom-scrollbar animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors border border-white/10"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Hero Image */}
                <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gray-900">
                    <img
                        src={workflow.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop'}
                        alt={workflow.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-md">{workflow.title}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-purple-200 bg-purple-500/40 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-md">
                                {workflow.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full border backdrop-blur-md ${workflow.difficulty === 'Beginner' ? 'bg-green-500/40 text-green-100 border-green-500/30' :
                                workflow.difficulty === 'Intermediate' ? 'bg-yellow-500/40 text-yellow-100 border-yellow-500/30' :
                                    'bg-red-500/40 text-red-100 border-red-500/30'
                                }`}>
                                {workflow.difficulty}
                            </span>
                            <span className="flex items-center gap-1 text-gray-200 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                                <Calendar className="h-4 w-4" />
                                {new Date(workflow.date_added).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-8">
                    {/* Detailed Description */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Layers className="h-5 w-5 text-purple-500" />
                            Description
                        </h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {workflow.full_description}
                        </p>
                    </div>

                    {/* Use Case */}
                    {workflow.use_case && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-purple-500" />
                                Use Case
                            </h3>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {workflow.use_case}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tools & Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white mb-3">Tools Used</h3>
                            <div className="flex flex-wrap gap-2">
                                {workflow.tools_used?.map((tool, idx) => (
                                    <span key={idx} className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20 text-sm">
                                        {tool}
                                    </span>
                                ))}
                                {(!workflow.tools_used || workflow.tools_used.length === 0) && (
                                    <span className="text-gray-500 italic">No specific tools listed</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white mb-3">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {workflow.tags?.map((tag, idx) => (
                                    <span key={idx} className="flex items-center gap-1 bg-white/5 text-gray-400 px-3 py-1 rounded-lg border border-white/10 text-sm">
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </span>
                                ))}
                                {(!workflow.tags || workflow.tags.length === 0) && (
                                    <span className="text-gray-500 italic">No tags</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Workflow JSON Download */}
                    {workflow.workflow_json && (
                        <div className="pt-6 border-t border-white/10">
                            <button
                                onClick={() => {
                                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workflow.workflow_json, null, 2));
                                    const downloadAnchorNode = document.createElement('a');
                                    downloadAnchorNode.setAttribute("href", dataStr);
                                    downloadAnchorNode.setAttribute("download", `${workflow.title.replace(/\s+/g, '_')}_workflow.json`);
                                    document.body.appendChild(downloadAnchorNode);
                                    downloadAnchorNode.click();
                                    downloadAnchorNode.remove();
                                }}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium border border-purple-500/50"
                            >
                                <Download className="h-4 w-4" />
                                Download Workflow JSON
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
