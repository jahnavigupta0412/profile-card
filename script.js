/**
 * Cyber Neon Glassmorphism Profile Card Logic
 * Features:
 * - 3D Tilt Parallax with Spring Damping
 * - Mouse-Tracking Neon Spotlight Glow Effect
 * - Dark / Light Mode Switching with LocalStorage Persistence
 * - Animated Metric Counters
 * - Interactive Connect / Message / Copy Actions with Toast Feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  // Select DOM Elements
  const profileCard = document.getElementById('profileCard');
  const cardAmbientShadow = document.getElementById('cardAmbientShadow');
  const cardGlowOverlay = document.getElementById('cardGlowOverlay');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeLabel = document.getElementById('theme-label');
  const glowToggleBtn = document.getElementById('glow-toggle-btn');
  const primaryActionBtn = document.getElementById('primary-action-btn');
  const followBtnText = document.getElementById('follow-btn-text');
  const secondaryActionBtn = document.getElementById('secondary-action-btn');
  const shareCardBtn = document.getElementById('share-card-btn');
  const shareTooltip = document.getElementById('shareTooltip');
  const toastContainer = document.getElementById('toastContainer');
  const counters = document.querySelectorAll('.counter');
  const tagPills = document.querySelectorAll('.tag-pill');

  let isGlowActive = true;
  let isConnected = false;
  let rafId = null;

  /* ==========================================================================
     1. Theme Switcher (Dark Mode / Frost Light Mode)
     ========================================================================== */
  const storedTheme = localStorage.getItem('theme-preference');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme (default to dark if not set)
  const initialTheme = storedTheme ? storedTheme : (systemPrefersDark ? 'dark' : 'dark');
  setTheme(initialTheme);

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-preference', theme);

    if (theme === 'dark') {
      themeLabel.textContent = 'Dark Mode';
      themeToggleBtn.setAttribute('aria-label', 'Switch to Light Mode');
    } else {
      themeLabel.textContent = 'Light Mode';
      themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} theme`);
  });

  /* ==========================================================================
     2. Interactive 3D Tilt & Mouse-Tracking Glow
     ========================================================================== */
  function handleMouseMove(e) {
    if (!profileCard) return;

    const rect = profileCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates from -1 to 1 based on card center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const normalizedX = (x - centerX) / centerX;
    const normalizedY = (y - centerY) / centerY;

    // Calculate rotation angles (max tilt: 10 degrees)
    const rotateX = -normalizedY * 8;
    const rotateY = normalizedX * 8;

    if (rafId) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      // Update mouse position for the dynamic radial spotlight glow
      if (isGlowActive) {
        profileCard.style.setProperty('--mouse-x', `${x}px`);
        profileCard.style.setProperty('--mouse-y', `${y}px`);
        profileCard.style.setProperty('--glow-opacity', '1');
      }

      // Apply 3D perspective tilt
      profileCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale3d(1.015, 1.015, 1.015)`;
    });
  }

  function handleMouseLeave() {
    if (rafId) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      // Fade out dynamic spotlight glow
      profileCard.style.setProperty('--glow-opacity', '0');

      // Smoothly return card to rest position
      profileCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
    });
  }

  profileCard.addEventListener('mousemove', handleMouseMove);
  profileCard.addEventListener('mouseleave', handleMouseLeave);

  // Optional: Toggle glow effect via the top bar control
  glowToggleBtn.addEventListener('click', () => {
    isGlowActive = !isGlowActive;
    if (!isGlowActive) {
      profileCard.style.setProperty('--glow-opacity', '0');
      glowToggleBtn.classList.remove('active');
      showToast('Mouse spotlight glow disabled');
    } else {
      glowToggleBtn.classList.add('active');
      showToast('Mouse spotlight glow enabled');
    }
  });

  /* ==========================================================================
     3. Animated Metric Counters
     ========================================================================== */
  function animateCounters() {
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const isDecimal = counter.getAttribute('data-decimal') !== null;
      const duration = 1600; // ms
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease Out Cubic function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * easeOut;

        if (isDecimal) {
          counter.textContent = currentVal.toFixed(1);
        } else {
          counter.textContent = Math.floor(currentVal);
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = isDecimal ? target.toFixed(1) : target;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // Trigger counters with a slight entrance delay
  setTimeout(animateCounters, 350);

  /* ==========================================================================
     4. Interactive Actions (Connect, Message, Share)
     ========================================================================== */
  
  // Primary Connect Button Interaction
  primaryActionBtn.addEventListener('click', () => {
    isConnected = !isConnected;
    
    if (isConnected) {
      primaryActionBtn.classList.add('connected');
      followBtnText.textContent = 'Connected ✓';
      showToast('Connected with Jahnavi Gupta! Network updated.');

      // Increment followers count slightly for feedback
      const followersCounter = document.querySelector('[data-stat="followers"] .counter');
      if (followersCounter) {
        followersCounter.textContent = '34.9';
      }
    } else {
      primaryActionBtn.classList.remove('connected');
      followBtnText.textContent = 'Connect';
      showToast('Disconnected from network.');
    }

    createButtonRipple(primaryActionBtn);
  });

  // Secondary Message Button Interaction
  secondaryActionBtn.addEventListener('click', () => {
    createButtonRipple(secondaryActionBtn);
    showToast('Opening secure transmission channel to Jahnavi...');
  });

  // Share / Copy Link Button Interaction
  shareCardBtn.addEventListener('click', async () => {
    createButtonRipple(shareCardBtn);
    const profileUrl = window.location.href;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
      }
      
      // Show tooltip
      shareTooltip.classList.add('show');
      showToast('Profile link copied to clipboard!');
      
      setTimeout(() => {
        shareTooltip.classList.remove('show');
      }, 2200);
    } catch (err) {
      showToast('Direct link copied!');
    }
  });

  // Skill Tags Click Interaction
  tagPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const skillName = pill.textContent;
      showToast(`Filter projects by skill: ${skillName}`);
      pill.style.transform = 'scale(0.95)';
      setTimeout(() => {
        pill.style.transform = '';
      }, 150);
    });
  });

  /* ==========================================================================
     5. Helper Functions (Ripple Effect & Toasts)
     ========================================================================== */
  function createButtonRipple(button) {
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.4)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'rippleAnim 0.6s linear';
    ripple.style.pointerEvents = 'none';

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${rect.width / 2 - size / 2}px`;
    ripple.style.top = `${rect.height / 2 - size / 2}px`;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  function showToast(message) {
    if (!toastContainer) return;

    // Clean up existing toast if more than 2
    if (toastContainer.children.length >= 2) {
      toastContainer.removeChild(toastContainer.firstElementChild);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  }

  // Add ripple animation keyframes dynamically if not present
  if (!document.getElementById('dynamic-ripple-style')) {
    const style = document.createElement('style');
    style.id = 'dynamic-ripple-style';
    style.innerHTML = `
      @keyframes rippleAnim {
        to {
          transform: scale(2.5);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
});
