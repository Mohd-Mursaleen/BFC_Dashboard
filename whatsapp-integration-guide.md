# WhatsApp Integration - Frontend Implementation Guide

## 🎯 Overview

This guide covers all the frontend changes needed to integrate WhatsApp notifications into your gym management system. The backend now automatically sends WhatsApp messages for:

1. ✅ **New Member Welcome** - When a member is created
2. ✅ **Subscription Created** - When a subscription is activated
3. ✅ **Subscription Paused** - When a member pauses their subscription
4. ✅ **Subscription Resumed** - When a paused subscription is resumed
5. ✅ **Expiry Reminders** - Automated daily reminders for expiring subscriptions

---

## 📋 Table of Contents

1. [Automatic Notifications (No Frontend Changes Required)](#automatic-notifications)
2. [WAHA Session Management UI](#waha-session-management)
3. [WhatsApp Test Connection](#test-connection)
4. [Expiring Members Dashboard Widget](#expiring-members-widget)
5. [Manual Bulk Messaging](#bulk-messaging)
6. [Member Detail Page Enhancements](#member-detail-enhancements)
7. [Subscription Detail Page Enhancements](#subscription-detail-enhancements)
8. [Settings/Configuration Page](#settings-page)

---

## 🔔 Automatic Notifications

### What Happens Automatically (Backend)

The following WhatsApp notifications are sent **automatically** by the backend:


#### 1. New Member Welcome Message

**Trigger:** When you create a new member with `status: "active"` and a phone number

**API Call:** `POST /api/members`

**What the backend sends:**
```
Welcome to BFC Gym, {member_name}! 🎉

We're excited to have you as part of our fitness family.

Your journey to a healthier lifestyle starts now!

For any queries, feel free to contact us.
```

**Frontend Action Required:** ❌ None - happens automatically

---

#### 2. Subscription Created Message

**Trigger:** When you create a new subscription

**API Call:** `POST /api/subscriptions`

**What the backend sends:**
```
Hi {member_name}! 👋

Your subscription for *{plan_name}* has been activated! ✅

📅 Start Date: {start_date}
📅 End Date: {end_date}

Let's crush those fitness goals together! 💪

See you at the gym!
```

**Frontend Action Required:** ❌ None - happens automatically

---

#### 3. Subscription Paused Message

**Trigger:** When you pause a subscription

**API Call:** `POST /api/subscriptions/{id}/pause`

**What the backend sends:**
```
Hi {member_name},

Your gym subscription has been *paused* ⏸️

It will automatically resume on: {resume_date}

Take care and see you soon!
```

**Frontend Action Required:** ❌ None - happens automatically

---

#### 4. Subscription Resumed Message

**Trigger:** When you resume a paused subscription

**API Call:** `POST /api/subscriptions/{id}/resume`

**What the backend sends:**
```
Welcome back, {member_name}! 🎉

Your gym subscription has been *resumed* ▶️

New expiry date: {new_end_date}

Let's get back to crushing those goals! 💪
```

**Frontend Action Required:** ❌ None - happens automatically

---

#### 5. Expiry Reminders (Automated Scheduler)

**Trigger:** Runs automatically every 90 seconds (development mode)

**What it does:** Sends reminders to members whose subscriptions expire in exactly 7 days

**What the backend sends:**
```
Hi {member_name},

Your gym subscription expires in *7 days*.

Expiry date: {end_date}

Renew soon to avoid any interruption in your workout routine! 💪
```

**Frontend Action Required:** ❌ None - fully automated

---

## 🔌 WAHA Session Management

### What is WAHA?

WAHA (WhatsApp HTTP API) is the service that connects your system to WhatsApp. Before sending messages, you need to:
1. Start a WAHA session
2. Scan a QR code with your WhatsApp mobile app
3. Keep the session active

### Session Status Component

Create a component to manage the WhatsApp connection:

```javascript
import { useState, useEffect } from 'react';

const WhatsAppSessionManager = () => {
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check session status on mount
  useEffect(() => {
    checkStatus();
    // Poll status every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/waha/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const startSession = async () => {
    setLoading(true);
    try {
      await fetch('/api/waha/start', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Wait a moment then fetch QR code
      setTimeout(async () => {
        const qrResponse = await fetch('/api/waha/qr-image', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (qrResponse.ok) {
          const blob = await qrResponse.blob();
          setQrCode(URL.createObjectURL(blob));
        }
        
        checkStatus();
      }, 2000);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopSession = async () => {
    try {
      await fetch('/api/waha/stop', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      checkStatus();
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/waha/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQrCode(null);
      checkStatus();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="whatsapp-session-manager">
      <h2>📱 WhatsApp Connection</h2>
      
      <div className="status-indicator">
        <span className={`status-badge ${status?.toLowerCase()}`}>
          {status === 'WORKING' && '✅ Connected'}
          {status === 'SCAN_QR_CODE' && '📱 Scan QR Code'}
          {status === 'STARTING' && '⏳ Starting...'}
          {status === 'STOPPED' && '⭕ Disconnected'}
          {status === 'FAILED' && '❌ Failed'}
          {!status && '⏳ Checking...'}
        </span>
      </div>

      {status === 'WORKING' && (
        <div className="connected-actions">
          <p className="success-message">
            ✅ WhatsApp is connected and ready to send messages!
          </p>
          <div className="action-buttons">
            <button onClick={stopSession} className="btn-secondary">
              Stop Session
            </button>
            <button onClick={logout} className="btn-danger">
              Logout & Disconnect
            </button>
          </div>
        </div>
      )}

      {(status === 'STOPPED' || status === 'FAILED') && (
        <div className="disconnected-actions">
          <p className="warning-message">
            ⚠️ WhatsApp is not connected. Start a session to enable notifications.
          </p>
          <button 
            onClick={startSession} 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Starting...' : 'Start WhatsApp Session'}
          </button>
        </div>
      )}

      {status === 'SCAN_QR_CODE' && qrCode && (
        <div className="qr-code-section">
          <h3>Scan QR Code with WhatsApp</h3>
          <ol>
            <li>Open WhatsApp on your phone</li>
            <li>Go to Settings → Linked Devices</li>
            <li>Tap "Link a Device"</li>
            <li>Scan this QR code</li>
          </ol>
          <img src={qrCode} alt="WhatsApp QR Code" className="qr-code" />
          <p className="hint">QR code refreshes automatically</p>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSessionManager;
```

### CSS for Session Manager

```css
.whatsapp-session-manager {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.status-indicator {
  margin: 16px 0;
}

.status-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.status-badge.working {
  background: #dcfce7;
  color: #166534;
}

.status-badge.scan_qr_code {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.stopped,
.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

.qr-code-section {
  margin-top: 24px;
  text-align: center;
}

.qr-code {
  max-width: 300px;
  margin: 16px auto;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
```

---

## 🧪 Test Connection

Add a test button to verify WhatsApp is working:

```javascript
const WhatsAppTestButton = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [testPhone, setTestPhone] = useState('918218134534');

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const response = await fetch(
        `/api/whatsapp/test?test_phone=${testPhone}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        connection_status: 'failed', 
        error: error.message 
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="whatsapp-test">
      <h3>🧪 Test WhatsApp Connection</h3>
      
      <div className="test-input">
        <label>Test Phone Number:</label>
        <input
          type="text"
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
          placeholder="918218134535"
        />
      </div>
      
      <button 
        onClick={testConnection} 
        disabled={testing}
        className="btn-primary"
      >
        {testing ? 'Sending Test...' : 'Send Test Message'}
      </button>

      {result && (
        <div className={`test-result ${result.connection_status}`}>
          {result.connection_status === 'success' ? (
            <div className="success">
              ✅ Test message sent successfully!
              <br />
              <small>Message ID: {result.details?.message_id}</small>
            </div>
          ) : (
            <div className="error">
              ❌ Test failed
              <br />
              <small>{result.details?.error || result.error}</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## 📊 Expiring Members Widget

Add this to your dashboard to show members whose subscriptions are expiring soon:

```javascript
const ExpiringMembersWidget = () => {
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchExpiring();
  }, []);

  const fetchExpiring = async () => {
    try {
      const response = await fetch('/api/whatsapp/expiring-subscriptions?days=7', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setExpiring(data.subscriptions || []);
    } catch (error) {
      console.error('Failed to fetch expiring members:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/whatsapp/send-expiry-reminders?days=7', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      alert(`✅ Sent ${data.notifications_sent} reminders successfully!`);
      
      if (data.notifications_failed > 0) {
        alert(`⚠️ ${data.notifications_failed} reminders failed`);
      }
    } catch (error) {
      alert('❌ Failed to send reminders');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="expiring-widget">
      <div className="widget-header">
        <h3>⏰ Expiring Soon ({expiring.length})</h3>
        <button 
          onClick={sendReminders} 
          disabled={sending || expiring.length === 0}
          className="btn-primary"
        >
          {sending ? 'Sending...' : '📱 Send Reminders'}
        </button>
      </div>

      {expiring.length > 0 ? (
        <div className="expiring-list">
          {expiring.map((sub) => (
            <div key={sub.subscription_id} className="expiring-item">
              <div className="member-info">
                <strong>{sub.member_name}</strong>
                <span className="phone">{sub.member_phone}</span>
              </div>
              <div className="expiry-info">
                <span className="days-badge">
                  {sub.days_remaining} days
                </span>
                <span className="date">{sub.end_date}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-expiring">
          ✅ No memberships expiring in the next 7 days
        </div>
      )}
    </div>
  );
};
```

---


## 📤 Bulk Messaging

Send custom messages to multiple members at once:

```javascript
const BulkWhatsAppMessaging = () => {
  const [recipients, setRecipients] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const addRecipient = (member) => {
    if (!recipients.find(r => r.phone === member.phone)) {
      setRecipients([...recipients, {
        phone: member.phone,
        name: member.full_name
      }]);
    }
  };

  const removeRecipient = (phone) => {
    setRecipients(recipients.filter(r => r.phone !== phone));
  };

  const sendBulkMessages = async () => {
    if (recipients.length === 0 || !message) {
      alert('Please add recipients and enter a message');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/whatsapp/bulk-send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients,
          message
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.successful > 0) {
        alert(`✅ Sent ${data.successful} messages successfully!`);
      }
      
      if (data.failed > 0) {
        alert(`⚠️ ${data.failed} messages failed`);
      }
    } catch (error) {
      alert('❌ Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bulk-messaging">
      <h2>📤 Bulk WhatsApp Messaging</h2>

      <div className="message-composer">
        <label>Message (use {name} for personalization):</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi {name}, this is a reminder about..."
          rows={5}
        />
      </div>

      <div className="recipients-section">
        <h3>Recipients ({recipients.length})</h3>
        
        {/* Add your member search/select component here */}
        <MemberSearch onSelect={addRecipient} />

        <div className="recipients-list">
          {recipients.map((recipient) => (
            <div key={recipient.phone} className="recipient-chip">
              <span>{recipient.name}</span>
              <span className="phone">{recipient.phone}</span>
              <button onClick={() => removeRecipient(recipient.phone)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={sendBulkMessages}
        disabled={sending || recipients.length === 0 || !message}
        className="btn-primary btn-large"
      >
        {sending ? 'Sending...' : `📱 Send to ${recipients.length} Members`}
      </button>

      {result && (
        <div className="bulk-result">
          <h3>📊 Results</h3>
          <div className="stats">
            <div className="stat success">
              <span className="label">Successful</span>
              <span className="value">{result.successful}</span>
            </div>
            <div className="stat failed">
              <span className="label">Failed</span>
              <span className="value">{result.failed}</span>
            </div>
            <div className="stat total">
              <span className="label">Total</span>
              <span className="value">{result.total}</span>
            </div>
          </div>

          <div className="detailed-results">
            {result.results?.map((r, idx) => (
              <div key={idx} className={`result-item ${r.success ? 'success' : 'failed'}`}>
                <span className="icon">{r.success ? '✅' : '❌'}</span>
                <span className="name">{r.name}</span>
                <span className="phone">{r.phone}</span>
                {r.error && <span className="error">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 👤 Member Detail Page Enhancements

Add WhatsApp actions to the member detail page:

```javascript
const MemberDetailPage = ({ memberId }) => {
  const [member, setMember] = useState(null);
  const [sendingWelcome, setSendingWelcome] = useState(false);

  // ... existing member fetch logic

  const sendWelcomeMessage = async () => {
    setSendingWelcome(true);
    try {
      const response = await fetch('/api/whatsapp/send-welcome', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          member_phone: member.phone,
          member_name: member.full_name
        })
      });

      if (response.ok) {
        alert('✅ Welcome message sent!');
      } else {
        alert('❌ Failed to send message');
      }
    } catch (error) {
      alert('❌ Error sending message');
    } finally {
      setSendingWelcome(false);
    }
  };

  return (
    <div className="member-detail">
      {/* ... existing member details */}

      <div className="whatsapp-actions">
        <h3>📱 WhatsApp Actions</h3>
        <button
          onClick={sendWelcomeMessage}
          disabled={sendingWelcome || !member?.phone}
          className="btn-secondary"
        >
          {sendingWelcome ? 'Sending...' : '👋 Send Welcome Message'}
        </button>
      </div>
    </div>
  );
};
```

---

## 📋 Subscription Detail Page Enhancements

Show WhatsApp notification status on subscription pages:

```javascript
const SubscriptionDetailPage = ({ subscriptionId }) => {
  const [subscription, setSubscription] = useState(null);

  // ... existing subscription fetch logic

  return (
    <div className="subscription-detail">
      {/* ... existing subscription details */}

      <div className="notification-info">
        <h3>📱 WhatsApp Notifications</h3>
        <div className="notification-status">
          <div className="status-item">
            <span className="icon">✅</span>
            <span>Subscription confirmation sent automatically</span>
          </div>
          
          {subscription?.is_currently_paused && (
            <div className="status-item">
              <span className="icon">⏸️</span>
              <span>Pause notification sent</span>
            </div>
          )}

          <div className="status-item">
            <span className="icon">⏰</span>
            <span>Expiry reminder will be sent 7 days before expiration</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## ⚙️ Settings/Configuration Page

Create a settings page for WhatsApp configuration:

```javascript
const WhatsAppSettings = () => {
  return (
    <div className="whatsapp-settings">
      <h1>📱 WhatsApp Settings</h1>

      {/* Session Management */}
      <section className="settings-section">
        <WhatsAppSessionManager />
      </section>

      {/* Test Connection */}
      <section className="settings-section">
        <WhatsAppTestButton />
      </section>

      {/* Notification Settings */}
      <section className="settings-section">
        <h2>🔔 Automatic Notifications</h2>
        <div className="notification-list">
          <div className="notification-item">
            <div className="notification-info">
              <h4>👋 Welcome Message</h4>
              <p>Sent when a new active member is created</p>
            </div>
            <span className="status enabled">✅ Enabled</span>
          </div>

          <div className="notification-item">
            <div className="notification-info">
              <h4>🎉 Subscription Created</h4>
              <p>Sent when a subscription is activated</p>
            </div>
            <span className="status enabled">✅ Enabled</span>
          </div>

          <div className="notification-item">
            <div className="notification-info">
              <h4>⏸️ Subscription Paused</h4>
              <p>Sent when a subscription is paused</p>
            </div>
            <span className="status enabled">✅ Enabled</span>
          </div>

          <div className="notification-item">
            <div className="notification-info">
              <h4>▶️ Subscription Resumed</h4>
              <p>Sent when a paused subscription is resumed</p>
            </div>
            <span className="status enabled">✅ Enabled</span>
          </div>

          <div className="notification-item">
            <div className="notification-info">
              <h4>⏰ Expiry Reminders</h4>
              <p>Sent automatically 7 days before expiration</p>
              <small>Runs every 90 seconds (development mode)</small>
            </div>
            <span className="status enabled">✅ Enabled</span>
          </div>
        </div>
      </section>

      {/* Scheduler Status */}
      <section className="settings-section">
        <h2>⏱️ Scheduler Status</h2>
        <SchedulerStatus />
      </section>
    </div>
  );
};

const SchedulerStatus = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/scheduler/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error);
    }
  };

  const triggerExpiryReminders = async () => {
    try {
      await fetch('/api/scheduler/expiry-reminders', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('✅ Expiry reminder check triggered!');
    } catch (error) {
      alert('❌ Failed to trigger reminders');
    }
  };

  return (
    <div className="scheduler-status">
      {status && (
        <>
          <div className="status-info">
            <p>Status: <strong>{status.status}</strong></p>
            <p>Auto-resume interval: {status.auto_resume_interval_hours} hours</p>
            <p>Timezone: {status.timezone}</p>
          </div>

          <button onClick={triggerExpiryReminders} className="btn-secondary">
            🔄 Trigger Expiry Reminders Now
          </button>
        </>
      )}
    </div>
  );
};
```

---

## 🎨 Recommended CSS Styles

```css
/* WhatsApp Theme Colors */
:root {
  --whatsapp-green: #25D366;
  --whatsapp-dark: #128C7E;
  --whatsapp-light: #DCF8C6;
}

/* Buttons */
.btn-whatsapp {
  background-color: var(--whatsapp-green);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-whatsapp:hover {
  background-color: var(--whatsapp-dark);
}

.btn-whatsapp:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.enabled {
  background: #dcfce7;
  color: #166534;
}

.status-badge.disabled {
  background: #fee2e2;
  color: #991b1b;
}

/* Expiring Widget */
.expiring-widget {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.expiring-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.days-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
}

/* Bulk Messaging */
.recipient-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  padding: 8px 12px;
  border-radius: 20px;
  margin: 4px;
}

.recipient-chip button {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  font-weight: bold;
}

/* Results */
.bulk-result .stats {
  display: flex;
  gap: 16px;
  margin: 20px 0;
}

.stat {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat.success {
  background: #dcfce7;
  color: #166534;
}

.stat.failed {
  background: #fee2e2;
  color: #991b1b;
}

.stat .value {
  display: block;
  font-size: 32px;
  font-weight: bold;
  margin-top: 8px;
}
```

---

## 📱 Phone Number Formatting

Always format phone numbers correctly before sending to the API:

```javascript
// Utility function to format phone numbers
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing (assuming India)
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
};

// Validate phone number
const validatePhoneNumber = (phone) => {
  const cleaned = formatPhoneNumber(phone);
  // Check if it's a valid Indian number (91 + 10 digits)
  return /^91\d{10}$/.test(cleaned);
};

// Usage in forms
const handlePhoneChange = (e) => {
  const phone = e.target.value;
  const formatted = formatPhoneNumber(phone);
  
  if (validatePhoneNumber(formatted)) {
    setPhoneError('');
  } else {
    setPhoneError('Invalid phone number (should be 10 digits)');
  }
  
  setPhone(formatted);
};
```

---

## 🔍 Error Handling

Handle WhatsApp errors gracefully:

```javascript
const handleWhatsAppError = (error) => {
  if (error.status === 401) {
    return 'WhatsApp session expired. Please reconnect.';
  } else if (error.status === 400) {
    return 'Invalid phone number or message format.';
  } else if (error.status === 429) {
    return 'Too many messages sent. Please wait and try again.';
  } else if (error.message?.includes('WAHA')) {
    return 'WhatsApp service is not available. Please check connection.';
  }
  return 'Failed to send WhatsApp message. Please try again.';
};

// Usage
try {
  const response = await fetch('/api/whatsapp/send-text', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone, text })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(handleWhatsAppError(error));
  }

  alert('✅ Message sent successfully!');
} catch (error) {
  alert(`❌ ${error.message}`);
}
```

---

## 📊 Dashboard Integration

Add WhatsApp metrics to your main dashboard:

```javascript
const WhatsAppDashboardWidget = () => {
  const [metrics, setMetrics] = useState({
    sessionStatus: 'checking',
    expiringCount: 0,
    lastReminderRun: null
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Get session status
      const statusRes = await fetch('/api/waha/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statusData = await statusRes.json();

      // Get expiring count
      const expiringRes = await fetch('/api/whatsapp/expiring-subscriptions?days=7', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const expiringData = await expiringRes.json();

      setMetrics({
        sessionStatus: statusData.status,
        expiringCount: expiringData.count,
        lastReminderRun: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Failed to fetch WhatsApp metrics:', error);
    }
  };

  return (
    <div className="dashboard-widget whatsapp-widget">
      <h3>📱 WhatsApp Status</h3>
      
      <div className="widget-content">
        <div className="metric">
          <span className="label">Connection:</span>
          <span className={`value ${metrics.sessionStatus?.toLowerCase()}`}>
            {metrics.sessionStatus === 'WORKING' ? '✅ Connected' : '⚠️ Disconnected'}
          </span>
        </div>

        <div className="metric">
          <span className="label">Expiring Soon:</span>
          <span className="value">{metrics.expiringCount} members</span>
        </div>

        <div className="metric">
          <span className="label">Auto-reminders:</span>
          <span className="value">✅ Active</span>
        </div>
      </div>

      <button 
        onClick={() => window.location.href = '/settings/whatsapp'}
        className="btn-secondary btn-small"
      >
        Manage WhatsApp
      </button>
    </div>
  );
};
```

---

## ✅ Implementation Checklist

### Phase 1: Essential (Required for WhatsApp to work)
- [ ] Add WAHA Session Manager component to settings
- [ ] Add QR code scanning UI
- [ ] Add session status indicator in header/navbar
- [ ] Test connection button

### Phase 2: Dashboard Integration
- [ ] Add expiring members widget to dashboard
- [ ] Add WhatsApp status widget
- [ ] Add manual reminder trigger button

### Phase 3: Member & Subscription Pages
- [ ] Add "Send Welcome Message" button to member detail page
- [ ] Show WhatsApp notification status on subscription pages
- [ ] Add phone number validation to member forms

### Phase 4: Advanced Features
- [ ] Bulk messaging interface
- [ ] WhatsApp settings page
- [ ] Notification history (if you create notifications table)
- [ ] Custom message templates

---

## 🚀 Quick Start Steps

1. **Start WAHA Container**
   ```bash
   docker-compose up -d waha
   ```

2. **Add Session Manager to Your App**
   - Create a new page: `/settings/whatsapp`
   - Add the `WhatsAppSessionManager` component
   - Scan QR code with your phone

3. **Test the Connection**
   - Use the test button to send a test message
   - Verify message is received on WhatsApp

4. **Add Dashboard Widget**
   - Add `ExpiringMembersWidget` to your main dashboard
   - Test manual reminder sending

5. **Create a Test Member**
   - Create a new member with your phone number
   - Verify you receive the welcome message

6. **Create a Test Subscription**
   - Create a subscription for the test member
   - Verify you receive the subscription confirmation

7. **Test Pause/Resume**
   - Pause the subscription → verify pause message
   - Resume the subscription → verify resume message

---

## 📞 Support & Troubleshooting

### Common Issues

**QR Code Not Showing**
- Wait 2-3 seconds after starting session
- Refresh the page
- Check WAHA container logs: `docker logs waha`

**Messages Not Sending**
- Check session status is "WORKING"
- Verify phone numbers have country code (91 for India)
- Check WAHA container is running: `docker ps`

**Session Keeps Disconnecting**
- Don't logout from WhatsApp Web on other devices
- Keep the phone connected to internet
- Restart WAHA container if needed

### Backend Logs

Check backend logs for WhatsApp activity:
```bash
docker logs bfc-backend | grep -i whatsapp
```

### WAHA Logs

Check WAHA logs for connection issues:
```bash
docker logs waha
```

---

## 🎉 You're All Set!

Your gym management system now has full WhatsApp integration! Members will automatically receive:
- Welcome messages when they join
- Subscription confirmations
- Pause/resume notifications
- Expiry reminders 7 days before expiration

All notifications are sent automatically by the backend - no manual intervention needed!
