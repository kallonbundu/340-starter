/**
 * Login Message Notification System
 * Shows unread message notifications when users log in
 */

class LoginNotificationSystem {
  constructor() {
    this.init();
  }

  init() {
    // Check if user just logged in and has unread messages
    this.checkForLoginNotification();
    
    // Add bell click tracking
    this.setupBellInteraction();
    
    // Auto-dismiss login notification
    this.setupAutoDissmiss();
  }

  /**
   * Check if we should show login notification for unread messages
   */
  checkForLoginNotification() {
    // Check if user just logged in (set by server-side middleware)
    const justLoggedIn = window.justLoggedIn || false;
    const unreadCount = this.getUnreadMessageCount();
    
    if (justLoggedIn && unreadCount > 0) {
      // Show notification after a short delay to allow page to load
      setTimeout(() => {
        this.showLoginNotification(unreadCount);
      }, 1000);
    }
  }

  /**
   * Get unread message count from the notification badge
   */
  getUnreadMessageCount() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      return parseInt(badge.textContent) || 0;
    }
    return 0;
  }

  /**
   * Show login notification for unread messages
   */
  showLoginNotification(count) {
    // Remove any existing notification
    const existing = document.querySelector('.login-notification');
    if (existing) {
      existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'login-notification';
    notification.innerHTML = `
      <button class="close-btn" onclick="this.closest('.login-notification').remove()">&times;</button>
      <div class="notification-header">
        <span class="notification-icon">📬</span>
        <span class="notification-title">Welcome back!</span>
      </div>
      <div class="notification-message">
        You have ${count} unread message${count !== 1 ? 's' : ''} waiting for you.
      </div>
      <div class="notification-actions">
        <a href="/messages/inbox" class="btn btn-primary">View Messages</a>
        <button class="btn btn-secondary" onclick="this.closest('.login-notification').remove()">Later</button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 8 seconds if not interacted with
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideInNotification 0.3s ease-out reverse';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 8000);
  }

  /**
   * Setup bell interaction tracking
   */
  setupBellInteraction() {
    const bell = document.querySelector('.message-notification-bell');
    if (bell) {
      bell.addEventListener('click', (e) => {
        // Add click animation
        bell.style.transform = 'scale(0.95)';
        setTimeout(() => {
          bell.style.transform = '';
        }, 150);
        
        // Track that user clicked on messages (for analytics if needed)
        console.log('User accessed messages via notification bell');
      });
    }
  }

  /**
   * Setup auto-dismiss functionality
   */
  setupAutoDissmiss() {
    // Remove notification if user navigates to inbox
    if (window.location.pathname.includes('/message')) {
      const notification = document.querySelector('.login-notification');
      if (notification) {
        notification.remove();
      }
    }
  }

  /**
   * Show a general message notification (can be called from other parts of the app)
   */
  static showMessageNotification(title, message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `login-notification ${type}`;
    notification.innerHTML = `
      <button class="close-btn" onclick="this.closest('.login-notification').remove()">&times;</button>
      <div class="notification-header">
        <span class="notification-icon">${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '📬'}</span>
        <span class="notification-title">${title}</span>
      </div>
      <div class="notification-message">${message}</div>
    `;

    document.body.appendChild(notification);

    // Auto-remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideInNotification 0.3s ease-out reverse';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, duration);
  }

  /**
   * Update notification badge count
   */
  static updateNotificationCount(newCount) {
    const badge = document.querySelector('.notification-badge');
    const wrapper = document.querySelector('.message-notification-wrapper');
    
    if (newCount > 0) {
      if (badge) {
        badge.textContent = newCount;
        badge.style.display = 'flex';
      } else {
        // Create badge if it doesn't exist
        const bell = document.querySelector('.message-notification-bell');
        if (bell) {
          const newBadge = document.createElement('span');
          newBadge.className = 'notification-badge';
          newBadge.textContent = newCount;
          bell.appendChild(newBadge);
        }
      }
      
      // Update tooltip
      const tooltip = document.querySelector('.unread-message-tooltip');
      if (tooltip) {
        tooltip.textContent = `You have ${newCount} unread message${newCount !== 1 ? 's' : ''}`;
      }
    } else {
      // Hide badge when no unread messages
      if (badge) {
        badge.style.display = 'none';
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LoginNotificationSystem();
  });
} else {
  new LoginNotificationSystem();
}

// Make functions available globally for convenience
window.LoginNotificationSystem = LoginNotificationSystem;