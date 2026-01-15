// Met automatiquement l'année en bas de page
document.addEventListener("DOMContentLoaded", function () {
  var yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
// ====== CLIPS (YouTube/Vimeo/MP4) ======
const clipsModal = document.getElementById("clipsModal");
const clipsModalTitle = document.getElementById("clipsModalTitle");
const clipsMedia = clipsModal ? clipsModal.querySelector(".modal-media") : null;

function openClipModal({ type, src, title }) {
  if (!clipsModal || !clipsMedia) return;

  clipsModalTitle.textContent = title || "";

  // vide le contenu précédent (important pour arrêter YouTube)
  clipsMedia.innerHTML = "";

  const frame = document.createElement("div");
  frame.className = "frame";

  if (type === "embed") {
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = title || "Clip";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    frame.appendChild(iframe);
  } else if (type === "mp4") {
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.playsInline = true; // iPad/iPhone
    video.preload = "metadata";
    frame.appendChild(video);
  }

  clipsMedia.appendChild(frame);

  clipsModal.classList.add("open");
  clipsModal.setAttribute("aria-hidden", "false");

  // ferme avec ESC
  document.addEventListener("keydown", onEscClose);
}

function closeClipModal() {
  if (!clipsModal || !clipsMedia) return;

  clipsModal.classList.remove("open");
  clipsModal.setAttribute("aria-hidden", "true");

  // vide pour arrêter l’audio/vidéo
  clipsMedia.innerHTML = "";
  document.removeEventListener("keydown", onEscClose);
}

function onEscClose(e) {
  if (e.key === "Escape") closeClipModal();
}

// Clic sur une carte
document.querySelectorAll(".clip-card").forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.clipType; // "embed" ou "mp4"
    const src = btn.dataset.clipSrc;
    const title = btn.dataset.clipTitle || "";
    if (!type || !src) return;
    openClipModal({ type, src, title });
  });
});

// Fermeture (backdrop + bouton X)
document.querySelectorAll("[data-modal-close]").forEach((el) => {
  el.addEventListener("click", closeClipModal);
});
// ====== CLIPS INLINE PLAYER ======
(function () {
  const cards = document.querySelectorAll(".clip-card");

  function stopAllExcept(exceptCard) {
    document.querySelectorAll(".clip-card.is-playing").forEach((card) => {
      if (card === exceptCard) return;

      const holder = card.querySelector(".clip-holder");
      if (holder) holder.remove();

      // Remet l’overlay play visible
      const play = card.querySelector(".clip-play");
      if (play) play.style.display = "";

      card.classList.remove("is-playing");
      card.setAttribute("aria-expanded", "false");
    });
  }

  function buildEmbed(src, title) {
    const iframe = document.createElement("iframe");
    // autoplay + mute aide sur plusieurs navigateurs; YouTube ignore parfois l’autoplay selon le contexte
    const join = src.includes("?") ? "&" : "?";
    iframe.src = `${src}${join}autoplay=1&mute=1&playsinline=1&rel=0`;
    iframe.title = title || "Clip";
    iframe.loading = "lazy";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    return iframe;
  }

  function buildMp4(src, title) {
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.playsInline = true;     // iOS
    video.preload = "metadata";
    video.setAttribute("playsinline", ""); // iOS (attribut)
    video.setAttribute("aria-label", title || "Clip");
    // autoplay iOS exige souvent muted + user gesture; ici on laisse controls (safe)
    return video;
  }

  cards.forEach((card) => {
    card.setAttribute("aria-expanded", "false");

    card.addEventListener("click", () => {
      const type = card.dataset.clipType;
      const src = card.dataset.clipSrc;
      const title = card.dataset.clipTitle || "Clip";

      if (!type || !src) return;

      // toggle: si déjà ouvert, on ferme
      if (card.classList.contains("is-playing")) {
        stopAllExcept(null);
        return;
      }

      stopAllExcept(card);

      const thumb = card.querySelector(".clip-thumb");
      if (!thumb) return;

      // Crée un conteneur ratio 16/9 dans la vignette
      const holder = document.createElement("div");
      holder.className = "clip-holder";

      const player =
        type === "mp4" ? buildMp4(src, title) : buildEmbed(src, title);

      holder.appendChild(player);
      thumb.appendChild(holder);

      // Cache l’icône ▶
      const play = card.querySelector(".clip-play");
      if (play) play.style.display = "none";

      card.classList.add("is-playing");
      card.setAttribute("aria-expanded", "true");

      // Optionnel: si MP4, tente play (souvent OK après clic)
      if (type === "mp4") {
        try { player.play(); } catch (e) {}
      }
    });
  });
})();
