
const SPOTS = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"];

/** @type {{ spot: string, occupied: boolean }[]} */
let availabilityStore = [];

/** After a spot is chosen, map clicks are locked until "Change Area" is used. */
let selectionLocked = false;

/** Matches checkout card: GHC per minute (demo pricing). */
const RATE_PER_MIN = 0.1;

function formatGhc(amount) {
  return `GHC ${amount.toFixed(2)}`;
}

function updateBookingTotals() {
  const input = document.getElementById("booking-minutes");
  if (!input) return;
  let mins = Math.round(Number(input.value));
  if (Number.isNaN(mins) || mins < 1) mins = 1;
  if (mins > 480) mins = 480;
  input.value = String(mins);

  const rateElement = document.getElementById("booking-rate-display");
  const durationElement = document.getElementById("booking-duration-display");
  const formulaEl = document.getElementById("booking-formula");
  const totalEl = document.getElementById("booking-total");
  if (rateElement) rateElement.textContent = `GHC ${RATE_PER_MIN.toFixed(2)} / min`;
  if (durationElement) durationElement.textContent = `${mins} mins`;
  if (formulaEl) {
    formulaEl.textContent = `GHC ${RATE_PER_MIN.toFixed(2)} × ${mins} mins`;
  }
  if (totalEl) totalEl.textContent = formatGhc(mins * RATE_PER_MIN);
}

function showBookingView() {
  const selected = document.querySelector(
    '#spaces-container button[data-state="selected"]'
  );
  if (!selected) return;

  const spot = selected.dataset.spot || "";
  const titleElement = document.getElementById("booking-spot-title");
  if (titleElement) titleElement.textContent = spot ? `Spot ${spot}` : "Spot —";

  const parking = document.getElementById("view-parking");
  const booking = document.getElementById("view-booking");
  if (parking) {
    parking.hidden = true;
    parking.setAttribute("aria-hidden", "true");
  }
  if (booking) {
    booking.hidden = false;
    booking.setAttribute("aria-hidden", "false");
  }

  const minutesInput = document.getElementById("booking-minutes");
  if (minutesInput) minutesInput.value = "60";
  updateBookingTotals();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showParkingView() {
  const parking = document.getElementById("view-parking");
  const booking = document.getElementById("view-booking");
  if (parking) {
    parking.hidden = false;
    parking.removeAttribute("aria-hidden");
  }
  if (booking) {
    booking.hidden = true;
    booking.setAttribute("aria-hidden", "true");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function markSpotOccupied(spotCode) {
  const spot = spotCode.toUpperCase();
  const row = availabilityStore.find((x) => x.spot === spot);
  if (row) row.occupied = true;
}

function showThankYouToast() {
  const toast = document.getElementById("thank-you-toast");
  if (!toast) return;
  toast.hidden = false;
  window.clearTimeout(showThankYouToast._timer);
  showThankYouToast._timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 6500);
}

/**
 * After confirm: mark spot occupied, clear selection, return to map, thank-you message.
 */
function finalizeBookingAndReturnToMap(spotCode) {
  const spacesContainer = document.getElementById("spaces-container");
  if (!spacesContainer) return;

  markSpotOccupied(spotCode);
  spacesContainer.querySelectorAll("button[data-spot]").forEach((btn) => {
    delete btn.dataset.state;
  });
  clearSelection(spacesContainer);
  applyAvailability(spacesContainer, availabilityStore);
  setSpacesInteractionLocked(spacesContainer, false);
  setSpotSelectionActionsEnabled(false);
  setSelectedSpotInPanel("");

  showParkingView();
  showThankYouToast();
}

function returnToParkingSelection(spacesContainer) {
  clearSelectionFromChangeArea(spacesContainer);
  showParkingView();
}

function setupBookingFlow() {
  const proceedBtn = document.getElementById("proceed-checkout-btn");
  const changeSpotBtn = document.getElementById("change-spot-btn");
  const confirmBtn = document.getElementById("confirm-booking-btn");
  const minutesInput = document.getElementById("booking-minutes");
  const findParkingLink = document.querySelector('a[href="#parking-lot"]');

  proceedBtn?.addEventListener("click", () => {
    const selected = document.querySelector(
      '#spaces-container button[data-state="selected"]'
    );
    if (!selected || proceedBtn.disabled) return;
    showBookingView();
  });

  changeSpotBtn?.addEventListener("click", () => {
    const sc = document.getElementById("spaces-container");
    if (sc) returnToParkingSelection(sc);
  });

  confirmBtn?.addEventListener("click", () => {
    const selected = document.querySelector(
      '#spaces-container button[data-state="selected"]'
    );
    const spot = selected?.dataset?.spot;
    if (!spot) return;
    finalizeBookingAndReturnToMap(spot);
  });

  minutesInput?.addEventListener("input", updateBookingTotals);

  minutesInput?.addEventListener("change", updateBookingTotals);

  findParkingLink?.addEventListener("click", (e) => {
    e.preventDefault();
    const sc = document.getElementById("spaces-container");
    if (sc) returnToParkingSelection(sc);
    else showParkingView();
    document.getElementById("parking-lot")?.scrollIntoView({ behavior: "smooth" });
  });
}

function randomizeAvailability() {
  const list = SPOTS.map((spot) => ({
    spot,
    occupied: Math.random() < 0.45,
  }));
  // Keep at least one spot free so the demo is always usable
  if (list.every((x) => x.occupied)) {
    list[Math.floor(Math.random() * list.length)].occupied = false;
  }
  availabilityStore = list;
  return list;
}

function spotToPanelText(spot) {
  const row = spot?.[0]?.toUpperCase?.() ?? "";
  const num = spot?.slice?.(1) ?? "";
  if (!row || !num) return spot || "";
  return `Row ${row}, Spot ${num}`;
}

function setTileState(buttonElement, state) {
  const tile = buttonElement.querySelector(".btn");
  const label = buttonElement.querySelector("p");
  const spot = buttonElement.dataset.spot || "";

  if (!tile || !label) return;

  tile.classList.remove("available", "occupied", "selected");
  label.classList.remove("selected-space");

  if (state === "occupied") {
    tile.classList.add("occupied");
    buttonElement.disabled = true;
    buttonElement.setAttribute("aria-disabled", "true");
    label.textContent = spot;
    return;
  }

  if (state === "selected") {
    tile.classList.add("selected");
    buttonElement.disabled = false;
    buttonElement.removeAttribute("aria-disabled");
    label.classList.add("selected-space");
    label.textContent = `${spot} (SELECTED)`;
    return;
  }

  tile.classList.add("available");
  buttonElement.disabled = false;
  buttonElement.removeAttribute("aria-disabled");
  label.textContent = spot;
}

function clearSelection(containerEl) {
  containerEl.querySelectorAll("button[data-spot]").forEach((btn) => {
    if (btn.dataset.state === "selected") btn.dataset.state = "";
    const tile = btn.querySelector(".btn");
    const label = btn.querySelector("p");
    if (tile?.classList.contains("selected")) {
      tile.classList.remove("selected");
      if (label) {
        label.classList.remove("selected-space");
        label.textContent = btn.dataset.spot || label.textContent;
      }
    }
  });
}

function applyAvailability(containerEl, availability) {
  const map = new Map(availability.map((x) => [x.spot, x.occupied]));

  containerEl.querySelectorAll("button[data-spot]").forEach((btn) => {
    const spot = (btn.dataset.spot || "").toUpperCase();
    const occupied = map.get(spot);
    if (occupied === undefined) return;

    if (occupied) {
      setTileState(btn, "occupied");
      btn.dataset.state = "occupied";
    } else if (btn.dataset.state === "selected") {
      setTileState(btn, "selected");
    } else {
      setTileState(btn, "available");
      btn.dataset.state = "available";
    }
  });
}

function setSelectedSpotInPanel(spot) {
  const el = document.getElementById("selected-spot");
  if (!el) return;
  el.textContent = spot ? spotToPanelText(spot) : "—";
}

function setSpotSelectionActionsEnabled(enabled) {
  const proceed = document.getElementById("proceed-checkout-btn");
  const changeArea = document.getElementById("change-area-btn");
  [proceed, changeArea].forEach((btn) => {
    if (!btn) return;
    btn.disabled = !enabled;
    if (enabled) {
      btn.removeAttribute("aria-disabled");
    } else {
      btn.setAttribute("aria-disabled", "true");
    }
  });
}

function setSpacesInteractionLocked(containerEl, locked) {
  selectionLocked = locked;
  if (locked) {
    containerEl.setAttribute("data-selection-locked", "true");
    containerEl.querySelectorAll("button[data-spot]").forEach((btn) => {
      if (btn.dataset.state === "selected") {
        btn.removeAttribute("tabindex");
      } else {
        btn.setAttribute("tabindex", "-1");
      }
    });
  } else {
    containerEl.removeAttribute("data-selection-locked");
    containerEl.querySelectorAll("button[data-spot]").forEach((btn) => {
      btn.removeAttribute("tabindex");
    });
  }
}

function clearSelectionFromChangeArea(containerEl) {
  const selected = containerEl.querySelector('button[data-state="selected"]');
  if (selected) {
    const spot = (selected.dataset.spot || "").toUpperCase();
    const row = availabilityStore.find((x) => x.spot === spot);
    if (row?.occupied) {
      setTileState(selected, "occupied");
      selected.dataset.state = "occupied";
    } else {
      setTileState(selected, "available");
      selected.dataset.state = "available";
    }
  }
  setSelectedSpotInPanel("");
  setSpacesInteractionLocked(containerEl, false);
  setSpotSelectionActionsEnabled(false);
}

function init() {
  setupBookingFlow();

  const spacesContainer = document.getElementById("spaces-container");
  if (!spacesContainer) return;

  const changeAreaBtn = document.getElementById("change-area-btn");

  spacesContainer.querySelectorAll("button[data-spot]").forEach((btn) => {
    delete btn.dataset.state;
  });
  setSelectedSpotInPanel("");
  setSpacesInteractionLocked(spacesContainer, false);
  setSpotSelectionActionsEnabled(false);

  const refresh = () => {
    const availability = randomizeAvailability();
    applyAvailability(spacesContainer, availability);

    const selectedBtn = spacesContainer.querySelector('button[data-state="selected"]');
    if (selectedBtn) {
      const isNowOccupied =
        selectedBtn.dataset.state === "occupied" || selectedBtn.disabled;
      if (isNowOccupied) {
        selectedBtn.dataset.state = "";
        clearSelection(spacesContainer);
        setSelectedSpotInPanel("");
        setSpotSelectionActionsEnabled(false);
      }
    }
  };

  refresh();

  changeAreaBtn?.addEventListener("click", () => {
    returnToParkingSelection(spacesContainer);
  });

  spacesContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-spot]");
    if (!btn || !spacesContainer.contains(btn)) return;
    if (btn.disabled || btn.dataset.state === "occupied") return;

    if (selectionLocked) {
      return;
    }

    btn.dataset.state = "selected";
    setTileState(btn, "selected");
    setSelectedSpotInPanel(btn.dataset.spot || "");
    setSpacesInteractionLocked(spacesContainer, true);
    setSpotSelectionActionsEnabled(true);
  });
}

document.addEventListener("DOMContentLoaded", init);
