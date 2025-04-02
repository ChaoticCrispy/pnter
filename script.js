document.addEventListener('DOMContentLoaded', () => {
  initCanvasBackground();
  initTabs();
  initTypingParticles();
});


var particlesEnabled = false

function initTypingParticles() {
  const canvas = document.getElementById('typingParticlesCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
  }

  resize();

  window.addEventListener('resize', resize);

  function modifyFontSize(scale) {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
  
    const range = sel.getRangeAt(0);
    const selectedNodes = [];
  
    const treeWalker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(node);
          return range.intersectsNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );
  
    while (treeWalker.nextNode()) {
      selectedNodes.push(treeWalker.currentNode);
    }
  
    selectedNodes.forEach(textNode => {
      const span = document.createElement("span");
  
      const currentSize =
        parseFloat(window.getComputedStyle(textNode.parentElement).fontSize) || 16;
      const newSize = Math.max(6, currentSize * scale);
  
      span.style.fontSize = `${newSize}px`;
      span.textContent = textNode.textContent;
  
      textNode.parentNode.replaceChild(span, textNode);
    });
  
    sel.removeAllRanges();
  }

  const particles = [];

  function spawnParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 1.5) * 2,
        alpha: 1,
        radius: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 360}, 100%, 70%)`
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let p of particles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fill();

      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
    }

    // Remove faded particles
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('keydown', (e) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
  
    const range = sel.getRangeAt(0);
  
    if (
      e.ctrlKey || e.metaKey ||
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Backspace", "Delete"].includes(e.key)
    ) return;
  
    if (e.key === "Enter") return;
  
    if (e.key === "Tab") {
      e.preventDefault();
    
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
    
      const range = sel.getRangeAt(0);
      const tabSpan = document.createElement("span");
      tabSpan.textContent = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"; // 4 non-breaking spaces
      tabSpan.className = "fading-letter";
    
      range.insertNode(tabSpan);
    
      range.setStartAfter(tabSpan);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    
      tabSpan.addEventListener("animationend", () => {
        tabSpan.classList.remove("fading-letter");
      });
    
      return;
    }
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      modifyFontSize(1.5); 
      return;
    }
    
    if (e.key === '-') {
      e.preventDefault();
      modifyFontSize(0.5); 
      return;
    }
    if (e.key.length !== 1) return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
    
      // ✅ Replace selected text
      if (!range.collapsed) {
        range.deleteContents();
      }
    
      const char = e.key === " " ? "\u00A0" : e.key;
      const span = document.createElement("span");
      span.className = "fading-letter";
      span.textContent = char;
    
      range.insertNode(span);
    
      range.setStartAfter(span);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    
      span.addEventListener("animationend", () => {
        span.classList.remove("fading-letter");
      });
    
      // ✅ Save tab after typing
      const activeTab = document.querySelector('.tab-content.active');
      if (activeTab) {
        saveTabContent(activeTab.id);
      }
    
      // ✅ Optional: particles
      if (particlesEnabled) {
        const rect = span.getBoundingClientRect();
        const x = rect.left + rect.width;
        const y = rect.top + rect.height / 2 + window.scrollY;
        spawnParticles(x, y);
      }
    
      return;
    }
   
  });
 
}


function initCanvasBackground() {
  const canvas = document.getElementById('backgroundCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const dots = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5),
    vy: (Math.random() - 0.5),
    radius: Math.random() * 2 + 1,
  }));

  function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < dots.length; i++) {
      let dot = dots[i];
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#888";
      ctx.fill();

      for (let j = i + 1; j < dots.length; j++) {
        const dx = dot.x - dots[j].x;
        const dy = dot.y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(200, 200, 200, ${1 - dist / 100})`;
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }

      dot.x += dot.vx;
      dot.y += dot.vy;

      if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
      if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
    }

    requestAnimationFrame(drawDots);
  }

  drawDots();
}

function initTabs() {
  const tabContainer = document.getElementById('tab-container');
  const tabs = document.getElementById('tabs');
  const addTabBtn = document.getElementById('add-tab-button');

  const tabsList = JSON.parse(localStorage.getItem("tabs") || "[]");

  for (const tabId of tabsList) {
    const tabName = localStorage.getItem(`${tabId}-name`);
    const tabContent = localStorage.getItem(tabId);

    if (tabName && tabContent !== null) {
      const tabBtn = createTabButton(tabId, tabName);
      tabs.insertBefore(tabBtn, addTabBtn);

      const tabEl = document.createElement("div");
      tabEl.id = tabId;
      tabEl.className = "tab-content";
      tabEl.contentEditable = true;
      tabEl.innerHTML = tabContent;
      tabEl.addEventListener("input", () => saveTabContent(tabId));
      tabContainer.appendChild(tabEl);
    }
  }

  const firstTab = document.querySelector('.tab-button');
  const firstContent = document.querySelector('.tab-content');
  if (firstTab && firstContent) {
    firstTab.classList.add('active');
    firstContent.classList.add('active');
  }
}

function createTabButton(tabId, tabName = tabId) {
  const tabBtn = document.createElement('button');
  tabBtn.className = 'tab-button';

  const span = document.createElement('span');
  span.contentEditable = true;
  span.innerText = tabName;
  // Save name while editing
  span.oninput = () => renameTab(span, tabId);

  // Also save when done
  span.onblur = () => renameTab(span, tabId);

  // Prevent newlines on Enter
  span.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      span.blur(); // remove focus → triggers onblur
    }
  };
  const del = document.createElement('span');
  del.className = 'delete-tab';
  del.innerText = '✕';

  let holdTimeout;

  const initiateDelete = () => {
    del.classList.add('danger');
    holdTimeout = setTimeout(() => deleteTab(tabId, tabBtn), 1000);
  };

  const cancelDelete = () => {
    clearTimeout(holdTimeout);
    del.classList.remove('danger');
  };

  del.onmousedown = initiateDelete;
  del.onmouseup = del.onmouseleave = cancelDelete;
  del.ontouchstart = (e) => {
    e.preventDefault();
    initiateDelete();
  };
  del.ontouchend = del.ontouchcancel = cancelDelete;

  tabBtn.appendChild(span);
  tabBtn.appendChild(del);
  tabBtn.onclick = (e) => {
    if (e.target === del) return;
    openTab(e, tabId);
  };

  return tabBtn;
}

function openTab(evt, tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabName).classList.add('active');
  evt.currentTarget.classList.add('active');
}
function saveTabContent(id) {
  const content = document.getElementById(id).innerHTML;
  localStorage.setItem(id, content);
}
function renameTab(spanEl, id) {
  const name = spanEl.innerText.trim();
  localStorage.setItem(`${id}-name`, name);
}

function createTab() {
  const tabs = document.getElementById('tabs');
  const addTabBtn = document.getElementById('add-tab-button');
  const tabContainer = document.getElementById('tab-container');
  const tabsList = JSON.parse(localStorage.getItem("tabs") || "[]");

  const newId = `Tab${Date.now()}`;
  tabsList.push(newId);
  localStorage.setItem("tabs", JSON.stringify(tabsList));
  localStorage.setItem(`${newId}-name`, newId);
  localStorage.setItem(newId, "");

  const newButton = createTabButton(newId);
  tabs.insertBefore(newButton, addTabBtn);

  newButton.classList.add("animate-in");
  setTimeout(() => newButton.classList.remove("animate-in"), 300);
  tabs.insertBefore(newButton, addTabBtn);

  const newTab = document.createElement("div");
  newTab.id = newId;
  newTab.className = "tab-content";
  newTab.contentEditable = true;
  newTab.addEventListener("input", () => saveTabContent(newId));
  tabContainer.appendChild(newTab);

  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

  newButton.classList.add('active');
  newTab.classList.add('active');
}

function toggleParticles() {
  particlesEnabled = !particlesEnabled;

  const element = document.getElementById('particles-button');
  element.innerHTML = "particles: " + String(particlesEnabled).substring(-1,1).toUpperCase();
}

function deleteTab(tabId, tabBtn) {
  const tabContent = document.getElementById(tabId);
  tabBtn.remove();
  tabContent.remove();

  localStorage.removeItem(tabId);
  localStorage.removeItem(`${tabId}-name`);

  let tabsList = JSON.parse(localStorage.getItem("tabs") || "[]");
  tabsList = tabsList.filter(id => id !== tabId);
  localStorage.setItem("tabs", JSON.stringify(tabsList));

  const nextTab = document.querySelector(".tab-button");
  const nextContent = document.querySelector(".tab-content");
  if (nextTab && nextContent) {
    nextTab.classList.add("active");
    nextContent.classList.add("active");
  }
}
