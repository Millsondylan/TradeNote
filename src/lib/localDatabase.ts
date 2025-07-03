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

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if running on mobile
      if (Capacitor.isNativePlatform()) {
        await this.sqlite.requestPermissions();
      }

      // Create database connection
      this.db = await this.sqlite.createConnection(
        'tradenote',
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();
      await this.createTables();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

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
  }

  // User operations
  async createUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
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
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');
    
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
  }

  async getUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT * FROM users');
    
    if (result.values) {
      return result.values.map(user => ({
        ...user,
        preferences: JSON.parse(user.preferences)
      }));
    }
    return [];
  }

  async updateUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      `UPDATE users SET email = ?, name = ?, password = ?, tradingStyle = ?, riskTolerance = ?, experienceLevel = ?, preferences = ?, updatedAt = ?
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
  }

  // Trade operations
  async createTrade(trade: Trade): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      `INSERT INTO trades (id, symbol, type, entryPrice, exitPrice, quantity, entryDate, exitDate, profit, notes, tags, confidence, mood, stopLoss, takeProfit, screenshot, strategy, market, session, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trade.id || crypto.randomUUID(),
        trade.symbol,
        trade.type,
        trade.entryPrice,
        trade.exitPrice,
        trade.quantity,
        trade.entryDate,
        trade.exitDate,
        trade.profit,
        trade.notes,
        JSON.stringify(trade.tags || []),
        trade.confidence,
        trade.mood,
        trade.stopLoss,
        trade.takeProfit,
        trade.screenshot,
        trade.strategy,
        trade.market,
        trade.session,
        trade.createdAt,
        trade.updatedAt
      ]
    );
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
        tags: JSON.parse(trade.tags || '[]')
      }));
    }
    return [];
  }

  async updateTrade(trade: Trade): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      `UPDATE trades SET symbol = ?, type = ?, entryPrice = ?, exitPrice = ?, quantity = ?, entryDate = ?, exitDate = ?, profit = ?, notes = ?, tags = ?, confidence = ?, mood = ?, stopLoss = ?, takeProfit = ?, screenshot = ?, strategy = ?, market = ?, session = ?, updatedAt = ?
       WHERE id = ?`,
      [
        trade.symbol,
        trade.type,
        trade.entryPrice,
        trade.exitPrice,
        trade.quantity,
        trade.entryDate,
        trade.exitDate,
        trade.profit,
        trade.notes,
        JSON.stringify(trade.tags || []),
        trade.confidence,
        trade.mood,
        trade.stopLoss,
        trade.takeProfit,
        trade.screenshot,
        trade.strategy,
        trade.market,
        trade.session,
        trade.updatedAt,
        trade.id
      ]
    );
  }

  async deleteTrade(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run('DELETE FROM trades WHERE id = ?', [id]);
  }

  // Watchlist operations
  async addToWatchlist(item: WatchlistItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      `INSERT INTO watchlist (id, symbol, name, currentPrice, change, changePercent, addedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id || crypto.randomUUID(),
        item.symbol,
        item.name,
        item.currentPrice,
        item.change,
        item.changePercent,
        item.addedAt
      ]
    );
  }

  async getWatchlist(): Promise<WatchlistItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT * FROM watchlist ORDER BY addedAt DESC');
    return result.values || [];
  }

  async removeFromWatchlist(symbol: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run('DELETE FROM watchlist WHERE symbol = ?', [symbol]);
  }

  // Alert operations
  async createAlert(alert: Alert): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
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
  }

  async getAlerts(): Promise<Alert[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT * FROM alerts ORDER BY createdAt DESC');
    return result.values || [];
  }

  async updateAlert(alert: Alert): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      `UPDATE alerts SET symbol = ?, type = ?, condition = ?, value = ?, message = ?, isActive = ?
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
  }

  async deleteAlert(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run('DELETE FROM alerts WHERE id = ?', [id]);
  }

  // Performance metrics
  async savePerformanceMetrics(metrics: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      `INSERT INTO performance_metrics (id, date, totalTrades, winningTrades, losingTrades, totalProfit, totalLoss, winRate, profitFactor, averageWin, averageLoss, maxDrawdown, sharpeRatio, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        metrics.date,
        metrics.totalTrades,
        metrics.winningTrades,
        metrics.losingTrades,
        metrics.totalProfit,
        metrics.totalLoss,
        metrics.winRate,
        metrics.profitFactor,
        metrics.averageWin,
        metrics.averageLoss,
        metrics.maxDrawdown,
        metrics.sharpeRatio,
        new Date().toISOString()
      ]
    );
  }

  async getPerformanceMetrics(startDate?: string, endDate?: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM performance_metrics';
    const params: any[] = [];

    if (startDate || endDate) {
      query += ' WHERE 1=1';
      if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
      }
    }

    query += ' ORDER BY date DESC';
    
    const result = await this.db.query(query, params);
    return result.values || [];
  }

  // Backup and restore
  async exportData(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    const users = await this.db.query('SELECT * FROM users');
    const trades = await this.db.query('SELECT * FROM trades');
    const watchlist = await this.db.query('SELECT * FROM watchlist');
    const alerts = await this.db.query('SELECT * FROM alerts');
    const metrics = await this.db.query('SELECT * FROM performance_metrics');

    return {
      users: users.values || [],
      trades: trades.values || [],
      watchlist: watchlist.values || [],
      alerts: alerts.values || [],
      metrics: metrics.values || [],
      exportedAt: new Date().toISOString()
    };
  }

  async importData(data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Clear existing data
    await this.db.run('DELETE FROM users');
    await this.db.run('DELETE FROM trades');
    await this.db.run('DELETE FROM watchlist');
    await this.db.run('DELETE FROM alerts');
    await this.db.run('DELETE FROM performance_metrics');

    // Import new data
    if (data.users) {
      for (const user of data.users) {
        await this.createUser(user);
      }
    }

    if (data.trades) {
      for (const trade of data.trades) {
        await this.createTrade(trade);
      }
    }

    if (data.watchlist) {
      for (const item of data.watchlist) {
        await this.addToWatchlist(item);
      }
    }

    if (data.alerts) {
      for (const alert of data.alerts) {
        await this.createAlert(alert);
      }
    }

    if (data.metrics) {
      for (const metric of data.metrics) {
        await this.savePerformanceMetrics(metric);
      }
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection('tradenote');
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export const localDatabase = new LocalDatabase();
export default localDatabase; 