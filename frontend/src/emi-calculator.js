import { LitElement, css, html } from 'lit';

class EmiCalculator extends LitElement {
  static properties = {
    principal: { state: true },
    annualRate: { state: true },
    tenureMonths: { state: true },
    loading: { state: true },
    error: { state: true },
    result: { state: true },
  };

  constructor() {
    super();
    this.principal = '';
    this.annualRate = '';
    this.tenureMonths = '';
    this.loading = false;
    this.error = '';
    this.result = null;
  }

  static styles = css`
    :host {
      display: block;
      max-width: 480px;
      margin: 2rem auto;
      padding: 1rem;
      font-family: Arial, sans-serif;
      border: 1px solid #d0d7de;
      border-radius: 12px;
      background: #ffffff;
    }

    h1 {
      font-size: 1.25rem;
      margin-top: 0;
    }

    form {
      display: grid;
      gap: 0.75rem;
    }

    label {
      display: grid;
      gap: 0.35rem;
      font-weight: 600;
    }

    input {
      padding: 0.5rem;
      border-radius: 8px;
      border: 1px solid #c5c9d0;
    }

    button {
      border: none;
      border-radius: 8px;
      padding: 0.6rem 0.8rem;
      background: #0a66ff;
      color: white;
      cursor: pointer;
      font-weight: 600;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error {
      color: #b42318;
      font-weight: 600;
    }

    .result {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      background: #f0f7ff;
      border: 1px solid #bfdbfe;
    }
  `;

  async onSubmit(event) {
    event.preventDefault();
    this.loading = true;
    this.error = '';
    this.result = null;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/emi/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: Number(this.principal),
          annual_rate: Number(this.annualRate),
          tenure_months: Number(this.tenureMonths),
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        this.error = payload.errors
          ? Object.values(payload.errors).join(' ')
          : 'Unable to calculate EMI.';
        return;
      }
      this.result = payload.data;
    } catch {
      this.error = 'Network error while calling backend API.';
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <h1>EMI Calculator (Simple Interest)</h1>
      <form @submit=${this.onSubmit}>
        <label>
          Principal
          <input
            type="number"
            min="1"
            step="0.01"
            .value=${this.principal}
            @input=${(e) => (this.principal = e.target.value)}
            required
          />
        </label>

        <label>
          Annual Rate (%)
          <input
            type="number"
            min="0.01"
            step="0.01"
            .value=${this.annualRate}
            @input=${(e) => (this.annualRate = e.target.value)}
            required
          />
        </label>

        <label>
          Tenure (Months)
          <input
            type="number"
            min="1"
            step="1"
            .value=${this.tenureMonths}
            @input=${(e) => (this.tenureMonths = e.target.value)}
            required
          />
        </label>

        <button type="submit" ?disabled=${this.loading}>
          ${this.loading ? 'Calculating…' : 'Calculate EMI'}
        </button>
      </form>

      ${this.error ? html`<p class="error">${this.error}</p>` : ''}

      ${this.result
        ? html`
            <div class="result">
              <p><strong>Monthly EMI:</strong> ${this.result.monthly_emi}</p>
              <p><strong>Total Amount:</strong> ${this.result.total_amount}</p>
              <p><strong>Simple Interest:</strong> ${this.result.simple_interest}</p>
            </div>
          `
        : ''}
    `;
  }
}

customElements.define('emi-calculator', EmiCalculator);
