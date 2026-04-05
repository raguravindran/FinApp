import { LitElement, css, html } from 'lit';

class EmiHome extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
      background: radial-gradient(circle at top, #e8f1ff 0%, #f8fbff 40%, #ffffff 100%);
      color: #12264d;
      padding: 1.5rem clamp(1rem, 4vw, 3rem) 2.2rem;
      box-sizing: border-box;
    }

    .hero {
      max-width: 920px;
      margin: 0 auto;
      text-align: center;
      animation: fadeIn 420ms ease;
    }

    .logo {
      margin: 0 auto 1rem;
      width: 112px;
      height: 112px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 1.2rem;
      font-weight: 800;
      background: linear-gradient(145deg, #d8e7ff, #b3ccff);
      border: 4px solid #f0f5ff;
      box-shadow: 0 10px 22px #2858ac33;
      color: #173b80;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.5rem, 3.6vw, 2.3rem);
    }

    .description {
      margin: 0.8rem auto 0;
      line-height: 1.6;
      max-width: 700px;
      color: #2f4268;
    }

    .panel {
      max-width: 920px;
      margin: 1.2rem auto 0;
      background: #ffffff;
      border: 1px solid #d7e4ff;
      border-radius: 16px;
      padding: 1rem;
      box-shadow: 0 16px 30px #2e5aa00f;
    }

    .panel h2 {
      margin: 0;
      font-size: 1.15rem;
      color: #1b3d81;
    }

    .panel p {
      margin: 0.45rem 0 0;
      color: #415c8b;
    }

    a {
      color: #1d53b7;
      font-weight: 600;
      text-decoration: none;
    }

    emi-calculator {
      margin-top: 0.95rem;
      max-width: 100%;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  render() {
    return html`
      <section class="hero">
        <div class="logo" aria-label="FinApp logo placeholder">LOGO</div>
        <h1>EMI Studio</h1>
        <p class="description">
          From scattered finances to structured goals—this platform builds your complete financial
          game plan. Know where you stand, what you need, and exactly how to get there.
        </p>
      </section>



      <section class="panel">
        <h2>Prefer conversational planning?</h2>
        <p>Use FinApp Chat to ask finance-aware questions with backend context enrichment.</p>
        <p><a href="/chat">Open Chat Workspace →</a></p>
      </section>

      <section class="panel">
        <h2>Start with one thing: your EMI</h2>
        <p>
          Enter principal, annual interest rate, and loan tenure in months. You will instantly see
          monthly EMI, total amount payable, and total simple interest.
        </p>
        <emi-calculator></emi-calculator>
      </section>
    `;
  }
}

customElements.define('emi-home', EmiHome);
