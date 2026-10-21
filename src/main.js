import './style.css';
import { renderHome } from './views/home.js';
import { renderLayout } from './views/layout.js';
import { renderBuilder } from './views/builder.js';
import { renderQuiz } from './views/quiz.js';

const ROUTES = {
  '': renderHome,
  layout: renderLayout,
  baukasten: renderBuilder,
  quiz: (el) => renderQuiz(el, { mode: 'quiz' }),
  karten: (el) => renderQuiz(el, { mode: 'cards' }),
};

const main = document.getElementById('app');

function route() {
  const name = location.hash.replace(/^#\/?/, '');
  const render = ROUTES[name] ?? renderHome;
  const view = document.createElement('div');
  main.replaceChildren(view);
  render(view);
  const navName = name === 'karten' ? 'quiz' : name;
  document.querySelectorAll('.tabbar a').forEach((a) => {
    a.toggleAttribute('aria-current', a.dataset.route === navName);
  });
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();

// In der Android-App (Capacitor) liegen die Dateien bereits lokal – dort kein Service Worker.
const isNativeApp = Boolean(window.Capacitor?.isNativePlatform?.());

if ('serviceWorker' in navigator && import.meta.env.PROD && !isNativeApp) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('Service Worker:', err));
  });
}
