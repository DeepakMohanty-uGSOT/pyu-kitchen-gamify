import type { Level } from "../types";

// ============================================================ CHAPTER 1 — THE PANTRY (Variables)

export const CH1: Level[] = [
  {
    id: "1.1",
    chapter: 1,
    title: "Label the Jars",
    concept: "Making a variable",
    points: 20,
    scene: "pantry",
    runLabel: "Day",
    story:
      "Pyu's jars have lost their labels, and Pyu only uses a jar if it has a name on it. You are Byte, Pyu's helper. You write the steps, and Pyu follows them one by one.",
    learn:
      "A **variable** is like a jar with a label. You write the label, then `=`, then what goes inside the jar.\nFor example, `apples = 3` makes a jar called apples with 3 inside.\nWords (text) need quote marks: `city = \"Delhi\"`.",
    goal: "Make two jars:\n- a jar called `rice` with the number **5** inside\n- a jar called `name` with the word **Pyu** inside",
    notes: ["Press **Cook** and watch the shelf. Each jar appears when its line runs."],
    starterCode:
      "# Write your steps below.\n# Pyu reads them from top to bottom.\n\n",
    customers: [{ name: "Day 1" }],
    checks: [
      { type: "noError" },
      { type: "var", name: "rice", equals: 5, pyType: "int",
        whenValue: [{ value: "5", message: "The rice jar has \"5\" in quote marks, so Python sees it as text. Remove the quotes to store the number 5." }] },
      { type: "var", name: "name", equals: "Pyu", pyType: "str" },
    ],
    hints: [
      "One line makes one jar: the jar's name, then =, then what goes inside.",
      "Numbers are written as they are. Words need quote marks around them.",
      "You need exactly two lines. Names must match exactly, so write rice in small letters, not Rice.",
    ],
    successText: "Two jars labelled and on the shelf",
  },
  {
    id: "1.2",
    chapter: 1,
    title: "More Jars",
    concept: "Making variables",
    points: 20,
    scene: "pantry",
    runLabel: "Day",
    story: "Pyu drew a picture of how his shelf should look. Make the shelf match the picture before lunch.",
    learn:
      "You can make as many jars as you want, one per line.\nA yes/no value is written `True` or `False`, with a capital first letter and no quote marks.\nFor example, `lights_on = False`.",
    goal: "Look at the picture below and make four jars:\n- `eggs`: how many eggs there are\n- `sugar`: how many cups of sugar there are\n- `chef`: the name written on the apron\n- `oven_on`: is the oven on? (yes or no)",
    picture: [
      { emoji: "🥚", label: "A box with 6 eggs" },
      { emoji: "🥣", label: "2 cups of sugar" },
      { emoji: "🧑‍🍳", label: "The apron says: Pyu" },
      { emoji: "🔥", label: "The oven light is ON" },
    ],
    starterCode: "# Make the shelf match Pyu's picture.\n\n",
    bindings: [{ object: "oven", variable: "oven_on" }],
    customers: [{ name: "Day 1" }],
    checks: [
      { type: "noError" },
      { type: "var", name: "eggs", equals: 6, pyType: "int" },
      { type: "var", name: "sugar", equals: 2, pyType: "int" },
      { type: "var", name: "chef", equals: "Pyu", pyType: "str" },
      { type: "var", name: "oven_on", equals: true, pyType: "bool",
        whenValue: [
          { value: "True", message: "oven_on has \"True\" in quote marks, which makes it text. Python's yes value is True without quotes." },
          { value: "ON", message: "oven_on holds the word \"ON\". Pyu needs Python's yes/no value instead: True or False." },
        ] },
    ],
    hints: [
      "Each picture card gives you one jar. The task tells you the jar's name, and the picture tells you what goes inside.",
      "Numbers need no quotes. The chef's name is a word, so it does need quotes.",
      "The oven question is yes or no. In Python, yes is True, with no quote marks.",
    ],
    successText: "The shelf matches Pyu's picture",
  },
  {
    id: "1.3",
    chapter: 1,
    title: "Bad Labels",
    concept: "Naming rules",
    points: 20,
    scene: "pantry",
    runLabel: "Day",
    story: "Pyu wrote some labels in a hurry. Python has rules about names, and it won't read this code at all.",
    learn:
      "Jar names have rules:\n- they can't start with a number (`3cups` is not allowed, `cups3` is fine)\n- they can't have spaces (use `_` instead: `big_pot`)\n- they can't be one of Python's own words, like `if`, `for` or `class`",
    goal: "Python can't read three of these names. Rename those jars so Python accepts them. Keep what's inside each jar the same, and keep the last line.",
    notes: ["Python shows one problem at a time. Fix it, press Cook again, and read the next message."],
    starterCode:
      "# Pyu wrote these labels in a hurry. Python can't read them!\n2eggs = 12\nmy rice = 5\nclass = \"Pyu\"\nprint(\"Pantry labels fixed!\")\n",
    customers: [{ name: "Day 1" }],
    checks: [
      { type: "compiles" },
      { type: "noError" },
      { type: "hasValue", value: 12, pyType: "int", fail: "The jar with 12 eggs is missing. Change the jar's name, but keep 12 inside it." },
      { type: "hasValue", value: 5, pyType: "int", fail: "The jar with 5 scoops of rice is missing. Change the jar's name, but keep 5 inside it." },
      { type: "hasValue", value: "Pyu", pyType: "str", fail: "The jar holding \"Pyu\" is missing. Change the jar's name, but keep \"Pyu\" inside it." },
      { type: "output", lines: ["Pantry labels fixed!"] },
    ],
    hints: [
      "Press Cook and read which line Python stops at. Fix one name at a time.",
      "A name can't start with a digit or contain a space. Use an underscore _ to join words.",
      "class is one of Python's own words, so pick another name for that jar.",
    ],
    successText: "Every name follows Python's rules",
  },
  {
    id: "1.4",
    chapter: 1,
    title: "Refill",
    concept: "Changing a variable",
    points: 20,
    scene: "pantry",
    runLabel: "Day",
    mode: "fill",
    story: "Every morning a van delivers more rice. The amount is different every day, so your step must work on any day.",
    learn:
      "A jar can get a new value. Python first works out the right side of `=`, then puts the answer into the jar on the left.\nFor example, if `score = 10`, then after `score = score + 1` the jar holds 11.",
    goal: "The jars `rice` and `delivery` are already on the shelf. Put the delivery into the rice jar, so `rice` ends up holding **its old amount plus the delivery**.",
    notes: ["Fill in the empty box. Pyu will test it on three different days with different amounts, so don't type the numbers yourself."],
    fillTemplate:
      "# The shelf already has a jar called rice and a jar called delivery.\n# The amounts are different every day!\nrice = [[]]\nprint(\"Rice jar now holds\", rice, \"scoops\")",
    customers: [
      { name: "Day 1", globals: { rice: 5, delivery: 3 },
        expect: [{ type: "var", name: "rice", equals: 8, pyType: "int" }, { type: "output", lines: ["Rice jar now holds 8 scoops"] }] },
      { name: "Day 2", globals: { rice: 2, delivery: 9 },
        expect: [{ type: "var", name: "rice", equals: 11, pyType: "int" }, { type: "output", lines: ["Rice jar now holds 11 scoops"] }] },
      { name: "Day 3", globals: { rice: 12, delivery: 4 },
        expect: [{ type: "var", name: "rice", equals: 16, pyType: "int" }, { type: "output", lines: ["Rice jar now holds 16 scoops"] }] },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Python works out the right side of = first, using what's in the jars right now.",
      "A jar's own name can be used on the right side. Python uses the old amount there.",
      "Use both jar names on the right side, joined with a + sign.",
    ],
    successText: "Rice refilled correctly three days in a row",
  },
  {
    id: "1.5",
    chapter: 1,
    title: "Tea Time",
    concept: "Order of steps",
    points: 20,
    scene: "pantry",
    mode: "reorder",
    story: "Asha wants a hot cup of tea. Pyu's recipe cards fell on the floor and got mixed up. Pyu follows the cards in whatever order you put them, even a wrong one.",
    learn:
      "Python runs lines **from top to bottom**, one at a time. Order matters!\nIf you copy a jar into another jar, you copy what's inside **at that moment**. Changing the first jar later doesn't change the copy.",
    goal: "Put the steps in the right order so Asha gets a **hot** cup of tea **with tea leaves** in it.",
    notes: ["Drag the cards, or use the ▲ ▼ buttons to move a step up or down."],
    reorderLines: [
      "cup = kettle",
      "kettle = \"cold water\"",
      "print(\"Serving:\", cup)",
      "kettle = \"hot water\"",
      "cup = cup + \" + tea leaves\"",
    ],
    bindings: [
      { object: "kettle", variable: "kettle" },
      { object: "teaCup", variable: "cup" },
    ],
    customers: [{ name: "Asha", says: "One hot tea, please!" }],
    checks: [
      { type: "noError" },
      { type: "var", name: "cup", equals: "hot water + tea leaves", pyType: "str",
        whenValue: [
          { value: "cold water + tea leaves", message: "Asha got cold tea. Pyu poured the water before it was hot. Look at the order of your steps." },
          { value: "hot water", message: "Asha got a cup of plain hot water. The tea leaves never went into her cup." },
          { value: "cold water", message: "Asha got a cup of cold, plain water. Nothing was heated and no leaves were added." },
          { value: "hot water + tea leaves + tea leaves", message: "Asha's tea has tea leaves in it twice. How did that happen?" },
        ] },
      { type: "output", lines: ["Serving: hot water + tea leaves"],
        fail: "The tea was fine, but Pyu served it too early. Serving should be the very last step." },
    ],
    hints: [
      "Pyu does one card at a time, top to bottom. A card can only use a jar that already exists.",
      "When cup = kettle runs, the cup gets whatever is in the kettle at that moment.",
      "What should be in the kettle at the moment Pyu pours it into the cup?",
    ],
    successText: "A steaming cup of tea for Asha",
  },
];

// ============================================================ CHAPTER 2 — WHAT'S IN THE JAR (Data types)

export const CH2: Level[] = [
  {
    id: "2.1",
    chapter: 2,
    title: "Four Kinds of Jars",
    concept: "int, float, str, bool",
    points: 25,
    scene: "pantry",
    runLabel: "Day",
    story: "Jars hold different kinds of things: whole eggs, a measured amount of sugar, a written word, or an on/off switch.",
    learn:
      "Python has four basic kinds of values:\n- **int**: a whole number, like `7`\n- **float**: a decimal number, like `0.75`\n- **str**: text in quote marks, like `\"tea\"`\n- **bool**: `True` or `False`",
    goal: "Make four jars:\n- `eggs` holding the whole number **12**\n- `sugar` holding **2.5**\n- `dish` holding the word **soup**\n- `oven_on` holding the yes/no value that means *the oven is on*",
    notes: ["Watch how each jar looks different depending on what's inside."],
    starterCode: "# Four jars, four different kinds of value.\n\n",
    bindings: [{ object: "oven", variable: "oven_on" }],
    customers: [{ name: "Day 1" }],
    checks: [
      { type: "noError" },
      { type: "var", name: "eggs", equals: 12, pyType: "int",
        whenValue: [{ value: "12", message: "eggs has \"12\" in quotes, so it's text. Numbers don't need quotes." }] },
      { type: "var", name: "sugar", equals: 2.5, pyType: "float",
        whenValue: [{ value: "2.5", message: "sugar has \"2.5\" in quotes, so it's text. Numbers don't need quotes." }] },
      { type: "var", name: "dish", equals: "soup", pyType: "str" },
      { type: "var", name: "oven_on", equals: true, pyType: "bool" },
    ],
    hints: [
      "Look at the list in the New idea box. Each jar needs a different kind of value.",
      "A decimal number is written with a dot, like 0.75. Numbers never need quotes.",
      "Only the dish needs quotes. The oven jar needs True or False.",
    ],
    successText: "Four different kinds of jar on the shelf",
  },
  {
    id: "2.2",
    chapter: 2,
    title: "Inspector Pyu",
    concept: "type()",
    points: 25,
    scene: "pantry",
    runLabel: "Day",
    story: "Four mystery jars arrived. What's inside changes every day, so Pyu can't guess. He wants Python to tell him.",
    learn:
      "`type(...)` tells you what kind of value something is.\n`print(...)` shows something on the screen.\nYou can put one inside the other: `print(type(3.5))` shows `<class 'float'>`.",
    goal: "Four mystery jars are on the shelf: `jar_a`, `jar_b`, `jar_c` and `jar_d`. Print the **type** of each jar, one per line, in the order a, b, c, d. Each line should look like `<class 'int'>`.",
    mysteryVars: ["jar_a", "jar_b", "jar_c", "jar_d"],
    starterCode:
      "# The mystery jars jar_a, jar_b, jar_c and jar_d are already on the shelf.\n# What's inside changes every day.\n\n",
    customers: [
      { name: "Day 1", globals: { jar_a: 7, jar_b: "7", jar_c: 7.5, jar_d: false },
        expect: [{ type: "output", lines: ["<class 'int'>", "<class 'str'>", "<class 'float'>", "<class 'bool'>"] }] },
      { name: "Day 2", globals: { jar_a: "hello", jar_b: true, jar_c: 3, jar_d: 0.25 },
        expect: [{ type: "output", lines: ["<class 'str'>", "<class 'bool'>", "<class 'int'>", "<class 'float'>"] }] },
      { name: "Day 3", globals: { jar_a: 9.75, jar_b: 40, jar_c: "True", jar_d: true },
        expect: [{ type: "output", lines: ["<class 'float'>", "<class 'int'>", "<class 'str'>", "<class 'bool'>"] }] },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Don't write the answers yourself. They change every day, so let Python find them.",
      "Use type() on a jar's name, then put that inside print().",
      "You need four lines, one for each jar, in the order a, b, c, d.",
    ],
    successText: "Mystery jars checked three days running",
  },
  {
    id: "2.3",
    chapter: 2,
    title: "The Quoted Number",
    concept: "Text vs numbers",
    points: 25,
    scene: "pantry",
    runLabel: "Day",
    story: "Pyu put quote marks around the number of eggs. To Python, \"5\" is a word, not the number five, so adding breaks.",
    learn:
      "`5` is a number, but `\"5\"` (with quotes) is text.\nPython can add two numbers, but it won't add text and a number together.",
    goal: "Fix the code so the `eggs` jar holds a **real number** and Pyu prints the correct total number of eggs.",
    starterCode:
      "eggs = \"5\"\nmore_eggs = 3\ntotal_eggs = eggs + more_eggs\nprint(\"Total eggs:\", total_eggs)\n",
    customers: [{ name: "Day 1" }],
    checks: [
      { type: "noError" },
      { type: "var", name: "eggs", equals: 5, pyType: "int",
        whenValue: [{ value: "5", message: "The eggs jar still has \"5\" as text. It needs to be the number 5." }] },
      { type: "var", name: "total_eggs", equals: 8, pyType: "int" },
      { type: "output", lines: ["Total eggs: 8"] },
    ],
    hints: [
      "Press Cook and read the message. What two kinds of things is Python trying to add?",
      "Compare the eggs jar and the more_eggs jar on the shelf. They are different kinds.",
      "You only need to change one line, by removing something from it.",
    ],
    successText: "Eggs counted correctly",
  },
  {
    id: "2.4",
    chapter: 2,
    title: "Convert It",
    concept: "int(), float(), str()",
    points: 25,
    scene: "pantry",
    runLabel: "Day",
    mode: "fill",
    story: "The order slips are mixed up: some numbers are written as text, and some text should be a number. Pyu needs each one changed into the right kind.",
    learn:
      "You can change one kind of value into another:\n- `int(\"8\")` gives the whole number `8`\n- `float(\"1.5\")` gives the decimal number `1.5`\n- `str(20)` gives the text `\"20\"`",
    goal: "Make three new jars from the old ones:\n- `plates`: the **whole number** version of `order`\n- `table_label`: the **text** version of `table`\n- `cups_needed`: the **decimal number** version of `cups`",
    notes: ["The jars order, table and cups change every day, so use their names, not today's values."],
    fillTemplate:
      "# Jars already on the shelf (they change every day):\n#   order - number of plates, written as text, e.g. \"3\"\n#   table - the table number, a whole number, e.g. 4\n#   cups  - cups of milk, written as text, e.g. \"2.5\"\nplates = [[]]\ntable_label = [[]]\ncups_needed = [[]]\nprint(plates + 1, \"Table \" + table_label, cups_needed * 2)",
    bindings: [{ object: "plates", variable: "plates" }],
    customers: [
      { name: "Day 1", globals: { order: "3", table: 4, cups: "2.5" },
        expect: [
          { type: "var", name: "plates", equals: 3, pyType: "int" },
          { type: "var", name: "table_label", equals: "4", pyType: "str" },
          { type: "var", name: "cups_needed", equals: 2.5, pyType: "float" },
        ] },
      { name: "Day 2", globals: { order: "7", table: 12, cups: "0.5" },
        expect: [
          { type: "var", name: "plates", equals: 7, pyType: "int" },
          { type: "var", name: "table_label", equals: "12", pyType: "str" },
          { type: "var", name: "cups_needed", equals: 0.5, pyType: "float" },
        ] },
      { name: "Day 3", globals: { order: "1", table: 9, cups: "4.0" },
        expect: [
          { type: "var", name: "plates", equals: 1, pyType: "int" },
          { type: "var", name: "table_label", equals: "9", pyType: "str" },
          { type: "var", name: "cups_needed", equals: 4, pyType: "float" },
        ] },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Look at the New idea box. There is one changer for each kind of value.",
      "Put the jar's name inside the brackets of the changer.",
      "Never type today's numbers yourself. They change every day.",
    ],
    successText: "Every order slip fixed",
  },
];

// ============================================================ CHAPTER 3 — THE SCALES COUNTER (Operators)

export const CH3: Level[] = [
  {
    id: "3.1",
    chapter: 3,
    title: "Weigh It Up",
    concept: "+  -  *  /",
    points: 15,
    scene: "scales",
    runLabel: "Day",
    story: "A big baking order came in. Pyu needs some sums worked out before he starts.",
    learn:
      "Python does maths with these signs:\n- `+` add, `-` subtract\n- `*` multiply, `/` divide\nFor example, `cost = price * 2`. You can use jar names in your sums.",
    goal: "The jars `flour`, `sugar` and `butter` hold today's amounts in grams. Make four jars:\n- `total`: flour, sugar and butter added together\n- `extra_flour`: how many more grams of flour there are than butter\n- `per_cake`: the total shared equally between **4** cakes\n- `triple_sugar`: three times the sugar",
    starterCode: "# Jars already on the shelf (in grams): flour, sugar, butter\n# The amounts change every day.\n\n",
    bindings: [{ object: "scale", variable: "total", label: "total" }],
    customers: [
      { name: "Day 1", globals: { flour: 500, sugar: 200, butter: 100 },
        expect: [
          { type: "var", name: "total", equals: 800, pyType: "number" },
          { type: "var", name: "extra_flour", equals: 400, pyType: "number" },
          { type: "var", name: "per_cake", equals: 200, pyType: "number" },
          { type: "var", name: "triple_sugar", equals: 600, pyType: "number" },
        ] },
      { name: "Day 2", globals: { flour: 300, sugar: 150, butter: 50 },
        expect: [
          { type: "var", name: "total", equals: 500, pyType: "number" },
          { type: "var", name: "extra_flour", equals: 250, pyType: "number" },
          { type: "var", name: "per_cake", equals: 125, pyType: "number" },
          { type: "var", name: "triple_sugar", equals: 450, pyType: "number" },
        ] },
      { name: "Day 3", globals: { flour: 250, sugar: 120, butter: 75 },
        expect: [
          { type: "var", name: "total", equals: 445, pyType: "number" },
          { type: "var", name: "extra_flour", equals: 175, pyType: "number" },
          { type: "var", name: "per_cake", equals: 111.25, pyType: "number" },
          { type: "var", name: "triple_sugar", equals: 360, pyType: "number" },
        ] },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Use the jar names in your sums, not today's numbers.",
      "A sum can use a jar you made on an earlier line.",
      "per_cake shares the total, so use the total jar and the / sign.",
    ],
    successText: "Ingredients weighed for three days",
  },
  {
    id: "3.2",
    chapter: 3,
    title: "Cookie Boxes",
    concept: "//  and  %",
    points: 15,
    scene: "scales",
    runLabel: "Day",
    story: "The cookie shop only sells full boxes. Pyu wants to know how many full boxes he can pack, and how many cookies are left for him to eat.",
    learn:
      "Two special division signs:\n- `//` divides and throws away the leftover part: `7 // 2` is `3`\n- `%` gives only the leftover: `7 % 2` is `1`",
    goal: "Pyu packs `cookies` into boxes that hold `box_size` cookies each. Both amounts change daily. Make two jars:\n- `full_boxes`: how many boxes can be **completely** filled\n- `left_over`: how many cookies are left without a full box",
    starterCode: "# Jars already on the shelf: cookies and box_size\n\n",
    bindings: [{ object: "cookieBox", variable: "full_boxes", extra: "left_over" }],
    customers: [
      { name: "Day 1", globals: { cookies: 17, box_size: 5 },
        expect: [{ type: "var", name: "full_boxes", equals: 3, pyType: "int" }, { type: "var", name: "left_over", equals: 2, pyType: "int" }] },
      { name: "Day 2", globals: { cookies: 24, box_size: 6 },
        expect: [{ type: "var", name: "full_boxes", equals: 4, pyType: "int" }, { type: "var", name: "left_over", equals: 0, pyType: "int" }] },
      { name: "Day 3", globals: { cookies: 10, box_size: 3 },
        expect: [{ type: "var", name: "full_boxes", equals: 3, pyType: "int" }, { type: "var", name: "left_over", equals: 1, pyType: "int" }] },
      { name: "Day 4", globals: { cookies: 4, box_size: 5 },
        expect: [{ type: "var", name: "full_boxes", equals: 0, pyType: "int" }, { type: "var", name: "left_over", equals: 4, pyType: "int" }] },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Normal division (/) gives 3.4 for 17 ÷ 5, but you can't sell 0.4 of a box.",
      "One sign gives the number of full boxes, and the other gives the leftover cookies.",
      "Use the jar names cookies and box_size with those signs.",
    ],
    successText: "Cookies boxed for four days",
  },
  {
    id: "3.3",
    chapter: 3,
    title: "Double Batch",
    concept: "+=  -=  *=",
    points: 15,
    scene: "scales",
    runLabel: "Day",
    story: "Customers loved yesterday's cake, so Pyu is making twice as much. He's also using less sugar to make it healthier.",
    learn:
      "Shortcuts for changing a jar's own value:\n- `x += 2` means `x = x + 2`\n- `x -= 2` means `x = x - 2`\n- `x *= 2` means `x = x * 2`",
    goal: "Change the jars that are already there. Don't make new ones:\n- **double** the `flour`\n- add **2** more `eggs`\n- take **30** grams away from `sugar`\n\nThen print `Batch ready!`",
    starterCode: "# Jars already on the shelf: flour (grams), eggs, sugar (grams)\n\n",
    bindings: [{ object: "scale", variable: "flour", label: "flour" }],
    customers: [
      { name: "Day 1", globals: { flour: 200, eggs: 3, sugar: 100 },
        expect: [
          { type: "var", name: "flour", equals: 400, pyType: "int" },
          { type: "var", name: "eggs", equals: 5, pyType: "int" },
          { type: "var", name: "sugar", equals: 70, pyType: "int" },
        ] },
      { name: "Day 2", globals: { flour: 350, eggs: 1, sugar: 90 },
        expect: [
          { type: "var", name: "flour", equals: 700, pyType: "int" },
          { type: "var", name: "eggs", equals: 3, pyType: "int" },
          { type: "var", name: "sugar", equals: 60, pyType: "int" },
        ] },
      { name: "Day 3", globals: { flour: 120, eggs: 6, sugar: 30 },
        expect: [
          { type: "var", name: "flour", equals: 240, pyType: "int" },
          { type: "var", name: "eggs", equals: 8, pyType: "int" },
          { type: "var", name: "sugar", equals: 0, pyType: "int" },
        ] },
    ],
    checks: [{ type: "noError" }, { type: "output", lines: ["Batch ready!"] }],
    hints: [
      "Changing a jar means using its old value to make its new value.",
      "Look at the shortcuts in the New idea box.",
      "You need one line for each ingredient, then the print line.",
    ],
    successText: "Double batches ready three days running",
  },
  {
    id: "3.4",
    chapter: 3,
    title: "Taste Thermometer",
    concept: "Comparing values",
    points: 20,
    scene: "scales",
    runLabel: "Day",
    story: "Pyu's thermometer shows a number, but Pyu wants simple yes/no answers.",
    learn:
      "You can compare values, and Python answers `True` or `False`:\n- `>` bigger than, `<` smaller than\n- `>=` bigger than or equal, `<=` smaller than or equal\n- `==` equal to, `!=` not equal to\nFor example, `is_tall = height > 150`",
    goal: "Today's `temperature` is on the shelf (it changes every day). Make four True/False jars:\n- `hot_enough`: is it **75 or more**?\n- `perfect`: is it **exactly 80**?\n- `too_hot`: is it **more than 90**?\n- `not_cold`: is it **not 20**?",
    starterCode: "# The jar temperature is already on the shelf.\n\n",
    bindings: [{ object: "thermometer", variable: "temperature" }],
    customers: [
      { name: "Day 1", globals: { temperature: 80 }, expect: boolChecks(true, true, false, true) },
      { name: "Day 2", globals: { temperature: 60 }, expect: boolChecks(false, false, false, true) },
      { name: "Day 3", globals: { temperature: 95 }, expect: boolChecks(true, false, true, true) },
      { name: "Day 4", globals: { temperature: 20 }, expect: boolChecks(false, false, false, false) },
      { name: "Day 5", hidden: true, globals: { temperature: 75 }, expect: boolChecks(true, false, false, true) },
      { name: "Day 6", hidden: true, globals: { temperature: 90 }, expect: boolChecks(true, false, false, true) },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "A comparison gives True or False, and you can store that answer in a jar.",
      "Careful: = puts something in a jar, but == asks \"are these equal?\"",
      "\"75 or more\" includes 75 itself, so use the sign with = in it.",
    ],
    successText: "The thermometer answers every question correctly",
  },
  {
    id: "3.5",
    chapter: 3,
    title: "Ready to Bake?",
    concept: "and, or, not",
    points: 20,
    scene: "scales",
    runLabel: "Day",
    story: "Pyu once put a cake into a cold oven. Never again! Now the oven must tell him when it's really ready.",
    learn:
      "Join yes/no answers with:\n- `and`: True only if **both** are True\n- `or`: True if **at least one** is True\n- `not`: flips True to False and False to True\nFor example, `can_play = sunny and not raining`",
    goal: "The jars `preheated`, `tray_in` and `baking` are all True/False, and they change daily. Make:\n- `oven_ready`: True only when the oven is preheated **and** the tray is in **and** it is **not** already baking\n- `need_help`: True when the oven is **not** preheated **or** the tray is **not** in",
    starterCode: "# Jars already on the shelf: preheated, tray_in, baking\n\n",
    bindings: [{ object: "oven", variable: "oven_ready" }],
    customers: [
      { name: "Day 1", globals: { preheated: true, tray_in: true, baking: false }, expect: ovenChecks(true, false) },
      { name: "Day 2", globals: { preheated: true, tray_in: true, baking: true }, expect: ovenChecks(false, false) },
      { name: "Day 3", globals: { preheated: false, tray_in: true, baking: false }, expect: ovenChecks(false, true) },
      { name: "Day 4", globals: { preheated: true, tray_in: false, baking: false }, expect: ovenChecks(false, true) },
      { name: "Day 5", hidden: true, globals: { preheated: false, tray_in: false, baking: true }, expect: ovenChecks(false, true) },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Read the task out loud. The words and, or and not are almost the Python code!",
      "You can join more than two jars with and.",
      "Put not in front of a jar name to flip it.",
    ],
    successText: "The oven knows when it's ready",
  },
  {
    id: "3.6",
    chapter: 3,
    title: "Check the Fridge",
    concept: "in, not in",
    points: 15,
    scene: "scales",
    runLabel: "Day",
    story: "Before making an omelette, Pyu checks what's in the fridge.",
    learn:
      "A **list** holds many values in square brackets: `fruits = [\"apple\", \"kiwi\"]`.\n`in` checks if something is in a list: `\"kiwi\" in fruits` is True.\n`not in` checks the opposite.",
    goal: "The `fridge` jar holds a list of what's inside (it changes daily). Make:\n- `has_egg`: True if `\"egg\"` is in the fridge\n- `no_milk`: True if `\"milk\"` is **not** in the fridge",
    starterCode: "# The jar fridge is already on the shelf, e.g. [\"egg\", \"butter\"]\n\n",
    bindings: [{ object: "fridge", variable: "fridge" }],
    customers: [
      { name: "Day 1", globals: { fridge: ["egg", "butter", "milk"] }, expect: fridgeChecks(true, false) },
      { name: "Day 2", globals: { fridge: ["cheese", "milk"] }, expect: fridgeChecks(false, false) },
      { name: "Day 3", globals: { fridge: ["egg", "jam"] }, expect: fridgeChecks(true, true) },
      { name: "Day 4", globals: { fridge: [] }, expect: fridgeChecks(false, true) },
    ],
    checks: [{ type: "noError" }],
    hints: [
      "Look at the New idea box. The answer is one short word.",
      "Store the True/False answer straight in the jar.",
      "The thing you're looking for is a word, so it needs quotes.",
    ],
    successText: "The fridge checked four days in a row",
  },
];

function boolChecks(hot: boolean, perfect: boolean, tooHot: boolean, notCold: boolean) {
  return [
    { type: "var" as const, name: "hot_enough", equals: hot, pyType: "bool" as const },
    { type: "var" as const, name: "perfect", equals: perfect, pyType: "bool" as const },
    { type: "var" as const, name: "too_hot", equals: tooHot, pyType: "bool" as const },
    { type: "var" as const, name: "not_cold", equals: notCold, pyType: "bool" as const },
  ];
}

function ovenChecks(ready: boolean, help: boolean) {
  return [
    { type: "var" as const, name: "oven_ready", equals: ready, pyType: "bool" as const },
    { type: "var" as const, name: "need_help", equals: help, pyType: "bool" as const },
  ];
}

function fridgeChecks(egg: boolean, noMilk: boolean) {
  return [
    { type: "var" as const, name: "has_egg", equals: egg, pyType: "bool" as const },
    { type: "var" as const, name: "no_milk", equals: noMilk, pyType: "bool" as const },
  ];
}
