import axios from 'axios';

export class DataService {
  static async generateMockData(dataKey, count = 50) {
    const data = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      const timestamp = now - (count - i) * 60000; // 1 minute intervals
      let value;
      
      if (dataKey.funcBody) {
        // Execute function body (simplified)
        value = this.executeFunction(dataKey.funcBody, i);
      } else {
        value = Math.random() * 100 - 50;
      }
      
      data.push([timestamp, value]);
    }
    
    return data;
  }

  static executeFunction(funcBody, index) {
    try {
      // Simple function execution (in real app, use safer approach)
      const prevValue = index > 0 ? this.executeFunction(funcBody, index - 1) : 0;
      const func = new Function('prevValue', funcBody);
      return func(prevValue);
    } catch (error) {
      console.error('Function execution error:', error);
      return Math.random() * 100 - 50;
    }
  }

  static async fetchRealData(datasource) {
    // In real app, call your API here
    try {
      const response = await axios.post('/api/telemetry/timeseries', {
        deviceId: datasource.deviceId,
        keys: datasource.dataKeys.map(k => k.name),
        startTs: Date.now() - 3600000,
        endTs: Date.now(),
        interval: 60000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching real data:', error);
      // Fallback to mock data
      return this.generateMockData(datasource.dataKeys[0]);
    }
  }

  static generateLatestValue(dataKey) {
    if (dataKey.funcBody) {
      return this.executeFunction(dataKey.funcBody, 0);
    }
    return Math.random() * 100 - 50;
  }
}
