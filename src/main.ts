const options = {
  species: ["Goblin", "Gremlin", "Raccoon", "Troll", "Ogre", "Pigeon", "Mothman", "Bog Sprite"],
  temperament: ["mischievous", "grumpy", "noble", "chaotic", "curious", "dramatic", "sneaky"],
  habitat: ["abandoned clocktower", "city sewer", "enchanted forest", "dumpster kingdom", "misty bridge", "old cathedral"],
  trait: ["glows in moonlight", "collects shiny bottle caps", "speaks in rhymes", "can smell pancakes miles away", "wears a tiny cape", "has thunderous hiccups"]
} as const;

type OptionGroup = keyof typeof options;

const speciesSelect = document.querySelector<HTMLSelectElement>("#species");
const temperamentSelect = document.querySelector<HTMLSelectElement>("#temperament");
const habitatSelect = document.querySelector<HTMLSelectElement>("#habitat");
const traitSelect = document.querySelector<HTMLSelectElement>("#trait");
const form = document.querySelector<HTMLFormElement>("#creator-form");
const result = document.querySelector<HTMLElement>("#result");

if (!speciesSelect || !temperamentSelect || !habitatSelect || !traitSelect || !form || !result) {
  throw new Error("Missing required DOM nodes for Creature Creator.");
}

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

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const species = speciesSelect.value;
  const temperament = temperamentSelect.value;
  const habitat = habitatSelect.value;
  const trait = traitSelect.value;

  result.textContent = [
    `Name: ${species} of the ${habitat.split(" ")[0]} Clan`,
    `Class: ${temperament} ${species}`,
    `Habitat: ${habitat}`,
    `Trait: ${trait}`,
    "",
    `Lore: This ${temperament} ${species.toLowerCase()} roams the ${habitat} and ${trait.toLowerCase()}.`
  ].join("\n");
});
