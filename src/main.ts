const options = {
  species: ["Goblin", "Gremlin", "Raccoon", "Troll", "Ogre", "Pigeon", "Mothman", "Bog Sprite"],
  temperament: ["mischievous", "grumpy", "noble", "chaotic", "curious", "dramatic", "sneaky"],
  habitat: ["abandoned clocktower", "city sewer", "enchanted forest", "dumpster kingdom", "misty bridge", "old cathedral"],
  trait: ["glows in moonlight", "collects shiny bottle caps", "speaks in rhymes", "can smell pancakes miles away", "wears a tiny cape", "has thunderous hiccups"],
  role: ["scout", "alchemist", "bard", "warden", "oracle", "trickster"],
  quirk: ["never lies but constantly exaggerates", "is terrified of butterflies", "hoards cursed teaspoons", "refuses to cross running water", "keeps a diary of strange dreams", "talks to statues and gets answers back"],
  goal: ["recover a stolen relic", "build a floating market", "start peace talks with the crows", "map hidden tunnels", "win the yearly lantern race", "awaken an ancient garden"]
} as const;

type OptionGroup = keyof typeof options;

const speciesSelect = document.querySelector<HTMLSelectElement>("#species");
const temperamentSelect = document.querySelector<HTMLSelectElement>("#temperament");
const habitatSelect = document.querySelector<HTMLSelectElement>("#habitat");
const traitSelect = document.querySelector<HTMLSelectElement>("#trait");
const roleSelect = document.querySelector<HTMLSelectElement>("#role");
const form = document.querySelector<HTMLFormElement>("#creator-form");
const result = document.querySelector<HTMLElement>("#result");
const randomizeButton = document.querySelector<HTMLButtonElement>("#randomize");
const saveButton = document.querySelector<HTMLButtonElement>("#save");
const list = document.querySelector<HTMLOListElement>("#saved-creatures");

const canvas = document.querySelector<HTMLCanvasElement>("#pixel-portrait");

if (!speciesSelect || !temperamentSelect || !habitatSelect || !traitSelect || !roleSelect || !form || !result || !randomizeButton || !saveButton || !list || !canvas) {
  throw new Error("Missing required DOM nodes for Creature Creator.");
}

const pick = <T,>(values: readonly T[]): T => values[Math.floor(Math.random() * values.length)];

const slug = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const populate = (key: OptionGroup, select: HTMLSelectElement): void => {
  options[key].forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
};

populate("species", speciesSelect);
populate("temperament", temperamentSelect);
populate("habitat", habitatSelect);
populate("trait", traitSelect);
populate("role", roleSelect);


const spritePalettes = {
  goblin: { skin: "#7cc757", shadow: "#3f7d2e", highlight: "#d9f7b5", accent: "#bf5b39", detail: "#1d2427" },
  gremlin: { skin: "#8884db", shadow: "#49478d", highlight: "#f0eeff", accent: "#51bed8", detail: "#1d2427" },
  raccoon: { skin: "#95959c", shadow: "#54545c", highlight: "#f4f4f5", accent: "#2b2b2d", detail: "#151515" },
  troll: { skin: "#85ad62", shadow: "#4c6e39", highlight: "#dff0cf", accent: "#bb8658", detail: "#1d2427" },
  ogre: { skin: "#8fb769", shadow: "#587741", highlight: "#e0edc7", accent: "#8a4c37", detail: "#1d2427" },
  pigeon: { skin: "#95b0d2", shadow: "#5f7490", highlight: "#f1f5ff", accent: "#92d4be", detail: "#1d2427" },
  mothman: { skin: "#7a6578", shadow: "#433943", highlight: "#f3b1b6", accent: "#dd2c30", detail: "#0e1012" },
  "bog-sprite": { skin: "#77cfac", shadow: "#2f7b67", highlight: "#dcfff4", accent: "#93e9d0", detail: "#1d2427" }
} as const;

type SpeciesKey = keyof typeof spritePalettes;
type LayerColor = "skin" | "shadow" | "highlight" | "accent" | "detail";

const hashSeed = (input: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRng = (seed: number): (() => number) => () => {
  let current = (seed += 0x6d2b79f5);
  current = Math.imul(current ^ (current >>> 15), current | 1);
  current ^= current + Math.imul(current ^ (current >>> 7), current | 61);
  return ((current ^ (current >>> 14)) >>> 0) / 4294967296;
};

const renderPixelPortrait = (species: string, seedText: string): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const key = (slug(species) as SpeciesKey) in spritePalettes ? (slug(species) as SpeciesKey) : "goblin";
  const palette = spritePalettes[key];
  const size = 16;
  const scale = canvas.width / size;
  const center = (size - 1) / 2;
  const rng = createRng(hashSeed(seedText));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#081417";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const earHeight = Math.floor(rng() * 3) + 2;
  const jawWidth = Math.floor(rng() * 3) + 4;
  const eyeGap = Math.floor(rng() * 2) + 2;
  const eyeY = Math.floor(rng() * 2) + 6;
  const mouthY = Math.floor(rng() * 2) + 10;
  const hornChance = rng();
  const maskChance = rng();

  const pixels: Array<{ x: number; y: number; color: LayerColor }> = [];
  const paint = (x: number, y: number, color: LayerColor): void => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    pixels.push({ x, y, color });
  };

  for (let y = 1; y < size - 1; y += 1) {
    const vertical = Math.abs(y - center) / center;
    const halfWidth = Math.max(
      jawWidth,
      Math.round((1 - vertical * vertical) * 5) + 3 + (y < earHeight + 2 ? 2 : 0)
    );
    for (let dx = 0; dx <= halfWidth; dx += 1) {
      const xLeft = Math.floor(center - dx);
      const xRight = Math.ceil(center + dx);
      const edge = dx >= halfWidth - 1;
      paint(xLeft, y, edge ? "shadow" : "skin");
      paint(xRight, y, edge ? "shadow" : "skin");
    }
  }

  for (let x = 5; x <= 10; x += 1) paint(x, eyeY - 1, "highlight");
  for (let y = eyeY - 1; y <= mouthY + 1; y += 1) {
    paint(Math.floor(center - 3), y, "highlight");
    paint(Math.ceil(center + 3), y, "highlight");
  }
  paint(Math.floor(center - eyeGap), eyeY, "detail");
  paint(Math.ceil(center + eyeGap), eyeY, "detail");
  for (let x = Math.floor(center - 2); x <= Math.ceil(center + 2); x += 1) paint(x, mouthY, "accent");
  paint(Math.floor(center), mouthY + 1, "accent");

  if (hornChance > 0.6) {
    paint(4, 2, "accent"); paint(11, 2, "accent");
    paint(3, 1, "highlight"); paint(12, 1, "highlight");
  }
  if (maskChance > 0.45) {
    for (let x = 4; x <= 11; x += 1) paint(x, eyeY, "shadow");
    paint(Math.floor(center - eyeGap), eyeY, "detail");
    paint(Math.ceil(center + eyeGap), eyeY, "detail");
  }

  pixels.forEach(({ x, y, color }) => {
    ctx.fillStyle = palette[color];
    ctx.fillRect(x * scale, y * scale, scale, scale);
  });

  canvas.setAttribute("aria-label", `${species} generated portrait`);
};

const createCreatureSheet = (): string => {
  const species = speciesSelect.value;
  const temperament = temperamentSelect.value;
  const habitat = habitatSelect.value;
  const trait = traitSelect.value;
  const role = roleSelect.value;
  const quirk = pick(options.quirk);
  const goal = pick(options.goal);

  const nameParts = [pick(["Grim", "Nim", "Brak", "Tala", "Murk", "Kiri", "Vex"]), pick(["spark", "whistle", "moss", "snout", "riddle", "gear", "glint"])];
  const name = `${nameParts[0]}${nameParts[1]}`;

  const power = Math.floor(Math.random() * 6) + 5;
  const cleverness = Math.floor(Math.random() * 6) + 5;
  const chaos = Math.floor(Math.random() * 6) + 5;

  return [
    `ID: ${slug(name)}-${Date.now().toString().slice(-4)}`,
    `Name: ${name}`,
    `Class: ${temperament} ${species} ${role}`,
    `Habitat: ${habitat}`,
    `Signature trait: ${trait}`,
    `Quirk: ${quirk}`,
    `Current goal: ${goal}`,
    "",
    "Stats (1-10):",
    `- Power: ${power}`,
    `- Cleverness: ${cleverness}`,
    `- Chaos: ${chaos}`,
    "",
    `Lore: ${name} is a ${temperament} ${species.toLowerCase()} ${role} from the ${habitat} who ${trait.toLowerCase()}. They ${quirk} while trying to ${goal}.`
  ].join("\n");
};

const renderCreature = (): void => {
  const sheet = createCreatureSheet();
  result.textContent = sheet;
  renderPixelPortrait(speciesSelect.value, sheet);
};

const randomizeSelections = (): void => {
  speciesSelect.value = pick(options.species);
  temperamentSelect.value = pick(options.temperament);
  habitatSelect.value = pick(options.habitat);
  traitSelect.value = pick(options.trait);
  roleSelect.value = pick(options.role);
  renderCreature();
};

const saveCurrentCreature = (): void => {
  const current = result.textContent?.trim();
  if (!current || current.startsWith("Choose your options")) {
    return;
  }

  const item = document.createElement("li");
  const title = current.split("\n")[1] ?? "Unnamed Creature";
  item.textContent = title.replace("Name: ", "");
  item.title = current;
  list.prepend(item);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderCreature();
});

randomizeButton.addEventListener("click", randomizeSelections);
saveButton.addEventListener("click", saveCurrentCreature);

renderCreature();
