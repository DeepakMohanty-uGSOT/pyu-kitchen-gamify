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
    concept: "Defining and calling",
    points: 15,
    scene: "wall",
    story: "Pyu is tired of rewriting the tea recipe for every customer. He wants to write it once on a recipe card, pin it on the wall, and use it whenever someone orders tea.",
    goal: "Write a recipe card (a function) called `make_tea`. Each time Pyu uses the card, it serves one cup by printing `Here is your tea!`. Then use the card to serve **3** customers.",
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
      "def starts a new recipe card. After def comes the card's name, round brackets, and a colon.",
      "The card's steps are indented underneath it. Writing the card doesn't run it. It only pins it on the wall.",
      "To use a card, write its name followed by (). Do that once for each customer.",
    ],
    successText: "Tea served to 3 customers",
  },
  {
    id: "7.2",
    chapter: 7,
    title: "Any Fruit Juice",
    concept: "Parameters and arguments",
    points: 15,
    scene: "wall",
    story: "Pyu doesn't want a separate card for every fruit. One juice card should work for any fruit.",
    goal: "Write a recipe card `make_juice` that takes **one ingredient: the fruit**. It prints `One mango juice, coming up!` with whatever fruit it's given. Then serve mango, apple and orange juice, in that order.",
    starterCode: "# One card for every kind of juice.\n\n",
    customers: [{ name: "Ravi", says: "Juice for the table!" }],
    checks: [
      { type: "noError" },
      { type: "defines", fn: "make_juice" },
      { type: "output", lines: ["One mango juice, coming up!", "One apple juice, coming up!", "One orange juice, coming up!"] },
      { type: "callCount", fn: "make_juice", min: 3,
        fail: "Pyu printed the juices, but didn't use the make_juice card for all three. Serve every juice with the card." },
      { type: "funcTest", fn: "make_juice", args: ["kiwi"], expectOutput: ["One kiwi juice, coming up!"] },
      { type: "funcTest", fn: "make_juice", args: ["dragon fruit"], expectOutput: ["One dragon fruit juice, coming up!"] },
    ],
    hints: [
      "An ingredient slot (a parameter) goes inside the brackets on the def line, written as a jar name.",
      "Inside the card, use that jar name. Whatever Pyu hands in fills the jar each time.",
      "When you use the card, put the fruit inside the brackets as text.",
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
    story: "Pyu wants a recipe card that works out bills. The card shouldn't shout the answer. It should hand it back so Pyu can use it.",
    goal: "Write a recipe card `calculate_bill` that is given a **price** and a **quantity**, in that order, and **hands back** (returns) the total cost. The card itself must not print anything. Pyu prints the result, and he'll also test the card on secret orders.",
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
      "return hands a value back to whoever used the card. The card finishes as soon as it returns.",
      "print shows something on a ticket, but hands nothing back. Pyu can't use a printed value in a calculation.",
      "The card needs two parameters, in the order price, quantity.",
    ],
    successText: "The bill card passed every secret order",
  },
  {
    id: "7.4",
    chapter: 7,
    title: "Medium by Default",
    concept: "Default parameters",
    points: 15,
    scene: "wall",
    story: "Most customers just say \"a coffee, please\" without a size. Pyu always makes those medium.",
    goal: "Write `make_coffee`, which takes a **size** and returns the text `A large coffee` (with that size). If Pyu uses the card **without** saying a size, it makes a `medium` one. Then print one coffee made without a size, and one small coffee.",
    notes: ["Pyu expects the tickets `A medium coffee` then `A small coffee`."],
    starterCode: "# The coffee card\n\n",
    customers: [{ name: "Tom", says: "A coffee, please. Any size!" }],
    checks: [
      { type: "noError" },
      { type: "defines", fn: "make_coffee" },
      { type: "funcTest", fn: "make_coffee", args: [], expect: "A medium coffee", pyType: "str", noOutput: true },
      { type: "funcTest", fn: "make_coffee", args: ["large"], expect: "A large coffee", pyType: "str", noOutput: true },
      { type: "funcTest", fn: "make_coffee", args: [], kwargs: { size: "tiny" }, expect: "A tiny coffee", pyType: "str", noOutput: true,
        fail: "Pyu used the card as make_coffee(size=\"tiny\") and it didn't work. The card's ingredient slot should be called size." },
      { type: "output", lines: ["A medium coffee", "A small coffee"] },
    ],
    hints: [
      "A parameter can have a default value, which is used when nothing is passed in.",
      "You set a default inside the def brackets by putting = after the parameter's name.",
      "This card returns text instead of printing it. The printing happens where you use the card.",
    ],
    successText: "Coffee in every size, medium by default",
  },
  {
    id: "7.5",
    chapter: 7,
    title: "The Missing Jar",
    concept: "Basic scope",
    points: 15,
    scene: "wall",
    story: "Pyu's topping card makes a lovely dish, but when he goes to serve it, the jar has vanished from the kitchen.",
    goal: "Fix the recipe so Pyu serves `Serving: pasta with cheese`. The topping must still be added **by the card**.",
    notes: ["Step through it and watch the card's own little shelf."],
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
      "Jars made inside a recipe card live on the card's own little shelf, and they disappear when the card finishes.",
      "Step through and watch: where does the topped jar go after the card returns?",
      "The card already hands its dish back. The main kitchen needs to catch what's handed back in a jar of its own.",
    ],
    successText: "Pasta with cheese served",
  },
  {
    id: "7.6",
    chapter: 7,
    title: "The Full Bill",
    concept: "Combining functions, conditions and operators",
    points: 20,
    scene: "wall",
    story: "It's time for the real billing card, with every rule the restaurant uses.",
    goal: "Write `calculate_bill(price, quantity, is_member)` that **returns** the final bill:\n- The cost is price × quantity.\n- Members get **10% off**.\n- After that, if the cost is **more than 500**, take off another **50**.\n\nPyu will test it on lots of secret orders.",
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
      "Follow the rules in the order they're written: cost first, then the member discount, then the big-order discount.",
      "Inside the card you can update a jar step by step before returning it.",
      "\"More than 500\" means a bill of exactly 500 doesn't get the extra 50 off.",
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
    concept: "SyntaxError",
    points: 15,
    scene: "fire",
    story: "Soup splashed all over Pyu's recipe card. Now Python can't read it, and the smoke alarm is beeping.",
    goal: "Fix every smudge so the recipe runs and Pyu prints:\n```\nThe soup is hot\nServe 5 bowls of soup\n```",
    notes: ["Python reports one smudge at a time. Fix it, cook again, and read the next one."],
    starterCode:
      "dish = \"soup\ntemperature = 90\nif temperature > 80\nprint(\"The\", dish, \"is hot\")\nservings = (2 + 3\nprint(\"Serve\", servings, \"bowls of\", dish)\n",
    customers: [{ name: "Asha" }],
    checks: [{ type: "compiles" }, { type: "noError" }, { type: "output", lines: ["The soup is hot", "Serve 5 bowls of soup"] }],
    hints: [
      "Read the line number in the alarm and look closely at that line, and sometimes at the line just before it.",
      "Text needs a quote mark at both ends, and every opening bracket needs a closing one.",
      "An if line must end with a colon, and the step under it must be indented.",
    ],
    successText: "The recipe is readable again",
  },
  {
    id: "8.2",
    chapter: 8,
    title: "Missing Jar",
    concept: "NameError",
    points: 15,
    scene: "fire",
    story: "Pyu keeps reaching for jars that aren't on the shelf. Someone's handwriting is terrible.",
    goal: "Fix the recipe so it prints:\n```\nSugar: 3\nFlour: 250\nCups of stuff: 5\n```",
    starterCode:
      "sugar = 3\nflour = 250\nmilk = 2\nprint(\"Sugar:\", sugr)\ntotal_cups = sugar + milk\nprint(\"Flour:\", Flour)\nprint(\"Cups of stuff:\", totl_cups)\n",
    customers: [{ name: "Ravi" }],
    checks: [{ type: "noError" }, { type: "output", lines: ["Sugar: 3", "Flour: 250", "Cups of stuff: 5"] }],
    hints: [
      "A NameError means Pyu looked for a label that isn't on the shelf. Compare the name in the alarm with the jars on the shelf.",
      "Python is picky about spelling and capital letters. Flour and flour are two different labels.",
      "Don't make new jars to match the typos. Fix the typos.",
    ],
    successText: "Every jar found",
  },
  {
    id: "8.3",
    chapter: 8,
    title: "Can't Mix That",
    concept: "TypeError",
    points: 15,
    scene: "fire",
    story: "Pyu is trying to mix things that simply don't go together, and the pot is sputtering.",
    goal: "Fix the recipe so it prints:\n```\nPlates: 4\nBill: 200\nNew bill: 220\n```\n`new_bill` must end up as a real number.",
    starterCode:
      "plates = 4\nprice = 50\nbill = plates * price\nprint(\"Plates: \" + plates)\nprint(\"Bill: \" + bill)\nextra = \"20\"\nnew_bill = bill + extra\nprint(\"New bill:\", new_bill)\n",
    customers: [{ name: "Mei" }],
    checks: [
      { type: "noError" },
      { type: "output", lines: ["Plates: 4", "Bill: 200", "New bill: 220"] },
      { type: "var", name: "new_bill", equals: 220, pyType: "number" },
    ],
    hints: [
      "A TypeError here means Python was asked to join text and a number with +.",
      "You can turn a number into text with str(), or let print separate things with commas.",
      "extra holds \"20\" in quotes. Should it really be text?",
    ],
    successText: "Everything mixes properly now",
  },
  {
    id: "8.4",
    chapter: 8,
    title: "It Runs, But...",
    concept: "Logical errors",
    points: 15,
    scene: "fire",
    story: "No alarms, no smoke, and yet customers are storming back to the counter waving their bills.",
    goal: "This recipe runs without any alarm, but the bills are wrong. The rules: a plate costs **40**, and orders of **5 or more** plates get **10 off**. Fix the recipe so every customer's bill is right. Tickets look like `Bill: 80`.",
    starterCode:
      "price = 40\nplates = int(input())\nbill = price + plates\nif plates > 5:\n    bill = bill - 10\nprint(\"Bill:\", bill)\n",
    customers: (
      [["Asha", "2", 80], ["Ravi", "5", 190], ["Mei", "7", 270], ["Tom", "1", 40, 1], ["Zara", "6", 230, 1]] as [string, string, number, number?][]
    ).map(([name, plates, bill, h]): Customer => ({
      name, hidden: !!h, inputs: [plates], says: `${plates} plate${plates === "1" ? "" : "s"}, please.`,
      expect: [{ type: "output", lines: [`Bill: ${bill}`], fail: `${name} ordered ${plates} plate${plates === "1" ? "" : "s"} but got "{got}".` }],
      failHint: "Work the bill out by hand for this customer, then step through the recipe and compare.",
    })),
    checks: [{ type: "noError" }],
    hints: [
      "No error doesn't mean no bug. Work out Asha's bill by hand, then Step through and watch the bill jar.",
      "Look at how price and plates are combined. Is that how a bill works?",
      "Check the discount rule carefully. Does it include exactly 5 plates?",
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
    story: "The smoke alarm is showing a message. Real cooks read the alarm before grabbing the fire extinguisher.",
    alarm: "TypeError on line 2: unsupported operand type(s) for /: 'int' and 'str'",
    goal: "The alarm points at **line 2**, inside the recipe card, but the card itself is fine! Find where the problem really starts and fix it, so each customer gets a ticket like `Each person gets 300.0 grams`. Don't change the recipe card.",
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
        fail: "The recipe card portion_size has changed. Leave the card as it was and fix the real cause." },
    ],
    hints: [
      "The alarm says Python tried to divide a number by text. Which of the two values is text?",
      "Follow people backwards. Where did its value come from?",
      "Everything a customer says arrives as text. Fix it where it arrives, not inside the card.",
    ],
    successText: "Alarm read, cause found, fire out",
  },
  {
    id: "8.6",
    chapter: 8,
    title: "Fire Drill",
    concept: "Everything",
    points: 25,
    scene: "fire",
    timer: 300,
    story: "🔥 The kitchen is on fire! This billing recipe has three bugs, and the flames get bigger every second. Each bug you fix puts out part of the fire.",
    goal: "Fix all **3 bugs** before the timer runs out. A plate costs **60**. Each customer says how many plates they want. The ticket is `Bill: 180`, or `Big order! Bill: 300` when the bill is **over 200**.",
    notes: ["Running out of time doesn't lose anything. The timer just starts again."],
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
      "Fix the alarms one at a time, starting with the first one Python shows you.",
      "One bug stops Python reading the recipe at all, one is a missing jar, and one is about what kind of thing the customer's answer is.",
      "If bill > 200 sets off a TypeError, look at what kind of value bill is holding.",
    ],
    successText: "Fire out! All 3 bugs fixed",
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
    concept: "Open problem",
    points: 30,
    scene: "grand",
    runLabel: "Day",
    outputMode: "loose",
    story: "Opening night! Pyu has 20 orders to process, and the queue outside is still growing.",
    goal: "The `orders` jar holds the price of every order tonight. Pyu needs a numbered ticket for every order, like `Order 1: 120`, and after the last ticket, one more that says `Total earned: 1780` with the real total. Tomorrow's rush will be a different size.",
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
      "Solve it by hand for the first two orders, then look at what you did each time.",
      "You need to keep two things up to date as you go: which order number you're on, and the money earned so far.",
      "The total ticket happens only once, after every order is done.",
    ],
    successText: "The rush is handled",
  },
  {
    id: "9.2",
    chapter: 9,
    title: "Special Requests",
    concept: "Open problem",
    points: 30,
    scene: "grand",
    outputMode: "loose",
    story: "Some customers are members, some order in bulk, and some are allergic to peanuts. Pyu has to serve every one of them correctly.",
    goal: "Each customer tells Pyu four things, in this order: the **dish**, how many **plates**, whether they're a **member** (`yes` or `no`), and their **allergy** (`peanuts` or `none`).\n\nMenu: `dosa` 80 · `noodles` 120 · `satay` 150 (contains peanuts)\n\n- A customer allergic to peanuts who orders satay can't be served. Print `Sorry, satay contains peanuts`.\n- Otherwise the bill is price × plates. Members get 10% off. After that, orders of 5 or more plates get another 50 off.\n- Print `Serving 3 x dosa. Bill: 240` with their own numbers.",
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
      "Take it one step at a time: first collect all four answers.",
      "Decide first whether this customer can be served at all. Only then work out the bill.",
      "Apply the rules in the order they're written, and remember that everything a customer says arrives as text.",
    ],
    successText: "Every special request handled",
  },
  {
    id: "9.3",
    chapter: 9,
    title: "Critic Night",
    concept: "Open problem",
    points: 40,
    scene: "grand",
    outputMode: "loose",
    story: "A famous food critic is visiting tonight, hidden somewhere among the customers. Pyu wants a proper order system: take the orders, apply the rules, work out the bills and print receipts.",
    goal: "Each customer tells Pyu their **name**, **how many dishes** they want, then each **dish** one at a time, and finally whether they're a **member** (`yes`/`no`).\n\nMenu: `dosa` 80 · `idli` 50 · `vada` 40 · `chai` 20\n\nPrint a receipt like this:\n```\nReceipt for Asha\ndosa: 80\nchai: 20\nSubtotal: 100\nDiscount: 10\nTotal: 90\n```\n- Each dish gets its own line with its price. A dish that isn't on the menu gets the line `Not on the menu: pizza` and costs nothing.\n- Members get a discount of 10% of the subtotal.\n- If the subtotal is 300 or more, the discount goes up by another 25, for members and non-members alike.\n- The total is the subtotal minus the discount.",
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
      "Big problems are just small ones stacked up. Get the name and the receipt title working first, then add one rule at a time.",
      "You'll need to keep a running subtotal as you go through the dishes.",
      "A recipe card that gives the price of a single dish can keep the rest of your recipe tidy.",
    ],
    successText: "The critic gave Pyu's Kitchen five stars",
  },
];
