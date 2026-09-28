import type { Check, Customer, Level } from "../types";

const out = (...lines: string[]): Check[] => [{ type: "output", lines }];

// ============================================================ CHAPTER 4 — THE FRONT COUNTER (Input & Output)

export const CH4: Level[] = [
  {
    id: "4.1",
    chapter: 4,
    title: "First Service",
    concept: "print()",
    points: 20,
    scene: "counter",
    story: "The front counter opens for the first time. Asha is first in line. Pyu wants to greet everyone and announce today's special on the ticket printer.",
    learn:
      "`print(...)` shows something on the screen. In Pyu's kitchen, each print becomes a ticket.\nFor example, `print(\"Good morning!\")` prints one ticket.\nIf your text has an apostrophe ('), put double quotes around it: `print(\"It's hot\")`.",
    goal: "Print these two tickets exactly, in this order:\n```\nWelcome to Pyu's Kitchen!\nDish of the day: Masala Dosa\n```",
    starterCode: "# Pyu's first service of the day.\n\n",
    customers: [{ name: "Asha", says: "What's cooking today?" }],
    checks: [{ type: "noError" }, { type: "output", lines: ["Welcome to Pyu's Kitchen!", "Dish of the day: Masala Dosa"] }],
    hints: [
      "Each print makes one ticket, so you need two print lines.",
      "The words go inside quote marks, inside the brackets of print.",
      "The first line has an apostrophe, so use double quotes \" \" around it. Check capitals and spaces too.",
    ],
    successText: "The counter is open for business",
  },
  {
    id: "4.2",
    chapter: 4,
    title: "Take the Order",
    concept: "input()",
    points: 25,
    scene: "counter",
    story: "Customers are arriving! Each one tells Pyu their name, and Pyu likes to greet every customer personally.",
    learn:
      "`input()` waits for someone to type an answer, then gives it back to you.\nStore the answer in a jar: `city = input(\"Where are you from? \")`.\nThe words inside `input(...)` are the question Pyu asks.",
    goal: "Each customer tells Pyu their name. Greet them with a ticket in exactly this form, using their own name:\n```\nWelcome, Asha!\n```",
    notes: [
      "Several customers will come, each with a different name, so your code must work for all of them.",
      "The question inside input( ) is spoken by Pyu. It is not a ticket.",
    ],
    starterCode: "# A customer walks up to the counter...\n\n",
    customers: [
      { name: "Asha", inputs: ["Asha"], expect: out("Welcome, Asha!") },
      { name: "Ravi", inputs: ["Ravi"], expect: out("Welcome, Ravi!") },
      { name: "Mei", inputs: ["Mei"], expect: out("Welcome, Mei!") },
      { name: "Jo", inputs: ["Jo"], hidden: true, expect: out("Welcome, Jo!") },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "First ask for the name with input() and store it in a jar.",
      "Then print the greeting using that jar.",
      "Check the spaces and punctuation: a comma after Welcome, one space, the name, and ! right after it.",
    ],
    successText: "Every customer greeted by name",
  },
  {
    id: "4.3",
    chapter: 4,
    title: "Proper Tickets",
    concept: "f-strings",
    points: 25,
    scene: "counter",
    story: "The kitchen staff can't read Pyu's messy notes. He needs neat, tidy order tickets.",
    learn:
      "An **f-string** lets you put jars inside text. Put `f` before the quotes and the jar's name inside `{ }`.\nFor example, if `pet = \"cat\"`, then `print(f\"I have a {pet}\")` prints `I have a cat`.",
    goal: "Each customer tells Pyu three things, in this order: their **name**, how many **plates**, and the **dish**. Print their ticket in exactly this form:\n```\nOrder for Asha: 2 x Dosa\n```",
    starterCode: "# Take the order, then print a neat ticket.\n\n",
    customers: [
      { name: "Asha", inputs: ["Asha", "2", "Dosa"], expect: out("Order for Asha: 2 x Dosa") },
      { name: "Ravi", inputs: ["Ravi", "1", "Idli"], expect: out("Order for Ravi: 1 x Idli") },
      { name: "Mei", inputs: ["Mei", "3", "Vada"], expect: out("Order for Mei: 3 x Vada") },
      { name: "Leo", inputs: ["Leo", "12", "Masala Dosa"], hidden: true, expect: out("Order for Leo: 12 x Masala Dosa") },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "You need three input() lines, one for each answer, in the order the customer gives them.",
      "Then one print with an f-string that uses all three jars.",
      "Check every character: the colon after the name, and a space on both sides of the x.",
    ],
    successText: "Neat tickets for every order",
  },
  {
    id: "4.4",
    chapter: 4,
    title: "How Many Plates?",
    concept: "Turning answers into numbers",
    points: 30,
    scene: "counter",
    story: "Dosa is selling fast! Each customer says how many plates they want, and Pyu prints their bill.",
    learn:
      "Whatever someone types into `input()` comes back as **text**, even if it looks like a number.\nTo do maths with it, change it into a number first: `age = int(input())`.",
    goal: "One plate of dosa costs **80**. Each customer says how many plates they want. Print their bill in exactly this form:\n```\nBill: 240\n```",
    starterCode: "price = 80\n\n# A customer is at the counter...\n\n",
    bindings: [
      { object: "plates", variable: "plates" },
      { object: "receipt", variable: "bill" },
    ],
    customers: [
      { name: "Asha", inputs: ["3"], says: "3 plates, please!", expect: [{ type: "output", lines: ["Bill: 240"], fail: "Asha ordered 3 plates, but Pyu printed \"{got}\"." }],
        failHint: "Check how you're using the number she gave you." },
      { name: "Ravi", inputs: ["4"], says: "4 plates for my family.", expect: [{ type: "output", lines: ["Bill: 320"], fail: "Ravi ordered 4 plates, but Pyu printed \"{got}\"." }],
        failHint: "Check how you're using the number he gave you." },
      { name: "Mei", inputs: ["1"], says: "Just 1, thanks.", expect: [{ type: "output", lines: ["Bill: 80"], fail: "Mei ordered 1 plate, but Pyu printed \"{got}\"." }],
        failHint: "Check how you're using the number she gave you." },
      { name: "Tom", inputs: ["10"], hidden: true, expect: [{ type: "output", lines: ["Bill: 800"], fail: "Tom ordered 10 plates, but Pyu printed \"{got}\"." }],
        failHint: "Check how you're using the number he gave you." },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "The customer's answer arrives as text, like \"3\", not the number 3.",
      "If you multiply the text \"3\" by 80, Python repeats \"3\" 80 times! Try it and see.",
      "Change the answer into a whole number before you multiply.",
    ],
    successText: "Correct bills for 4 customers",
  },
];

// ============================================================ CHAPTER 5 — THE TASTING STATION (Conditions)

const spiceWord = (s: number) => (s <= 3 ? "mild" : s <= 6 ? "medium" : s <= 9 ? "hot" : "dangerous");
const spiceCustomer = (name: string, spice: number, hidden = false): Customer => ({
  name, hidden, globals: { spice },
  expect: [
    { type: "var", name: "label", equals: spiceWord(spice), pyType: "str" },
    { type: "output", lines: [`Spice label: ${spiceWord(spice)}`] },
  ],
});

const discountTotal = (price: number, q: number, m: boolean) => {
  const t = price * q;
  if (m && q >= 5) return t * 0.8;
  if (m || q >= 10) return t * 0.9;
  return t;
};
const discountCustomer = (name: string, price: number, quantity: number, is_member: boolean, hidden = false): Customer => ({
  name, hidden, globals: { price, quantity, is_member },
  expect: [
    { type: "var", name: "total", equals: discountTotal(price, quantity, is_member), pyType: "number" },
    { type: "output", lines: [`Total: ${discountTotal(price, quantity, is_member)}`], mode: "loose" },
  ],
});

const allergyLine = (dish: string, allergy: string) =>
  dish === "satay" ? (allergy === "peanuts" ? "Sorry, satay has peanuts" : "Serving satay") : `Serving ${dish}`;

export const CH5: Level[] = [
  {
    id: "5.1",
    chapter: 5,
    title: "Too Salty?",
    concept: "if",
    points: 20,
    scene: "tasting",
    story: "Pyu tastes every bowl before it leaves the kitchen. Some soups come out too salty.",
    learn:
      "`if` runs some lines **only when** something is True.\nEnd the if line with `:` and push the lines under it 4 spaces to the right (press Tab):\n```\nif rain > 5:\n    print(\"Take an umbrella\")\n```",
    goal: "Taste each soup. **If** `salt` is more than **5**, add **2** cups to `water` and print `Added water`. If the soup isn't too salty, change nothing and print nothing.",
    starterCode: "# Jars already on the shelf: salt (spoons) and water (cups).\n# Every customer's soup is different.\n\n",
    bindings: [
      { object: "saltMeter", variable: "salt" },
      { object: "waterPot", variable: "water" },
    ],
    customers: [
      { name: "Asha", globals: { salt: 7, water: 3 }, expect: [{ type: "var", name: "water", equals: 5, pyType: "int" }, ...out("Added water")] },
      { name: "Ravi", globals: { salt: 4, water: 3 }, expect: [{ type: "var", name: "water", equals: 3, pyType: "int" }, { type: "output", lines: [], fail: "Ravi's soup wasn't too salty, but Pyu printed \"{got}\"." }] },
      { name: "Mei", globals: { salt: 5, water: 1 }, expect: [{ type: "var", name: "water", equals: 1, pyType: "int" }, { type: "output", lines: [], fail: "Mei's soup has exactly 5 salt, which is not more than 5, but Pyu printed \"{got}\"." }] },
      { name: "Tom", hidden: true, globals: { salt: 9, water: 0 }, expect: [{ type: "var", name: "water", equals: 2, pyType: "int" }, ...out("Added water")] },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Start with if, then the question about salt, then a colon.",
      "Both the water step and the print go underneath the if, pushed 4 spaces to the right.",
      "\"More than 5\" means a soup with exactly 5 salt is fine.",
    ],
    successText: "Every soup tasted and fixed",
  },
  {
    id: "5.2",
    chapter: 5,
    title: "Taste Test",
    concept: "if / else",
    points: 20,
    scene: "tasting",
    story: "Now every bowl gets a decision: either it gets fixed, or it gets served.",
    learn:
      "`else` gives a second path for when the if question is False:\n```\nif hungry:\n    print(\"Eat\")\nelse:\n    print(\"Wait\")\n```\n`else:` lines up with `if`, not with the lines inside it.",
    goal: "**If** `salt` is more than **5**: add **2** cups to `water` and print `Too salty! Adding water`.\n**Otherwise**: print `Tasty! Serving soup`.",
    starterCode: "# Jars already on the shelf: salt and water.\n\n",
    bindings: [
      { object: "saltMeter", variable: "salt" },
      { object: "waterPot", variable: "water" },
    ],
    customers: [
      { name: "Asha", globals: { salt: 8, water: 2 }, expect: [{ type: "var", name: "water", equals: 4, pyType: "int" }, ...out("Too salty! Adding water")] },
      { name: "Ravi", globals: { salt: 3, water: 2 }, expect: [{ type: "var", name: "water", equals: 2, pyType: "int" }, ...out("Tasty! Serving soup")] },
      { name: "Mei", globals: { salt: 5, water: 4 }, expect: [{ type: "var", name: "water", equals: 4, pyType: "int" }, ...out("Tasty! Serving soup")] },
      { name: "Tom", globals: { salt: 6, water: 0 }, expect: [{ type: "var", name: "water", equals: 2, pyType: "int" }, ...out("Too salty! Adding water")] },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "There are two paths: one for too salty, and one for everything else.",
      "else: sits at the same distance from the left edge as if.",
      "Only the too-salty path changes the water.",
    ],
    successText: "Every bowl tasted: fixed or served",
  },
  {
    id: "5.3",
    chapter: 5,
    title: "Spice Levels",
    concept: "if / elif / else",
    points: 20,
    scene: "tasting",
    story: "Customers keep getting surprised by the curry. Pyu wants every dish labelled with how spicy it is.",
    learn:
      "`elif` (short for \"else if\") lets you ask more questions in a row. Python checks from the top and stops at the first True one:\n```\nif marks >= 90:\n    grade = \"A\"\nelif marks >= 60:\n    grade = \"B\"\nelse:\n    grade = \"C\"\n```",
    goal: "Label each dish by its `spice` number:\n- 0 to 3 → `mild`\n- 4 to 6 → `medium`\n- 7 to 9 → `hot`\n- 10 or more → `dangerous`\n\nPut the word in a jar called `label`, then print it like `Spice label: medium`.",
    starterCode: "# The jar spice is already on the shelf.\n\n",
    bindings: [
      { object: "chilli", variable: "spice" },
      { object: "dish", variable: "label", label: "label" },
    ],
    customers: [
      spiceCustomer("Asha", 2), spiceCustomer("Ravi", 5), spiceCustomer("Mei", 8), spiceCustomer("Tom", 10),
      spiceCustomer("Zara", 3, true), spiceCustomer("Leo", 4, true), spiceCustomer("Kai", 6, true),
      spiceCustomer("Ivy", 7, true), spiceCustomer("Sam", 9, true), spiceCustomer("Noor", 15, true), spiceCustomer("Ben", 0, true),
    ],
    checks: [{ type: "noError" }],
    hints: [
      "There are four labels, and each dish gets exactly one.",
      "Check from smallest to biggest: first ask about mild, then medium, then hot.",
      "The last case (dangerous) needs no question. Use else.",
    ],
    successText: "Every dish labelled by spice",
  },
  {
    id: "5.4",
    chapter: 5,
    title: "Member Discount",
    concept: "Combining rules",
    points: 20,
    scene: "tasting",
    story: "Pyu's Kitchen has a members' club, and big orders get a discount too. The discount rules are strict.",
    learn:
      "You can join questions with `and` / `or` inside an if:\n```\nif age >= 18 and has_ticket:\n    print(\"Come in\")\n```\nTo take 10% off a price, multiply it by `0.9`.",
    goal: "Work out each customer's bill in a jar called `total`. The jars `price`, `quantity` and `is_member` are already on the shelf.\n- Start with price × quantity.\n- If the customer is a member **and** buys 5 or more, take **20%** off.\n- Otherwise, if they are a member **or** buy 10 or more, take **10%** off.\n- Otherwise, no discount.\n\nThen print it like `Total: 400`.",
    starterCode: "# Jars already on the shelf: price, quantity, is_member\n\n",
    bindings: [{ object: "receipt", variable: "total" }],
    customers: [
      discountCustomer("Asha", 100, 5, true), discountCustomer("Ravi", 100, 2, true),
      discountCustomer("Mei", 50, 12, false), discountCustomer("Tom", 50, 3, false),
      discountCustomer("Zara", 20, 10, true, true), discountCustomer("Leo", 30, 4, false, true),
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Work out the full price first. Then decide which discount applies.",
      "20% off means the customer pays 80% of the price, so multiply by 0.8.",
      "Check the member-and-5-or-more rule first, then use elif for the 10% rule.",
    ],
    successText: "Every discount applied correctly",
  },
  {
    id: "5.5",
    chapter: 5,
    title: "Allergy Check",
    concept: "An if inside an if",
    points: 20,
    scene: "tasting",
    story: "Satay is made with peanuts. Pyu must never serve it to someone who is allergic to peanuts.",
    learn:
      "You can put an if inside another if. Just push it 4 more spaces to the right:\n```\nif weather == \"rain\":\n    if has_umbrella:\n        print(\"Walk\")\n```\nTo check if text matches, use `==`.",
    goal: "The jars `dish` and `allergy` are on the shelf. Satay contains peanuts.\n- If the dish is `satay`: if the allergy is `peanuts`, print `Sorry, satay has peanuts`, otherwise print `Serving satay`.\n- For any other dish, print `Serving ` followed by the dish name.",
    starterCode: "# Jars already on the shelf: dish and allergy.\n\n",
    bindings: [
      { object: "allergyBoard", variable: "allergy" },
      { object: "dish", variable: "dish", label: "dish" },
    ],
    customers: (
      [["Asha", "satay", "peanuts"], ["Ravi", "satay", "none"], ["Mei", "noodles", "peanuts"], ["Tom", "curry", "none"],
       ["Zara", "satay", "dairy", 1], ["Leo", "dosa", "dairy", 1]] as [string, string, string, number?][]
    ).map(([name, dish, allergy, h]) => ({ name, hidden: !!h, globals: { dish, allergy }, expect: out(allergyLine(dish, allergy)) })),
    checks: [{ type: "noError" }],
    hints: [
      "First ask about the dish. Only if it's satay do you need to ask about the allergy.",
      "The allergy question goes inside the satay question, pushed further right.",
      "Words need quotes when you compare them: \"satay\", \"peanuts\".",
    ],
    successText: "Everyone served safely",
  },
];

// ============================================================ CHAPTER 6 — THE STOVE LINE (Loops)

const trayLines = (rows: number, spots: number) => {
  const lines: string[] = [];
  for (let r = 1; r <= rows; r++) for (let s = 1; s <= spots; s++) lines.push(`Cookie at row ${r}, spot ${s}`);
  return lines;
};

const butterLines = (fridge: string[]) => {
  const lines: string[] = [];
  for (const item of fridge) {
    lines.push(`Checking ${item}`);
    if (item === "butter") { lines.push("Found the butter!"); break; }
  }
  return lines;
};

const packLines = (cookies: string[]) => {
  const good = cookies.filter((c) => c !== "burnt");
  return [...good.map((c) => `Packed a ${c} cookie`), `Packed ${good.length} cookies`];
};

const boilTo = (t: number) => { while (t < 100) t += 20; return t; };

export const CH6: Level[] = [
  {
    id: "6.1",
    chapter: 6,
    title: "Tired Arm",
    concept: "for loop + range()",
    points: 15,
    scene: "stove",
    runLabel: "Day",
    story: "Pyu's arm hurts. His soup code has the same stir line written ten times, and reading it over and over is tiring.",
    learn:
      "A **for loop** repeats the lines under it. `range(3)` means \"3 times\":\n```\nfor i in range(3):\n    print(\"Hi\")\n```\nThis prints Hi three times. The repeated lines are pushed 4 spaces to the right.",
    goal: "Change the code so the soup is still stirred **10 separate times** (each stir adds 1 to `stirs`) and Pyu still prints `Stirred 10 times`. The whole code must be **4 lines or fewer**.",
    notes: ["Empty lines and # comments don't count."],
    starterCode: "stirs = 0\n" + "stirs = stirs + 1\n".repeat(10) + "print(\"Stirred\", stirs, \"times\")\n",
    bindings: [{ object: "pot", variable: "stirs" }],
    customers: [{ name: "Day 1" }],
    checks: [
      { type: "noError" },
      { type: "var", name: "stirs", equals: 10, pyType: "int" },
      { type: "varSequence", name: "stirs", values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        fail: "Pyu watched the stirs jar go {got}. It should go up one stir at a time, from 0 to 10. Pyu has to really stir, not just write the final number." },
      { type: "output", lines: ["Stirred 10 times"] },
      { type: "maxLines", n: 4 },
    ],
    hints: [
      "The same line is repeated 10 times. A loop can do that for you.",
      "Keep the first line (stirs = 0) and the last line (the print).",
      "Replace the ten stir lines with two lines: a for loop line, and one stir line under it.",
    ],
    successText: "Stirred 10 times with only 4 lines",
  },
  {
    id: "6.2",
    chapter: 6,
    title: "Plate Every Dish",
    concept: "Looping through a list",
    points: 15,
    scene: "stove",
    runLabel: "Day",
    story: "The order board is full. Each order needs its own ticket, and the number of orders changes every day.",
    learn:
      "A for loop can go through a list one item at a time. You choose a name for the current item:\n```\nfor fruit in [\"apple\", \"kiwi\"]:\n    print(fruit)\n```\nThis prints apple, then kiwi.",
    goal: "The `orders` jar holds today's list of dishes. Print one ticket for **each** order, in the same order as the list, like `Ticket: dosa`. After all the tickets, print `All plated!`",
    starterCode: "# The jar orders is already on the shelf, e.g. [\"dosa\", \"idli\"]\n\n",
    bindings: [{ object: "tickets", variable: "orders" }],
    customers: (
      [["dosa", "idli", "vada"], ["chai"], ["soup", "rice", "curry", "naan", "salad"], []] as string[][]
    ).map((orders, i) => ({
      name: `Day ${i + 1}`, hidden: i === 3, globals: { orders },
      expect: out(...orders.map((o) => `Ticket: ${o}`), "All plated!"),
    })),
    checks: [{ type: "noError" }],
    hints: [
      "Loop through the orders list and print a ticket inside the loop.",
      "Use the name you chose for the current item in the ticket.",
      "All plated! happens only once, after the loop, so don't push it to the right.",
    ],
    successText: "Every dish plated, every day",
  },
  {
    id: "6.3",
    chapter: 6,
    title: "Bring to a Boil",
    concept: "while loop",
    points: 20,
    scene: "stove",
    runLabel: "Day",
    story: "The soup is cold. Pyu must keep heating it until it boils, but it starts at a different temperature every day.",
    learn:
      "A **while loop** keeps repeating **as long as** something is True:\n```\nwhile water < 10:\n    water = water + 1\n```\nMake sure something changes inside the loop, or it will never stop!",
    goal: "Each heating step adds **20** degrees to `temperature`. Keep heating until the soup is **100 or more**, then stop. If it's already 100 or more, don't heat it at all.",
    starterCode: "# The soup's starting temperature is already in the jar temperature.\n# It's different every day.\n\n# heat the soup until it boils\n\nprint(\"Soup is ready at\", temperature)\n",
    bindings: [{ object: "thermometer", variable: "temperature" }],
    customers: [20, 35, 90, 100, 5].map((t, i) => ({
      name: `Day ${i + 1}`, hidden: i === 4, globals: { temperature: t },
      expect: [
        { type: "var" as const, name: "temperature", op: ">=" as const, value: 100,
          fail: "On {run} the soup never boiled. It only reached {got}. Is your loop running long enough?" },
        { type: "var" as const, name: "temperature", equals: boilTo(t), pyType: "int" as const,
          fail: "On {run} the soup boiled over! It reached {got}. Pyu should stop heating as soon as it reaches 100 or more." },
        ...out(`Soup is ready at ${boilTo(t)}`),
      ],
    })),
    checks: [{ type: "noError" }],
    hints: [
      "You don't know how many times to heat it, because it changes every day.",
      "A while loop repeats as long as its question is True. What should the question be?",
      "Keep heating while the temperature is below 100.",
    ],
    successText: "Soup boiled perfectly every day",
  },
  {
    id: "6.4",
    chapter: 6,
    title: "Cookie Tray",
    concept: "A loop inside a loop",
    points: 20,
    scene: "stove",
    runLabel: "Day",
    story: "Pyu's cookie trays come in different sizes. Every spot on the tray needs exactly one cookie.",
    learn:
      "A loop can go inside another loop. For each round of the outer loop, the inner loop runs all the way:\n```\nfor day in range(1, 3):\n    for meal in range(1, 4):\n        print(day, meal)\n```\n`range(1, 4)` counts 1, 2, 3.",
    goal: "The tray has `rows` rows, and each row has `spots` places (the size changes every day). Put a cookie in **every** place by printing one ticket per place. Go row by row, left to right, counting from 1:\n```\nCookie at row 1, spot 1\nCookie at row 1, spot 2\n...\n```\n…all the way to the last spot of the last row.",
    starterCode: "# Jars already on the shelf: rows and spots (the size of today's tray)\n\n",
    bindings: [{ object: "tray", variable: "rows", extra: "spots" }],
    customers: ([[3, 4], [2, 5], [1, 3], [4, 2]] as [number, number][]).map(([rows, spots], i) => ({
      name: `Day ${i + 1}`, hidden: i === 3, globals: { rows, spots }, expect: out(...trayLines(rows, spots)),
    })),
    checks: [{ type: "noError" }],
    hints: [
      "For each row, Pyu goes through every spot in that row. That's a loop inside a loop.",
      "range(1, rows + 1) counts from 1 up to rows.",
      "The inner loop is pushed right under the outer loop, and the print is pushed right under the inner loop.",
    ],
    successText: "Every tray filled, row by row",
  },
  {
    id: "6.5",
    chapter: 6,
    title: "Find the Butter",
    concept: "break",
    points: 15,
    scene: "stove",
    runLabel: "Day",
    story: "The fridge door is open and cold air is escaping! Pyu wants to find the butter and close the door fast.",
    learn:
      "`break` stops a loop straight away, even if there are items left:\n```\nfor n in [1, 2, 3, 4]:\n    if n == 3:\n        break\n    print(n)\n```\nThis prints 1 and 2, then stops.",
    goal: "Check the `fridge` items one by one, printing `Checking milk` (with that item's name) for each. As soon as you find `butter`, print `Found the butter!` and **stop**. Don't check anything after it. If there's no butter, just check everything.",
    starterCode: "# The jar fridge is already on the shelf.\n\n",
    bindings: [{ object: "fridge", variable: "fridge" }],
    customers: (
      [["milk", "jam", "butter", "eggs", "cheese"], ["butter", "milk"], ["eggs", "milk"], ["jam", "butter", "butter"]] as string[][]
    ).map((fridge, i) => ({ name: `Day ${i + 1}`, hidden: i === 3, globals: { fridge }, expect: out(...butterLines(fridge)) })),
    checks: [{ type: "noError" }],
    hints: [
      "First, loop through the fridge and print a Checking ticket for every item.",
      "Inside the loop, after the Checking ticket, ask whether the item is \"butter\".",
      "If it is, print the found message and use break.",
    ],
    successText: "Butter found, fridge door closed",
  },
  {
    id: "6.6",
    chapter: 6,
    title: "Skip the Burnt Ones",
    concept: "continue",
    points: 15,
    scene: "stove",
    runLabel: "Day",
    story: "A few cookies got burnt. Pyu wants to pack only the good ones and count how many he packed.",
    learn:
      "`continue` skips the rest of this round and jumps to the next item:\n```\nfor n in [1, 2, 3]:\n    if n == 2:\n        continue\n    print(n)\n```\nThis prints 1 and 3, skipping 2.",
    goal: "Go through the `cookies` list. **Skip** every `burnt` cookie. For every other cookie, print `Packed a golden cookie` (with that cookie's word) and add 1 to `packed`. At the end, print `Packed 2 cookies` with the real count.",
    starterCode: "# The jar cookies holds today's batch, e.g. [\"golden\", \"burnt\", \"chewy\"]\npacked = 0\n\n",
    bindings: [
      { object: "cookieBelt", variable: "cookies" },
      { object: "counter", variable: "packed", label: "packed" },
    ],
    customers: (
      [["golden", "burnt", "chewy"], ["burnt", "burnt"], ["golden", "golden", "burnt", "crispy"], ["crispy"]] as string[][]
    ).map((cookies, i) => ({
      name: `Day ${i + 1}`, hidden: i === 3, globals: { cookies },
      expect: [
        { type: "var" as const, name: "packed", equals: cookies.filter((c) => c !== "burnt").length, pyType: "int" as const },
        ...out(...packLines(cookies)),
      ],
    })),
    checks: [{ type: "noError" }],
    hints: [
      "Loop through every cookie.",
      "If the cookie is \"burnt\", use continue to skip it.",
      "The final count ticket goes after the loop, not inside it.",
    ],
    successText: "Only the good cookies packed",
  },
];
