const SMELTABLE_BASE_ITEMS = ['iron-plate', 'copper-plate', 'steel-plate', 'stone-brick'];

const SMELT_INGREDIENTS = {
    'iron-plate': 'iron-ore',
    'copper-plate': 'copper-ore',
    'steel-plate': 'iron-plate',
    'stone-brick': 'stone'
};

function getSmeltIngredient(smeltedItemName) {
    return SMELT_INGREDIENTS[smeltedItemName] || null;
}

const SMELTER_ENTITY_TEMPLATES = [
    {
        name: 'long-handed-inserter',
        position: { x: 2, y: 0 },
        direction: 12,
        control_behavior: {
            circuit_condition: { first_signal: { name: 'steel-plate' }, constant: 200, comparator: '<' },
            circuit_set_filters: true
        },
        filters: [
            { index: 1, name: 'stone', quality: 'normal', comparator: '=' },
            { index: 2, name: 'copper-cable', quality: 'normal', comparator: '=' }
        ],
        use_filters: true
    },
    {
        name: 'long-handed-inserter',
        position: { x: 2, y: 2 },
        direction: 4
    },
    {
        name: 'medium-electric-pole',
        position: { x: 2, y: 1 }
    },
    {
        name: 'electric-furnace',
        position: { x: 4, y: 1 },
        control_behavior: { read_contents: true },
        quality: 'epic',
        items: [
            {
                id: { name: 'speed-module-3', quality: 'epic' },
                items: { in_inventory: [{ inventory: 4, stack: 0 }, { inventory: 4, stack: 1 }] }
            }
        ]
    }
];

function getSmelterBlueprintEntities(bufferPosition) {
    const baseCount = 9;
    const entities = [];
    for (let i = 0; i < SMELTER_ENTITY_TEMPLATES.length; i++) {
        const t = SMELTER_ENTITY_TEMPLATES[i];
        const ent = {
            entity_number: baseCount + 1 + i,
            name: t.name,
            position: {
                x: t.position.x + bufferPosition.x,
                y: t.position.y + bufferPosition.y
            }
        };
        if (t.direction !== undefined) ent.direction = t.direction;
        if (t.control_behavior) ent.control_behavior = JSON.parse(JSON.stringify(t.control_behavior));
        if (t.filters) ent.filters = t.filters;
        if (t.use_filters !== undefined) ent.use_filters = t.use_filters;
        if (t.quality) ent.quality = t.quality;
        if (t.items) ent.items = JSON.parse(JSON.stringify(t.items));
        entities.push(ent);
    }
    return entities;
}

function getSmelterWires(deciderEntityNumber, firstNewEntityNumber) {
    const id = (n) => (n === 0 ? deciderEntityNumber : n === 1 ? firstNewEntityNumber : firstNewEntityNumber + 3);
    return [
        [id(1), 2, id(0), 4],
        [id(0), 1, id(3), 1],
        [4, 5, 12, 5]
    ];
}

function addSmelterToBlueprint(resultBlueprint, bufferChestPosition) {
    const deciderEntityNumber = 6;
    const firstNewNumber = 10;
    const entities = resultBlueprint.blueprint.entities;
    const newEntities = getSmelterBlueprintEntities(bufferChestPosition);
    newEntities.forEach((e) => entities.push(e));
    const wires = resultBlueprint.blueprint.wires || [];
    getSmelterWires(deciderEntityNumber, firstNewNumber).forEach((w) => wires.push(w));
    resultBlueprint.blueprint.wires = wires;
}

const SMELTER_SIGNAL_VALUES = {
    'iron-plate': 500,
    'copper-ore': 1000,
    'iron-ore': 1500,
    'stone': 2000
};

const SMELTER_INGREDIENT_COUNTS = {
    'iron-plate': 5,
    'copper-ore': 1,
    'iron-ore': 1,
    'stone': 2
};

const SMELTER_RANGE_SIZE = 100;
const SMELTER_PASSTHROUGH_SIZE = 10;

function redSignalEachCondition(constant, comparator, compareType) {
    const c = {
        first_signal: { type: 'virtual', name: 'signal-each' },
        constant,
        comparator,
        first_signal_networks: { red: true, green: false }
    };
    if (compareType) c.compare_type = compareType;
    return c;
}

function greenItemCondition(name, count) {
    return {
        first_signal: { name },
        constant: count,
        comparator: '<',
        first_signal_networks: { red: false, green: true }
    };
}

function getSmelterConditions(smeltOptions, nextFilterIndex) {
    const conditions = [];
    const filters = [];
    const smeltEntries = SMELTABLE_BASE_ITEMS.filter((name) => smeltOptions[name] && smeltOptions[name].smelt);
    if (smeltEntries.length === 0) return { conditions, filters: [] };

    let filterIndex = nextFilterIndex;
    smeltEntries.forEach((name) => {
        const startCount = smeltOptions[name].start_count != null ? smeltOptions[name].start_count : 50;
        const ingredient = getSmeltIngredient(name);
        const V = SMELTER_SIGNAL_VALUES[ingredient];
        if (!ingredient) return;

        filters.push({
            index: filterIndex++,
            name: ingredient,
            quality: 'normal',
            comparator: '=',
            count: V
        });

        conditions.push(greenItemCondition(name, startCount));
        conditions.push(redSignalEachCondition(V, '>=', 'and'));
        conditions.push(redSignalEachCondition(V + SMELTER_RANGE_SIZE, '<=', 'and'));
        smeltEntries.forEach((other) => { // check that all other things aren't currently smelting
            if (getSmeltIngredient(other) === ingredient) return;
            const otherV = SMELTER_SIGNAL_VALUES[getSmeltIngredient(other)];
            conditions.push({
                first_signal: { name: getSmeltIngredient(other) },
                constant: otherV,
                comparator: '=',
                first_signal_networks: { red: true, green: false },
                compare_type: 'and'
            });
        });
        if(SMELTER_INGREDIENT_COUNTS[getSmeltIngredient(name)] > 1) {
            conditions.push(redSignalEachCondition(V + 1, '>'));
            conditions.push(redSignalEachCondition(V + SMELTER_INGREDIENT_COUNTS[getSmeltIngredient(name)], '<=', 'and'));
        }
    });

    return { conditions, filters };
}

function isSmeltableBaseIngredient(name) {
    return SMELTABLE_BASE_ITEMS.includes(name);
}
