import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Settings as SettingsIcon, User, Database, Bell, Moon, Sun, Download, Upload, Trash2, LogOut, Shield, Palette } from 'lucide-react';
import localDatabase from '../lib/localDatabase';

const Settings: React.FC = () => {
  const { state: userState, dispatch } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/auth');
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await localDatabase.initialize();
      const trades = await localDatabase.getTrades();
      const watchlist = await localDatabase.getWatchlist();
      const alerts = await localDatabase.getAlerts();
      
      const exportData = {
        trades,
        watchlist,
        alerts,
        user: userState.user,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `tradenote-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // Validate import data structure
      if (!importData.trades || !importData.user) {
        throw new Error('Invalid import file format');
      }
      
      await localDatabase.initialize();
      
      // Import trades
      for (const trade of importData.trades) {
        await localDatabase.createTrade(trade);
      }
      
      // Import watchlist
      if (importData.watchlist) {
        for (const item of importData.watchlist) {
          await localDatabase.addToWatchlist(item);
        }
      }
      
      // Import alerts
      if (importData.alerts) {
        for (const alert of importData.alerts) {
          await localDatabase.createAlert(alert);
        }
      }
      
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      await localDatabase.initialize();
      // Delete all trades, watchlist, and alerts
      const trades = await localDatabase.getTrades();
      for (const trade of trades) {
        if (trade.id) await localDatabase.deleteTrade(trade.id);
      }
      
      const watchlist = await localDatabase.getWatchlist();
      for (const item of watchlist) {
        await localDatabase.removeFromWatchlist(item.symbol);
      }
      
      const alerts = await localDatabase.getAlerts();
      for (const alert of alerts) {
        if (alert.id) await localDatabase.deleteAlert(alert.id);
      }
      
      alert('All data deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data');
    }
  };

  const settingsSections = [
    {
      title: 'Profile',
      icon: <User className="w-5 h-5" />,
      items: [
        {
          label: 'Username',
          value: userState.user?.name || 'Not set',
          type: 'text'
        },
        {
          label: 'Trading Style',
          value: userState.user?.tradingStyle || 'Not set',
          type: 'text'
        },
        {
          label: 'Risk Tolerance',
          value: userState.user?.riskTolerance || 'Not set',
          type: 'text'
        },
        {
          label: 'Experience Level',
          value: userState.user?.experienceLevel || 'Not set',
          type: 'text'
        }
      ]
    },
    {
      title: 'App Settings',
      icon: <SettingsIcon className="w-5 h-5" />,
      items: [
        {
          label: 'Theme',
          value: 'UltraTrader Dark',
          type: 'select',
          options: ['UltraTrader Dark', 'Light Mode', 'Auto']
        },
        {
          label: 'Notifications',
          value: 'Enabled',
          type: 'toggle'
        },
        {
          label: 'Auto-save',
          value: 'Enabled',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Data Management',
      icon: <Database className="w-5 h-5" />,
      items: [
        {
          label: 'Export Data',
          value: 'Export all data to JSON',
          type: 'action',
          action: handleExportData,
          loading: isExporting
        },
        {
          label: 'Import Data',
          value: 'Import from JSON file',
          type: 'file',
          action: handleImportData,
          loading: isImporting
        },
        {
          label: 'Delete All Data',
          value: 'Permanently delete all data',
          type: 'danger',
          action: () => setShowDeleteConfirm(true)
        }
      ]
    }
  ];

  return (
    <div className="px-4 pt-4 pb-24 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-300 drop-shadow-glow">Settings</h1>
        <button
          onClick={handleLogout}
          className="bg-danger-500 hover:bg-danger-600 text-white rounded-full px-4 py-2 shadow-holographic transition-all duration-200 active:scale-95"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-primary-400">
                {section.icon}
              </div>
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            </div>

            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-white font-medium">{item.label}</span>
                    <p className="text-gray-400 text-sm">{item.value}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.type === 'toggle' && (
                      <button className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        {item.value === 'Enabled' ? 'ON' : 'OFF'}
                      </button>
                    )}

                    {item.type === 'select' && (
                      <select className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1 text-white text-sm">
                        {item.options?.map((option, optionIndex) => (
                          <option key={optionIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {item.type === 'action' && (
                      <button
                        onClick={item.action}
                        disabled={item.loading}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        {item.loading ? 'Exporting...' : 'Export'}
                      </button>
                    )}

                    {item.type === 'file' && (
                      <label className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg text-sm transition-colors cursor-pointer">
                        {item.loading ? 'Importing...' : 'Import'}
                        <input
                          type="file"
                          accept=".json"
                          onChange={item.action}
                          className="hidden"
                        />
                      </label>
                    )}

                    {item.type === 'danger' && (
                      <button
                        onClick={item.action}
                        className="bg-danger-500 hover:bg-danger-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="mt-6 bg-dark-800/70 rounded-xl p-4 shadow-glass backdrop-blur-xs border border-dark-700">
        <h3 className="text-lg font-semibold text-white mb-3">App Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Version</span>
            <span className="text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Build</span>
            <span className="text-white">2024.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Storage</span>
            <span className="text-white">Local SQLite</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md shadow-glass backdrop-blur-xs border border-dark-700">
            <div className="flex items-center space-x-3 mb-4">
              <Trash2 className="w-6 h-6 text-danger-400" />
              <h2 className="text-xl font-bold text-white">Delete All Data</h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              This action will permanently delete all your trades, watchlist, and settings. This cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                className="flex-1 bg-danger-500 hover:bg-danger-600 text-white py-2 rounded-lg transition-colors"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 