(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const starCanvas = document.querySelector('.starfield-canvas');
  if (starCanvas && !reducedMotion) {
    const context = starCanvas.getContext('2d');
    let stars = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    const resizeStarfield = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      starCanvas.width = Math.round(width * ratio);
      starCanvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(520, Math.max(110, Math.round(width * height * 0.00028)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() < 0.94 ? 0.45 + Math.random() * 0.55 : 1 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: 0.25 + Math.random() * 0.75,
        blue: Math.random() < 0.18,
      }));
    };
    const drawStarfield = (time) => {
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const shimmer = 0.48 + (Math.sin(time * 0.00045 * star.speed + star.phase) + 1) * 0.24;
        context.beginPath();
        context.fillStyle = star.blue
          ? `rgba(167, 188, 255, ${shimmer})`
          : `rgba(239, 242, 255, ${shimmer})`;
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      }
      animationFrame = window.requestAnimationFrame(drawStarfield);
    };
    resizeStarfield();
    animationFrame = window.requestAnimationFrame(drawStarfield);
    window.addEventListener('resize', resizeStarfield, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.cancelAnimationFrame(animationFrame);
      else animationFrame = window.requestAnimationFrame(drawStarfield);
    });
  }
  const nav = document.querySelector('.nav-pill');
  const menuButton = document.querySelector('.menu-toggle');
  const themeButton = document.querySelector('.theme-toggle');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  document.querySelector('#year').textContent = new Date().getFullYear();

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('theme');
  } catch {
    // Continue with the dark default when browser storage is unavailable.
  }
  if (savedTheme === 'light') document.body.classList.add('light-theme');

  const updateThemeButton = () => {
    const lightTheme = document.body.classList.contains('light-theme');
    themeButton.setAttribute('aria-label', lightTheme ? 'Switch to dark theme' : 'Switch to light theme');
    themeButton.setAttribute('title', lightTheme ? 'Switch to dark theme' : 'Switch to light theme');
  };
  updateThemeButton();
  themeButton.addEventListener('click', () => {
    const lightTheme = document.body.classList.toggle('light-theme');
    try {
      localStorage.setItem('theme', lightTheme ? 'light' : 'dark');
    } catch {
      // Theme still changes for this page view if storage is unavailable.
    }
    updateThemeButton();
  });

  const closeMenu = () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('open', !isOpen);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const current = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === current;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-38% 0px -52% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));
  }
})();

(() => {
  // Coding Stats functionality
  const statsContainer = document.getElementById('coding-stats');
  if (!statsContainer) return;

  const loadStats = async () => {
    try {
      const res = await fetch('data/coding-stats.json');
      if (!res.ok) throw new Error('Failed to load stats');
      const stats = await res.json();
      renderStats(stats);
    } catch (e) {
      console.warn('Could not load coding stats, using fallback.', e);
      // Fallback data
      const stats = {
        totalContributions: 560,
        publicRepos: 24,
        currentStreak: 14,
        languagesCount: 8,
        languages: [
          { name: "TypeScript", percentage: 38.5, color: "#3178c6" },
          { name: "Python", percentage: 24.2, color: "#3572A5" },
          { name: "JavaScript", percentage: 18.1, color: "#f1e05a" },
          { name: "Rust", percentage: 11.4, color: "#dea584" },
          { name: "C++", percentage: 4.6, color: "#f34b7d" },
          { name: "Kotlin", percentage: 3.2, color: "#A97BFF" },
        ],
        months: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        contributionWeeks: []
      };
      renderStats(stats);
    }
  };

  const renderStats = (stats) => {
    // 1. Metrics
    const metricsGrid = document.getElementById('stats-metrics');
    if (metricsGrid) {
      metricsGrid.innerHTML = `
        <div class="metric-card">
          <div class="metric-header"><span>Contributions</span><div class="metric-icon" style="background: rgba(16, 185, 129, 0.1); color: #39d353"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg></div></div>
          <div class="metric-value">${stats.totalContributions}</div>
          <span class="metric-label" style="color: #39d353">In the last year</span>
        </div>
        <div class="metric-card">
          <div class="metric-header"><span>Public Repos</span><div class="metric-icon" style="background: rgba(6, 182, 212, 0.1); color: #22d3ee"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div></div>
          <div class="metric-value">${stats.publicRepos}</div>
          <span class="metric-label" style="color: #22d3ee">Open Source Projects</span>
        </div>
        <div class="metric-card">
          <div class="metric-header"><span>Current Streak</span><div class="metric-icon" style="background: rgba(245, 158, 11, 0.1); color: #fbbf24"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div></div>
          <div class="metric-value">${stats.currentStreak} <span>Days</span></div>
          <span class="metric-label" style="color: #fbbf24">Active Commits</span>
        </div>
        <div class="metric-card">
          <div class="metric-header"><span>Languages</span><div class="metric-icon" style="background: rgba(168, 85, 247, 0.1); color: #d8b4fe"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg></div></div>
          <div class="metric-value">${stats.languagesCount}</div>
          <span class="metric-label" style="color: #d8b4fe">Technologies Used</span>
        </div>
      `;
    }

    // 2. Languages
    const langBar = document.getElementById('lang-bar');
    const langList = document.getElementById('lang-list');
    if (langBar && langList) {
      langBar.innerHTML = stats.languages.map(l => 
        `<div class="lang-segment" style="width: ${l.percentage}%; background-color: ${l.color}" title="${l.name}: ${l.percentage}%"></div>`
      ).join('');
      
      langList.innerHTML = stats.languages.map(l => `
        <div class="lang-item">
          <div class="lang-item-left">
            <span class="lang-dot" style="background-color: ${l.color}"></span>
            <span class="lang-name">${l.name}</span>
          </div>
          <span class="lang-pct">${l.percentage}%</span>
        </div>
      `).join('');
    }

    // 3. Contribution Grid
    const totalEl = document.getElementById('contrib-total');
    if (totalEl) totalEl.textContent = `${stats.totalContributions} contributions in the last year`;

    const contribMonths = document.getElementById('contrib-months');
    if (contribMonths && stats.months) {
      contribMonths.innerHTML = stats.months.map(m => `<span>${m}</span>`).join('');
    }

    const contribGrid = document.getElementById('contrib-grid');
    if (contribGrid && stats.contributionWeeks && stats.contributionWeeks.length > 0) {
      let gridHTML = '';
      stats.contributionWeeks.forEach(week => {
        gridHTML += `<div class="contrib-week">`;
        week.forEach(day => {
          gridHTML += `
            <div class="contrib-cell level-${day.level}">
              <div class="contrib-tooltip">
                <strong>${day.count === 0 ? 'No contributions' : day.count + ' contributions'}</strong>
                <span>${day.formattedDate}</span>
              </div>
            </div>
          `;
        });
        gridHTML += `</div>`;
      });
      contribGrid.innerHTML = gridHTML;

      // 4. Monthly Velocity
      const velocityChart = document.getElementById('velocity-chart');
      if (velocityChart && stats.months) {
        let maxMonthly = 0;
        const monthlyData = stats.months.map(m => {
          const monthVal = stats.contributionWeeks.reduce((acc, week) => {
            const dayInMonth = week.find(d => new Date(d.date).toLocaleDateString("en-US", { month: "short" }) === m);
            return acc + (dayInMonth ? dayInMonth.count : 0);
          }, 0);
          if (monthVal > maxMonthly) maxMonthly = monthVal;
          return { name: m, value: monthVal };
        });

        let peakMonth = { name: '-', value: 0 };
        velocityChart.innerHTML = monthlyData.map(d => {
          if (d.value > peakMonth.value) peakMonth = d;
          const heightPercent = Math.min(100, Math.max(12, (d.value / Math.max(1, maxMonthly)) * 100));
          return `
            <div class="velocity-bar-col">
              <span class="velocity-val">${d.value * 2}</span>
              <div class="velocity-bar-wrap">
                <div class="velocity-bar" style="height: ${heightPercent}%"></div>
              </div>
              <span class="velocity-label">${d.name}</span>
            </div>
          `;
        }).join('');

        const peakEl = document.getElementById('peak-month');
        if (peakEl) peakEl.textContent = `${peakMonth.name} (${peakMonth.value * 2} Commits)`;
        
        const dailyAvg = document.getElementById('daily-avg');
        if (dailyAvg) {
          dailyAvg.textContent = `${(stats.totalContributions / 365).toFixed(1)} Commits / Day`;
        }
      }
    } else {
        // Render dummy grid if no data
        contribGrid.innerHTML = Array(52).fill(0).map(() => 
          `<div class="contrib-week">${Array(7).fill(0).map(() => `<div class="contrib-cell level-0"></div>`).join('')}</div>`
        ).join('');
    }
  };

  loadStats();
})();
