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
      const res = await fetch('data/coding-stats.json?t=' + Date.now());
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

      // Auto-scroll to the rightmost edge to show recent contributions
      setTimeout(() => {
        const scrollEl = document.querySelector('.contrib-scroll');
        if (scrollEl) {
          scrollEl.scrollLeft = scrollEl.scrollWidth;
        }
      }, 50);
    } else {
        // Render dummy grid if no data
        contribGrid.innerHTML = Array(52).fill(0).map(() => 
          `<div class="contrib-week">${Array(7).fill(0).map(() => `<div class="contrib-cell level-0"></div>`).join('')}</div>`
        ).join('');
    }
  };

  loadStats();
})();
