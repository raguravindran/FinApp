import { LitElement, css, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

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

  updated(changedProperties) {
    if (changedProperties.has('conversation')) {
      this.scrollHistoryToBottom();
    }
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
      padding: 1rem 1rem 0.9rem;
      box-shadow: 0 12px 30px #2e5aa014;
      min-height: calc(100vh - 2.4rem);
      display: flex;
      flex-direction: column;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .intro {
      color: #425c8d;
      line-height: 1.5;
    }

    .composer-textarea {
      width: 100%;
      min-height: 48px;
      max-height: 140px;
      border: 1px solid #bfd2ff;
      border-radius: 14px;
      padding: 0.75rem;
      box-sizing: border-box;
      font: inherit;
      resize: vertical;
    }

    button {
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
      margin-top: 0.8rem;
      display: grid;
      gap: 0.75rem;
      flex: 1;
      overflow-y: auto;
      padding: 0.15rem 0.25rem 0.75rem;
      align-content: start;
    }

    .message-card {
      margin-top: 0.2rem;
      border: 1px solid #cfddff;
      border-radius: 14px;
      padding: 0.75rem;
      background: #f5f9ff;
      white-space: pre-wrap;
      max-width: min(78ch, 84%);
      width: fit-content;
    }

    .message-card.user {
      border-color: #78a2ff;
      background: #2d6bf4;
      color: #ffffff;
      margin-left: auto;
    }

    .message-card.assistant {
      border-color: #cfe2ff;
      background: #f8fbff;
      margin-right: auto;
    }

    .meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.7rem;
      text-align: left;
      margin-bottom: 0.35rem;
    }

    .label {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 700;
      color: #1d4ca8;
      line-height: 1.2;
    }

    .message-card.user .label {
      color: #dfe9ff;
    }

    .timestamp {
      font-size: 0.74rem;
      line-height: 1.2;
      color: #4f6591;
      opacity: 0.92;
      white-space: nowrap;
    }

    .message-card.user .timestamp {
      color: #dfe9ff;
      opacity: 0.95;
    }

    .md p {
      margin: 0.25rem 0 0;
      line-height: 1.48;
      color: inherit;
    }

    .md ul,
    .md ol {
      margin: 0.4rem 0 0.25rem 1.2rem;
      padding: 0;
    }

    .md li {
      margin: 0.2rem 0;
      line-height: 1.45;
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
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
      justify-content: space-between;
      margin: 0.5rem 0 0.35rem;
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

    .composer {
      border-top: 1px solid #dce7ff;
      padding-top: 0.7rem;
      margin-top: auto;
      background: #ffffff;
      position: sticky;
      bottom: 0;
    }

    .composer-row {
      display: flex;
      gap: 0.6rem;
      align-items: flex-end;
    }

    .composer-row button {
      min-height: 44px;
      white-space: nowrap;
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

  formatTimestamp(timestamp) {
    const date = timestamp ? new Date(timestamp) : new Date();
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
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

  scrollHistoryToBottom() {
    const history = this.renderRoot?.querySelector('.history');
    if (!history) {
      return;
    }

    requestAnimationFrame(() => {
      history.scrollTop = history.scrollHeight;
    });
  }

  escapeHtml(text) {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  inlineMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }

  renderMarkdown(content) {
    const safe = this.escapeHtml(content || '');
    const lines = safe.split('\n');
    const chunks = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i += 1;
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        const list = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          list.push(lines[i].trim().replace(/^[-*]\s+/, ''));
          i += 1;
        }
        chunks.push(`<ul>${list.map((item) => `<li>${this.inlineMarkdown(item)}</li>`).join('')}</ul>`);
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        const list = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          list.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i += 1;
        }
        chunks.push(`<ol>${list.map((item) => `<li>${this.inlineMarkdown(item)}</li>`).join('')}</ol>`);
        continue;
      }

      const paragraphLines = [];
      while (i < lines.length && lines[i].trim() && !/^[-*]\s+/.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim())) {
        paragraphLines.push(lines[i].trim());
        i += 1;
      }
      chunks.push(`<p>${this.inlineMarkdown(paragraphLines.join(' '))}</p>`);
    }

    return chunks.join('');
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
        <p class="intro">
          Chat with Penny about your finances. Conversation history appears above, and the message
          composer stays at the bottom (WhatsApp-style).
        </p>

        <div class="history">
          ${this.conversation.length
            ? this.conversation.map(
                (entry) => html`
                  <div class="message-card ${entry.role}">
                    <div class="meta">
                      <div class="label">${entry.role === 'user' ? 'You' : 'Penny'}</div>
                      <div class="timestamp">${this.formatTimestamp(entry.timestamp)}</div>
                    </div>
                    <div class="md">${unsafeHTML(this.renderMarkdown(entry.content))}</div>
                  </div>
                `
              )
            : html`<div class="message-card assistant">No messages yet. Start chatting with Penny below.</div>`}
        </div>

        <div class="composer">
          <div class="toolbar">
            <div>
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
            </div>

            <button class="secondary" @click=${this.clearChat} ?disabled=${this.loading}>
              Clear history
            </button>
          </div>

          ${this.error ? html`<div class="error">${this.error}</div>` : ''}
          <div class="composer-row">
            <textarea
              class="composer-textarea"
              .value=${this.message}
              @input=${(event) => {
                this.message = event.target.value;
              }}
              placeholder="Message Penny…"
            ></textarea>
            <button @click=${this.sendMessage} ?disabled=${this.loading}>
              ${this.loading ? 'Thinking…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('chat-home', ChatHome);
