const wuerfel = document.querySelectorAll(".wuerfel");
const wuerfelBuehne = document.querySelector(".wuerfel-buehne");

if (wuerfel.length === 0) {
  throw new Error("Im HTML wurde kein Würfel gefunden.");
}

const bildAnsicht = document.querySelector(".bild-ansicht");
const ansichtInhalt = bildAnsicht?.querySelector(".bild-ansicht__inhalt");
const ansichtSchliessen = bildAnsicht?.querySelector(".bild-ansicht__schliessen");

if (
  !(bildAnsicht instanceof HTMLElement) ||
  !(ansichtInhalt instanceof HTMLElement) ||
  !(ansichtSchliessen instanceof HTMLButtonElement) ||
  !(wuerfelBuehne instanceof HTMLElement)
) {
  throw new Error("Die vergrösserte Ansicht wurde im HTML nicht gefunden.");
}

let bildOeffner = null;
let bildZoom = null;

// Grösse des Quadrats, in dem eine Würfelseite vor dem Seitenwechsel landet.
// Muss mit js/projekt.js übereinstimmen (Breite der Projektbilder / 1.48).
function uebergangsGroesse() {
  return Math.min((window.innerWidth * 0.58096) / 1.48, window.innerHeight * 0.8);
}

function bildAnsichtOeffnen(seite, wuerfelTransform, projektModus = false) {
  const medium = seite.querySelector(".wuerfel__bild, .wuerfel__video");
  const originalWuerfel = seite.closest(".wuerfel");
  const szene = seite.closest(".wuerfel-szene");

  if (!(medium instanceof HTMLImageElement) && !(medium instanceof HTMLVideoElement)) {
    throw new Error("Auf der angeklickten Würfelseite wurde kein Bild oder Video gefunden.");
  }

  if (!(originalWuerfel instanceof HTMLElement) || !(szene instanceof HTMLElement)) {
    throw new Error("Die Würfelseite ist keiner Würfelszene zugeordnet.");
  }

  const drehung = originalWuerfel.querySelector(".wuerfel__drehung");
  const drehungStil = drehung && window.getComputedStyle(drehung);
  const seitenStil = window.getComputedStyle(seite);
  const szeneRechteck = szene.getBoundingClientRect();
  const breite = originalWuerfel.offsetWidth;
  const mitteX = szeneRechteck.left + szeneRechteck.width / 2;
  const mitteY = szeneRechteck.top + szeneRechteck.height / 2;
  const zoomWuerfel = originalWuerfel.cloneNode(true);

  if (!(zoomWuerfel instanceof HTMLElement)) {
    throw new Error("Der Würfel konnte für die Grossansicht nicht kopiert werden.");
  }

  zoomWuerfel.setAttribute("aria-hidden", "true");
  zoomWuerfel.style.position = "absolute";
  zoomWuerfel.style.left = `${mitteX - breite / 2}px`;
  zoomWuerfel.style.top = `${mitteY - breite / 2}px`;
  zoomWuerfel.style.width = `${breite}px`;
  zoomWuerfel.style.height = `${breite}px`;
  zoomWuerfel.style.animation = "none";
  zoomWuerfel.style.transform = wuerfelTransform;

  const zoomDrehung = zoomWuerfel.querySelector(".wuerfel__drehung");

  if (!(zoomDrehung instanceof HTMLElement) || !drehungStil) {
    throw new Error("Die Würfeldrehung konnte für die Grossansicht nicht kopiert werden.");
  }

  zoomDrehung.style.transform = drehungStil.transform;

  const originaleSeiten = [...originalWuerfel.querySelectorAll(".wuerfel__seite")];
  const zoomSeiten = [...zoomWuerfel.querySelectorAll(".wuerfel__seite")];
  const zoomSeite = zoomSeiten[originaleSeiten.indexOf(seite)];

  if (!(zoomSeite instanceof HTMLElement)) {
    throw new Error("Die angeklickte Würfelseite konnte nicht kopiert werden.");
  }

  for (const kopierteSeite of zoomSeiten) {
    kopierteSeite.style.visibility = kopierteSeite === zoomSeite ? "visible" : "hidden";
  }

  zoomSeite.style.transform = seitenStil.transform;
  zoomSeite.style.overflow = "visible";
  const zoomMedium = zoomSeite.querySelector(".wuerfel__bild, .wuerfel__video");

  if (!(zoomMedium instanceof HTMLImageElement) && !(zoomMedium instanceof HTMLVideoElement)) {
    throw new Error("Das Bild der angeklickten Würfelseite konnte nicht kopiert werden.");
  }

  const istOben = seite.classList.contains("wuerfel__seite--oben");
  const istUnten = seite.classList.contains("wuerfel__seite--unten");
  const tuerTransformation = istOben
    ? "perspective(700px) rotateX(72deg)"
    : istUnten
      ? "perspective(700px) rotateX(-72deg)"
      : "perspective(700px) rotateY(-72deg)";
  const tuerScharnier = istOben ? "50% 0%" : istUnten ? "50% 100%" : "0% 50%";
  const tuerEnde = 0.32;

  zoomMedium.style.transform = "none";
  zoomMedium.style.transformOrigin = tuerScharnier;

  const zoomVideo = zoomSeite.querySelector("video");

  if (zoomVideo) {
    const originalVideo = seite.querySelector("video");
    zoomVideo.autoplay = false;
    zoomVideo.loop = false;
    zoomVideo.controls = !projektModus;
    zoomVideo.removeAttribute("aria-hidden");
    zoomVideo.style.pointerEvents = projektModus ? "none" : "auto";
    zoomVideo.setAttribute("aria-label", "Vergrössertes Würfelvideo");
    zoomWuerfel.removeAttribute("aria-hidden");

    if (originalVideo) {
      zoomVideo.addEventListener("loadedmetadata", () => {
        zoomVideo.currentTime = originalVideo.currentTime;
      }, { once: true });
    }
  }

  if (projektModus) {
    // Fliessender Übergang zur Projektseite: schwarzer Hintergrund wie dort, kein Schliessen-Knopf.
    zoomSeite.style.border = "0";
    bildAnsicht.style.background = "#000";
    ansichtSchliessen.hidden = true;
  }

  const perspektive = window.getComputedStyle(szene);
  ansichtInhalt.style.perspective = perspektive.perspective;
  ansichtInhalt.style.perspectiveOrigin = `${mitteX}px ${mitteY}px`;
  ansichtInhalt.replaceChildren(zoomWuerfel);
  const sichtbarkeit = originalWuerfel.style.visibility;
  originalWuerfel.style.visibility = "hidden";
  bildAnsicht.hidden = false;
  wuerfelBuehne.inert = true;
  if (!projektModus) {
    ansichtSchliessen.focus();
  }

  const reduzierteBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const zielGroesse = projektModus
    ? uebergangsGroesse()
    : Math.min(window.innerWidth * 0.94, window.innerHeight * 0.9, 960);
  const skalierung = zielGroesse / breite;
  const animationen = [];

  if (reduzierteBewegung) {
    zoomWuerfel.style.transform = `translate(${window.innerWidth / 2 - mitteX}px, ${window.innerHeight / 2 - mitteY}px) scale(${skalierung})`;
    zoomDrehung.style.transform = "none";
    zoomSeite.style.transform = "none";
    zoomMedium.style.transform = "none";
    bildAnsicht.style.opacity = "1";
  } else {
    const optionen = {
      duration: 1250,
      easing: "linear",
      fill: "forwards",
    };
    const zielX = window.innerWidth / 2;
    const zielY = window.innerHeight / 2;
    const wegX = zielX - mitteX;
    const wegY = zielY - mitteY;
    const wegLaenge = Math.hypot(wegX, wegY);
    let senkrechtX = wegLaenge === 0 ? 0 : -wegY / wegLaenge;
    let senkrechtY = wegLaenge === 0 ? -1 : wegX / wegLaenge;

    if (senkrechtY > 0) {
      senkrechtX *= -1;
      senkrechtY *= -1;
    }

    const bogentiefe = Math.min(140, Math.max(48, wegLaenge * 0.22));
    const kontrollX = mitteX + wegX / 2 + senkrechtX * bogentiefe * 2;
    const kontrollY = mitteY + wegY / 2 + senkrechtY * bogentiefe * 2;
    const wuerfelKeyframes = [
      { transform: wuerfelTransform, offset: 0 },
      { transform: wuerfelTransform, offset: tuerEnde },
    ];

    for (let schritt = 1; schritt <= 12; schritt += 1) {
      const fortschritt = schritt / 12;
      const rest = 1 - fortschritt;
      const x = rest ** 2 * mitteX + 2 * rest * fortschritt * kontrollX + fortschritt ** 2 * zielX;
      const y = rest ** 2 * mitteY + 2 * rest * fortschritt * kontrollY + fortschritt ** 2 * zielY;
      const offset = tuerEnde + (1 - tuerEnde) * fortschritt;

      wuerfelKeyframes.push({
        transform: `translate(${x - mitteX}px, ${y - mitteY}px) scale(${1 + (skalierung - 1) * fortschritt})`,
        offset,
      });
    }

    animationen.push(
      zoomWuerfel.animate(wuerfelKeyframes, optionen),
      zoomDrehung.animate(
        [
          { transform: drehungStil.transform, offset: 0 },
          {
            transform: drehungStil.transform,
            offset: tuerEnde,
            easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
          },
          { transform: "none", offset: 1 },
        ],
        optionen,
      ),
      zoomSeite.animate(
        [
          { transform: seitenStil.transform, offset: 0 },
          {
            transform: seitenStil.transform,
            offset: tuerEnde,
            easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
          },
          { transform: "none", offset: 1 },
        ],
        optionen,
      ),
      zoomMedium.animate(
        [
          {
            transform: "none",
            offset: 0,
            easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
          },
          {
            transform: tuerTransformation,
            offset: tuerEnde,
            easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
          },
          { transform: "none", offset: 1 },
        ],
        optionen,
      ),
      bildAnsicht.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 0.45, offset: tuerEnde },
          { opacity: 1, offset: 1 },
        ],
        optionen,
      ),
    );
  }

  bildZoom = { zoomWuerfel, originalWuerfel, sichtbarkeit, animationen, reduzierteBewegung, projektModus };
  return animationen;
}

function ansichtZuruecksetzen(zoom) {
  ansichtInhalt.replaceChildren();
  ansichtInhalt.style.removeProperty("perspective");
  ansichtInhalt.style.removeProperty("perspective-origin");
  bildAnsicht.style.opacity = "";
  bildAnsicht.style.background = "";
  bildAnsicht.hidden = true;
  ansichtSchliessen.hidden = false;
  zoom.originalWuerfel.style.visibility = zoom.sichtbarkeit;
  wuerfelBuehne.inert = false;
}

function projektUebergangStarten(seite, wuerfelTransform, projektseite) {
  if (bildZoom !== null) {
    return;
  }

  const medium = seite.querySelector(".wuerfel__bild, .wuerfel__video");
  const ziel = new URL(projektseite, window.location.href);

  if (medium instanceof HTMLVideoElement) {
    const quelle = medium.querySelector("source")?.getAttribute("src") ?? medium.getAttribute("src");

    if (quelle) {
      ziel.searchParams.set("video", quelle);
      ziel.searchParams.set("t", medium.currentTime.toFixed(2));
      const poster = medium.getAttribute("poster");

      if (poster) {
        ziel.searchParams.set("poster", poster);
      }
    }
  } else if (medium instanceof HTMLImageElement) {
    const quelle = medium.getAttribute("src");

    if (quelle) {
      ziel.searchParams.set("bild", quelle);
    }
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.location.href = ziel.href;
    return;
  }

  const animationen = bildAnsichtOeffnen(seite, wuerfelTransform, true);

  void Promise.all(animationen.map((animation) => animation.finished)).then(
    () => {
      window.location.href = ziel.href;
    },
    () => undefined,
  );
}

// Beim Zurückkehren (Zurück-Taste, Seiten-Cache) die Würfel wieder normal zeigen.
window.addEventListener("pageshow", (ereignis) => {
  if (ereignis.persisted && bildZoom?.projektModus) {
    const zoom = bildZoom;
    bildZoom = null;

    for (const animation of zoom.animationen) {
      animation.cancel();
    }

    ansichtZuruecksetzen(zoom);
  }
});

function bildAnsichtSchliessen() {
  if (bildAnsicht.hidden || bildZoom === null || bildZoom.projektModus) {
    return;
  }

  const zoom = bildZoom;
  bildZoom = null;

  async function schliessen() {
    if (zoom.reduzierteBewegung) {
      zoom.zoomWuerfel.querySelector("video")?.pause();
    } else {
      for (const animation of zoom.animationen) {
        animation.reverse();
      }

      await Promise.all(zoom.animationen.map((animation) => animation.finished.catch(() => undefined)));
      zoom.zoomWuerfel.querySelector("video")?.pause();
    }

    ansichtZuruecksetzen(zoom);
    bildOeffner?.focus();
    bildOeffner?.removeAttribute("tabindex");
    bildOeffner = null;
  }

  void schliessen();
}

ansichtSchliessen.addEventListener("click", bildAnsichtSchliessen);

bildAnsicht.addEventListener("click", (ereignis) => {
  if (ereignis.target === bildAnsicht || ereignis.target === ansichtInhalt) {
    bildAnsichtSchliessen();
  }
});

document.addEventListener("keydown", (ereignis) => {
  if (ereignis.key === "Escape" && !bildAnsicht.hidden) {
    bildAnsichtSchliessen();
  }
});

wuerfel.forEach((einWuerfel) => {
  const drehung = einWuerfel.querySelector(".wuerfel__drehung");

  if (!(drehung instanceof HTMLElement)) {
    throw new Error("Die Drehfläche eines Würfels wurde im HTML nicht gefunden.");
  }

  let ziehung = null;
  let drehungX = 0;
  let drehungY = 0;
  let ausrichtungsTimer = 0;

  function ausrichtungBeenden(ereignis) {
    if (ereignis.target !== drehung || ereignis.propertyName !== "transform") {
      return;
    }

    window.clearTimeout(ausrichtungsTimer);
    ausrichtungsTimer = 0;
    einWuerfel.classList.remove("wuerfel--ausrichten", "wuerfel--ziehen");
  }

  drehung.addEventListener("transitionend", ausrichtungBeenden);

  einWuerfel.addEventListener("pointerdown", (ereignis) => {
    if (ereignis.button !== 0 || einWuerfel.classList.contains("wuerfel--ausrichten")) {
      return;
    }

    ziehung = {
      zeigerId: ereignis.pointerId,
      letzteX: ereignis.clientX,
      letzteY: ereignis.clientY,
      startX: ereignis.clientX,
      startY: ereignis.clientY,
      wuerfelTransform: "",
      seite: ereignis.target instanceof Element
        ? ereignis.target.closest(".wuerfel__seite")
        : null,
      hatGezogen: false,
    };
    einWuerfel.classList.add("wuerfel--ziehen");
    ziehung.wuerfelTransform = window.getComputedStyle(einWuerfel).transform;
    einWuerfel.setPointerCapture(ereignis.pointerId);
  });

  einWuerfel.addEventListener("keydown", (ereignis) => {
    const projektseite = einWuerfel.dataset.projektseite;

    if (projektseite && (ereignis.key === "Enter" || ereignis.key === " ")) {
      ereignis.preventDefault();
      window.location.href = projektseite;
    }
  });

  einWuerfel.addEventListener("pointermove", (ereignis) => {
    if (ziehung === null || ereignis.pointerId !== ziehung.zeigerId) {
      return;
    }

    if (!ziehung.hatGezogen) {
      const abstandX = ereignis.clientX - ziehung.startX;
      const abstandY = ereignis.clientY - ziehung.startY;

      if (Math.hypot(abstandX, abstandY) <= 5) {
        ziehung.letzteX = ereignis.clientX;
        ziehung.letzteY = ereignis.clientY;
        return;
      }

      ziehung.hatGezogen = true;
    }

    drehungY += ereignis.clientX - ziehung.letzteX;
    drehungX -= ereignis.clientY - ziehung.letzteY;
    ziehung.letzteX = ereignis.clientX;
    ziehung.letzteY = ereignis.clientY;

    drehung.style.setProperty("--wuerfel-manuell-x", `${drehungX}deg`);
    drehung.style.setProperty("--wuerfel-manuell-y", `${drehungY}deg`);
  });

  function ziehungBeenden(ereignis) {
    if (ziehung === null || ereignis.pointerId !== ziehung.zeigerId) {
      return;
    }

    const beendeteZiehung = ziehung;
    ziehung = null;

    if (
      ereignis.type === "pointerup" &&
      !beendeteZiehung.hatGezogen &&
      beendeteZiehung.seite instanceof HTMLElement
    ) {
      const projektseite = einWuerfel.dataset.projektseite;

      if (projektseite) {
        einWuerfel.classList.remove("wuerfel--ziehen");
        projektUebergangStarten(beendeteZiehung.seite, beendeteZiehung.wuerfelTransform, projektseite);
        return;
      }

      einWuerfel.classList.remove("wuerfel--ziehen");
      bildOeffner = beendeteZiehung.seite.querySelector(".wuerfel__bild, .wuerfel__video");

      if (bildOeffner instanceof HTMLElement) {
        bildOeffner.tabIndex = -1;
      }

      bildAnsichtOeffnen(beendeteZiehung.seite, beendeteZiehung.wuerfelTransform);
      return;
    }

    // Eine starke Neigung auf der X-Achse korrigieren; die gewählte Seite bleibt dabei erhalten.
    const neigungX = ((drehungX + 180) % 360 + 360) % 360 - 180;

    if (Math.abs(neigungX) > 45) {
      drehungX = 0;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        drehung.style.setProperty("--wuerfel-manuell-x", "0deg");
        einWuerfel.classList.remove("wuerfel--ziehen");
        return;
      }

      einWuerfel.classList.add("wuerfel--ausrichten");
      void window.getComputedStyle(drehung).transform;
      drehung.style.setProperty("--wuerfel-manuell-x", "0deg");
      ausrichtungsTimer = window.setTimeout(() => {
        ausrichtungsTimer = 0;
        einWuerfel.classList.remove("wuerfel--ausrichten", "wuerfel--ziehen");
      }, 400);
      return;
    }

    einWuerfel.classList.remove("wuerfel--ziehen");
  }

  einWuerfel.addEventListener("pointerup", ziehungBeenden);
  einWuerfel.addEventListener("pointercancel", ziehungBeenden);
  einWuerfel.addEventListener("lostpointercapture", ziehungBeenden);
});
