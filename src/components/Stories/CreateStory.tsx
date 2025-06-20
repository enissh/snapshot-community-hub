
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, Camera, Video, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CreateStoryProps {
  onStoryCreated?: () => void;
}

const CreateStory = ({ onStoryCreated }: CreateStoryProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith('video/') ? 'video' : 'photo';

      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: mediaType,
          caption: caption || null
        });

      if (error) throw error;

      toast.success('Story shared successfully! ✨');
      setOpen(false);
      setFile(null);
      setCaption('');
      onStoryCreated?.();
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to share story');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-accent text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-background cursor-pointer hover:scale-110 transition-transform animate-pulse-orange">
          <Plus className="h-4 w-4" />
        </div>
      </DialogTrigger>
      <DialogContent className="plaza-card max-w-lg border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Create Story
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="story-media" className="text-foreground text-large">Photo or Video</Label>
            <Input
              id="story-media"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              required
              className="bg-secondary/50 border-primary/20 text-foreground text-large"
            />
            {file && (
              <div className="text-sm text-muted-foreground flex items-center gap-2 p-3 plaza-card">
                {file.type.startsWith('video/') ? <Video className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="story-caption" className="text-foreground text-large">Caption (optional)</Label>
            <Input
              id="story-caption"
              placeholder="Add a caption to your story..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-secondary/50 border-primary/20 text-foreground placeholder:text-muted-foreground text-large"
            />
          </div>
          
          <Button type="submit" disabled={uploading} className="w-full orange-button text-large">
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Sharing Story...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Share to Story
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStory;
