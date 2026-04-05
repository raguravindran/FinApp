import './chat-home.js';
import './emi-calculator.js';
import './emi-home.js';

const mount = document.getElementById('app');

if (mount) {
  if (window.location.pathname === '/chat') {
    mount.innerHTML = '<chat-home></chat-home>';
  } else {
    mount.innerHTML = '<emi-home></emi-home>';
  }
}
