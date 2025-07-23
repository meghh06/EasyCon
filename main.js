console.log("Main.js working");

const populate = async (value, currency) => {
    let myStr = "";
    const url = `https://api.currencyapi.com/v3/latest?apikey=cur_live_bwaypd9FLP1QCLynO03OLmKYOJRQ68eTkKSziy6R&base_currency=${currency}`;

    try {
        let response = await fetch(url);
        let rJson = await response.json();
        document.querySelector(".output").style.display = "block";

        for (let key of Object.keys(rJson["data"])) {
            myStr += ` <tr>
                            <td>${key}</td>
                            <td>${rJson["data"][key]["code"]}</td>
                            <td>${Math.round(rJson["data"][key]["value"] * value)}</td>
                        </tr>`;
        }
        document.querySelector("tbody").innerHTML = myStr;
    } catch (error) {
        alert("Error fetching currency data.");
        console.error('API fetch error:', error);
        // Try to log the response if available
        if (error instanceof Response) {
            error.text().then(txt => console.error('API error response:', txt));
        }
    }
};

const convertBtn = document.getElementById("convert-btn");
if (convertBtn) {
    convertBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const value = parseInt(document.querySelector("input[name='quantity']").value);
        const currency = document.querySelector("select[name='currency']").value;
        if (!isNaN(value) && currency) {
            populate(value, currency);
        }
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        target?.scrollIntoView({ behavior: "smooth" });
    });
});

document.getElementById("filterInput").addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const currency = row.children[0].textContent.toLowerCase();
        const code = row.children[1].textContent.toLowerCase();
        if (currency.includes(filter) || code.includes(filter)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});

function getMoonSVG() {
  return `<svg viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M21.5 19.5C18.5 22.5 13.5 22.5 10.5 19.5C7.5 16.5 7.5 11.5 10.5 8.5C11.5 7.5 12.5 7 13.5 6.5C13 8.5 13.5 11.5 16 14C18.5 16.5 21.5 17 23.5 16.5C23 17.5 22.5 18.5 21.5 19.5Z' fill='#f4d160'/></svg>`;
}
function getSunSVG() {
  return `<svg viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='14' cy='14' r='6' fill='#f4d160'/><g stroke='#eebc4a' stroke-width='2'><line x1='14' y1='2' x2='14' y2='6'/><line x1='14' y1='22' x2='14' y2='26'/><line x1='2' y1='14' x2='6' y2='14'/><line x1='22' y1='14' x2='26' y2='14'/><line x1='5.1' y1='5.1' x2='8.2' y2='8.2'/><line x1='19.8' y1='19.8' x2='22.9' y2='22.9'/><line x1='5.1' y1='22.9' x2='8.2' y2='19.8'/><line x1='19.8' y1='8.2' x2='22.9' y2='5.1'/></g></svg>`;
}
function setNightModeIcon(isDark) {
  const iconSpan = document.getElementById('night-mode-icon');
  if (!iconSpan) return;
  iconSpan.style.opacity = 0;
  setTimeout(() => {
    iconSpan.innerHTML = isDark ? getSunSVG() : getMoonSVG();
    iconSpan.style.transform = 'rotate(0deg)';
    iconSpan.style.opacity = 1;
  }, 200);
}
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('night-mode-toggle');
  const body = document.body;
  // Set initial mode from localStorage
  const isDark = localStorage.getItem('nightMode') === 'true';
  if (isDark) {
    body.classList.add('dark-mode');
  }
  setNightModeIcon(isDark);
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      body.classList.toggle('dark-mode');
      const isDarkNow = body.classList.contains('dark-mode');
      localStorage.setItem('nightMode', isDarkNow);
      setNightModeIcon(isDarkNow);
    });
  }
});

// --- Rate Alerts System ---
const alertForm = document.getElementById('alert-form');
const alertList = document.getElementById('alert-list');
const ALERTS_KEY = 'currencyRateAlerts';

function getAlerts() {
  return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]');
}
function saveAlerts(alerts) {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}
function renderAlerts() {
  const alerts = getAlerts();
  if (!alerts.length) {
    alertList.innerHTML = '<p style="color:#888;text-align:center;">No active alerts.</p>';
    return;
  }
  alertList.innerHTML = '<h3 class="active-alerts-title">Active Alerts</h3>' + alerts.map((a, i) => `
    <div style="background:#f3f4f6;padding:1rem 1.2rem;border-radius:0.7rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px #eebc4a11;">
      <div>
        <b>${a.from} → ${a.to}</b><br/>
        <span style="font-size:0.98em;">Alert when rate ${a.when === 'above' ? '>' : '<'} <b>${a.rate}</b></span>
      </div>
      <button class="btn" style="background:#e11d48;color:#fff;padding:0.4rem 1rem;font-size:0.95em;border-radius:0.5rem;" data-del="${i}">Delete</button>
    </div>
  `).join('');
  // Delete alert
  alertList.querySelectorAll('button[data-del]').forEach(btn => {
    btn.onclick = function() {
      const idx = +this.getAttribute('data-del');
      const alerts = getAlerts();
      alerts.splice(idx, 1);
      saveAlerts(alerts);
      renderAlerts();
    };
  });
}
renderAlerts();

if (alertForm) {
  alertForm.onsubmit = function(e) {
    e.preventDefault();
    const from = document.getElementById('from-currency').value;
    const to = document.getElementById('to-currency').value;
    const rate = parseFloat(document.getElementById('target-rate').value);
    const when = document.getElementById('alert-when').value;
    if (from === to) {
      alert('From and To currencies must be different.');
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid target rate.');
      return;
    }
    // Prevent duplicate
    const alerts = getAlerts();
    if (alerts.some(a => a.from === from && a.to === to && a.rate === rate && a.when === when)) {
      alert('This alert already exists.');
      return;
    }
    alerts.push({ from, to, rate, when });
    saveAlerts(alerts);
    renderAlerts();
    alertForm.reset();
  };
}

// Add swap button functionality for rate alert form
const swapBtn = document.getElementById('swap-currencies');
if (swapBtn) {
  swapBtn.addEventListener('click', function() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    if (fromSelect && toSelect) {
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
    }
  });
}

// --- Periodically check alerts (demo: every 30s) ---
async function checkAlerts() {
  const alerts = getAlerts();
  if (!alerts.length) return;
  // Fetch rates
  // Use the 'from' currency of the first alert as base (or default to USD)
  const base = alerts[0]?.from || 'USD';
  const url = `https://api.currencyapi.com/v3/latest?apikey=cur_live_bwaypd9FLP1QCLynO03OLmKYOJRQ68eTkKSziy6R&base_currency=${base}`;
  try {
    let response = await fetch(url);
    let rJson = await response.json();
    alerts.forEach((a, idx) => {
      const fromRate = rJson.data[a.from]?.value;
      const toRate = rJson.data[a.to]?.value;
      if (!fromRate || !toRate) return;
      // Calculate conversion rate
      const convRate = toRate / fromRate;
      if ((a.when === 'above' && convRate > a.rate) || (a.when === 'below' && convRate < a.rate)) {
        // Show notification
        showAlertNotification(a, convRate);
        // Remove alert after triggering
        const all = getAlerts();
        all.splice(idx, 1);
        saveAlerts(all);
        renderAlerts();
      }
    });
  } catch (err) {
    // Fail silently for demo
  }
}
function showAlertNotification(alert, currentRate) {
  // In-page notification
  const note = document.createElement('div');
  note.style.position = 'fixed';
  note.style.top = '32px';
  note.style.right = '32px';
  note.style.background = '#f4d160';
  note.style.color = '#232946';
  note.style.padding = '1.2rem 2rem';
  note.style.borderRadius = '1rem';
  note.style.boxShadow = '0 4px 24px #23294622';
  note.style.fontWeight = 'bold';
  note.style.fontSize = '1.1rem';
  note.style.zIndex = 9999;
  note.textContent = `Alert: ${alert.from} → ${alert.to} is now ${currentRate.toFixed(4)} (${alert.when} ${alert.rate})`;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 7000);
}
setInterval(checkAlerts, 30000);
// Also check on page load
checkAlerts();
