/**
 * 輕量級集中式 Event Bus 工具
 * 用於 React 元件與 API 模組間解耦解關聯的事件發佈/訂閱
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 訂閱事件
   * @param {string} event - 事件名稱
   * @param {Function} callback - 回調函式
   * @returns {Function} 取消訂閱函式
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => this.off(event, callback);
  }

  /**
   * 取消訂閱事件
   * @param {string} event - 事件名稱
   * @param {Function} callback - 回調函式
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * 觸發/廣播事件
   * @param {string} event - 事件名稱
   * @param {*} data - 夾帶資料
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[EventBus] Error handling event "${event}":`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();
