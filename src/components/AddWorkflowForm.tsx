import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Save, FileJson, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Category } from '../types';

interface AddWorkflowFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function AddWorkflowForm({ onClose, onSuccess, initialData }: AddWorkflowFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        brief_description: '',
        full_description: '',
        category: '',
        difficulty: 'Beginner',
        use_case: '',
        tags: '',
        tools_used: '',
        image_url: '',
        workflow_json: null as any
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        fetchCategories();
        if (initialData) {
            setFormData({
                ...initialData,
                tags: initialData.tags?.join(', ') || '',
                tools_used: initialData.tools_used?.join(', ') || '',
            });
            if (initialData.image_url) {
                setImagePreview(initialData.image_url);
            }
        }

        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, [initialData]);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*');
        if (data) setCategories(data);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be under 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string);
                    setFormData(prev => ({ ...prev, workflow_json: json }));
                    toast.success('JSON loaded successfully');
                } catch (err) {
                    toast.error('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.image_url;

            // Upload Image if new file selected
            if (imageFile) {
                setUploading(true);
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('workflow-images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('workflow-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
                setUploading(false);
            }

            if (!imageUrl) {
                toast.error('Please upload an image');
                setLoading(false);
                return;
            }

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('Not authenticated');

            const payload = {
                title: formData.title,
                brief_description: formData.brief_description,
                full_description: formData.full_description,
                category: formData.category,
                difficulty: formData.difficulty,
                use_case: formData.use_case,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                tools_used: formData.tools_used.split(',').map(t => t.trim()).filter(Boolean),
                image_url: imageUrl,
                workflow_json: formData.workflow_json,
                updated_at: new Date().toISOString()
            };

            if (initialData?.id) {
                const { error } = await supabase
                    .from('workflows')
                    .update(payload)
                    .eq('id', initialData.id);
                if (error) throw error;
                toast.success('Workflow updated successfully');
            } else {
                const { error } = await supabase
                    .from('workflows')
                    .insert([{ ...payload, author_id: user.id }]);
                if (error) throw error;
                toast.success('Workflow created successfully');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error saving workflow');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl custom-scrollbar">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#1a1a1a]/95 px-6 py-4 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? 'Edit Workflow' : 'Add New Workflow'}
                    </h2>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Title *</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder="e.g. Notion to Slack Sync"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Category *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Brief Description (Max 150 chars) *</label>
                        <textarea
                            required
                            maxLength={150}
                            value={formData.brief_description}
                            onChange={e => setFormData({ ...formData, brief_description: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[80px]"
                            placeholder="Short summary for the card view..."
                        />
                        <div className="text-right text-xs text-gray-500">
                            {formData.brief_description.length}/150
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Full Description *</label>
                        <textarea
                            required
                            value={formData.full_description}
                            onChange={e => setFormData({ ...formData, full_description: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[150px]"
                            placeholder="Detailed explanation of the workflow..."
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Difficulty Level *</label>
                            <select
                                required
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder="api, automation, slack..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Tools / Nodes Used (comma separated)</label>
                        <input
                            type="text"
                            value={formData.tools_used}
                            onChange={e => setFormData({ ...formData, tools_used: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Webhook, HTTP Request, Google Sheets..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Use Case (Optional)</label>
                        <textarea
                            value={formData.use_case}
                            onChange={e => setFormData({ ...formData, use_case: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[100px]"
                            placeholder="Real-world scenario where this helps..."
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Workflow Image *</label>
                            <div
                                className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-black/20 p-6 transition-colors hover:border-purple-500/50 hover:bg-white/5"
                                onClick={() => document.getElementById('image-upload')?.click()}
                            >
                                {imagePreview ? (
                                    <div className="relative w-full aspect-video">
                                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-sm font-medium text-white">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
                                        <p className="text-sm text-gray-400">Click to upload (Max 5MB)</p>
                                    </div>
                                )}
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Workflow JSON (Optional)</label>
                            <div
                                className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-black/20 p-6 transition-colors hover:border-purple-500/50 hover:bg-white/5"
                                onClick={() => document.getElementById('json-upload')?.click()}
                            >
                                {formData.workflow_json ? (
                                    <div className="flex flex-col items-center text-center">
                                        <FileJson className="mb-2 h-8 w-8 text-green-500" />
                                        <p className="text-sm text-green-400">JSON Loaded</p>
                                        <p className="text-xs text-gray-500">Click to replace</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                        <p className="text-sm text-gray-400">Upload .json file</p>
                                    </div>
                                )}
                                <input
                                    id="json-upload"
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleJsonChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {uploading ? 'Uploading...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Workflow
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
