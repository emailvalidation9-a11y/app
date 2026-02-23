import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { publicApi } from '@/services/api';
import { toast } from 'sonner';

interface BlogPost {
  title: string;
  category: string;
  publishedAt: string;
  excerpt: string;
  slug: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await publicApi.getBlogPosts();
        setPosts(res.data?.data?.posts || []);
      } catch (error) {
        toast.error('Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col gap-0 animate-fade-in relative z-10 w-full min-h-screen">
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <BookOpen className="h-3.5 w-3.5 mr-2 inline-block" /> Updates & Guides
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-foreground drop-shadow-sm">
            Our <span className="text-primary">Blog</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Read our latest news, updates, and simple guides on how to keep your email lists healthy.
          </p>
        </div>
      </section>

      <section className="py-12 pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center text-muted-foreground p-8 bg-card/40 border border-border/40 rounded-xl backdrop-blur-md">No posts found. Please check back later!</div>
            ) : (
              posts.map((post, i) => (
                <Card key={i} className="bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/50 transition-all shadow-md group cursor-pointer hover:-translate-y-1">
                  <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant="outline" className="bg-background border-border/50 text-xs font-mono">{post.category}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3" /> {new Date(post.publishedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">{post.title}</h2>
                      <p className="text-muted-foreground">{post.excerpt}</p>
                    </div>
                    <div className="shrink-0 mt-4 md:mt-0">
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full border border-border/50 bg-background/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}