// Übergang vom Würfel: Die angeklickte Würfelseite wächst zum ersten Projektbild.
const parameter = new URLSearchParams(window.location.search);
const bildQuelle = parameter.get("bild");
const videoQuelle = parameter.get("video");
const wurzel = document.documentElement;

function istErlaubt(pfad) {
  return typeof pfad === "string" && pfad.startsWith("../assets/") && !pfad.includes("..", 3);
}

// Muss mit uebergangsGroesse() in js/main.js übereinstimmen.
function uebergangsGroesse() {
  return Math.min((window.innerWidth * 0.58096) / 1.48, window.innerHeight * 0.8);
}

function uebergangBeenden() {
  wurzel.classList.remove("vom-wuerfel");
}

function bildAltText(quelle) {
  for (const bild of document.querySelectorAll(".projekt-galerie img")) {
    if (bild.getAttribute("src") === quelle) {
      return bild.alt;
    }
  }

  return "";
}

function heldErsetzen(held) {
  if (istErlaubt(videoQuelle)) {
    let video = held;
    const aktuelleQuelle = held instanceof HTMLVideoElement
      ? held.querySelector("source")?.getAttribute("src") ?? held.getAttribute("src")
      : null;

    if (aktuelleQuelle !== videoQuelle) {
      video = document.createElement("video");
      video.className = "projekt-film";
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      const poster = parameter.get("poster");

      if (istErlaubt(poster)) {
        video.poster = poster;
      }

      const quelle = document.createElement("source");
      quelle.src = videoQuelle;
      quelle.type = "video/mp4";
      video.append(quelle);
      held.replaceWith(video);
    }

    const startzeit = Number(parameter.get("t"));

    if (Number.isFinite(startzeit) && startzeit > 0) {
      const springen = () => {
        video.currentTime = startzeit;
      };

      if (video.readyState >= 1) {
        springen();
      } else {
        video.addEventListener("loadedmetadata", springen, { once: true });
      }
    }

    return video;
  }

  if (istErlaubt(bildQuelle)) {
    const bild = document.createElement("img");
    bild.className = "projekt-film";
    bild.src = bildQuelle;
    bild.alt = bildAltText(bildQuelle) || (held instanceof HTMLImageElement ? held.alt : "");
    held.replaceWith(bild);
    return bild;
  }

  return held;
}

function uebergangAbspielen() {
  const einstieg = document.querySelector(".projekt-einstieg");
  const alterHeld = einstieg?.querySelector(".projekt-film");

  if (!(einstieg instanceof HTMLElement) || !(alterHeld instanceof HTMLElement)) {
    uebergangBeenden();
    return;
  }

  const held = heldErsetzen(alterHeld);

  // Die Parameter aus der Adresse entfernen, damit Neuladen die normale Seite zeigt.
  window.history.replaceState(null, "", window.location.pathname + window.location.hash);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    uebergangBeenden();
    return;
  }

  const ziel = held.getBoundingClientRect();
  const groesse = uebergangsGroesse();
  const startLinks = window.innerWidth / 2 - groesse / 2;
  const startOben = window.innerHeight / 2 - groesse / 2;

  // Platz im Layout halten, während das Bild frei über der Seite schwebt.
  einstieg.style.height = `${ziel.height}px`;
  held.style.position = "fixed";
  held.style.zIndex = "5";
  held.style.margin = "0";
  held.style.aspectRatio = "auto";

  const dauer = 900;
  const bewegung = held.animate(
    [
      { left: `${startLinks}px`, top: `${startOben}px`, width: `${groesse}px`, height: `${groesse}px` },
      { left: `${ziel.left}px`, top: `${ziel.top}px`, width: `${ziel.width}px`, height: `${ziel.height}px` },
    ],
    { duration: dauer, easing: "cubic-bezier(0.65, 0, 0.25, 1)", fill: "forwards" },
  );

  // Die restliche Seite liegt zuerst unter dem Bild versteckt und schiesst dann
  // schnell nach unten an ihren Platz – das Bild bleibt dabei oben.
  // Alles ausser dem ersten Bild: Kopfzeile, restliche Bilder im ersten Abschnitt, weitere Abschnitte.
  const ersterAbschnitt = einstieg.parentElement;
  const zuSchieben = [
    document.querySelector(".projekt-kopf"),
    ...[...(ersterAbschnitt?.children ?? [])].filter((element) => element !== einstieg),
    ...[...document.querySelectorAll(".projekt-abschnitt")].filter((element) => element !== ersterAbschnitt),
  ].filter((element) => element instanceof HTMLElement);
  const naechstes = einstieg.nextElementSibling ?? ersterAbschnitt?.nextElementSibling;
  const schubWeg = naechstes instanceof HTMLElement
    ? naechstes.getBoundingClientRect().top - ziel.top
    : ziel.height;
  const schubStart = dauer * 0.9;
  const schubDauer = 1100;
  const schubEasing = "cubic-bezier(0.25, 0.8, 0.3, 1)";
  const versteckt = `translateY(${-schubWeg}px)`;

  const schieben = zuSchieben.flatMap((element) => [
    element.animate(
      [{ transform: versteckt }, { transform: "translateY(0)" }],
      { duration: schubDauer, delay: schubStart, easing: schubEasing, fill: "both" },
    ),
    element.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: schubDauer * 0.35, delay: schubStart, easing: "ease-out", fill: "both" },
    ),
  ]);

  uebergangBeenden();

  void bewegung.finished.then(() => {
    bewegung.cancel();
    held.style.position = "relative";
    held.style.removeProperty("margin");
    held.style.removeProperty("aspect-ratio");
    einstieg.style.removeProperty("height");
  });

  void Promise.all([bewegung.finished, ...schieben.map((animation) => animation.finished)]).then(() => {
    for (const animation of schieben) {
      animation.cancel();
    }

    held.style.removeProperty("position");
    held.style.removeProperty("z-index");
  });
}

if (istErlaubt(bildQuelle) || istErlaubt(videoQuelle)) {
  uebergangAbspielen();
} else {
  uebergangBeenden();
}

// ---------- Abschnitte: aktuelle Navigation scharf, Kopfzeile dunkel auf Grau ----------

const abschnitte = [...document.querySelectorAll(".projekt-abschnitt[id]")];
const abschnittLinks = [...document.querySelectorAll(".projekt-navigation a")];
let scrollGeplant = false;

function abschnittAktualisieren() {
  const markierung = window.innerHeight * 0.4;
  const kopfHoehe = 40;
  let aktiv = abschnitte[0];
  let dunkel = false;

  for (const abschnitt of abschnitte) {
    const rechteck = abschnitt.getBoundingClientRect();

    if (rechteck.top <= markierung) {
      aktiv = abschnitt;
    }

    if (abschnitt.dataset.kopf === "dunkel" && rechteck.top <= kopfHoehe && rechteck.bottom > kopfHoehe) {
      dunkel = true;
    }
  }

  for (const link of abschnittLinks) {
    link.classList.toggle("ist-aktiv", aktiv !== undefined && link.hash === `#${aktiv.id}`);
  }

  document.body.classList.toggle("kopf-dunkel", dunkel);
}

// ---------- Quer-Abschnitt: senkrechtes Scrollen bewegt das Band seitwärts ----------

const querAbschnitte = [...document.querySelectorAll(".projekt-quer")];
const schmal = window.matchMedia("(max-width: 56rem)");

function querHoeheSetzen() {
  for (const abschnitt of querAbschnitte) {
    const buehne = abschnitt.querySelector(".projekt-quer__buehne");
    const band = abschnitt.querySelector(".projekt-quer__band");

    if (!(buehne instanceof HTMLElement) || !(band instanceof HTMLElement)) {
      continue;
    }

    if (schmal.matches) {
      abschnitt.style.removeProperty("height");
      band.style.removeProperty("transform");
      continue;
    }

    const weg = Math.max(0, band.scrollWidth - buehne.clientWidth);
    abschnitt.dataset.weg = String(weg);
    abschnitt.style.height = `${window.innerHeight + weg}px`;
  }
}

function querBewegen() {
  if (schmal.matches) {
    return;
  }

  for (const abschnitt of querAbschnitte) {
    const band = abschnitt.querySelector(".projekt-quer__band");
    const weg = Number(abschnitt.dataset.weg) || 0;

    if (!(band instanceof HTMLElement) || weg === 0) {
      continue;
    }

    const fortschritt = Math.min(1, Math.max(0, -abschnitt.getBoundingClientRect().top / weg));
    band.style.transform = `translateX(${-fortschritt * weg}px)`;
  }
}

function beimScrollen() {
  if (scrollGeplant) {
    return;
  }

  scrollGeplant = true;
  window.requestAnimationFrame(() => {
    scrollGeplant = false;
    querBewegen();
    abschnittAktualisieren();
  });
}

function allesNeuBerechnen() {
  querHoeheSetzen();
  querBewegen();
  abschnittAktualisieren();
}

window.addEventListener("scroll", beimScrollen, { passive: true });
window.addEventListener("resize", allesNeuBerechnen);
schmal.addEventListener("change", allesNeuBerechnen);

// Bilder im Band ändern seine Breite, sobald sie geladen sind.
for (const bild of document.querySelectorAll(".projekt-quer__band img")) {
  if (!(bild instanceof HTMLImageElement) || !bild.complete) {
    bild.addEventListener("load", allesNeuBerechnen, { once: true });
  }
}

allesNeuBerechnen();
