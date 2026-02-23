import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    status: 'draft' | 'published';
    author: string;
    createdAt: string;
}

export default function AdminBlog() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'General',
        status: 'draft'
    });

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            const res = await adminApi.getBlogPosts();
            setPosts(res.data?.data?.posts || []);
        } catch (error) {
            toast.error('Failed to load blog posts');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleOpenDialog = (post?: BlogPost) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title || '',
                slug: post.slug || '',
                excerpt: post.excerpt || '',
                content: post.content || '',
                category: post.category || 'General',
                status: post.status || 'draft'
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                category: 'General',
                status: 'draft'
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingPost) {
                await adminApi.updateBlogPost(editingPost._id, formData);
                toast.success('Post updated');
            } else {
                await adminApi.createBlogPost(formData);
                toast.success('Post created');
            }
            setIsDialogOpen(false);
            fetchPosts();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save post');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await adminApi.deleteBlogPost(id);
            toast.success('Post deleted');
            fetchPosts();
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 animate-fade-in relative z-10 w-full min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Blog Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Create and manage content for your public learning center.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-md">
                    <Plus className="h-4 w-4" /> New Post
                </Button>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="text-center py-10 text-muted-foreground font-mono">Loading posts...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-10 bg-card/40 border-border/40 backdrop-blur-sm border rounded-2xl shadow-sm">
                        <p className="text-muted-foreground">No blog posts found. Create your first post!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Card key={post._id} className="bg-card/40 border-border/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow group">
                            <CardContent className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                <div className="flex-1 space-y-2 text-left">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg">{post.title}</h3>
                                        <Badge variant={post.status === 'published' ? 'default' : 'outline'} className={post.status === 'published' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border border-green-500/20' : ''}>
                                            {post.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{post.excerpt}</p>
                                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {post.category}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(post)} className="gap-2">
                                        <Edit className="h-3.5 w-3.5" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(post._id)} className="gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-transparent hover:border-red-500/20 shadow-none">
                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] border-border/50 bg-card/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle>{editingPost ? 'Edit Post' : 'New Post'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Post title" />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (URL marking)</Label>
                                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="post-title" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Engineering" />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Excerpt</Label>
                            <Input value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Short summary" />
                        </div>
                        <div className="space-y-2">
                            <Label>Content (Markdown)</Label>
                            <Textarea
                                className="min-h-[200px] font-mono text-sm"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="# Heading\n\nWrite your markdown content here..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{editingPost ? 'Save Changes' : 'Create Post'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
