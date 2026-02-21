/**
 * Content script: injects "Install Whispers" button on objkt.com pages.
 * Click opens the install page (Chrome Web Store or repo instructions).
 */
(function () {
  'use strict';

  // Replace with your Chrome Web Store URL once published, e.g.:
  // https://chrome.google.com/webstore/detail/tezos-chat/XXXXXXXXXX
  const INSTALL_URL = 'https://github.com/Paulwhoisaghostnet/whispers#installation';

  const id = 'tezos-chat-install-button';

  if (document.getElementById(id)) return;

  const btn = document.createElement('a');
  btn.id = id;
  btn.href = INSTALL_URL;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.textContent = 'Install Whispers';
  btn.setAttribute('role', 'button');

  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483646',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#fff',
    backgroundColor: '#2d7ff9',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 14px rgba(45, 127, 249, 0.45)',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  });

  btn.addEventListener('mouseenter', function () {
    btn.style.transform = 'scale(1.04)';
    btn.style.boxShadow = '0 6px 20px rgba(45, 127, 249, 0.5)';
  });
  btn.addEventListener('mouseleave', function () {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 14px rgba(45, 127, 249, 0.45)';
  });

  document.body.appendChild(btn);
})();
