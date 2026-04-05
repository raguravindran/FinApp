import { LitElement, css, html } from 'lit';

class ChatHome extends LitElement {
  static properties = {
    message: { state: true },
    loading: { state: true },
    error: { state: true },
    reply: { state: true },
  };

  constructor() {
    super();
    this.message = '';
    this.loading = false;
    this.error = '';
    this.reply = '';
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

    .reply {
      margin-top: 1rem;
      border: 1px solid #cfddff;
      border-radius: 12px;
      padding: 0.75rem;
      background: #f5f9ff;
      white-space: pre-wrap;
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
  `;

  async sendMessage() {
    if (!this.message.trim()) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.reply = '';

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/chat` : '/api/chat';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: this.message,
          userContext: {
            goals: ['build emergency fund'],
            riskProfile: 'medium',
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        this.error = 'Unable to get chat response right now.';
        return;
      }

      this.reply = payload.data?.answer || 'No answer available.';
    } catch {
      this.error = 'Network error while calling the chat API.';
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

        <button @click=${this.sendMessage} ?disabled=${this.loading}>
          ${this.loading ? 'Thinking…' : 'Ask FinApp'}
        </button>

        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
        ${this.reply ? html`<div class="reply">${this.reply}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('chat-home', ChatHome);
