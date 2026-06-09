// ====================== FINAL SCRIPT – SINGLE USER + LOUNGE (ALIAS PERSISTS UNTIL LOGOUT) ======================
(function () {
  window.addEventListener('DOMContentLoaded', () => {
    // ---------- DOM elements ----------
    const gatewayOverlay = document.getElementById('gatewayOverlay');
    const gatewayCanvas = document.getElementById('gateway-canvas');
    const matrixCanvas = document.getElementById('matrix-canvas');
    const appContainer = document.getElementById('app');
    const unlockBtn = document.getElementById('unlockBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorSpan = document.getElementById('errorMsg');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const extraMenu = document.getElementById('extraMenu');
    const navItems = document.querySelectorAll('.nav-item');
    const typingSpan = document.getElementById('typing-text');
    const sectionLoader = document.getElementById('section-loader');
    const logoutLink = document.getElementById('logoutLink');

    // ---------- GATEWAY 3D (red theme, Three.js) ----------
    let gatewayRenderer, gatewayScene, gatewayCamera, gatewayAnimId;
    function initGateway3D() {
      gatewayCanvas.style.display = 'block';
      gatewayScene = new THREE.Scene();
      gatewayScene.background = new THREE.Color(0x050005);
      gatewayScene.fog = new THREE.FogExp2(0x050005, 0.008);
      gatewayCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      gatewayCamera.position.set(0, 1.5, 12);
      gatewayRenderer = new THREE.WebGLRenderer({ canvas: gatewayCanvas, alpha: false });
      gatewayRenderer.setSize(window.innerWidth, window.innerHeight);
      gatewayRenderer.setPixelRatio(window.devicePixelRatio);

      const pCount = 3000;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 70;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 45;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xff0044, size: 0.09, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
      const particles = new THREE.Points(pGeo, pMat);
      gatewayScene.add(particles);

      const knotGeo = new THREE.TorusKnotGeometry(1.5, 0.3, 200, 32, 3, 4);
      const knotMat = new THREE.MeshStandardMaterial({ color: 0xff0044, emissive: 0x440000, emissiveIntensity: 0.8 });
      const knot = new THREE.Mesh(knotGeo, knotMat);
      knot.position.set(0, -0.8, -3);
      gatewayScene.add(knot);
      const wireKnot = new THREE.Mesh(knotGeo, new THREE.MeshBasicMaterial({ color: 0xff6666, wireframe: true, transparent: true, opacity: 0.3 }));
      wireKnot.position.copy(knot.position);
      gatewayScene.add(wireKnot);

      const triGeo = new THREE.ConeGeometry(0.2, 0.4, 3);
      const triMat = new THREE.MeshStandardMaterial({ color: 0xff0044, emissive: 0x330000 });
      const triangles = [];
      for (let i = 0; i < 60; i++) {
        const tri = new THREE.Mesh(triGeo, triMat);
        tri.position.set((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 20 - 10);
        tri.userData = { rotSpeed: 0.01 + Math.random() * 0.02, floatY: tri.position.y };
        gatewayScene.add(tri);
        triangles.push(tri);
      }

      const grid = new THREE.GridHelper(55, 40, 0xff0044, 0x550000);
      grid.position.y = -3.5;
      grid.material.transparent = true;
      grid.material.opacity = 0.4;
      gatewayScene.add(grid);

      const ambient = new THREE.AmbientLight(0x220000);
      gatewayScene.add(ambient);
      const redLight = new THREE.PointLight(0xff0044, 1.2);
      redLight.position.set(2, 3, 4);
      gatewayScene.add(redLight);
      const backLight = new THREE.PointLight(0xaa0000, 0.7);
      backLight.position.set(-2, 1, -5);
      gatewayScene.add(backLight);
      const cursorLight = new THREE.PointLight(0xff3366, 0.9);
      cursorLight.distance = 15;
      gatewayScene.add(cursorLight);

      let mouseX = 0, mouseY = 0;
      document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        cursorLight.position.x = mouseX * 5;
        cursorLight.position.y = -mouseY * 3 + 1;
        cursorLight.position.z = 4;
      });

      let time = 0;
      function animateGateway() {
        gatewayAnimId = requestAnimationFrame(animateGateway);
        time += 0.012;
        knot.rotation.x += 0.008;
        knot.rotation.y += 0.012;
        knot.rotation.z += 0.005;
        wireKnot.rotation.copy(knot.rotation);
        particles.rotation.y = time * 0.05;
        particles.rotation.x = Math.sin(time * 0.2) * 0.1;
        triangles.forEach((tri, idx) => {
          tri.rotation.y += 0.015;
          tri.rotation.x += 0.01;
          tri.position.y = tri.userData.floatY + Math.sin(time * 1.5 + idx) * 0.2;
        });
        redLight.intensity = 0.9 + Math.sin(time * 5) * 0.4;
        gatewayCamera.position.x += (mouseX * 0.8 - gatewayCamera.position.x) * 0.05;
        gatewayCamera.position.y += (-mouseY * 0.5 - gatewayCamera.position.y) * 0.05;
        gatewayCamera.lookAt(0, 0, -1);
        gatewayRenderer.render(gatewayScene, gatewayCamera);
      }
      animateGateway();

      window.addEventListener('resize', () => {
        gatewayCamera.aspect = window.innerWidth / window.innerHeight;
        gatewayCamera.updateProjectionMatrix();
        gatewayRenderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    // ---------- MATRIX RAIN ----------
    let matrixCtx, matrixAnimId;
    const fontSize = 14;
    let columns, drops;

    function initMatrixRain() {
      matrixCanvas.style.display = 'block';
      matrixCtx = matrixCanvas.getContext('2d');

      function resizeMatrix() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        columns = Math.floor(matrixCanvas.width / fontSize);
        drops = Array(columns).fill(1);
      }
      window.addEventListener('resize', resizeMatrix);
      resizeMatrix();

      const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
      function draw() {
        matrixCtx.fillStyle = 'rgba(1, 1, 8, 0.12)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        matrixCtx.fillStyle = '#00ff9f';
        matrixCtx.font = '18px monospace';
        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        matrixAnimId = requestAnimationFrame(draw);
      }
      draw();
    }

    // ---------- HARDCODED AUTH ----------
    function setCurrentUser(user) {
      localStorage.setItem('maxagain_current_user', JSON.stringify(user));
    }
    function getCurrentUser() {
      return JSON.parse(localStorage.getItem('maxagain_current_user') || 'null');
    }
    function clearCurrentUser() {
      localStorage.removeItem('maxagain_current_user');
      localStorage.removeItem('lounge_alias'); // clear lounge alias on logout
    }

    function handleLogin() {
      const user = usernameInput.value.trim();
      const pwd = passwordInput.value.trim();
      if (!user || !pwd) {
        errorSpan.textContent = '⚠️ Fill both fields.';
        return;
      }
      if (user !== 'issan' || pwd !== 'max') {
        errorSpan.textContent = '⛔ Invalid credentials. Check LinkedIn/GitHub.';
        return;
      }
      setCurrentUser({ username: 'issan', firstname: 'Max' });
      enterDashboard();
    }

    function enterDashboard() {
      cancelAnimationFrame(gatewayAnimId);
      gatewayRenderer.dispose();
      gatewayCanvas.style.display = 'none';
      gatewayOverlay.classList.add('hidden');
      appContainer.classList.add('active');
      initMatrixRain();
      populateWebAttacksContent();
      activateSection('home');

      if (typingSpan) typingSpan.innerHTML = '';
      const introText = "I'm Max! a developer, hacker, security researcher, bug hunter and yeah, an aspiring red team specialist. I live and breathe web vulns, network security, malware analysis, cryptography, binary exploitation, reverse engineering… the whole deal;)";
      let idx = 0;
      function typeEffect() {
        if (idx < introText.length && typingSpan) {
          typingSpan.innerHTML += introText.charAt(idx);
          idx++;
          setTimeout(typeEffect, 20);
        }
      }
      typeEffect();
    }

    unlockBtn.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });

    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        clearCurrentUser();
        location.reload();
      });
    }

    // Auto‑login if already authenticated
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.username === 'issan') {
      window.addEventListener('load', () => {
        cancelAnimationFrame(gatewayAnimId);
        if (gatewayRenderer) {
          gatewayRenderer.dispose();
          gatewayCanvas.style.display = 'none';
        }
        gatewayOverlay.classList.add('hidden');
        appContainer.classList.add('active');
        initMatrixRain();
        populateWebAttacksContent();
        activateSection('home');
        if (typingSpan) typingSpan.innerHTML = '';
        const introText = "I'm Max! a developer, hacker, security researcher, bug hunter and yeah, an aspiring red team specialist. I live and breathe web vulns, network security, malware analysis, cryptography, binary exploitation, reverse engineering… the whole deal;)";
        let idx = 0;
        function typeEffect() {
          if (idx < introText.length && typingSpan) {
            typingSpan.innerHTML += introText.charAt(idx);
            idx++;
            setTimeout(typeEffect, 20);
          }
        }
        typeEffect();
      }, { once: true });
    }

    // ---------- DYNAMIC TAB SWITCHING ----------
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.server-btn[data-tab]');
      if (!btn) return;
      const tabsContainer = btn.closest('.server-tabs');
      if (!tabsContainer) return;
      const tabId = btn.getAttribute('data-tab');
      const sectionParent = tabsContainer.parentNode;

      tabsContainer.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      sectionParent.querySelectorAll(':scope > .tab-content').forEach(div => {
        div.classList.remove('active');
      });

      const target = sectionParent.querySelector(`#tab-${tabId}`);
      if (target) {
        target.classList.add('active');
      }
    });

    // ---------- DYNAMIC SECTION LOADING ----------
    async function loadSection(targetId) {
      if (targetId === 'home') {
        document.getElementById('home-section').classList.add('active');
        if (sectionLoader) sectionLoader.classList.remove('active');
        updateActiveNav(targetId);
        return;
      }
      if (targetId === 'contact-admin') {
        document.getElementById('home-section').classList.remove('active');
        if (sectionLoader) {
          sectionLoader.classList.add('active');
          try {
            const res = await fetch('sections/contact-admin/contact-admin.html');
            if (res.ok) {
              sectionLoader.innerHTML = await res.text();
              setTimeout(() => initContactAdmin(), 100);
            } else {
              sectionLoader.innerHTML = '<div class="glass-card p-4 text-cyber-red">Contact page not found.</div>';
            }
          } catch {
            sectionLoader.innerHTML = '<div class="glass-card p-4 text-cyber-red">Failed to load contact page.</div>';
          }
        }
        updateActiveNav(targetId);
        return;
      }
      if (targetId === 'hackers-lounge') {
        document.getElementById('home-section').classList.remove('active');
        if (sectionLoader) {
          sectionLoader.classList.add('active');
          try {
            const res = await fetch('sections/hackers-lounge/hackers-lounge.html');
            if (res.ok) {
              sectionLoader.innerHTML = await res.text();
              setTimeout(() => initHackersLounge(), 150);
            } else {
              sectionLoader.innerHTML = '<div class="glass-card p-4 text-cyber-red">Lounge not found.</div>';
            }
          } catch {
            sectionLoader.innerHTML = '<div class="glass-card p-4 text-cyber-red">Failed to load lounge.</div>';
          }
        }
        updateActiveNav(targetId);
        return;
      }

      document.getElementById('home-section').classList.remove('active');
      if (sectionLoader) {
        sectionLoader.classList.add('active');
        sectionLoader.innerHTML = '<div class="glass-card p-4 text-center">Loading...</div>';
      }
      try {
        const res = await fetch(`sections/${targetId}/${targetId}.html`);
        if (!res.ok) throw new Error('Not found');
        const html = await res.text();
        if (sectionLoader) sectionLoader.innerHTML = html;
        if (targetId === 'web-attacks') populateWebAttacksContent();
        updateActiveNav(targetId);
      } catch {
        if (sectionLoader) sectionLoader.innerHTML = '<div class="glass-card p-4 text-cyber-red">⚠️ Failed to load section.</div>';
      }
    }

    function updateActiveNav(targetId) {
      navItems.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.target === targetId) link.classList.add('active');
      });
    }

    function activateSection(targetId) { loadSection(targetId); }

    navItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const target = item.dataset.target;
        if (target) activateSection(target);
        if (extraMenu && !extraMenu.classList.contains('hidden')) extraMenu.classList.add('hidden');
      });
    });

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => extraMenu.classList.toggle('hidden'));
    }

    document.body.addEventListener('click', e => {
      if (e.target.classList.contains('navigate-btn')) {
        const target = e.target.dataset.target;
        if (target) activateSection(target);
      }
    });

    // ---------- HACKER'S LOUNGE (FINAL: alias persists until logout) ----------
    function initHackersLounge() {
      const nameEntry = document.getElementById('lounge-name-entry');
      const keyDiv = document.getElementById('lounge-key');
      const verifyDiv = document.getElementById('lounge-verify');
      const chatDiv = document.getElementById('lounge-chat');

      const aliasInput = document.getElementById('alias-input');
      const aliasError = document.getElementById('alias-error');
      const generateBtn = document.getElementById('generate-key-btn');
      const generatedKeySpan = document.getElementById('generated-key');
      const enterLoungeBtn = document.getElementById('enter-lounge-btn');
      const verifyAliasDisplay = document.getElementById('verify-alias-display');
      const keyInput = document.getElementById('key-input');
      const verifyBtn = document.getElementById('verify-btn');
      const verifyError = document.getElementById('verify-error');

      let currentKey = '';
      let operatorAlias = '';

      // Check localStorage for saved alias (persists until logout)
      const savedAlias = localStorage.getItem('lounge_alias');
      if (savedAlias) {
        operatorAlias = savedAlias;
        showChat();
        return;
      }

      // Particle background
      const canvas = document.getElementById('lounge-particles');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const particles = [];
        for (let i = 0; i < 80; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
          });
        }
        function animate() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#00ff9f';
          particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          });
          requestAnimationFrame(animate);
        }
        animate();
      }

      generateBtn.addEventListener('click', () => {
        const alias = aliasInput.value.trim();
        if (!alias) {
          aliasError.textContent = 'Please enter a name.';
          return;
        }
        operatorAlias = alias;
        aliasError.textContent = '';
        // generate 4-char key
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        currentKey = '';
        for (let i = 0; i < 4; i++) {
          currentKey += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        generatedKeySpan.textContent = currentKey;
        nameEntry.classList.add('hidden');
        keyDiv.classList.remove('hidden');
      });

      enterLoungeBtn.addEventListener('click', () => {
        keyDiv.classList.add('hidden');
        verifyDiv.classList.remove('hidden');
        verifyAliasDisplay.textContent = operatorAlias;
        keyInput.value = '';
        verifyError.textContent = '';
        keyInput.focus();
      });

      verifyBtn.addEventListener('click', () => {
        if (keyInput.value.trim() === currentKey) {
          localStorage.setItem('lounge_alias', operatorAlias);
          showChat();
        } else {
          verifyError.textContent = '⛔ Wrong key. Try again.';
          keyInput.value = '';
          keyInput.focus();
        }
      });

      keyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyBtn.click();
      });

      function showChat() {
        verifyDiv.classList.add('hidden');
        chatDiv.classList.remove('hidden');
        initChat();
      }

      function initChat() {
        const messagesRef = db.ref('lounge/messages');
        const messagesList = document.getElementById('messages-list');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        if (!messagesList || !chatInput || !sendBtn) return;

        messagesRef.limitToLast(50).on('child_added', (snapshot) => {
          const msg = snapshot.val();
          addMessageToUI(msg);
          const container = document.getElementById('chat-messages');
          if (container) container.scrollTop = container.scrollHeight;
        });

        function addMessageToUI(msg) {
          const div = document.createElement('div');
          div.style.marginBottom = '6px';
          div.style.padding = '4px 8px';
          div.style.borderRadius = '8px';
          div.style.background = 'rgba(0, 255, 159, 0.05)';
          div.innerHTML = `<span style="color: var(--neon-green); font-weight: 600;">${escapeHtml(msg.sender)}</span> <span style="color: #888; font-size: 0.7rem;">${msg.timestamp}</span><br><span style="color: #ddd;">${escapeHtml(msg.text)}</span>`;
          messagesList.appendChild(div);
        }

        function escapeHtml(text) {
          const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
          return text.replace(/[&<>"']/g, m => map[m]);
        }

        function enforceMessageLimit() {
          messagesRef.once('value', (snapshot) => {
            const count = snapshot.numChildren();
            if (count > 100) {
              const firstChild = Object.keys(snapshot.val())[0];
              if (firstChild) messagesRef.child(firstChild).remove();
            }
          });
        }

        function sendMessage() {
          const text = chatInput.value.trim();
          if (!text) return;
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          messagesRef.push({ sender: operatorAlias, text, timestamp }).then(() => enforceMessageLimit());
          chatInput.value = '';
        }

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
        enforceMessageLimit();
      }
    }

    // ---------- CONTACT ADMIN ----------
    function initContactAdmin() {
      const quotes = [
        "“The quieter the packets, the louder the breach.”",
        "“Every app is secure until a curious mind arrives.”",
        "“Logs don’t lie. Developers sometimes do.”",
        "“There’s always another hidden endpoint.”",
        "“Trust is the biggest vulnerability.”"
      ];
      let quoteIdx = 0;
      const quoteEl = document.getElementById('rotating-quote');
      if (quoteEl) setInterval(() => { quoteIdx = (quoteIdx + 1) % quotes.length; quoteEl.textContent = quotes[quoteIdx]; }, 5000);

      const facts = [
        "The first computer worm was released in 1988.",
        "Android malware often abuses Accessibility Services.",
        "Most breaches start with human mistakes.",
        "A single leaked API key can expose millions.",
        "Stuxnet was the first known cyber weapon."
      ];
      let factIdx = 0;
      const factEl = document.getElementById('fun-fact');
      if (factEl) setInterval(() => { factIdx = (factIdx + 1) % facts.length; factEl.textContent = facts[factIdx]; }, 6000);

      const tips = [
        "Use a password manager. Your memory is not a secure vault.",
        "Enable MFA everywhere. SMS is better than nothing.",
        "Never reuse passwords across important accounts.",
        "Verify links before clicking – preview the URL.",
        "Keep your devices and apps updated."
      ];
      let tipIdx = 0;
      const tipEl = document.getElementById('security-tip');
      if (tipEl) setInterval(() => { tipIdx = (tipIdx + 1) % tips.length; tipEl.textContent = tips[tipIdx]; }, 8000);

      const jokes = [
        "“99 little bugs in the code… patch one down, 127 vulnerabilities appear.”",
        "“Works on my machine ≠ secure.”",
        "“Turning it off and on again fixes surprisingly many things.”",
        "“There’s no cloud, it’s just someone else’s computer.”",
        "“A SQL query walks into a bar, joins two tables and returns nothing.”"
      ];
      let jokeIdx = 0;
      const jokeEl = document.getElementById('hacker-humor');
      if (jokeEl) setInterval(() => { jokeIdx = (jokeIdx + 1) % jokes.length; jokeEl.textContent = jokes[jokeIdx]; }, 7000);

      const statuses = ["☕ Probably reversing APKs", "🛠️ Writing exploits", "📡 Sniffing packets", "🎧 Listening to synthwave", "💤 Offline (rarely)"];
      let statusIdx = 0;
      const statusEl = document.getElementById('status-line');
      if (statusEl) setInterval(() => { statusIdx = (statusIdx + 1) % statuses.length; statusEl.textContent = statuses[statusIdx]; }, 4000);

      const uptimeEl = document.getElementById('uptime');
      if (uptimeEl) {
        const start = Date.now();
        setInterval(() => {
          const diff = Math.floor((Date.now() - start) / 1000);
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          uptimeEl.textContent = `${h}h ${m}m`;
        }, 10000);
      }

      const terminalInput = document.getElementById('terminal-input');
      const terminalOutput = document.getElementById('terminal-output');
      const terminalBtn = document.getElementById('terminal-btn');

      function handleTerminal(command) {
        const cmd = command.toLowerCase().trim();
        let response = '';
        switch(cmd) {
          case 'help': response = 'Available commands: help, socials, projects, latest, coffee, secrets'; break;
          case 'socials': response = 'Instagram, LinkedIn, Telegram, Twitter, GitHub, Email – all links below.'; break;
          case 'projects': response = 'This dashboard, bug bounty tools, Android reversing lab, Wi‑Fi pentest framework.'; break;
          case 'latest': response = 'Currently reversing Android Binder & studying web cache poisoning.'; break;
          case 'coffee': response = '☕ Coffee counter overflow. Infinite cups consumed.'; break;
          case 'secrets': response = 'Access denied. Nice try though :)'; break;
          case 'matrix': document.body.style.background = '#000'; response = 'Matrix mode activated. Refresh to return.'; break;
          default: response = `Command not found: ${cmd}. Try 'help'.`;
        }
        if (terminalOutput) terminalOutput.textContent = response;
      }

      if (terminalBtn && terminalInput && terminalOutput) {
        terminalBtn.addEventListener('click', () => {
          handleTerminal(terminalInput.value);
          terminalInput.value = '';
        });
        terminalInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            handleTerminal(terminalInput.value);
            terminalInput.value = '';
          }
        });
      }
    }

    // ---------- POPULATE WEB ATTACKS ----------
    function populateWebAttacksContent() {
      const toolsGrid = document.getElementById('toolsGrid');
      if (toolsGrid) toolsGrid.innerHTML = '';

      const toolsData = [
        { name: 'Subfinder', desc: 'Fast subdomain discovery', cmd: 'go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest', link: 'https://github.com/projectdiscovery/subfinder' },
        { name: 'Amass', desc: 'Deep DNS enumeration', cmd: 'sudo apt install amass', link: 'https://github.com/OWASP/Amass' },
        { name: 'Assetfinder', desc: 'Quick asset mapping', cmd: 'go install github.com/tomnomnom/assetfinder@latest', link: 'https://github.com/tomnomnom/assetfinder' },
        { name: 'httpx', desc: 'Alive hosts', cmd: 'go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest', link: 'https://github.com/projectdiscovery/httpx' },
        { name: 'naabu', desc: 'Port scanner', cmd: 'go install -v github.com/projectdiscovery/naabu/v2/cmd/naabu@latest', link: 'https://github.com/projectdiscovery/naabu' },
        { name: 'gau', desc: 'Historical URLs', cmd: 'go install github.com/lc/gau/v2/cmd/gau@latest', link: 'https://github.com/lc/gau' },
        { name: 'katana', desc: 'Deep crawler', cmd: 'go install github.com/projectdiscovery/katana/cmd/katana@latest', link: 'https://github.com/projectdiscovery/katana' },
        { name: 'ffuf', desc: 'Fuzzing', cmd: 'sudo apt install ffuf', link: 'https://github.com/ffuf/ffuf' },
        { name: 'nuclei', desc: 'Vuln scanner', cmd: 'go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest', link: 'https://github.com/projectdiscovery/nuclei' },
        { name: 'shortscan', desc: 'IIS shortname', cmd: 'go install github.com/bitquark/shortscan/cmd/shortscan@latest', link: 'https://github.com/bitquark/shortscan' },
      ];
      if (toolsGrid) {
        toolsData.forEach(t => {
          const card = document.createElement('div');
          card.className = 'glass-card';
          card.innerHTML = `<div class="text-neon-green font-bold">${t.name}</div><p class="text-sm my-2">${t.desc}</p><div class="code-block relative"><button class="copy-btn">📋</button><pre>${t.cmd}</pre></div><a href="${t.link}" target="_blank" class="text-neon-blue text-xs underline">🔗 Link</a>`;
          toolsGrid.appendChild(card);
        });
      }

      const burpGrid = document.getElementById('burpGrid');
      if (burpGrid) burpGrid.innerHTML = '';
      const burpExt = [{ name: 'Autorize' }, { name: 'Param Miner' }, { name: 'Turbo Intruder' }, { name: 'Logger++' }, { name: 'Active Scan++' }, { name: 'Collaborator Everywhere' }];
      if (burpGrid) {
        burpExt.forEach(b => {
          const div = document.createElement('div');
          div.className = 'glass-card';
          div.innerHTML = `<i class="fas fa-puzzle-piece"></i> <strong>${b.name}</strong>`;
          burpGrid.appendChild(div);
        });
      }

      const browserGrid = document.getElementById('browserGrid');
      if (browserGrid) browserGrid.innerHTML = '';
      const browserExt = ['Wappalyzer', 'FoxyProxy', 'Link Gopher', 'HackBar', 'JSON Viewer', 'TruffleHog', 'DotGit', 'Retire.js'];
      if (browserGrid) {
        browserExt.forEach(b => {
          const div = document.createElement('div');
          div.className = 'glass-card';
          div.innerHTML = `<i class="fab fa-chrome"></i> <strong>${b}</strong>`;
          browserGrid.appendChild(div);
        });
      }

      const bookmarkGrid = document.getElementById('bookmarkGrid');
      if (bookmarkGrid) bookmarkGrid.innerHTML = '';
      const bookmarks = [
        { name: 'HackTricks', url: 'https://book.hacktricks.xyz/' },
        { name: 'PortSwigger', url: 'https://portswigger.net/web-security' },
        { name: 'PayloadsAllTheThings', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings' },
        { name: 'crt.sh', url: 'https://crt.sh' },
        { name: 'Shodan', url: 'https://shodan.io' },
        { name: 'XSS Hunter', url: 'https://xsshunter.com' },
        { name: 'Webhook.site', url: 'https://webhook.site' },
      ];
      if (bookmarkGrid) {
        bookmarks.forEach(b => {
          const a = document.createElement('a');
          a.href = b.url;
          a.target = '_blank';
          a.className = 'glass-card text-center';
          a.textContent = `📌 ${b.name}`;
          bookmarkGrid.appendChild(a);
        });
      }

      const resourcesGrid = document.getElementById('resourcesGrid');
      if (resourcesGrid) resourcesGrid.innerHTML = '';
      const resourcesArr = [
        { name: 'PayloadsAllTheThings', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings' },
        { name: 'Nuclei Templates', url: 'https://github.com/projectdiscovery/nuclei-templates' },
        { name: 'ParamSpider', url: 'https://github.com/devanshbatham/ParamSpider' },
        { name: 'HackerOne Hacktivity', url: 'https://www.hackerone.com/hacktivity' },
      ];
      if (resourcesGrid) {
        resourcesArr.forEach(r => {
          const a = document.createElement('a');
          a.href = r.url;
          a.target = '_blank';
          a.className = 'glass-card text-center';
          a.innerHTML = `<i class="fab fa-github"></i> ${r.name}`;
          resourcesGrid.appendChild(a);
        });
      }

      const checklistDiv = document.getElementById('checklistContainer');
      if (checklistDiv) checklistDiv.innerHTML = '';
      const checklistGroups = {
        'Pre-Hunt': ['Read scope', 'Rate limits', 'Burp ready', 'Webhook setup', 'VPN'],
        Recon: ['Subfinder', 'Amass', 'Assetfinder', 'CRT.sh', 'Historical URLs', 'HTTPX'],
        Fuzzing: ['Nuclei', 'Directory fuzzing', 'Param fuzzing', 'IIS shortname'],
        'Manual Testing': ['IDOR', 'XSS', 'SQLi', 'Open redirect', 'SSRF', 'LFI', 'Command Inj'],
      };
      let savedCheck = JSON.parse(localStorage.getItem('maxBugChecklist') || '{}');
      if (checklistDiv) {
        for (const [group, items] of Object.entries(checklistGroups)) {
          const groupDiv = document.createElement('div');
          groupDiv.className = 'checklist-group';
          groupDiv.innerHTML = `<h4 class="text-neon-blue text-xl">${group}</h4>`;
          items.forEach(item => {
            const id = `${group}_${item}`.replace(/ /g, '_');
            const checked = savedCheck[id] || false;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checklist-item';
            itemDiv.innerHTML = `<input type="checkbox" data-id="${id}" ${checked ? 'checked' : ''}> <label>${item}</label>`;
            groupDiv.appendChild(itemDiv);
          });
          checklistDiv.appendChild(groupDiv);
        }
        checklistDiv.addEventListener('change', e => {
          if (e.target.type === 'checkbox') {
            const id = e.target.dataset.id;
            savedCheck[id] = e.target.checked;
            localStorage.setItem('maxBugChecklist', JSON.stringify(savedCheck));
          }
        });
      }

      const serverTabsDiv = document.getElementById('serverTabs');
      const serverContentPre = document.querySelector('#serverContent pre');
      const servers = {
        IIS: 'Check: Server: Microsoft-IIS\nTest: shortscan --isvuln URL\nBugs: Shortname (~1), WebDAV PUT',
        Apache: 'Check: Server: Apache\nTest: path traversal, mod_cgi Shellshock\nBugs: .htaccess misconfig',
        Nginx: 'Check: nginx header\nTest: alias traversal, CRLF injection\nBugs: /files../ bypass',
        Tomcat: 'Check: /manager/html\nTest: default admin:admin\nBugs: WAR upload',
        'Node.js': 'Check: X-Powered-By: Express\nTest: prototype pollution (__proto__)',
      };
      let activeServer = 'IIS';
      function renderServerTabs() {
        if (!serverTabsDiv) return;
        serverTabsDiv.innerHTML = '';
        Object.keys(servers).forEach(s => {
          const btn = document.createElement('div');
          btn.className = `server-btn ${activeServer === s ? 'active' : ''}`;
          btn.innerText = s;
          btn.onclick = () => { activeServer = s; renderServerTabs(); if (serverContentPre) serverContentPre.innerText = servers[s]; };
          serverTabsDiv.appendChild(btn);
        });
        if (serverContentPre) serverContentPre.innerText = servers[activeServer];
      }
      renderServerTabs();

      const searchInput = document.getElementById('global-search');
      if (searchInput && !searchInput.hasAttribute('data-listener')) {
        searchInput.setAttribute('data-listener', 'true');
        searchInput.addEventListener('input', e => {
          const term = e.target.value.toLowerCase();
          document.querySelectorAll('#section-loader .glass-card, #section-loader .code-block, #section-loader .checklist-item')
            .forEach(card => { card.style.display = term === '' || card.innerText.toLowerCase().includes(term) ? '' : 'none'; });
        });
      }
    }

    // Copy buttons
    document.body.addEventListener('click', e => {
      if (e.target.classList.contains('copy-btn')) {
        const block = e.target.closest('.code-block');
        if (block) {
          const pre = block.querySelector('pre');
          if (pre) {
            navigator.clipboard.writeText(pre.innerText);
            const orig = e.target.innerText;
            e.target.innerText = '✔️';
            setTimeout(() => e.target.innerText = orig, 1200);
          }
        }
      }
    });

    initGateway3D();
  });
})();