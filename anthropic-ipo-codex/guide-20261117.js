'use strict';
(() => {
  const input = document.getElementById('example-price');
  const output = document.getElementById('share-result');
  const usd = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', minimumFractionDigits:2});
  function updateShares() {
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
  }
  input.addEventListener('input', updateShares);
  updateShares();
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
    title.style.fontSize = Math.min(210, width / 6.2) + 'px';
  }
  document.fonts.ready.then(fitTitle);
  window.addEventListener('resize', fitTitle);
  function revealSource() {
    if (!/^#s[1-7]$/.test(window.location.hash)) return;
    const source = document.getElementById(window.location.hash.slice(1));
    source.closest('details').open = true;
    source.scrollIntoView({block:'center'});
  }
  window.addEventListener('hashchange', revealSource);
  revealSource();

  const paths = {
    rising: [75, 85, 95, 105, 115],
    falling: [75, 65, 55, 45, 35],
    recovery: [75, 55, 45, 60, 80],
    gap: [100, 110, 120, 130, 140]
  };
  const pathInput = document.getElementById('price-path');
  function compareStrategies(prices) {
    const totalCents = 2500000;
    const results = [
      {name:'Single limit $90', shares:0, cash:totalCents, orders:[{budget:totalCents, limit:9000, filled:false}]},
      {name:'Ladder $90 / $80 / $75', shares:0, cash:totalCents, orders:[{budget:833333,limit:9000,filled:false},{budget:833333,limit:8000,filled:false},{budget:833334,limit:7500,filled:false}]},
      {name:'Scheduled $5K × 5', shares:0, cash:totalCents}
    ];
    prices.forEach(price => {
      const cents = Math.round(price * 100);
      results.forEach(result => {
        if (result.orders) {
          result.orders.forEach(order => {
            if (!order.filled && cents <= order.limit) {
              const quantity = Math.floor(order.budget / cents);
              result.shares += quantity;
              result.cash -= quantity * cents;
              order.filled = true;
            }
          });
        } else {
          const quantity = Math.floor(500000 / cents);
          result.shares += quantity;
          result.cash -= quantity * cents;
        }
      });
    });
    return results.map(result => ({...result, total:result.cash + result.shares * Math.round(prices[prices.length-1] * 100)}));
  }
  function updateComparison() {
    const prices = paths[pathInput.value];
    const path = document.getElementById('path-values');
    path.replaceChildren();
    prices.forEach((price,index) => {
      const node = document.createElement('span');
      const label = document.createElement('small');
      label.textContent = `WEEK ${index+1}`;
      node.append(label, `$${price}`);
      path.append(node);
    });
    const results = compareStrategies(prices);
    const table = document.getElementById('strategy-results');
    table.replaceChildren();
    results.forEach(result => {
      const row = document.createElement('tr');
      [result.name,result.shares.toLocaleString('en-US'),usd.format(result.cash/100),usd.format(result.total/100)].forEach((value,index) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        if (index === 0) cell.scope = 'row';
        cell.textContent = value;
        row.append(cell);
      });
      table.append(row);
    });
    const difference = (results[2].total-results[0].total)/100;
    document.getElementById('strategy-summary').textContent = `Scheduled buying finishes ${usd.format(Math.abs(difference))} ${difference >= 0 ? 'ahead of' : 'behind'} the single limit in this path. ${pathInput.value === 'gap' ? 'Both limit plans stay entirely in cash.' : 'All three ladder tiers fill together at the first $75 observation.'} No strategy wins every path.`;
  }
  pathInput.addEventListener('change', updateComparison);
  updateComparison();
})();
