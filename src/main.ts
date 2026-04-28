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

if (!speciesSelect || !temperamentSelect || !habitatSelect || !traitSelect || !roleSelect || !form || !result || !randomizeButton || !saveButton || !list) {
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
