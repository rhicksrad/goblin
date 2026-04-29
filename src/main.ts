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
  goblin: ["#00000000", "#6fbf4b", "#3f7d2e", "#d9f7b5", "#bf5b39", "#1a1a1a"],
  gremlin: ["#00000000", "#7b78ce", "#4b4a88", "#e9e8ff", "#5dc0d5", "#1a1a1a"],
  raccoon: ["#00000000", "#8f8f95", "#56565c", "#f4f4f5", "#1f1f20", "#1a1a1a"],
  troll: ["#00000000", "#7ea95d", "#4d6f3a", "#ddeecd", "#b77f53", "#1a1a1a"],
  ogre: ["#00000000", "#8bb463", "#597740", "#d8e8bd", "#7f4531", "#1a1a1a"],
  pigeon: ["#00000000", "#8da8c8", "#5c6f89", "#f1f5ff", "#92d4be", "#1a1a1a"],
  mothman: ["#00000000", "#6f5a6d", "#3f3540", "#f2a8ac", "#d11b1f", "#1a1a1a"],
  "bog-sprite": ["#00000000", "#6bcba7", "#2f7b67", "#d8fff1", "#93e9d0", "#1a1a1a"]
} as const;

const spriteTemplate = [
  "0000000000000000",
  "0000001111110000",
  "0000112222221100",
  "0001222333222100",
  "0012233444432210",
  "0122334444443221",
  "0123344455443321",
  "0123344444443321",
  "0123344554543321",
  "0012334444443210",
  "0001233444432100",
  "0000123333321000",
  "0000012222210000",
  "0000001111110000",
  "0000000000000000",
  "0000000000000000"
] as const;

const renderPixelPortrait = (species: string): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const key = slug(species) as keyof typeof spritePalettes;
  const palette = spritePalettes[key] ?? spritePalettes.goblin;
  const size = 16;
  const scale = canvas.width / size;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0b1719";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < size; y += 1) {
    const row = spriteTemplate[y];
    for (let x = 0; x < size; x += 1) {
      const colorIndex = Number(row[x]);
      const color = palette[colorIndex] ?? "#00000000";
      if (colorIndex === 0) {
        continue;
      }
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }

  canvas.setAttribute("aria-label", `${species} 8-bit portrait`);
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
  renderPixelPortrait(speciesSelect.value);
  result.textContent = createCreatureSheet();
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
