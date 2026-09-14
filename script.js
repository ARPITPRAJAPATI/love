/**
 * 21st Birthday Digital Scrapbook - Interactive Physics & Audio Engine
 * Features:
 * - Damped Spring & Lerp 3D Polaroid Tilt Physics (Preserves resting angles, zero snapping)
 * - Gentle Aerodynamic Rose Petal & Golden Foil Confetti System
 * - Romantic Web Audio API Birthday Chime Synthesizer
 * - Smooth Navigation, Floating Notes & Kiss Micro-moments
 */

document.addEventListener('DOMContentLoaded', () => {
  initAudioPlayer();
  initPolaroidPhysics();
  initConfettiPhysics();
  initNavigation();
  initInteractions();
});

/* ==========================================================================
   1. Damped Spring & Lerp 3D Polaroid Physics (Silky Smooth, No Snapping)
   ========================================================================== */
function initPolaroidPhysics() {
  const polaroids = document.querySelectorAll('.interactive-polaroid');

  polaroids.forEach((card) => {
    // Determine resting Z tilt angle from CSS class
    let baseRotateZ = 0;
    if (card.classList.contains('tilt-right')) baseRotateZ = 3.0;
    else if (card.classList.contains('tilt-left')) baseRotateZ = -3.5;
    else if (card.classList.contains('tilt-slight-right')) baseRotateZ = 2.5;
    else if (card.classList.contains('tilt-slight-left')) baseRotateZ = -2.0;

    const maxTilt = parseFloat(card.dataset.tiltMax) || 9;

    // Physics state
    let targetX = 0;
    let targetY = 0;
    let targetZ = baseRotateZ;
    let targetScale = 1.0;

    let currentX = 0;
    let currentY = 0;
    let currentZ = baseRotateZ;
    let currentScale = 1.0;

    let isHovered = false;
    let animFrameId = null;

    function physicsLoop() {
      // Spring lerp interpolation (0.08 damping factor for smooth liquid feel)
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      currentZ += (targetZ - currentZ) * 0.09;
      currentScale += (targetScale - currentScale) * 0.09;

      card.style.transform = `perspective(900px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) rotateZ(${currentZ.toFixed(2)}deg) scale3d(${currentScale.toFixed(3)}, ${currentScale.toFixed(3)}, ${currentScale.toFixed(3)})`;

      // Continue animating while hovering or until card settles back to rest
      const isResting = 
        Math.abs(targetX - currentX) < 0.01 &&
        Math.abs(targetY - currentY) < 0.01 &&
        Math.abs(targetZ - currentZ) < 0.01 &&
        Math.abs(targetScale - currentScale) < 0.001;

      if (isHovered || !isResting) {
        animFrameId = requestAnimationFrame(physicsLoop);
      } else {
        // Fully settled
        card.style.transform = `rotate(${baseRotateZ}deg)`;
        animFrameId = null;
      }
    }

    card.addEventListener('mouseenter', () => {
      isHovered = true;
      targetScale = 1.04;
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(physicsLoop);
      }
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt relative to mouse offset from card center
      targetX = ((y - centerY) / centerY) * -maxTilt;
      targetY = ((x - centerX) / centerX) * maxTilt;
      targetZ = baseRotateZ + ((x - centerX) / centerX) * 1.5;
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
      targetZ = baseRotateZ;
      targetScale = 1.0;
    });
  });
}

/* ==========================================================================
   2. Aerodynamic Slow-Motion Confetti & Rose Petal Physics
   ========================================================================== */
function initConfettiPhysics() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];

  const colors = [
    '#FFD700', // metallic gold
    '#FFEAA7', // champagne gold
    '#FF4757', // rose petal crimson
    '#C0263C', // ruby scarlet
    '#FFFDF8', // silk ivory
    '#FF9EAA', // blush pink
  ];

  class Particle {
    constructor(originX, originY, isBurst = false) {
      this.isBurst = isBurst;
      this.x = originX !== undefined ? originX : Math.random() * width;
      this.y = originY !== undefined ? originY : (isBurst ? height * 0.45 : Math.random() * -120);

      // Particle type: heart, petal, star, ribbon
      const rand = Math.random();
      if (rand < 0.35) {
        this.type = 'heart';
        this.size = Math.random() * 8 + 8;
      } else if (rand < 0.65) {
        this.type = 'petal';
        this.size = Math.random() * 8 + 10;
      } else if (rand < 0.8) {
        this.type = 'star';
        this.size = Math.random() * 6 + 7;
      } else {
        this.type = 'ribbon';
        this.size = Math.random() * 6 + 8;
      }

      this.color = colors[Math.floor(Math.random() * colors.length)];

      if (isBurst) {
        // Soft upward fountain arc
        const angle = Math.random() * Math.PI - Math.PI; // Upward hemisphere
        const speed = Math.random() * 3.2 + 1.2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed * 0.9;

        // Fluid air drag & slow floating gravity
        this.drag = 0.965;
        this.gravity = 0.035;
        this.opacity = 1.0;
        this.fadeRate = 0.0032; // Floats for ~6-8 seconds
      } else {
        // Ambient gentle drift
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = Math.random() * 0.7 + 0.5;
        this.drag = 0.99;
        this.gravity = 0.012;
        this.opacity = Math.random() * 0.4 + 0.45;
        this.fadeRate = 0;
      }

      // Sinusoidal air flutter
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.03 + 0.018;
      this.wobbleRadius = Math.random() * 1.4 + 0.7;

      // 3D Tumbling flip
      this.flip = Math.random() * Math.PI * 2;
      this.flipSpeed = Math.random() * 0.04 + 0.02;

      this.rotation = Math.random() * 360;
      this.vRot = (Math.random() - 0.5) * 1.8;
    }

    update() {
      this.vx *= this.drag;
      this.vy += this.gravity;

      this.wobble += this.wobbleSpeed;
      const swayX = Math.sin(this.wobble) * this.wobbleRadius;

      this.x += this.vx + swayX;
      this.y += this.vy;

      this.flip += this.flipSpeed;
      this.rotation += this.vRot;

      if (this.isBurst) {
        this.opacity -= this.fadeRate;
      } else if (this.y > height + 40) {
        this.y = -30;
        this.x = Math.random() * width;
        this.vy = Math.random() * 0.7 + 0.5;
      }
    }

    draw(context) {
      if (this.opacity <= 0) return;
      context.save();
      context.translate(this.x, this.y);
      context.rotate((this.rotation * Math.PI) / 180);

      // 3D paper tumbling flip simulation
      const scaleY = Math.cos(this.flip);
      context.scale(1, scaleY);

      context.globalAlpha = Math.max(0, Math.min(1, this.opacity));
      context.fillStyle = this.color;

      if (this.type === 'heart') {
        const s = this.size * 0.6;
        context.beginPath();
        context.moveTo(0, s * 0.3);
        context.bezierCurveTo(-s * 0.5, -s * 0.45, -s, s * 0.25, 0, s);
        context.bezierCurveTo(s, s * 0.25, s * 0.5, -s * 0.45, 0, s * 0.3);
        context.fill();
      } else if (this.type === 'petal') {
        const w = this.size * 0.75;
        const h = this.size * 1.25;
        context.beginPath();
        context.ellipse(0, 0, w / 2, h / 2, Math.PI / 6, 0, 2 * Math.PI);
        context.fill();
      } else if (this.type === 'star') {
        const r = this.size * 0.65;
        context.beginPath();
        context.moveTo(0, -r);
        context.quadraticCurveTo(0, 0, r, 0);
        context.quadraticCurveTo(0, 0, 0, r);
        context.quadraticCurveTo(0, 0, -r, 0);
        context.quadraticCurveTo(0, 0, 0, -r);
        context.fill();
      } else {
        context.fillRect(-this.size / 2, -this.size / 3, this.size, this.size * 0.6);
      }

      context.restore();
    }
  }

  // Populate ambient particles
  for (let i = 0; i < 26; i++) {
    particles.push(new Particle(Math.random() * width, Math.random() * height, false));
  }

  window.triggerConfettiBurst = function (originX, originY, count = 45) {
    const x = originX !== undefined ? originX : width / 2;
    const y = originY !== undefined ? originY : height * 0.45;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, true));
    }
  };

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);

      if (p.isBurst && p.opacity <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  const toggleBtn = document.getElementById('confettiToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const rect = toggleBtn.getBoundingClientRect();
      window.triggerConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);
    });
  }
}

/* ==========================================================================
   3. Nostalgic Web Audio API Synthesizer
   ========================================================================== */
function initAudioPlayer() {
  let audioCtx = null;
  let isPlaying = false;
  let currentStep = 0;
  let timerId = null;

  const cassetteDevice = document.getElementById('cassetteDevice');
  const cassettePlayerCard = document.getElementById('cassettePlayerCard');
  const cassetteCtaText = document.getElementById('cassetteCtaText');
  const trackStatus = document.getElementById('trackStatus');
  const globalAudioBtn = document.getElementById('globalAudioBtn');
  const globalAudioText = document.getElementById('globalAudioText');
  const notesContainer = document.getElementById('floatingNotesBox');

  const G3 = 196.00, C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23,
        G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25, D5 = 587.33;

  const melody = [
    { note: G3, dur: 0.4, chord: [C4, E4] },
    { note: G3, dur: 0.3 },
    { note: A4, dur: 0.7, chord: [C4, F4] },
    { note: G3, dur: 0.7 },
    { note: C5, dur: 0.7, chord: [E4, G4] },
    { note: B4, dur: 1.2, chord: [D4, G4] },

    { note: G3, dur: 0.4, chord: [B4, D4] },
    { note: G3, dur: 0.3 },
    { note: A4, dur: 0.7, chord: [C4, F4] },
    { note: G3, dur: 0.7 },
    { note: D5, dur: 0.7, chord: [F4, A4] },
    { note: C5, dur: 1.2, chord: [E4, G4] },

    { note: G3, dur: 0.4, chord: [C4, E4] },
    { note: G3, dur: 0.3 },
    { note: G4, dur: 0.7, chord: [E4, G4, C5] },
    { note: E4, dur: 0.7, chord: [C4, G4] },
    { note: C4, dur: 0.7, chord: [A4, C5] },
    { note: B4, dur: 0.7, chord: [G3, D4] },
    { note: A4, dur: 1.1, chord: [F4, C5] },

    { note: F4, dur: 0.4, chord: [D4, F4] },
    { note: F4, dur: 0.3 },
    { note: E4, dur: 0.7, chord: [C4, E4, G4] },
    { note: C5, dur: 0.7, chord: [E4, G4] },
    { note: D5, dur: 0.7, chord: [F4, B4] },
    { note: C5, dur: 1.5, chord: [C4, E4, G4, C5] },
  ];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, time, duration, gainLevel = 0.14) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.Q.setValueAtTime(1.8, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(gainLevel, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(gainLevel * 0.45, time + duration * 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.98);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  function playNextNote() {
    if (!isPlaying) return;
    const ctx = getAudioContext();
    const item = melody[currentStep];
    const now = ctx.currentTime;
    const noteDuration = item.dur * 0.92;

    playTone(item.note, now, noteDuration, 0.18);

    if (item.chord) {
      item.chord.forEach((chordNote) => {
        playTone(chordNote, now + 0.015, noteDuration * 1.15, 0.07);
      });
    }

    if (Math.random() > 0.35) {
      spawnFloatingNote();
    }

    currentStep = (currentStep + 1) % melody.length;
    timerId = setTimeout(playNextNote, item.dur * 720);
  }

  function spawnFloatingNote() {
    if (!notesContainer) return;
    const symbols = ['♪', '♫', '♩', '♬', '💖', '✨'];
    const note = document.createElement('span');
    note.className = 'music-note-particle';
    note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    note.style.left = `${Math.floor(Math.random() * 80) + 10}%`;
    note.style.fontSize = `${Math.floor(Math.random() * 10) + 18}px`;

    notesContainer.appendChild(note);
    setTimeout(() => {
      note.remove();
    }, 2800);
  }

  function toggleAudio() {
    const ctx = getAudioContext();
    if (isPlaying) {
      isPlaying = false;
      clearTimeout(timerId);
      cassettePlayerCard.classList.remove('is-playing');
      globalAudioBtn.classList.remove('is-playing');
      cassetteCtaText.textContent = 'click me!';
      globalAudioText.textContent = 'Play Music';
      trackStatus.textContent = 'Paused • Tap to resume';
    } else {
      isPlaying = true;
      cassettePlayerCard.classList.add('is-playing');
      globalAudioBtn.classList.add('is-playing');
      cassetteCtaText.textContent = 'pause';
      globalAudioText.textContent = 'Playing...';
      trackStatus.textContent = 'Playing: Romantic Birthday Tape';
      playNextNote();

      if (window.triggerConfettiBurst) {
        window.triggerConfettiBurst(window.innerWidth * 0.7, window.innerHeight * 0.7, 45);
      }
    }
  }

  if (cassetteDevice) {
    cassetteDevice.addEventListener('click', toggleAudio);
    cassetteDevice.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAudio();
      }
    });
  }

  if (globalAudioBtn) {
    globalAudioBtn.addEventListener('click', toggleAudio);
  }
}

/* ==========================================================================
   4. Smooth Navigation & Scroll Spy
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 220;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href').replace('#', '');
      if (href === currentId) {
        link.style.background = 'rgba(255, 255, 255, 0.24)';
        link.style.color = '#fff';
      } else {
        link.style.background = 'transparent';
        link.style.color = 'rgba(255, 245, 240, 0.82)';
      }
    });
  });
}

/* ==========================================================================
   5. Interactive Micro-moments (Hero "click me!" & Send a Kiss)
   ========================================================================== */
function initInteractions() {
  const heroClusterCard = document.getElementById('heroClusterCard');
  const heroClickMeBtn = document.getElementById('heroClickMeBtn');
  const binderSection = document.getElementById('binder');

  function handleHeroClick() {
    const rect = (heroClickMeBtn || heroClusterCard).getBoundingClientRect();
    if (window.triggerConfettiBurst) {
      window.triggerConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);
    }

    if (binderSection) {
      binderSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (heroClusterCard) {
    heroClusterCard.addEventListener('click', handleHeroClick);
    heroClusterCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleHeroClick();
      }
    });
  }

  if (heroClickMeBtn) {
    heroClickMeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleHeroClick();
    });
  }

  // Footer "Send a Kiss" Button
  const footerHeartBtn = document.getElementById('footerHeartBtn');
  if (footerHeartBtn) {
    footerHeartBtn.addEventListener('click', () => {
      const rect = footerHeartBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      for (let i = 0; i < 6; i++) {
        const kiss = document.createElement('span');
        kiss.textContent = Math.random() > 0.4 ? '💋' : '❤️';
        kiss.style.position = 'fixed';
        kiss.style.left = `${x + (Math.random() - 0.5) * 90}px`;
        kiss.style.top = `${y + (Math.random() - 0.5) * 40}px`;
        kiss.style.fontSize = `${Math.floor(Math.random() * 16) + 26}px`;
        kiss.style.pointerEvents = 'none';
        kiss.style.zIndex = '999';
        kiss.style.transition = 'all 2.2s cubic-bezier(0.1, 0.8, 0.3, 1)';
        document.body.appendChild(kiss);

        setTimeout(() => {
          kiss.style.transform = `translateY(-140px) scale(1.4) rotate(${(Math.random() - 0.5) * 40}deg)`;
          kiss.style.opacity = '0';
        }, 30);

        setTimeout(() => kiss.remove(), 2300);
      }

      if (window.triggerConfettiBurst) {
        window.triggerConfettiBurst(x, y, 40);
      }
    });
  }
}
