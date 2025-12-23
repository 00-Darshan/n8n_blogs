import { useEffect, useState, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { Header } from './components/Header';
import { WorkflowGrid } from './components/WorkflowGrid';
import { WorkflowModal } from './components/WorkflowModal';
import { AddWorkflowForm } from './components/AddWorkflowForm';
import type { Workflow, Category } from './types';
import { Toaster, toast } from 'sonner';
import { Plus, Search, Filter } from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'darshan@example.com';

function App() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdmin(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdmin(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = (session: any) => {
    setIsAdmin(session?.user?.email === ADMIN_EMAIL);
  };

  useEffect(() => {
    fetchWorkflows();
    fetchCategories();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('date_added', { ascending: false });

    if (error) {
      toast.error('Failed to load workflows');
      console.error(error);
    } else {
      setWorkflows(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;

    const { error } = await supabase.from('workflows').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete workflow');
    } else {
      toast.success('Workflow deleted');
      fetchWorkflows();
    }
  };

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch = (workflow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.brief_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesCategory = selectedCategory === 'All' || workflow.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [workflows, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 font-sans selection:bg-purple-500/30">
      <Toaster position="top-right" theme="dark" />
      <Header session={session} />

      <main className="container mx-auto px-4 py-8">
        {/* Intro Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600 mb-4">
            Automate Your World
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A collection of production-ready n8n workflows to supercharge your productivity and systems.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="sticky top-20 z-40 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#0f0f0f]/90 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-2xl">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search workflows, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-[#1a1a1a] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <CategoryFilter
              categories={['All', ...categories.map(c => c.name)]}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* Admin Action Bar */}
        {isAdmin && (
          <div className="mb-8 flex justify-end animate-in fade-in slide-in-from-top-4 duration-500">
            <button
              onClick={() => { setEditingWorkflow(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add New Workflow
            </button>
          </div>
        )}

        {/* Grid */}
        <WorkflowGrid
          workflows={filteredWorkflows}
          isLoading={loading}
          isAdmin={isAdmin}
          onEdit={(workflow) => { setEditingWorkflow(workflow); setIsFormOpen(true); }}
          onDelete={handleDelete}
          onClick={(workflow) => { setSelectedWorkflow(workflow); setIsModalOpen(true); }}
        />
      </main>

      <Footer />

      {/* Modals */}
      <WorkflowModal
        workflow={selectedWorkflow}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {isFormOpen && (
        <AddWorkflowForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchWorkflows}
          initialData={editingWorkflow}
        />
      )}
    </div>
  );
}

function CategoryFilter({ categories, selected, onChange }: { categories: string[], selected: string, onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Filter className="h-4 w-4 text-gray-500 shrink-0" />
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-auto rounded-lg border border-white/5 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer hover:bg-[#252525] transition-colors"
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-[#0f0f0f] py-8">
      <div className="container mx-auto px-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} n8n Blog by Darshan. All rights reserved.</p>
        <p className="mt-2 text-xs text-gray-600">Built with React, Supabase, and Tailwind CSS.</p>
      </div>
    </footer>
  );
}

export default App;
