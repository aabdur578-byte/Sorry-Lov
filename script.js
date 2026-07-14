// script.js

document.addEventListener('DOMContentLoaded', () => {
  const screen1 = document.getElementById('screen1');
  const screen2 = document.getElementById('screen2');
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const dodgeCounter = document.getElementById('dodgeCounter');
  const muteBtn = document.getElementById('muteBtn');

  let noBtnPlaced = false;
  let dodgeCount = 0;
  let musicOn = true;

  const dodgePhrases = [
    "Nice try! 😼",
    "Not so fast...",
    "Catch me if you can!",
    "Almost! 😹",
    "So close!",
    "Nope, try again!"
  ];

  // =========================================================
  // AUDIO ENGINE — everything is synthesized with Web Audio API.
  // No external mp3/wav files, so nothing can 404 or fail to load.
  // =========================================================
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  let musicNodes = null;

  // Resume audio context on first user gesture (required by mobile browsers)
  function unlockAudio() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playTone(freq, duration, type = 'sine', volume = 0.15, delay = 0) {
    if (!musicOn) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration + 0.05);
  }

  // Soft "boop" when the No button dodges
  function playDodgeSound() {
    playTone(520, 0.12, 'triangle', 0.12);
    playTone(380, 0.12, 'triangle', 0.08, 0.06);
  }

  // Warm tap sound for Yes button
  function playTapSound() {
    playTone(660, 0.1, 'sine', 0.15);
  }

  // Little celebration chime sequence
  function playCelebration() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => playTone(freq, 0.35, 'sine', 0.18, i * 0.12));
  }

  // Gentle looping background melody, built from a short note pattern
  function startMusic() {
    if (musicNodes) return;
    const pattern = [392, 440, 523.25, 440, 392, 349.23, 392, 440];
    let step = 0;

    const intervalId = setInterval(() => {
      if (!musicOn) return;
      playTone(pattern[step % pattern.length], 0.5, 'sine', 0.05);
      step++;
    }, 550);

    musicNodes = { intervalId };
  }

  function stopMusic() {
    if (musicNodes) {
      clearInterval(musicNodes.intervalId);
      musicNodes = null;
    }
  }

  // ---- Mute toggle ----
  muteBtn.addEventListener('click', () => {
    musicOn = !musicOn;
    muteBtn.textContent = musicOn ? '🔊 Music On' : '🔇 Music Off';
  });

  // ---- Bulletproof "No" Button Evasion ----
  function teleportNoButton(event) {
    unlockAudio();
    if (event) event.preventDefault();

    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    const safetyPadding = 20;

    const maxX = window.innerWidth - btnWidth - safetyPadding;
    const maxY = window.innerHeight - btnHeight - safetyPadding;

    const safeMaxX = Math.max(maxX, 0);
    const safeMaxY = Math.max(maxY, 0);

    const randomX = Math.random() * safeMaxX;
    const randomY = Math.random() * safeMaxY;

    if (!noBtnPlaced) {
      noBtn.classList.add('teleporting');
      noBtnPlaced = true;
    }

    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;

    // Cute feedback: sound + growing "Yes" button + dodge counter message
    playDodgeSound();
    dodgeCount++;
    dodgeCounter.textContent = dodgePhrases[Math.min(dodgeCount - 1, dodgePhrases.length - 1)];

    const growth = Math.min(1 + dodgeCount * 0.04, 1.6);
    yesBtn.style.transform = `scale(${growth})`;
  }

  noBtn.addEventListener('pointerdown', teleportNoButton);
  noBtn.addEventListener('touchstart', teleportNoButton, { passive: false });
  noBtn.addEventListener('mouseover', teleportNoButton);

  window.addEventListener('resize', () => {
    if (noBtnPlaced) teleportNoButton();
  });

  // ---- "Yes" Button: Smooth Screen Transition ----
  yesBtn.addEventListener('click', () => {
    unlockAudio();
    playTapSound();
    setTimeout(playCelebration, 150);

    screen1.classList.add('fade-out');

    setTimeout(() => {
      screen1.classList.add('hidden');
      screen2.classList.remove('hidden');
      void screen2.offsetWidth;
      screen2.classList.add('fade-in');

      startHeartShower();
      startMusic();
    }, 500);
  });

  // ---- Heart Shower ----
  function startHeartShower() {
    const heartCount = 30;
    for (let i = 0; i < heartCount; i++) {
      setTimeout(() => createHeart(), i * 150);
    }
  }

  function createHeart() {
    const heart = document.createElement('span');
    heart.classList.add('heart');
    heart.textContent = '❤️';

    const size = Math.random() * 1.5 + 1;
    const leftPos = Math.random() * 100;
    const duration = Math.random() * 2 + 3;

    heart.style.fontSize = `${size}rem`;
    heart.style.left = `${leftPos}vw`;
    heart.style.animationDuration = `${duration}s`;

    document.body.appendChild(heart);

    heart.addEventListener('animationend', () => {
      heart.remove();
    });
  }
});
