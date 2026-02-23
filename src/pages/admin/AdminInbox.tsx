import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Inbox, CheckCircle, Clock, Trash2, MailOpen, User, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    createdAt: string;
}

export default function AdminInbox() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const res = await adminApi.getContactMessages();
            setMessages(res.data?.data?.messages || []);
        } catch (error) {
            toast.error('Failed to load inbox');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await adminApi.updateContactMessageStatus(id, newStatus);
            toast.success('Status updated');
            fetchMessages();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await adminApi.deleteContactMessage(id);
            toast.success('Message deleted');
            fetchMessages();
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'unread':
                return <Badge variant="default" className="bg-red-500 text-white shadow-none border border-transparent font-bold tracking-widest uppercase">Unread</Badge>;
            case 'read':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 shadow-none border border-blue-500/20 font-bold tracking-widest uppercase">Read</Badge>;
            case 'replied':
                return <Badge variant="outline" className="bg-green-500/10 text-green-500 shadow-none border border-green-500/20 font-bold tracking-widest uppercase">Replied</Badge>;
            default:
                return <Badge variant="outline" className="bg-background text-foreground shadow-none">{status}</Badge>;
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 animate-fade-in relative z-10 w-full min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <Inbox className="h-6 w-6 text-primary" /> Communications
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Manage incoming tickets and messages from public pages.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="text-center py-10 text-muted-foreground font-mono">Loading communications...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 bg-card/40 border-border/40 backdrop-blur-sm border rounded-2xl shadow-sm">
                        <p className="text-muted-foreground">Inbox is empty. No new transmissions.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <Card key={msg._id} className={`bg-card/40 border-border/40 backdrop-blur-sm shadow-sm transition-shadow group relative overflow-hidden ${msg.status === 'unread' ? 'ring-1 ring-primary/20 bg-primary/5' : ''}`}>
                            {msg.status === 'unread' && <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary"></div>}
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                {msg.subject || 'No Subject Provided'}
                                            </h3>
                                            {getStatusBadge(msg.status)}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-foreground/50" /> <span className="font-semibold text-foreground/80">{msg.name}</span></span>
                                            <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"><MailOpen className="h-4 w-4" /> <span className="underline decoration-muted font-mono">{msg.email}</span></a>
                                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-foreground/50" /> {new Date(msg.createdAt).toLocaleString()}</span>
                                        </div>

                                        <div className="bg-background/50 border border-border/50 rounded-xl p-4 mt-4 font-mono text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                            {msg.message}
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-40 items-stretch">
                                        {msg.status === 'unread' && (
                                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(msg._id, 'read')} className="gap-2 justify-start font-semibold border-primary/20 text-primary hover:bg-primary/10 w-full">
                                                <CheckCircle className="h-4 w-4" /> Mark as Read
                                            </Button>
                                        )}
                                        {msg.status !== 'replied' && (
                                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(msg._id, 'replied')} className="gap-2 justify-start font-semibold border-green-500/20 text-green-500 hover:bg-green-500/10 w-full">
                                                <Tag className="h-4 w-4" /> Mark Replied
                                            </Button>
                                        )}
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(msg._id)} className="gap-2 justify-start border border-transparent bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none font-bold w-full">
                                            <Trash2 className="h-4 w-4" /> Delete Ticket
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
