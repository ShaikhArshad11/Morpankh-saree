import { Check, Trash2, Star } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useStore } from '@/store/useStore';
import { toast } from '@/hooks/use-toast';

const AdminReviews = () => {
  const { reviews, approveReview, deleteReview } = useStore();
  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Reviews Management</h1>

      {/* Pending */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          Pending Approval
          {pending.length > 0 && <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">{pending.length}</span>}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-xl p-6 border border-border">No pending reviews.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="bg-card rounded-xl p-4 border border-border flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm shrink-0">{r.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{r.name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { approveReview(r.id); toast({ title: 'Review approved' }); }} className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors" title="Approve">
                    <Check className="h-4 w-4 text-primary" />
                  </button>
                  <button onClick={() => { deleteReview(r.id); toast({ title: 'Review deleted' }); }} className="p-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved */}
      <h2 className="font-display text-lg font-semibold mb-4">Approved Reviews ({approved.length})</h2>
      <div className="space-y-3">
        {approved.map((r) => (
          <div key={r.id} className="bg-card rounded-xl p-4 border border-border flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">{r.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{r.name}</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </div>
            <button onClick={() => { deleteReview(r.id); toast({ title: 'Review deleted' }); }} className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0">
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
