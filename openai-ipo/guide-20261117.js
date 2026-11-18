'use strict';
(() => {
  const input = document.getElementById('example-price');
  const output = document.getElementById('share-result');
  const usd = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', minimumFractionDigits:2});
  input.addEventListener('input', () => {
    if (input.value.trim() === '') {
      output.textContent = 'Enter a price to see shares and unspent cash.';
      return;
    }
    const value = Number(input.value);
    if (!Number.isFinite(value) || !input.validity.valid || value <= 0) {
      output.textContent = 'Use a positive price with no more than two decimal places, up to $1 billion.';
      return;
    }
    const cents = Math.round(value * 100);
    const shares = Math.floor(2500000 / cents);
    const cost = shares * cents;
    output.textContent = `${shares.toLocaleString('en-US')} whole ${shares === 1 ? 'share' : 'shares'} · ${usd.format(cost/100)} invested · ${usd.format((2500000-cost)/100)} unspent. Illustrative only; excludes fees.`;
  });
  document.getElementById('copy-brief').addEventListener('click', async () => {
    const field = document.getElementById('research-brief');
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(field.value);
      status.textContent = 'Copied. Paste into Codex or Claude.';
    } catch {
      field.focus(); field.select();
      status.textContent = 'Brief selected. Use your copy shortcut.';
    }
  });
  function fitTitle() {
    const title = document.getElementById('title');
    const width = title.parentElement.clientWidth;
    title.style.fontSize = Math.min(210, width / 4.25) + 'px';
  }
  document.fonts.ready.then(fitTitle);
  window.addEventListener('resize', fitTitle);
  function revealSource() {
    if (!/^#s[1-6]$/.test(window.location.hash)) return;
    const source = document.getElementById(window.location.hash.slice(1));
    source.closest('details').open = true;
    source.scrollIntoView({block:'center'});
  }
  window.addEventListener('hashchange', revealSource);
  revealSource();
})();
