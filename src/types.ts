export interface Workflow {
    id: string;
    title: string;
    brief_description: string;
    full_description: string;
    image_url: string | null;
    workflow_json: any | null;
    tags: string[] | null;
    category: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    use_case: string | null;
    tools_used: string[] | null;
    date_added: string;
    views: number;
    author_id: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}
