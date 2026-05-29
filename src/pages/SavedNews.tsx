import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExternalLink, Trash2, Loader2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SavedPostData {
  id: string; // Document ID
  newsId: string;
  title: string;
  url: string;
  source: string;
  createdAt: string;
}

export function SavedNews() {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<SavedPostData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSaved = async () => {
      if (!user) return;
      setLoading(true);
      const path = 'savedPosts';
      try {
        const q = query(collection(db, 'savedPosts'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedPostData));
        setSavedPosts(posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err: any) {
        toast.error("Failed to fetch saved posts");
        handleFirestoreError(err, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  const handleDelete = async (postId: string) => {
    const path = `savedPosts/${postId}`;
    try {
      await deleteDoc(doc(db, 'savedPosts', postId));
      setSavedPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post removed from saved");
    } catch(err) {
      toast.error("Failed to remove post");
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <Bookmark className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Sign in to view saved posts</h2>
        <p className="text-muted-foreground max-w-sm">
          Please sign in using the sidebar to view and manage your saved news articles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bookmark className="w-6 h-6" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Saved Posts</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <Card key={i} className="animate-pulse">
               <CardHeader>
                 <div className="h-6 bg-muted mb-2 w-3/4 rounded" />
                 <div className="h-4 bg-muted w-1/2 rounded" />
               </CardHeader>
             </Card>
          ))}
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No saved posts yet.</p>
          <p className="text-sm mt-2">Bookmark posts from the feeds to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {savedPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader>
                     <div className="text-xs text-muted-foreground mb-1">{post.source || "Unknown source"}</div>
                     <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                     <CardDescription>
                       Saved on {new Date(post.createdAt).toLocaleDateString()}
                     </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-4 flex gap-2">
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "outline", className: "flex-1" })}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" /> Read Original
                    </a>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
