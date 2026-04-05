import { LitElement, css, html } from 'lit';

class ChatHome extends LitElement {
  static CHAT_HISTORY_KEY = 'finapp.chat.history.v1';

  static properties = {
    message: { state: true },
    loading: { state: true },
    error: { state: true },
    conversation: { state: true },
    storageMode: { state: true },
  };

  constructor() {
    super();
    this.message = '';
    this.loading = false;
    this.error = '';
    this.conversation = [];
    this.storageMode = 'session';
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadHistory();
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
      background: #f7faff;
      color: #102a56;
      padding: 1.2rem;
      box-sizing: border-box;
    }

    .layout {
      max-width: 920px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #d5e2ff;
      border-radius: 16px;
      padding: 1rem;
      box-shadow: 0 12px 30px #2e5aa014;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    p {
      color: #425c8d;
      line-height: 1.5;
    }

    textarea {
      width: 100%;
      min-height: 120px;
      border: 1px solid #bfd2ff;
      border-radius: 12px;
      padding: 0.75rem;
      box-sizing: border-box;
      font: inherit;
      margin-top: 0.75rem;
    }

    button {
      margin-top: 0.8rem;
      border: none;
      border-radius: 10px;
      padding: 0.6rem 1rem;
      background: linear-gradient(135deg, #2d6bf4, #1e4fb9);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .history {
      margin-top: 1rem;
      display: grid;
      gap: 0.75rem;
      max-height: 420px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }

    .message-card {
      margin-top: 1rem;
      border: 1px solid #cfddff;
      border-radius: 12px;
      padding: 0.75rem;
      background: #f5f9ff;
      white-space: pre-wrap;
    }

    .message-card.user {
      border-color: #93b4ff;
      background: #edf4ff;
    }

    .message-card.assistant {
      border-color: #cfe2ff;
      background: #f8fbff;
    }

    .label {
      display: inline-block;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 700;
      color: #1d4ca8;
      margin-bottom: 0.4rem;
    }

    .error {
      margin-top: 0.75rem;
      color: #ba1a1a;
      font-weight: 600;
    }

    .nav {
      display: inline-flex;
      align-items: center;
      margin-bottom: 0.6rem;
      color: #1a4ba9;
      text-decoration: none;
      font-weight: 600;
    }

    .toolbar {
      margin-top: 0.8rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
    }

    select {
      border: 1px solid #bfd2ff;
      border-radius: 10px;
      padding: 0.48rem 0.6rem;
      font: inherit;
      color: #1a3769;
      background: #fff;
    }

    button.secondary {
      background: #e8f0ff;
      color: #163a77;
      border: 1px solid #c5d8ff;
    }
  `;

  getStorage() {
    return this.storageMode === 'local' ? window.localStorage : window.sessionStorage;
  }

  loadHistory() {
    const persistedMode = window.localStorage.getItem('finapp.chat.storage.mode');
    if (persistedMode === 'local' || persistedMode === 'session') {
      this.storageMode = persistedMode;
    }

    try {
      const raw = this.getStorage().getItem(ChatHome.CHAT_HISTORY_KEY);
      this.conversation = raw ? JSON.parse(raw) : [];
    } catch {
      this.conversation = [];
    }
  }

  persistHistory() {
    this.getStorage().setItem(ChatHome.CHAT_HISTORY_KEY, JSON.stringify(this.conversation));
  }

  appendMessage(role, content) {
    this.conversation = [
      ...this.conversation,
      {
        role,
        content,
        timestamp: new Date().toISOString(),
      },
    ];
    this.persistHistory();
  }

  handleStorageChange(event) {
    const nextMode = event.target.value;
    if (nextMode !== 'local' && nextMode !== 'session') {
      return;
    }

    const currentHistory = [...this.conversation];
    this.storageMode = nextMode;
    window.localStorage.setItem('finapp.chat.storage.mode', nextMode);
    this.getStorage().setItem(ChatHome.CHAT_HISTORY_KEY, JSON.stringify(currentHistory));
    const staleStorage =
      nextMode === 'local' ? window.sessionStorage : window.localStorage;
    staleStorage.removeItem(ChatHome.CHAT_HISTORY_KEY);
    this.conversation = currentHistory;
  }

  clearChat() {
    this.conversation = [];
    this.error = '';
    this.getStorage().removeItem(ChatHome.CHAT_HISTORY_KEY);
  }

  async sendMessage() {
    const query = this.message.trim();
    if (!query) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';
    this.appendMessage('user', query);

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/chat` : '/api/chat';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          userContext: {
            goals: ['build emergency fund'],
            riskProfile: 'medium',
            recentMessages: this.conversation.slice(-6),
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        this.error = 'Unable to get chat response right now.';
        this.appendMessage('assistant', 'Sorry, I could not fetch a response right now.');
        return;
      }

      this.appendMessage('assistant', payload.data?.answer || 'No answer available.');
    } catch {
      this.error = 'Network error while calling the chat API.';
      this.appendMessage('assistant', 'Sorry, there was a network error while contacting the API.');
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="layout">
        <a class="nav" href="/">← Back to EMI Studio</a>
        <h1>FinApp Chat</h1>
        <p>
          Ask broad questions or finance-specific questions. The backend wraps your query with
          server context before sending it to the LLM provider.
        </p>

        <textarea
          .value=${this.message}
          @input=${(event) => {
            this.message = event.target.value;
          }}
          placeholder="Example: Based on my goals, how much should I invest monthly?"
        ></textarea>

        <div class="toolbar">
          <button @click=${this.sendMessage} ?disabled=${this.loading}>
            ${this.loading ? 'Thinking…' : 'Ask FinApp'}
          </button>

          <label for="storage-select">Store chat in:</label>
          <select
            id="storage-select"
            .value=${this.storageMode}
            @change=${this.handleStorageChange}
            ?disabled=${this.loading}
          >
            <option value="session">Session storage (tab only)</option>
            <option value="local">Local storage (persist across tabs)</option>
          </select>

          <button class="secondary" @click=${this.clearChat} ?disabled=${this.loading}>
            Clear history
          </button>
        </div>

        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
        <div class="history">
          ${this.conversation.length
            ? this.conversation.map(
                (entry) => html`
                  <div class="message-card ${entry.role}">
                    <div class="label">${entry.role === 'user' ? 'You' : 'FinApp AI'}</div>
                    <div>${entry.content}</div>
                  </div>
                `
              )
            : html`<div class="message-card assistant">No messages yet. Start chatting above.</div>`}
        </div>
      </div>
    `;
  }
}

customElements.define('chat-home', ChatHome);
