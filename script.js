
"use strict";

/* OPENING ANIMATION */

const opening = document.getElementById("opening");
const website = document.getElementById("website");
const openButton = document.getElementById("openButton");
const music = document.getElementById("music");
const musicButton = document.getElementById("musicButton");

let opened = false;

openButton.addEventListener("click", () => {
  if (opened) return;
  opened = true;

  openButton.disabled = true;
  website.hidden = false;
  window.scrollTo(0, 0);

  opening.classList.add("open");

  music.play().then(() => {
    musicButton.setAttribute("aria-pressed", "true");
  }).catch(() => {
    // Music is optional.
  });

  setTimeout(() => {
    opening.hidden = true;
    musicButton.hidden = false;
    setupReveal();
    setupScratch();
  }, 1800);
});

/* BACKGROUND MUSIC */

musicButton.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicButton.setAttribute("aria-pressed", "true");
    } catch (error) {
      // Audio file may be missing.
    }
  } else {
    music.pause();
    musicButton.setAttribute("aria-pressed", "false");
  }
});

/* WEDDING COUNTDOWN */

const weddingTime =
  new Date("2026-12-27T16:00:00+05:30").getTime();

function updateCountdown() {
  const remaining = Math.max(0, weddingTime - Date.now());

  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining / 3600000) % 24,
    minutes: Math.floor(remaining / 60000) % 60,
    seconds: Math.floor(remaining / 1000) % 60
  };

  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(id).textContent =
      String(value).padStart(2, "0");
  });

  if (remaining === 0) {
    document.getElementById("countdownText").textContent =
      "Our wedding day has arrived!";
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* SCROLL ANIMATIONS */

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach(el => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  elements.forEach(el => observer.observe(el));
}

/* SCRATCH TO REVEAL WEDDING DETAILS */

let scratchReady = false;

function setupScratch() {
  if (scratchReady) return;
  scratchReady = true;

  const canvas = document.getElementById("scratchCanvas");
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });
  const revealButton = document.getElementById("revealButton");

  if (!ctx) {
    revealButton.click();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.scale(ratio, ratio);

  // Olive-green scratch coating
  ctx.fillStyle = "#a6b39a";
  ctx.fillRect(0, 0, width, height);

  // Decorative heart
  ctx.fillStyle = "#dce3d4";
  ctx.beginPath();
  ctx.moveTo(width / 2, height * 0.78);
  ctx.bezierCurveTo(
    width * 0.05, height * 0.48,
    width * 0.17, height * 0.12,
    width / 2, height * 0.33
  );
  ctx.bezierCurveTo(
    width * 0.83, height * 0.12,
    width * 0.95, height * 0.48,
    width / 2, height * 0.78
  );
  ctx.fill();

  ctx.fillStyle = "#46583d";
  ctx.textAlign = "center";
  ctx.font = "bold 17px Georgia";
  ctx.fillText("SCRATCH HERE", width / 2, height * 0.52);

  let drawing = false;
  let previous = null;
  let strokes = 0;
  let revealed = false;

  function getPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };
  }

  function scratch(point) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 42;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    if (previous) {
      ctx.moveTo(previous.x, previous.y);
    } else {
      ctx.moveTo(point.x, point.y);
    }

    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    previous = point;
  }

  function reveal() {
    if (revealed) return;
    revealed = true;

    canvas.style.transition = "opacity .7s ease";
    canvas.style.opacity = "0";
    canvas.style.pointerEvents = "none";
    revealButton.hidden = true;
  }

  function checkProgress() {
    if (revealed) return;

    const pixels = ctx.getImageData(
      0, 0, canvas.width, canvas.height
    ).data;

    let cleared = 0;
    let total = 0;

    for (let i = 3; i < pixels.length; i += 80) {
      total++;
      if (pixels[i] < 128) cleared++;
    }

    if (total > 0 && cleared / total > 0.4) {
      reveal();
    }
  }

  canvas.addEventListener("pointerdown", event => {
    if (revealed) return;

    drawing = true;
    previous = null;
    canvas.setPointerCapture(event.pointerId);
    scratch(getPoint(event));
  });

  canvas.addEventListener("pointermove", event => {
    if (!drawing || revealed) return;

    scratch(getPoint(event));
    strokes++;

    if (strokes % 12 === 0) {
      checkProgress();
    }
  });

  function finish() {
    if (!drawing) return;

    drawing = false;
    previous = null;
    checkProgress();
  }

  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", finish);
  revealButton.addEventListener("click", reveal);
}

/* ADD WEDDING TO CALENDAR */

document.getElementById("calendarButton")
  .addEventListener("click", () => {

  const event = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "BEGIN:VEVENT",
    "UID:hisham-aneena-20261227@example.invalid",
    "DTSTAMP:20261017T000000Z",
    "DTSTART:20261227T103000Z",
    "DTEND:20261227T143000Z",
    "SUMMARY:Muhammed Hisham and Aneena Jubin Wedding",
    "LOCATION:BUM Hall, Pookkottur, Malappuram, Kerala",
    "DESCRIPTION:Wedding celebration of Muhammed Hisham and Aneena Jubin",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([event], {
    type: "text/calendar;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "Hisham-Aneena-Wedding.ics";
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

/* SHARE INVITATION */

document.getElementById("shareButton")
  .addEventListener("click", async () => {

  const text =
    "You're invited to the wedding of " +
    "Muhammed Hisham & Aneena Jubin! " +
    "Sunday, 27 December 2026, " +
    "4:00 PM–8:00 PM at BUM Hall, Pookkottur.";

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Muhammed Hisham & Aneena Wedding",
        text,
        url: window.location.href
      });
    } catch (error) {
      // User may cancel sharing.
    }
  } else {
    window.open(
      "https://wa.me/?text=" +
      encodeURIComponent(text + "\n" + window.location.href),
      "_blank",
      "noopener"
    );
  }
});