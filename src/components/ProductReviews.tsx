import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user_name: string | null;
  created_at: string;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        onClick={() => interactive && onRate?.(star)}
        disabled={!interactive}
        className={`text-sm transition-colors ${star <= rating ? 'text-gold' : 'text-border'} ${interactive ? 'cursor-pointer hover:text-gold' : 'cursor-default'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const ProductReviews = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Faça login para avaliar');
      return;
    }
    if (newRating === 0) {
      toast.error('Selecione uma avaliação');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert([{
      user_id: user.id,
      product_id: productId,
      rating: newRating,
      comment: newComment || null,
      user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anônimo',
    }]);
    setSubmitting(false);
    if (error) {
      toast.error('Erro ao enviar avaliação');
    } else {
      toast.success('Avaliação enviada!');
      setNewRating(0);
      setNewComment('');
      fetchReviews();
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="border-t border-border pt-12 mt-12">
      <h3 className="font-heading text-xl tracking-[0.15em] text-foreground">AVALIAÇÕES</h3>
      <div className="mt-2 w-8 h-px bg-gold" />

      {avgRating && (
        <div className="mt-4 flex items-center gap-3">
          <StarRating rating={Math.round(Number(avgRating))} />
          <span className="font-body text-sm text-muted-foreground">{avgRating} ({reviews.length})</span>
        </div>
      )}

      {/* Submit review */}
      {user && (
        <div className="mt-8 border border-border p-6">
          <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground mb-3">SUA AVALIAÇÃO</p>
          <StarRating rating={newRating} onRate={setNewRating} interactive />
          <textarea
            className="mt-4 w-full bg-transparent border-b border-border py-2 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold resize-none"
            rows={2}
            placeholder="Comentário (opcional)"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 font-body text-[10px] tracking-[0.3em] text-foreground/70 border-b border-foreground/20 pb-1 gold-hover disabled:opacity-50"
          >
            {submitting ? 'ENVIANDO...' : 'ENVIAR'}
          </button>
        </div>
      )}

      {/* Reviews list */}
      <div className="mt-8 flex flex-col gap-6">
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="border-b border-border/30 pb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StarRating rating={review.rating} />
                <span className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">
                  {review.user_name || 'ANÔNIMO'}
                </span>
              </div>
              <span className="font-body text-[9px] text-muted-foreground/50">
                {new Date(review.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {review.comment && (
              <p className="mt-2 font-body text-sm text-foreground/60 leading-relaxed">{review.comment}</p>
            )}
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 && (
        <p className="mt-6 font-body text-sm text-muted-foreground/50">Nenhuma avaliação ainda.</p>
      )}
    </div>
  );
};

export default ProductReviews;
