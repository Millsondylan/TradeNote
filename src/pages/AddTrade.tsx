import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localDatabase, { Trade } from '../lib/localDatabase';
import { Plus, Upload, Camera, FileText, Save } from 'lucide-react';

const AddTrade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ocr' | 'csv'>('manual');
  const [form, setForm] = useState<Partial<Trade>>({
    symbol: '',
    type: 'buy',
    entryPrice: 0,
    exitPrice: undefined,
    quantity: 1,
    entryDate: new Date().toISOString().slice(0, 10),
    exitDate: '',
    notes: '',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [isSaving, setIsSaving] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'tags' ? value.split(',').map(t => t.trim()) : value }));
  };

  const saveTrade = async () => {
    if (!form.symbol || !form.entryPrice || !form.quantity || !form.entryDate) {
      alert('Please fill in all required fields');
      return;
    }
    setIsSaving(true);
    try {
      await localDatabase.initialize();
      const trade: Trade = {
        ...form,
        id: crypto.randomUUID(),
        entryPrice: Number(form.entryPrice),
        exitPrice: form.exitPrice ? Number(form.exitPrice) : undefined,
        quantity: Number(form.quantity),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Trade;
      await localDatabase.createTrade(trade);
      navigate('/journal');
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Failed to save trade');
    } finally {
      setIsSaving(false);
    }
  };

  // Stub for OCR capture
  const handleOcrCapture = () => {
    alert('OCR capture is not implemented in this demo.');
  };

  // Stub for CSV import
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    alert('CSV import is not implemented in this demo.');
  };

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow mb-4">Add Trade</h1>
      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manual' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-300'}`}
          onClick={() => setActiveTab('manual')}
        >
          <Plus className="inline w-4 h-4 mr-1" /> Manual Entry
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ocr' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-300'}`}
          onClick={() => setActiveTab('ocr')}
        >
          <Camera className="inline w-4 h-4 mr-1" /> OCR Capture
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'csv' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-300'}`}
          onClick={() => setActiveTab('csv')}
        >
          <FileText className="inline w-4 h-4 mr-1" /> CSV Import
        </button>
      </div>

      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <div className="bg-dark-800/70 rounded-xl p-6 shadow-glass backdrop-blur-xs border border-dark-700">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Symbol *</label>
              <input
                type="text"
                name="symbol"
                value={form.symbol}
                onChange={handleInput}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                placeholder="e.g. AAPL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleInput}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Entry Price *</label>
              <input
                type="number"
                name="entryPrice"
                value={form.entryPrice}
                onChange={handleInput}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Exit Price</label>
              <input
                type="number"
                name="exitPrice"
                value={form.exitPrice || ''}
                onChange={handleInput}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleInput}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Entry Date *</label>
              <input
                type="date"
                name="entryDate"
                value={form.entryDate}
                onChange={handleInput}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Exit Date</label>
              <input
                type="date"
                name="exitDate"
                value={form.exitDate}
                onChange={handleInput}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
              <input
                type="text"
                name="tags"
                value={form.tags?.join(', ') || ''}
                onChange={handleInput}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                placeholder="comma separated"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleInput}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              rows={3}
              placeholder="Trade notes, rationale, etc."
            />
          </div>
          <button
            onClick={saveTrade}
            disabled={isSaving}
            className="mt-6 w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-bold flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Trade'}
          </button>
        </div>
      )}

      {/* OCR Capture Tab */}
      {activeTab === 'ocr' && (
        <div className="bg-dark-800/70 rounded-xl p-6 shadow-glass backdrop-blur-xs border border-dark-700 flex flex-col items-center justify-center min-h-[200px]">
          <Camera className="w-12 h-12 text-primary-400 mb-4" />
          <p className="text-gray-300 mb-4">Capture a trade slip or screenshot to auto-fill trade details (coming soon)</p>
          <button
            onClick={handleOcrCapture}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Start OCR Capture
          </button>
        </div>
      )}

      {/* CSV Import Tab */}
      {activeTab === 'csv' && (
        <div className="bg-dark-800/70 rounded-xl p-6 shadow-glass backdrop-blur-xs border border-dark-700 flex flex-col items-center justify-center min-h-[200px]">
          <FileText className="w-12 h-12 text-primary-400 mb-4" />
          <p className="text-gray-300 mb-4">Import trades from a CSV file (coming soon)</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            className="mb-4"
          />
        </div>
      )}
    </div>
  );
};

export default AddTrade; 