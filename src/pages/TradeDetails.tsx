import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import localDatabase, { Trade } from '../lib/localDatabase';
import { Edit, Trash2, Save, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

const TradeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Trade>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadTrade(id);
  }, [id]);

  const loadTrade = async (tradeId: string) => {
    await localDatabase.initialize();
    const trades = await localDatabase.getTrades();
    const found = trades.find(t => t.id === tradeId);
    setTrade(found || null);
    setForm(found || {});
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'tags' ? value.split(',').map(t => t.trim()) : value }));
  };

  const saveTrade = async () => {
    if (!trade) return;
    setIsSaving(true);
    try {
      const updated: Trade = {
        ...trade,
        ...form,
        entryPrice: Number(form.entryPrice),
        exitPrice: form.exitPrice ? Number(form.exitPrice) : undefined,
        quantity: Number(form.quantity),
        updatedAt: new Date().toISOString()
      };
      await localDatabase.updateTrade(updated);
      setIsEditing(false);
      await loadTrade(trade.id!);
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTrade = async () => {
    if (!trade) return;
    if (!window.confirm('Delete this trade? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await localDatabase.deleteTrade(trade.id!);
      navigate('/journal');
    } catch (error) {
      alert('Failed to delete trade');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!trade) {
    return (
      <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center text-gray-400">Trade not found.</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate('/journal')} className="mr-2 p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
          <ArrowLeft className="w-5 h-5 text-primary-400" />
        </button>
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow flex-1">Trade Details</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="ml-2 p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors">
            <Edit className="w-5 h-5" />
          </button>
        )}
        {!isEditing && (
          <button onClick={deleteTrade} disabled={isDeleting} className="ml-2 p-2 rounded-lg bg-danger-500 hover:bg-danger-600 text-white transition-colors disabled:opacity-50">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="bg-dark-800/70 rounded-xl p-6 shadow-glass backdrop-blur-xs border border-dark-700">
        {isEditing ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Symbol *</label>
                <input type="text" name="symbol" value={form.symbol} onChange={handleInput} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
                <select name="type" value={form.type} onChange={handleInput} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white">
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Entry Price *</label>
                <input type="number" name="entryPrice" value={form.entryPrice} onChange={handleInput} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Exit Price</label>
                <input type="number" name="exitPrice" value={form.exitPrice || ''} onChange={handleInput} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Quantity *</label>
                <input type="number" name="quantity" value={form.quantity} onChange={handleInput} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Entry Date *</label>
                <input type="date" name="entryDate" value={form.entryDate?.slice(0, 10)} onChange={handleInput} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Exit Date</label>
                <input type="date" name="exitDate" value={form.exitDate?.slice(0, 10) || ''} onChange={handleInput} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                <input type="text" name="tags" value={form.tags?.join(', ') || ''} onChange={handleInput} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleInput} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" rows={3} />
            </div>
            <div className="flex space-x-2 mt-6">
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={saveTrade} disabled={isSaving} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center">
                <Save className="w-4 h-4 mr-2" />{isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-primary-200 text-lg">{trade.symbol}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${trade.type === 'buy' ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400'}`}>{trade.type.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Entry Price</span>
                  <span className="text-white">${trade.entryPrice}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Exit Price</span>
                  <span className="text-white">{trade.exitPrice ? `$${trade.exitPrice}` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-white">{trade.quantity}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Entry Date</span>
                  <span className="text-white">{trade.entryDate?.slice(0, 10)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Exit Date</span>
                  <span className="text-white">{trade.exitDate ? trade.exitDate.slice(0, 10) : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className={trade.exitDate ? 'text-success-400' : 'text-primary-400'}>{trade.exitDate ? 'Closed' : 'Open'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              {trade.profit !== undefined && (
                <>
                  {trade.profit >= 0 ? <TrendingUp className="w-4 h-4 text-success-400" /> : <TrendingDown className="w-4 h-4 text-danger-400" />}
                  <span className={`font-bold ${trade.profit >= 0 ? 'text-success-400' : 'text-danger-400'}`}>{trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}</span>
                </>
              )}
            </div>
            {trade.notes && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-1">Notes</h3>
                <div className="bg-dark-700/70 rounded-lg p-3 text-gray-200 text-sm italic">{trade.notes}</div>
              </div>
            )}
            {trade.tags && trade.tags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-1">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {trade.tags.map((tag, i) => (
                    <span key={i} className="bg-primary-900/40 text-primary-200 px-2 py-0.5 rounded-full text-xs">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TradeDetails; 