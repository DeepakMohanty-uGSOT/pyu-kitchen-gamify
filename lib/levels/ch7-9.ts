import type { Check, Customer, Level } from "../types";

const out = (...lines: string[]): Check[] => [{ type: "output", lines }];

// ============================================================ CHAPTER 7 — THE RECIPE WALL (Functions)

const fullBill = (price: number, quantity: number, member: boolean) => {
  let cost = price * quantity;
  if (member) cost = cost * 0.9;
  if (cost > 500) cost = cost - 50;
  return cost;
};

export const CH7: Level[] = [
  {
    id: "7.1",
    chapter: 7,
    title: "First Recipe Card",
    concept: "Making and using a function",
    points: 15,
    scene: "wall",
    story: "Pyu is tired of writing the tea steps again for every customer. He wants to write them once on a recipe card, pin it on the wall, and use it whenever someone orders tea.",
    learn:
      "A **function** is a recipe card: some steps with a name. `def` makes the card:\n```\ndef say_hi():\n    print(\"Hi!\")\n```\nWriting the card doesn't run it. To use it, write its name with brackets: `say_hi()`.",
    goal: "Make a recipe card (a function) called `make_tea`. Each time Pyu uses it, it prints `Here is your tea!`. Then use the card **3** times to serve 3 customers.",
    starterCode: "# Pin your recipe card here, then use it.\n\n",
    customers: [{ name: "Asha", says: "Tea for three of us, please!" }],
    checks: [
      { type: "noError" },
      { type: "defines", fn: "make_tea" },
      { type: "callCount", fn: "make_tea", min: 3, max: 3 },
      { type: "output", lines: ["Here is your tea!", "Here is your tea!", "Here is your tea!"] },
      { type: "funcTest", fn: "make_tea", args: [], expectOutput: ["Here is your tea!"] },
    ],
    hints: [
      "Start with def, then the name make_tea, then () and a colon.",
      "The print goes under the def line, pushed 4 spaces right.",
      "After the card, write make_tea() three times, not pushed right.",
    ],
    successText: "Tea served to 3 customers",
  },
  {
    id: "7.2",
    chapter: 7,
    title: "Any Fruit Juice",
    concept: "Giving a function an ingredient",
    points: 15,
    scene: "wall",
    story: "Pyu doesn't want a different card for every fruit. One juice card should work for any fruit.",
    learn:
      "A card can take an **ingredient** (called a parameter). Put a name inside the brackets:\n```\ndef greet(person):\n    print(\"Hello\", person)\n\ngreet(\"Ravi\")\n```\nWhen you use the card, the value you pass in fills that name.",
    goal: "Make a recipe card `make_juice` that takes **one ingredient: the fruit**. It prints `One mango juice, coming up!` with whatever fruit it gets. Then serve mango, apple and orange juice, in that order.",
    starterCode: "# One card for every kind of juice.\n\n",
    customers: [{ name: "Ravi", says: "Juice for the table!" }],
    checks: [
      { type: "noError" },
      { type: "defines", fn: "make_juice" },
      { type: "output", lines: ["One mango juice, coming up!", "One apple juice, coming up!", "One orange juice, coming up!"] },
      { type: "callCount", fn: "make_juice", min: 3,
        fail: "The juices were printed, but not by the make_juice card every time. Use the card for all three juices." },
      { type: "funcTest", fn: "make_juice", args: ["kiwi"], expectOutput: ["One kiwi juice, coming up!"] },
      { type: "funcTest", fn: "make_juice", args: ["dragon fruit"], expectOutput: ["One dragon fruit juice, coming up!"] },
    ],
    hints: [
      "Put a name for the fruit inside the brackets on the def line.",
      "Use that name in the print inside the card. An f-string makes this easy.",
      "Use the card three times, each time with a different fruit in quotes.",
    ],
    successText: "Three juices from one recipe card",
  },
  {
    id: "7.3",
    chapter: 7,
    title: "The Bill",
    concept: "return",
    points: 20,
    scene: "wall",
    story: "Pyu wants a card that works out bills. The card shouldn't shout the answer. It should hand it back so Pyu can use it.",
    learn:
      "`return` hands an answer back from a card:\n```\ndef double(n):\n    return n * 2\n\nresult = double(4)\n```\nNow `result` holds 8. `print` only shows a value; `return` gives it back to be used.",
    goal: "Make a recipe card `calculate_bill` that gets a **price** and a **quantity** (in that order) and **returns** the total cost. The card must not print anything itself. Pyu prints the answer, and he'll also test your card with secret orders.",
    starterCode: "# Write your recipe card here\n\n\n\n# Pyu tries it out on one order:\nprint(calculate_bill(80, 3))\n",
    bindings: [],
    customers: [{ name: "Mei" }],
    checks: [
      { type: "noError" },
      { type: "defines", fn: "calculate_bill" },
      { type: "funcTest", fn: "calculate_bill", args: [80, 3], expect: 240, pyType: "number", noOutput: true },
      { type: "funcTest", fn: "calculate_bill", args: [45, 2], expect: 90, pyType: "number", noOutput: true },
      { type: "funcTest", fn: "calculate_bill", args: [12.5, 4], expect: 50, pyType: "number", noOutput: true },
      { type: "funcTest", fn: "calculate_bill", args: [100, 0], expect: 0, pyType: "number", noOutput: true },
      { type: "output", lines: ["240"], mode: "loose" },
    ],
    hints: [
      "The card needs two ingredients in the brackets: price, then quantity.",
      "Work out price times quantity inside the card.",
      "Use return, not print, to hand the answer back.",
    ],
    successText: "The bill card passed every secret order",
  },
  {
    id: "7.4",
    chapter: 7,
    title: "Medium by Default",
    concept: "Default values",
    points: 15,
    scene: "wall",
    story: "Most customers just say \"a coffee, please\" without a size. Pyu always makes those medium.",
    learn:
      "An ingredient can have a **default** value, used when nothing is passed in:\n```\ndef order(drink=\"water\"):\n    return \"One \" + drink\n```\n`order()` gives \"One water\", and `order(\"tea\")` gives \"One tea\".",
    goal: "Make `make_coffee`, which takes a **size** and returns the text `A large coffee` (with that size). If Pyu uses it **without** a size, it makes a `medium` one. Then print a coffee made without a size, and a small coffee.",
    notes: ["Pyu expects the tickets `A medium coffee` and then `A small coffee`."],
    starterCode: "# The coffee card\n\n",
    customers: [{ name: "Tom", says: "A coffee, please. Any size!" }],
    checks: [
      { type: "noError" },
      { type: "defines", fn: "make_coffee" },
      { type: "funcTest", fn: "make_coffee", args: [], expect: "A medium coffee", pyType: "str", noOutput: true },
      { type: "funcTest", fn: "make_coffee", args: ["large"], expect: "A large coffee", pyType: "str", noOutput: true },
      { type: "funcTest", fn: "make_coffee", args: [], kwargs: { size: "tiny" }, expect: "A tiny coffee", pyType: "str", noOutput: true,
        fail: "Pyu used the card as make_coffee(size=\"tiny\") and it didn't work. The card's ingredient must be called size." },
      { type: "output", lines: ["A medium coffee", "A small coffee"] },
    ],
    hints: [
      "Call the ingredient size, and give it the default \"medium\" using =.",
      "The card returns the text. It doesn't print it.",
      "Print the result of the card twice: once with no size, once with \"small\".",
    ],
    successText: "Coffee in every size, medium by default",
  },
  {
    id: "7.5",
    chapter: 7,
    title: "The Missing Jar",
    concept: "Variables inside a function",
    points: 15,
    scene: "wall",
    story: "Pyu's topping card makes a lovely dish, but when he tries to serve it, the jar has disappeared from the kitchen.",
    learn:
      "Jars made **inside** a card live on the card's own small shelf. When the card finishes, they disappear.\nTo keep the answer, catch what the card returns in a jar outside:\n```\nanswer = my_card()\n```",
    goal: "Fix the code so Pyu serves `Serving: pasta with cheese`. The cheese must still be added **by the card**.",
    notes: ["Use Step to go line by line, and watch the card's own shelf."],
    starterCode:
      "def add_toppings(dish):\n    topped = dish + \" with cheese\"\n    return topped\n\nadd_toppings(\"pasta\")\nprint(\"Serving:\", topped)\n",
    customers: [{ name: "Zara", says: "Pasta with cheese, please." }],
    checks: [
      { type: "noError" },
      { type: "defines", fn: "add_toppings" },
      { type: "callCount", fn: "add_toppings", min: 1, fail: "The topping card was never used. The cheese must be added by add_toppings." },
      { type: "output", lines: ["Serving: pasta with cheese"] },
      { type: "funcTest", fn: "add_toppings", args: ["pizza"], expect: "pizza with cheese", pyType: "str" },
    ],
    hints: [
      "The jar topped only exists inside the card, and it's gone when the card finishes.",
      "The card already returns the dish. Something outside needs to catch it.",
      "Store what add_toppings(\"pasta\") gives back in a jar, then print that jar.",
    ],
    successText: "Pasta with cheese served",
  },
  {
    id: "7.6",
    chapter: 7,
    title: "The Full Bill",
    concept: "Putting it together",
    points: 20,
    scene: "wall",
    story: "Time for the real bill card, with every rule the restaurant uses.",
    learn:
      "Inside a card you can use everything you know: maths, if, and return.\nYou can change a jar step by step, then return it at the end.",
    goal: "Make `calculate_bill(price, quantity, is_member)` that **returns** the final bill:\n- The cost is price × quantity.\n- Members get **10% off**.\n- After that, if the cost is **more than 500**, take off another **50**.\n\nPyu will test it on lots of secret orders.",
    starterCode: "# Write your recipe card here\n\n\n\nprint(calculate_bill(100, 3, True))\n",
    customers: [{ name: "Leo" }],
    checks: [
      { type: "noError" },
      { type: "defines", fn: "calculate_bill" },
      ...([
        [100, 3, false], [100, 3, true], [100, 6, false], [100, 6, true],
        [50, 10, true], [100, 5, false], [60, 10, false], [1, 1, true],
      ] as [number, number, boolean][]).map(([p, q, m]): Check => ({
        type: "funcTest", fn: "calculate_bill", args: [p, q, m], expect: fullBill(p, q, m), pyType: "number", noOutput: true,
      })),
      { type: "output", lines: ["270"], mode: "loose" },
    ],
    hints: [
      "Follow the rules in order: cost first, then the member discount, then the big-order discount.",
      "10% off means multiply by 0.9.",
      "\"More than 500\" means a bill of exactly 500 does not get the extra 50 off.",
    ],
    successText: "The full bill card passed every secret order",
  },
];

// ============================================================ CHAPTER 8 — KITCHEN ON FIRE (Debugging)

export const CH8: Level[] = [
  {
    id: "8.1",
    chapter: 8,
    title: "Smudged Recipe",
    concept: "Writing mistakes (SyntaxError)",
    points: 15,
    scene: "fire",
    story: "Soup splashed all over Pyu's recipe, and now Python can't read it. The smoke alarm is beeping!",
    learn:
      "A **SyntaxError** means the code isn't written the way Python expects, like a spelling or grammar mistake.\nCommon causes: a missing quote mark, a missing `:`, a missing bracket, or a line that should be pushed right.",
    goal: "Fix every mistake so the code runs and Pyu prints:\n```\nThe soup is hot\nServe 5 bowls of soup\n```",
    notes: ["Python shows one mistake at a time. Fix it, press Cook again, and read the next one."],
    starterCode:
      "dish = \"soup\ntemperature = 90\nif temperature > 80\nprint(\"The\", dish, \"is hot\")\nservings = (2 + 3\nprint(\"Serve\", servings, \"bowls of\", dish)\n",
    customers: [{ name: "Asha" }],
    checks: [{ type: "compiles" }, { type: "noError" }, { type: "output", lines: ["The soup is hot", "Serve 5 bowls of soup"] }],
    hints: [
      "Read the line number in the red message, and look at that line (sometimes the line before it too).",
      "Text needs a quote mark at both ends. Every ( needs a ).",
      "An if line ends with a colon, and the line under it is pushed 4 spaces right.",
    ],
    successText: "The recipe is readable again",
  },
  {
    id: "8.2",
    chapter: 8,
    title: "Missing Jar",
    concept: "Name mistakes (NameError)",
    points: 15,
    scene: "fire",
    story: "Pyu keeps reaching for jars that aren't on the shelf. Someone's handwriting is terrible!",
    learn:
      "A **NameError** means Python can't find a jar with that name. Usually it's a typo.\nPython is picky: `Sugar` and `sugar` are two different names.",
    goal: "Fix the code so it prints:\n```\nSugar: 3\nFlour: 250\nCups of stuff: 5\n```",
    starterCode:
      "sugar = 3\nflour = 250\nmilk = 2\nprint(\"Sugar:\", sugr)\ntotal_cups = sugar + milk\nprint(\"Flour:\", Flour)\nprint(\"Cups of stuff:\", totl_cups)\n",
    customers: [{ name: "Ravi" }],
    checks: [{ type: "noError" }, { type: "output", lines: ["Sugar: 3", "Flour: 250", "Cups of stuff: 5"] }],
    hints: [
      "Compare the name in the red message with the jar names on the shelf.",
      "Check spelling and capital letters very carefully.",
      "Don't make new jars to match the typos. Fix the typos.",
    ],
    successText: "Every jar found",
  },
  {
    id: "8.3",
    chapter: 8,
    title: "Can't Mix That",
    concept: "Type mistakes (TypeError)",
    points: 15,
    scene: "fire",
    story: "Pyu is mixing things that don't go together, and the pot is sputtering.",
    learn:
      "A **TypeError** means you mixed two kinds of values that don't go together, like adding text and a number with `+`.\nTip: `print(\"Age:\", 12)` with a comma works fine, because print can show both.",
    goal: "Fix the code so it prints:\n```\nPlates: 4\nBill: 200\nNew bill: 220\n```\n`new_bill` must end up as a real number.",
    starterCode:
      "plates = 4\nprice = 50\nbill = plates * price\nprint(\"Plates: \" + plates)\nprint(\"Bill: \" + bill)\nextra = \"20\"\nnew_bill = bill + extra\nprint(\"New bill:\", new_bill)\n",
    customers: [{ name: "Mei" }],
    checks: [
      { type: "noError" },
      { type: "output", lines: ["Plates: 4", "Bill: 200", "New bill: 220"] },
      { type: "var", name: "new_bill", equals: 220, pyType: "number" },
    ],
    hints: [
      "Python won't join text and a number with +.",
      "Use a comma in print instead of +, or change the number to text with str().",
      "extra holds \"20\" in quotes. Should it be text?",
    ],
    successText: "Everything mixes properly now",
  },
  {
    id: "8.4",
    chapter: 8,
    title: "It Runs, But...",
    concept: "Wrong answers (logic mistakes)",
    points: 15,
    scene: "fire",
    story: "No alarms, no smoke, and yet customers are coming back angry about their bills.",
    learn:
      "Sometimes code runs with **no error** but gives the wrong answer. That's a **logic mistake**.\nTo find it, work out the right answer by hand, then use **Step** to watch the jars and see where they go wrong.",
    goal: "This code runs, but the bills are wrong. The rules: one plate costs **40**, and orders of **5 or more** plates get **10 off**. Fix the code so every bill is right. Tickets look like `Bill: 80`.",
    starterCode:
      "price = 40\nplates = int(input())\nbill = price + plates\nif plates > 5:\n    bill = bill - 10\nprint(\"Bill:\", bill)\n",
    customers: (
      [["Asha", "2", 80], ["Ravi", "5", 190], ["Mei", "7", 270], ["Tom", "1", 40, 1], ["Zara", "6", 230, 1]] as [string, string, number, number?][]
    ).map(([name, plates, bill, h]): Customer => ({
      name, hidden: !!h, inputs: [plates], says: `${plates} plate${plates === "1" ? "" : "s"}, please.`,
      expect: [{ type: "output", lines: [`Bill: ${bill}`], fail: `${name} ordered ${plates} plate${plates === "1" ? "" : "s"} but got "{got}".` }],
      failHint: "Work out this customer's bill by hand, then Step through the code and compare.",
    })),
    checks: [{ type: "noError" }],
    hints: [
      "Asha ordered 2 plates at 40 each. What should she pay? What did the code give?",
      "Look at the line that works out the bill. Is + the right sign?",
      "Check the discount rule: should exactly 5 plates get the discount?",
    ],
    successText: "Every bill is right",
  },
  {
    id: "8.5",
    chapter: 8,
    title: "Read the Alarm",
    concept: "Reading error messages",
    points: 15,
    scene: "fire",
    story: "The smoke alarm is showing a message. Good cooks read the alarm before they grab the fire extinguisher.",
    learn:
      "An error message tells you **what** went wrong and **which line** it happened on.\nBut the real cause can be on an earlier line! Follow the values backwards to find where they came from.",
    alarm: "TypeError on line 2: unsupported operand type(s) for /: 'int' and 'str'",
    goal: "The alarm points at **line 2**, inside the recipe card, but the card is fine! Find where the problem really starts and fix it, so each customer gets a ticket like `Each person gets 300.0 grams`. Don't change the recipe card.",
    starterCode:
      "def portion_size(total_grams, people):\n    return total_grams / people\n\nrice_grams = 900\npeople = input()\nsize = portion_size(rice_grams, people)\nprint(\"Each person gets\", size, \"grams\")\n",
    customers: (
      [["Asha", "3", "300.0"], ["Ravi", "4", "225.0"], ["Mei", "6", "150.0"], ["Tom", "8", "112.5", 1]] as [string, string, string, number?][]
    ).map(([name, people, grams, h]): Customer => ({
      name, hidden: !!h, inputs: [people], says: `We are ${people} people.`, expect: out(`Each person gets ${grams} grams`),
    })),
    checks: [
      { type: "noError" },
      { type: "funcTest", fn: "portion_size", args: [900, 3], expect: 300, pyType: "float",
        fail: "The recipe card portion_size has been changed. Leave the card as it was and fix the real cause." },
    ],
    hints: [
      "The alarm says Python tried to divide a number by text. Which one is text?",
      "Follow people backwards. Where did its value come from?",
      "Everything a customer types arrives as text. Fix it where it arrives, not inside the card.",
    ],
    successText: "Alarm read, cause found, fire out",
  },
  {
    id: "8.6",
    chapter: 8,
    title: "Fire Drill",
    concept: "Fix 3 mistakes",
    points: 25,
    scene: "fire",
    timer: 300,
    story: "🔥 The kitchen is on fire! This bill code has three mistakes, and the flames grow every second. Each mistake you fix puts out part of the fire.",
    learn:
      "Fix mistakes one at a time. Press Cook, read the red message, fix that line, and press Cook again.\nYou have 5 minutes. If time runs out, nothing is lost. The timer just starts again.",
    goal: "Fix all **3 mistakes** before time runs out. One plate costs **60**, and each customer says how many plates they want. The ticket is `Bill: 180`, or `Big order! Bill: 300` when the bill is **over 200**.",
    starterCode:
      "def total_cost(price, plates)\n    return price * plates\n\nprice = 60\nplates = input()\nbill = total_cost(price, plate)\nif bill > 200:\n    print(\"Big order! Bill:\", bill)\nelse:\n    print(\"Bill:\", bill)\n",
    customers: (
      [["Asha", "3", "Bill: 180"], ["Ravi", "5", "Big order! Bill: 300"], ["Mei", "1", "Bill: 60"], ["Tom", "4", "Big order! Bill: 240", 1]] as [string, string, string, number?][]
    ).map(([name, plates, line, h]): Customer => ({
      name, hidden: !!h, inputs: [plates], says: `${plates} plate${plates === "1" ? "" : "s"}!`, expect: out(line),
    })),
    checks: [{ type: "noError" }],
    fireStages: [
      { label: "Recipe readable", checks: [{ type: "compiles" }] },
      { label: "Every jar found", checks: [{ type: "compiles" }, { type: "noErrorOfType", error: "NameError" }] },
      { label: "Every bill right", checks: [] },
    ],
    hints: [
      "Start with the first red message Python shows you.",
      "One mistake is a missing symbol, one is a misspelled name, and one is about the customer's answer being text.",
      "If bill > 200 gives a TypeError, check what kind of value bill holds.",
    ],
    successText: "Fire out! All 3 mistakes fixed",
  },
];

// ============================================================ CHAPTER 9 — GRAND OPENING (Final challenge)

const rushLines = (orders: number[]) => {
  const lines = orders.map((p, i) => `Order ${i + 1}: ${p}`);
  lines.push(`Total earned: ${orders.reduce((a, b) => a + b, 0)}`);
  return lines;
};

const MENU2: Record<string, number> = { dosa: 80, noodles: 120, satay: 150 };
const specialLine = (dish: string, plates: number, member: string, allergy: string) => {
  if (dish === "satay" && allergy === "peanuts") return "Sorry, satay contains peanuts";
  let bill = MENU2[dish] * plates;
  if (member === "yes") bill = bill * 0.9;
  if (plates >= 5) bill = bill - 50;
  return `Serving ${plates} x ${dish}. Bill: ${Math.round(bill * 100) / 100}`;
};

const MENU3: Record<string, number> = { dosa: 80, idli: 50, vada: 40, chai: 20 };
const receiptLines = (name: string, dishes: string[], member: string) => {
  const lines = [`Receipt for ${name}`];
  let subtotal = 0;
  for (const d of dishes) {
    if (d in MENU3) { lines.push(`${d}: ${MENU3[d]}`); subtotal += MENU3[d]; }
    else lines.push(`Not on the menu: ${d}`);
  }
  let discount = member === "yes" ? subtotal * 0.1 : 0;
  if (subtotal >= 300) discount += 25;
  const r = (x: number) => Math.round(x * 100) / 100;
  lines.push(`Subtotal: ${subtotal}`, `Discount: ${r(discount)}`, `Total: ${r(subtotal - discount)}`);
  return lines;
};
const criticCustomer = (name: string, dishes: string[], member: string, hidden: boolean): Customer => ({
  name, hidden, inputs: [name, String(dishes.length), ...dishes, member],
  expect: [{ type: "output", lines: receiptLines(name, dishes, member) }],
});

const RUSH_1 = [120, 80, 45, 200, 60, 95, 150, 30, 75, 110, 55, 90, 130, 40, 85, 70, 160, 25, 100, 65];

export const CH9: Level[] = [
  {
    id: "9.1",
    chapter: 9,
    title: "The Rush",
    concept: "Your own solution",
    points: 30,
    scene: "grand",
    runLabel: "Day",
    outputMode: "loose",
    story: "Opening night! Pyu has 20 orders to handle, and the queue outside keeps growing.",
    learn:
      "From now on, nobody tells you which tool to use. Think about the problem first:\n- What happens again and again?\n- What do you need to remember as you go?\n- What happens only once, at the end?",
    goal: "The `orders` jar holds the price of every order tonight (tonight there are 20). Print a numbered ticket for each order, like `Order 1: 120`. After the last ticket, print `Total earned: 1780` with the real total. Tomorrow there will be a different number of orders.",
    starterCode: "# The jar orders is already on the shelf: one price per order.\n\n",
    bindings: [{ object: "tickets", variable: "orders" }],
    customers: [
      { name: "Night 1", globals: { orders: RUSH_1 }, expect: [{ type: "output", lines: rushLines(RUSH_1), mode: "loose" }] },
      { name: "Night 2", globals: { orders: [70, 20, 45, 300, 15, 60, 90] }, expect: [{ type: "output", lines: rushLines([70, 20, 45, 300, 15, 60, 90]), mode: "loose" }] },
      { name: "Night 3", globals: { orders: [500] }, expect: [{ type: "output", lines: rushLines([500]), mode: "loose" }] },
      { name: "Night 4", hidden: true, globals: { orders: [] }, expect: [{ type: "output", lines: rushLines([]), mode: "loose" }] },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Do the first two orders by hand on paper. What did you do each time?",
      "Keep two jars up to date as you go: the order number and the money so far.",
      "The total ticket is printed only once, after every order is done.",
    ],
    successText: "The rush is handled",
  },
  {
    id: "9.2",
    chapter: 9,
    title: "Special Requests",
    concept: "Your own solution",
    points: 30,
    scene: "grand",
    outputMode: "loose",
    story: "Some customers are members, some order a lot, and some are allergic to peanuts. Pyu has to serve every one of them correctly.",
    learn:
      "Break a big problem into small steps. Get one small part working, press Cook, then add the next part.",
    goal: "Each customer tells Pyu four things, in this order: the **dish**, how many **plates**, whether they're a **member** (`yes` or `no`), and their **allergy** (`peanuts` or `none`).\n\nMenu: `dosa` 80 · `noodles` 120 · `satay` 150 (has peanuts)\n\n- If someone allergic to peanuts orders satay, don't serve it. Print `Sorry, satay contains peanuts`.\n- Otherwise the bill is price × plates. Members get 10% off. After that, 5 or more plates get another 50 off.\n- Print `Serving 3 x dosa. Bill: 240` with their own numbers.",
    starterCode: "# Tonight's customers are waiting...\n\n",
    customers: (
      [
        ["Asha", "dosa", 3, "no", "none"], ["Ravi", "noodles", 2, "yes", "none"], ["Mei", "satay", 1, "no", "peanuts"],
        ["Tom", "satay", 5, "yes", "none"], ["Zara", "dosa", 6, "no", "peanuts", 1], ["Leo", "noodles", 5, "no", "none", 1],
        ["Kai", "satay", 2, "yes", "peanuts", 1], ["Ivy", "noodles", 10, "yes", "peanuts", 1],
      ] as [string, string, number, string, string, number?][]
    ).map(([name, dish, plates, member, allergy, h]): Customer => ({
      name, hidden: !!h, inputs: [dish, String(plates), member, allergy],
      expect: [{ type: "output", lines: [specialLine(dish, plates, member, allergy)], mode: "loose" }],
    })),
    checks: [{ type: "noError" }],
    hints: [
      "Step one: collect all four answers into jars.",
      "Step two: decide if this customer can be served at all. Only then work out the bill.",
      "Apply the rules in the order they are written. And remember, typed answers arrive as text.",
    ],
    successText: "Every special request handled",
  },
  {
    id: "9.3",
    chapter: 9,
    title: "Critic Night",
    concept: "Your own solution",
    points: 40,
    scene: "grand",
    outputMode: "loose",
    story: "A famous food critic is secretly visiting tonight. Pyu wants a proper order system: take orders, apply the rules, work out bills and print receipts.",
    learn:
      "This is the biggest challenge. Build it slowly: first print the receipt title, press Cook, then add the dishes, then the subtotal, then the discount.",
    goal: "Each customer tells Pyu: their **name**, **how many dishes** they want, then each **dish** one by one, and finally whether they're a **member** (`yes`/`no`).\n\nMenu: `dosa` 80 · `idli` 50 · `vada` 40 · `chai` 20\n\nPrint a receipt like this:\n```\nReceipt for Asha\ndosa: 80\nchai: 20\nSubtotal: 100\nDiscount: 10\nTotal: 90\n```\n- Each dish gets its own line with its price. A dish that isn't on the menu gets the line `Not on the menu: pizza` and costs nothing.\n- Members get a discount of 10% of the subtotal.\n- If the subtotal is 300 or more, the discount goes up by another 25, for everyone.\n- Total = subtotal minus discount.",
    starterCode: "# Critic night. Every receipt must be perfect.\n\n",
    customers: [
      criticCustomer("Asha", ["dosa", "chai"], "yes", false),
      criticCustomer("Ravi", ["idli", "pizza", "vada"], "no", false),
      criticCustomer("Mei", ["dosa", "dosa", "dosa", "idli"], "no", false),
      criticCustomer("Tom", ["dosa", "dosa", "idli", "vada", "chai"], "yes", true),
      criticCustomer("Zara", [], "yes", true),
      criticCustomer("Leo", ["burger"], "no", true),
      criticCustomer("Kai", ["chai"], "yes", true),
      criticCustomer("Ivy", ["dosa", "dosa", "dosa", "dosa"], "yes", true),
      criticCustomer("Sam", ["vada", "vada", "sushi", "idli", "chai", "chai"], "no", true),
      criticCustomer("Noor", ["idli", "idli", "idli", "idli", "idli", "idli"], "no", true),
      criticCustomer("Ben", ["dosa", "idli", "vada", "chai", "dosa", "idli"], "yes", true),
      criticCustomer("The Critic", ["dosa", "vada", "chai", "tea"], "no", true),
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Start small: ask for the name and print the receipt title. Press Cook. Then add one rule at a time.",
      "Keep a running subtotal jar as you go through the dishes.",
      "A recipe card that gives back the price of one dish can keep your code tidy.",
    ],
    successText: "The critic gave Pyu's Kitchen five stars",
  },
];
