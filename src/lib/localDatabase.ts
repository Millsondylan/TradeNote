import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface Trade {
  id?: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: string;
  exitDate?: string;
  profit?: number;
  notes?: string;
  tags?: string[];
  confidence?: number;
  mood?: 'good' | 'neutral' | 'bad';
  stopLoss?: number;
  takeProfit?: number;
  screenshot?: string;
  strategy?: string;
  market?: string;
  session?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  tradingStyle: string;
  riskTolerance: 'low' | 'medium' | 'high';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    defaultCurrency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id?: string;
  symbol: string;
  name?: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  addedAt: string;
}

export interface Alert {
  id?: string;
  symbol: string;
  type: 'price' | 'news' | 'technical';
  condition: 'above' | 'below' | 'equals';
  value: number | string;
  message: string;
  isActive: boolean;
  createdAt: string;
}

class LocalDatabase {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;
  private isMobile = Capacitor.isNativePlatform();

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Database already initialized, skipping...');
      return;
    }

    try {
      console.log('=== Database Initialization Start ===');
      console.log('Platform:', this.isMobile ? 'Mobile' : 'Web');
      console.log('CapacitorSQLite available:', !!CapacitorSQLite);

      // Note: Permissions are handled automatically by Capacitor on mobile
      if (this.isMobile) {
        console.log('Running on mobile platform - permissions handled automatically');
      }

      // Create database connection
      console.log('Creating database connection...');
      this.db = await this.sqlite.createConnection(
        'tradenote',
        false,
        'no-encryption',
        1,
        false
      );
      console.log('Database connection created');

      console.log('Opening database...');
      await this.db.open();
      console.log('Database opened successfully');

      console.log('Creating tables...');
      await this.createTables();
      console.log('Tables created successfully');
      
      this.isInitialized = true;
      console.log('=== Database initialization complete ===');
    } catch (error) {
      console.error('=== Database initialization failed ===');
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Users table
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT,
          tradingStyle TEXT,
          riskTolerance TEXT,
          experienceLevel TEXT,
          preferences TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      // Trades table
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS trades (
          id TEXT PRIMARY KEY,
          symbol TEXT NOT NULL,
          type TEXT NOT NULL,
          entryPrice REAL NOT NULL,
          exitPrice REAL,
          quantity REAL NOT NULL,
          entryDate TEXT NOT NULL,
          exitDate TEXT,
          profit REAL,
          notes TEXT,
          tags TEXT,
          confidence INTEGER,
          mood TEXT,
          stopLoss REAL,
          takeProfit REAL,
          screenshot TEXT,
          strategy TEXT,
          market TEXT,
          session TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      // Watchlist table
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS watchlist (
          id TEXT PRIMARY KEY,
          symbol TEXT NOT NULL,
          name TEXT,
          currentPrice REAL,
          change REAL,
          changePercent REAL,
          addedAt TEXT NOT NULL
        )
      `);

      // Alerts table
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS alerts (
          id TEXT PRIMARY KEY,
          symbol TEXT NOT NULL,
          type TEXT NOT NULL,
          condition TEXT NOT NULL,
          value TEXT NOT NULL,
          message TEXT NOT NULL,
          isActive INTEGER NOT NULL,
          createdAt TEXT NOT NULL
        )
      `);

      // Performance metrics table
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS performance_metrics (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          totalTrades INTEGER,
          winningTrades INTEGER,
          losingTrades INTEGER,
          totalProfit REAL,
          totalLoss REAL,
          winRate REAL,
          profitFactor REAL,
          averageWin REAL,
          averageLoss REAL,
          maxDrawdown REAL,
          sharpeRatio REAL,
          createdAt TEXT NOT NULL
        )
      `);

      // Create indexes for better performance
      await this.db.execute('CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol)');
      await this.db.execute('CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(entryDate)');
      await this.db.execute('CREATE INDEX IF NOT EXISTS idx_trades_type ON trades(type)');
      await this.db.execute('CREATE INDEX IF NOT EXISTS idx_watchlist_symbol ON watchlist(symbol)');
      await this.db.execute('CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(isActive)');

      console.log('All tables and indexes created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw new Error(`Failed to create database tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // User operations
  async createUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Creating user:', user.name);
      
      await this.db.run(
        `INSERT INTO users (id, email, name, password, tradingStyle, riskTolerance, experienceLevel, preferences, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email,
          user.name,
          user.password || null,
          user.tradingStyle,
          user.riskTolerance,
          user.experienceLevel,
          JSON.stringify(user.preferences),
          user.createdAt,
          user.updatedAt
        ]
      );
      
      console.log('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (result.values && result.values.length > 0) {
        const user = result.values[0];
        return {
          ...user,
          preferences: JSON.parse(user.preferences)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByName(name: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE name = ?',
        [name]
      );

      if (result.values && result.values.length > 0) {
        const user = result.values[0];
        return {
          ...user,
          preferences: JSON.parse(user.preferences)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by name:', error);
      throw new Error(`Failed to get user by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query('SELECT * FROM users');
      
      if (result.values) {
        return result.values.map(user => ({
          ...user,
          preferences: JSON.parse(user.preferences)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error(`Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Updating user:', user.name);
      
      await this.db.run(
        `UPDATE users SET 
         email = ?, name = ?, password = ?, tradingStyle = ?, 
         riskTolerance = ?, experienceLevel = ?, preferences = ?, updatedAt = ?
         WHERE id = ?`,
        [
          user.email,
          user.name,
          user.password || null,
          user.tradingStyle,
          user.riskTolerance,
          user.experienceLevel,
          JSON.stringify(user.preferences),
          user.updatedAt,
          user.id
        ]
      );
      
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteUser(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Deleting user:', id);
      
      // Delete all user data
      await this.db.run('DELETE FROM trades WHERE id IN (SELECT id FROM users WHERE id = ?)', [id]);
      await this.db.run('DELETE FROM watchlist WHERE id IN (SELECT id FROM users WHERE id = ?)', [id]);
      await this.db.run('DELETE FROM alerts WHERE id IN (SELECT id FROM users WHERE id = ?)', [id]);
      await this.db.run('DELETE FROM performance_metrics WHERE id IN (SELECT id FROM users WHERE id = ?)', [id]);
      await this.db.run('DELETE FROM users WHERE id = ?', [id]);
      
      console.log('User and all associated data deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Trade operations
  async createTrade(trade: Trade): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Creating trade:', trade.symbol, trade.type);
      
      await this.db.run(
        `INSERT INTO trades (id, symbol, type, entryPrice, exitPrice, quantity, entryDate, exitDate, profit, notes, tags, confidence, mood, stopLoss, takeProfit, screenshot, strategy, market, session, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trade.id || crypto.randomUUID(),
          trade.symbol,
          trade.type,
          trade.entryPrice,
          trade.exitPrice || null,
          trade.quantity,
          trade.entryDate,
          trade.exitDate || null,
          trade.profit || null,
          trade.notes || null,
          trade.tags ? JSON.stringify(trade.tags) : null,
          trade.confidence || null,
          trade.mood || null,
          trade.stopLoss || null,
          trade.takeProfit || null,
          trade.screenshot || null,
          trade.strategy || null,
          trade.market || null,
          trade.session || null,
          trade.createdAt,
          trade.updatedAt
        ]
      );
      
      console.log('Trade created successfully');
    } catch (error) {
      console.error('Error creating trade:', error);
      throw new Error(`Failed to create trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTrades(filters?: {
    symbol?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Trade[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      let query = 'SELECT * FROM trades WHERE 1=1';
      const params: any[] = [];

      if (filters?.symbol) {
        query += ' AND symbol = ?';
        params.push(filters.symbol);
      }

      if (filters?.type) {
        query += ' AND type = ?';
        params.push(filters.type);
      }

      if (filters?.startDate) {
        query += ' AND entryDate >= ?';
        params.push(filters.startDate);
      }

      if (filters?.endDate) {
        query += ' AND entryDate <= ?';
        params.push(filters.endDate);
      }

      query += ' ORDER BY entryDate DESC';

      if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }

      const result = await this.db.query(query, params);
      
      if (result.values) {
        return result.values.map(trade => ({
          ...trade,
          tags: trade.tags ? JSON.parse(trade.tags) : []
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting trades:', error);
      throw new Error(`Failed to get trades: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateTrade(trade: Trade): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Updating trade:', trade.id);
      
      await this.db.run(
        `UPDATE trades SET 
         symbol = ?, type = ?, entryPrice = ?, exitPrice = ?, quantity = ?, 
         entryDate = ?, exitDate = ?, profit = ?, notes = ?, tags = ?, 
         confidence = ?, mood = ?, stopLoss = ?, takeProfit = ?, screenshot = ?, 
         strategy = ?, market = ?, session = ?, updatedAt = ?
         WHERE id = ?`,
        [
          trade.symbol,
          trade.type,
          trade.entryPrice,
          trade.exitPrice || null,
          trade.quantity,
          trade.entryDate,
          trade.exitDate || null,
          trade.profit || null,
          trade.notes || null,
          trade.tags ? JSON.stringify(trade.tags) : null,
          trade.confidence || null,
          trade.mood || null,
          trade.stopLoss || null,
          trade.takeProfit || null,
          trade.screenshot || null,
          trade.strategy || null,
          trade.market || null,
          trade.session || null,
          trade.updatedAt,
          trade.id
        ]
      );
      
      console.log('Trade updated successfully');
    } catch (error) {
      console.error('Error updating trade:', error);
      throw new Error(`Failed to update trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteTrade(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Deleting trade:', id);
      
      await this.db.run('DELETE FROM trades WHERE id = ?', [id]);
      
      console.log('Trade deleted successfully');
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw new Error(`Failed to delete trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Watchlist operations
  async addToWatchlist(item: WatchlistItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Adding to watchlist:', item.symbol);
      
      await this.db.run(
        `INSERT OR REPLACE INTO watchlist (id, symbol, name, currentPrice, change, changePercent, addedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id || crypto.randomUUID(),
          item.symbol,
          item.name || null,
          item.currentPrice || null,
          item.change || null,
          item.changePercent || null,
          item.addedAt
        ]
      );
      
      console.log('Watchlist item added successfully');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw new Error(`Failed to add to watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWatchlist(): Promise<WatchlistItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query('SELECT * FROM watchlist ORDER BY addedAt DESC');
      
      if (result.values) {
        return result.values;
      }
      return [];
    } catch (error) {
      console.error('Error getting watchlist:', error);
      throw new Error(`Failed to get watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeFromWatchlist(symbol: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Removing from watchlist:', symbol);
      
      await this.db.run('DELETE FROM watchlist WHERE symbol = ?', [symbol]);
      
      console.log('Watchlist item removed successfully');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw new Error(`Failed to remove from watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Alert operations
  async createAlert(alert: Alert): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Creating alert:', alert.symbol, alert.type);
      
      await this.db.run(
        `INSERT INTO alerts (id, symbol, type, condition, value, message, isActive, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alert.id || crypto.randomUUID(),
          alert.symbol,
          alert.type,
          alert.condition,
          alert.value.toString(),
          alert.message,
          alert.isActive ? 1 : 0,
          alert.createdAt
        ]
      );
      
      console.log('Alert created successfully');
    } catch (error) {
      console.error('Error creating alert:', error);
      throw new Error(`Failed to create alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAlerts(): Promise<Alert[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query('SELECT * FROM alerts ORDER BY createdAt DESC');
      
      if (result.values) {
        return result.values.map(alert => ({
          ...alert,
          isActive: Boolean(alert.isActive)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting alerts:', error);
      throw new Error(`Failed to get alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateAlert(alert: Alert): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Updating alert:', alert.id);
      
      await this.db.run(
        `UPDATE alerts SET 
         symbol = ?, type = ?, condition = ?, value = ?, message = ?, isActive = ?
         WHERE id = ?`,
        [
          alert.symbol,
          alert.type,
          alert.condition,
          alert.value.toString(),
          alert.message,
          alert.isActive ? 1 : 0,
          alert.id
        ]
      );
      
      console.log('Alert updated successfully');
    } catch (error) {
      console.error('Error updating alert:', error);
      throw new Error(`Failed to update alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteAlert(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Deleting alert:', id);
      
      await this.db.run('DELETE FROM alerts WHERE id = ?', [id]);
      
      console.log('Alert deleted successfully');
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw new Error(`Failed to delete alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Performance metrics operations
  async savePerformanceMetrics(metrics: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Saving performance metrics for date:', metrics.date);
      
      await this.db.run(
        `INSERT OR REPLACE INTO performance_metrics (id, date, totalTrades, winningTrades, losingTrades, totalProfit, totalLoss, winRate, profitFactor, averageWin, averageLoss, maxDrawdown, sharpeRatio, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          metrics.date,
          metrics.totalTrades || 0,
          metrics.winningTrades || 0,
          metrics.losingTrades || 0,
          metrics.totalProfit || 0,
          metrics.totalLoss || 0,
          metrics.winRate || 0,
          metrics.profitFactor || 0,
          metrics.averageWin || 0,
          metrics.averageLoss || 0,
          metrics.maxDrawdown || 0,
          metrics.sharpeRatio || 0,
          new Date().toISOString()
        ]
      );
      
      console.log('Performance metrics saved successfully');
    } catch (error) {
      console.error('Error saving performance metrics:', error);
      throw new Error(`Failed to save performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPerformanceMetrics(startDate?: string, endDate?: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      let query = 'SELECT * FROM performance_metrics WHERE 1=1';
      const params: any[] = [];

      if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY date DESC';

      const result = await this.db.query(query, params);
      
      if (result.values) {
        return result.values;
      }
      return [];
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error(`Failed to get performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Data export/import operations
  async exportData(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Exporting all data...');
      
      const users = await this.getUsers();
      const trades = await this.getTrades();
      const watchlist = await this.getWatchlist();
      const alerts = await this.getAlerts();
      const performanceMetrics = await this.getPerformanceMetrics();
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        users,
        trades,
        watchlist,
        alerts,
        performanceMetrics
      };
      
      console.log('Data export completed');
      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async importData(data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('Importing data...');
      
      // Clear existing data
      await this.db.run('DELETE FROM users');
      await this.db.run('DELETE FROM trades');
      await this.db.run('DELETE FROM watchlist');
      await this.db.run('DELETE FROM alerts');
      await this.db.run('DELETE FROM performance_metrics');
      
      // Import users
      for (const user of data.users || []) {
        await this.createUser(user);
      }
      
      // Import trades
      for (const trade of data.trades || []) {
        await this.createTrade(trade);
      }
      
      // Import watchlist
      for (const item of data.watchlist || []) {
        await this.addToWatchlist(item);
      }
      
      // Import alerts
      for (const alert of data.alerts || []) {
        await this.createAlert(alert);
      }
      
      // Import performance metrics
      for (const metric of data.performanceMetrics || []) {
        await this.savePerformanceMetrics(metric);
      }
      
      console.log('Data import completed successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Database maintenance
  async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database:', error);
      }
    }
  }

  // Get database info
  async getDatabaseInfo(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const users = await this.getUsers();
      const trades = await this.getTrades();
      const watchlist = await this.getWatchlist();
      const alerts = await this.getAlerts();
      
      return {
        platform: this.isMobile ? 'Mobile' : 'Web',
        initialized: this.isInitialized,
        userCount: users.length,
        tradeCount: trades.length,
        watchlistCount: watchlist.length,
        alertCount: alerts.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting database info:', error);
      throw new Error(`Failed to get database info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
const localDatabase = new LocalDatabase();
export default localDatabase; 