signal_order = [ // curl -L https://github.com/factoriolab/factoriolab/raw/refs/heads/main/src/data/spa/data.json | jq '[.items[] | select(.category != "technology") | select(.category != "fluids") | .id]'
    "wooden-chest",
    "iron-chest",
    "steel-chest",
    "storage-tank",
    "transport-belt",
    "fast-transport-belt",
    "express-transport-belt",
    "turbo-transport-belt",
    "underground-belt",
    "fast-underground-belt",
    "express-underground-belt",
    "turbo-underground-belt",
    "splitter",
    "fast-splitter",
    "express-splitter",
    "turbo-splitter",
    "burner-inserter",
    "inserter",
    "long-handed-inserter",
    "fast-inserter",
    "bulk-inserter",
    "stack-inserter",
    "small-electric-pole",
    "medium-electric-pole",
    "big-electric-pole",
    "substation",
    "pipe",
    "pipe-to-ground",
    "pump",
    "rail",
    "rail-ramp",
    "rail-support",
    "train-stop",
    "rail-signal",
    "rail-chain-signal",
    "locomotive",
    "cargo-wagon",
    "fluid-wagon",
    "artillery-wagon",
    "car",
    "tank",
    "spidertron",
    "logistic-robot",
    "construction-robot",
    "active-provider-chest",
    "passive-provider-chest",
    "storage-chest",
    "buffer-chest",
    "requester-chest",
    "roboport",
    "small-lamp",
    "arithmetic-combinator",
    "decider-combinator",
    "selector-combinator",
    "constant-combinator",
    "power-switch",
    "programmable-speaker",
    "display-panel",
    "stone-brick",
    "concrete",
    "hazard-concrete",
    "refined-concrete",
    "refined-hazard-concrete",
    "landfill",
    "artificial-yumako-soil",
    "overgrowth-yumako-soil",
    "artificial-jellynut-soil",
    "overgrowth-jellynut-soil",
    "ice-platform",
    "foundation",
    "cliff-explosives",
    "repair-pack",
    "boiler",
    "steam-engine",
    "solar-panel",
    "accumulator",
    "nuclear-reactor",
    "heat-pipe",
    "heat-exchanger",
    "steam-turbine",
    "fusion-reactor",
    "fusion-generator",
    "burner-mining-drill",
    "electric-mining-drill",
    "big-mining-drill",
    "offshore-pump",
    "pumpjack",
    "stone-furnace",
    "steel-furnace",
    "electric-furnace",
    "foundry",
    "recycler",
    "agricultural-tower",
    "biochamber",
    "captive-biter-spawner",
    "assembling-machine-1",
    "assembling-machine-2",
    "assembling-machine-3",
    "oil-refinery",
    "chemical-plant",
    "centrifuge",
    "electromagnetic-plant",
    "cryogenic-plant",
    "lab",
    "biolab",
    "lightning-rod",
    "lightning-collector",
    "heating-tower",
    "beacon",
    "speed-module",
    "speed-module-2",
    "speed-module-3",
    "efficiency-module",
    "efficiency-module-2",
    "efficiency-module-3",
    "productivity-module",
    "productivity-module-2",
    "productivity-module-3",
    "quality-module",
    "quality-module-2",
    "quality-module-3",
    "wood",
    "coal",
    "stone",
    "iron-ore",
    "copper-ore",
    "uranium-ore",
    "raw-fish",
    "ice",
    "iron-plate",
    "copper-plate",
    "steel-plate",
    "solid-fuel",
    "plastic-bar",
    "sulfur",
    "battery",
    "explosives",
    "carbon",
    "water-barrel",
    "crude-oil-barrel",
    "petroleum-gas-barrel",
    "light-oil-barrel",
    "heavy-oil-barrel",
    "lubricant-barrel",
    "sulfuric-acid-barrel",
    "fluoroketone-hot-barrel",
    "fluoroketone-cold-barrel",
    "iron-gear-wheel",
    "iron-stick",
    "copper-cable",
    "barrel",
    "electronic-circuit",
    "advanced-circuit",
    "processing-unit",
    "engine-unit",
    "electric-engine-unit",
    "flying-robot-frame",
    "low-density-structure",
    "rocket-fuel",
    "uranium-235",
    "uranium-238",
    "uranium-fuel-cell",
    "depleted-uranium-fuel-cell",
    "nuclear-fuel",
    "calcite",
    "tungsten-ore",
    "tungsten-carbide",
    "tungsten-plate",
    "scrap",
    "holmium-ore",
    "holmium-plate",
    "superconductor",
    "supercapacitor",
    "yumako-seed",
    "jellynut-seed",
    "yumako",
    "jellynut",
    "iron-bacteria",
    "copper-bacteria",
    "spoilage",
    "nutrients",
    "bioflux",
    "yumako-mash",
    "jelly",
    "carbon-fiber",
    "biter-egg",
    "pentapod-egg",
    "tree-seed",
    "lithium",
    "lithium-plate",
    "quantum-processor",
    "fusion-power-cell",
    "automation-science-pack",
    "logistic-science-pack",
    "military-science-pack",
    "chemical-science-pack",
    "production-science-pack",
    "utility-science-pack",
    "space-science-pack",
    "metallurgic-science-pack",
    "agricultural-science-pack",
    "electromagnetic-science-pack",
    "cryogenic-science-pack",
    "promethium-science-pack",
    "rocket-silo",
    "rocket-part",
    "cargo-landing-pad",
    "space-platform-foundation",
    "cargo-bay",
    "asteroid-collector",
    "crusher",
    "thruster",
    "space-platform-starter-pack",
    "metallic-asteroid-chunk",
    "carbonic-asteroid-chunk",
    "oxide-asteroid-chunk",
    "promethium-asteroid-chunk",
    "submachine-gun",
    "railgun",
    "teslagun",
    "shotgun",
    "combat-shotgun",
    "rocket-launcher",
    "flamethrower",
    "firearm-magazine",
    "piercing-rounds-magazine",
    "uranium-rounds-magazine",
    "shotgun-shell",
    "piercing-shotgun-shell",
    "cannon-shell",
    "explosive-cannon-shell",
    "uranium-cannon-shell",
    "explosive-uranium-cannon-shell",
    "artillery-shell",
    "rocket",
    "explosive-rocket",
    "atomic-bomb",
    "capture-robot-rocket",
    "flamethrower-ammo",
    "railgun-ammo",
    "tesla-ammo",
    "grenade",
    "cluster-grenade",
    "poison-capsule",
    "slowdown-capsule",
    "defender-capsule",
    "distractor-capsule",
    "destroyer-capsule",
    "light-armor",
    "heavy-armor",
    "modular-armor",
    "power-armor",
    "power-armor-mk2",
    "mech-armor",
    "solar-panel-equipment",
    "fission-reactor-equipment",
    "fusion-reactor-equipment",
    "battery-equipment",
    "battery-mk2-equipment",
    "battery-mk3-equipment",
    "belt-immunity-equipment",
    "exoskeleton-equipment",
    "personal-roboport-equipment",
    "personal-roboport-mk2-equipment",
    "night-vision-equipment",
    "toolbelt-equipment",
    "energy-shield-equipment",
    "energy-shield-mk2-equipment",
    "personal-laser-defense-equipment",
    "discharge-defense-equipment",
    "stone-wall",
    "gate",
    "radar",
    "land-mine",
    "gun-turret",
    "laser-turret",
    "flamethrower-turret",
    "artillery-turret",
    "rocket-turret",
    "tesla-turret",
    "railgun-turret",
  ]
  
  
  

b = {
    "blueprint": {
        "icons": [
            {
                "signal": {
                    "name": "assembling-machine-3",
                    "quality": "epic"
                },
                "index": 1
            }
        ],
        "entities": [
            {
                "entity_number": 1,
                "name": "bulk-inserter",
                "position": {
                    "x": 127.5,
                    "y": 173.5
                },
                "direction": 4,
                "quality": "epic"
            },
            {
                "entity_number": 2,
                "name": "buffer-chest",
                "position": {
                    "x": 128.5,
                    "y": 173.5
                },
                "control_behavior": {
                    "circuit_condition_enabled": false
                },
                "quality": "epic",
                "request_filters": {
                    "sections": [
                        {
                            "index": 1,
                            "filters": [
                                {
                                    "index": 1,
                                    "name": "iron-plate",
                                    "quality": "normal",
                                    "comparator": "=",
                                    "count": 100
                                },
                                {
                                    "index": 2,
                                    "name": "copper-plate",
                                    "quality": "normal",
                                    "comparator": "=",
                                    "count": 100
                                }
                            ]
                        }
                    ]
                }
            },
            {
                "entity_number": 3,
                "name": "assembling-machine-3",
                "position": {
                    "x": 125.5,
                    "y": 174.5
                },
                "control_behavior": {
                    "set_recipe": true
                },
                "quality": "epic",
                "items": [
                    {
                        "id": {
                            "name": "speed-module-3",
                            "quality": "epic"
                        },
                        "items": {
                            "in_inventory": [
                                {
                                    "inventory": 4,
                                    "stack": 0
                                },
                                {
                                    "inventory": 4,
                                    "stack": 1
                                },
                                {
                                    "inventory": 4,
                                    "stack": 2
                                },
                                {
                                    "inventory": 4,
                                    "stack": 3
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "entity_number": 4,
                "name": "medium-electric-pole",
                "position": {
                    "x": 127.5,
                    "y": 174.5
                }
            },
            {
                "entity_number": 5,
                "name": "bulk-inserter",
                "position": {
                    "x": 127.5,
                    "y": 175.5
                },
                "direction": 12,
                "quality": "epic"
            },
            {
                "entity_number": 6,
                "name": "decider-combinator",
                "position": {
                    "x": 129.5,
                    "y": 174
                },
                "control_behavior": {
                    "decider_conditions": {
                        "conditions": [
                            {
                                "first_signal": {
                                    "name": "iron-gear-wheel"
                                },
                                "constant": 100
                            },
                            {
                                "first_signal": {
                                    "type": "virtual",
                                    "name": "signal-each"
                                },
                                "constant": 2,
                                "comparator": "=",
                                "first_signal_networks": {
                                    "red": true,
                                    "green": false
                                },
                                "compare_type": "and"
                            },
                            {
                                "first_signal": {
                                    "name": "transport-belt"
                                },
                                "constant": 1000,
                                "first_signal_networks": {
                                    "red": false,
                                    "green": true
                                }
                            },
                            {
                                "first_signal": {
                                    "name": "iron-gear-wheel"
                                },
                                "constant": 1,
                                "comparator": "=",
                                "first_signal_networks": {
                                    "red": true,
                                    "green": false
                                },
                                "compare_type": "and"
                            },
                            {
                                "first_signal": {
                                    "type": "virtual",
                                    "name": "signal-each"
                                },
                                "second_signal": {
                                    "name": "transport-belt"
                                },
                                "comparator": "=",
                                "first_signal_networks": {
                                    "red": true,
                                    "green": false
                                },
                                "second_signal_networks": {
                                    "red": true,
                                    "green": false
                                },
                                "compare_type": "and"
                            },
                            {
                                "first_signal": {
                                    "name": "iron-gear-wheel"
                                },
                                "constant": 10,
                                "first_signal_networks": {
                                    "red": false,
                                    "green": true
                                },
                                "second_signal_networks": {
                                    "red": false,
                                    "green": true
                                }
                            },
                            {
                                "first_signal": {
                                    "type": "virtual",
                                    "name": "signal-each"
                                },
                                "constant": 1,
                                "comparator": "=",
                                "first_signal_networks": {
                                    "red": true,
                                    "green": false
                                },
                                "second_signal_networks": {
                                    "red": true,
                                    "green": false
                                },
                                "compare_type": "and"
                            }
                        ],
                        "outputs": [
                            {
                                "signal": {
                                    "type": "virtual",
                                    "name": "signal-each"
                                },
                                "copy_count_from_input": false
                            }
                        ]
                    }
                }
            },
            {
                "entity_number": 7,
                "name": "constant-combinator",
                "position": {
                    "x": 129.5,
                    "y": 175.5
                },
                "control_behavior": {
                    "sections": {
                        "sections": [
                            {
                                "index": 1,
                                "filters": [
                                    {
                                        "index": 1,
                                        "name": "iron-gear-wheel",
                                        "quality": "normal",
                                        "comparator": "=",
                                        "count": 1
                                    },
                                    {
                                        "index": 2,
                                        "name": "transport-belt",
                                        "quality": "normal",
                                        "comparator": "=",
                                        "count": 3
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                "entity_number": 8,
                "name": "steel-chest",
                "position": {
                    "x": 128.5,
                    "y": 175.5
                }
            },
            {
                "entity_number": 9,
                "name": "bulk-inserter",
                "position": {
                    "x": 128.5,
                    "y": 174.5
                },
                "direction": 8,
                "quality": "epic"
            }
        ],
        "wires": [
            [
                2,
                2,
                6,
                2
            ],
            [
                3,
                2,
                6,
                4
            ],
            [
                6,
                1,
                7,
                1
            ],
            [
                6,
                1,
                6,
                3
            ]
        ],
        "item": "blueprint",
        "version": 562949958139904
    }
}

todo = [
    { "name": "iron-gear-wheel",      "start_count": 10, "stop_count": 190 },
    { "name": "transport-belt",       "start_count": 10, "stop_count":  90 },
    { "name": "underground-belt",     "start_count":  1, "stop_count":   5 },
    { "name": "copper-cable",         "start_count": 10, "stop_count": 190 },
    { "name": "electronic-circuit",   "start_count": 10, "stop_count": 290 },
    { "name": "splitter",             "start_count":  1, "stop_count":   5 },
    { "name": "inserter",             "start_count": 10, "stop_count":  60 },
    { "name": "long-handed-inserter", "start_count": 10, "stop_count":  40 },
    { "name": "fast-inserter",        "start_count": 10, "stop_count":  40 },
    { "name": "repair-pack",          "start_count": 10, "stop_count": 100 },
    { "name": "pipe",                 "start_count": 10, "stop_count": 200 },
    { "name": "pipe-to-ground",       "start_count": 10, "stop_count":  20 },
    { "name": "assembling-machine-1", "start_count": 10, "stop_count":  80 },
    { "name": "electric-mining-drill","start_count": 10, "stop_count":  20 },
    { "name": "steam-engine",         "start_count": 10, "stop_count":  20 },
    //{ "name": "lab",                  "start_count": 10, "stop_count":  20 }, // wooden belts for us
    { "name": "radar",                "start_count":  1, "stop_count":   5 },
    { "name": "constant-combinator",  "start_count":  1, "stop_count":   5 },
    { "name": "decider-combinator",   "start_count":  1, "stop_count":   5 },
    { "name": "arithmetic-combinator","start_count":  1, "stop_count":   5 },
    { "name": "power-switch",         "start_count":  1, "stop_count":   5 },
    { "name": "iron-stick",           "start_count": 10, "stop_count": 200 },
    { "name": "programmable-speaker", "start_count":  1, "stop_count":   5 },
    { "name": "display-panel",        "start_count":  1, "stop_count":   5 },
    { "name": "small-lamp",           "start_count": 10, "stop_count":  20 },
    { "name": "rail-signal",          "start_count":  1, "stop_count":   5 },
    { "name": "rail-chain-signal",    "start_count":  1, "stop_count":   5 },
    { "name": "iron-chest",           "start_count": 10, "stop_count":  20 },
    { "name": "offshore-pump",        "start_count": 10, "stop_count":  20 },
    { "name": "steel-chest",          "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },
    { "name": "storage-tank",         "start_count": 10, "stop_count":  50, "needs": ["steel-plate"] },
    { "name": "medium-electric-pole", "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },
    { "name": "chemical-plant",       "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },
    { "name": "assembling-machine-2", "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },
    { "name": "big-electric-pole",    "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },
    { "name": "engine-unit",          "start_count": 10, "stop_count": 300, "needs": ["steel-plate"] },
    { "name": "pump",                 "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },
    { "name": "pumpjack",             "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },
    { "name": "train-stop",           "start_count":  1, "stop_count":   5, "needs": ["steel-plate"] },
    { "name": "locomotive",           "start_count":  1, "stop_count":   5, "needs": ["steel-plate"] },
    { "name": "cargo-wagon",          "start_count":  1, "stop_count":   5, "needs": ["steel-plate"] },
    { "name": "fluid-wagon",          "start_count":  1, "stop_count":   5, "needs": ["steel-plate"] },
    { "name": "car",                  "start_count":  1, "stop_count":   5, "needs": ["steel-plate"] },
    { "name": "barrel",               "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },

    { "name": "iron-gear-wheel",      "start_count":250, "stop_count":1000 },
    { "name": "underground-belt",     "start_count": 10, "stop_count": 100 },
    { "name": "splitter",             "start_count": 10, "stop_count": 100 },
    { "name": "transport-belt",       "start_count":200, "stop_count":1000 },
    { "name": "fast-transport-belt",  "start_count":100, "stop_count": 200 },
    { "name": "fast-underground-belt","start_count": 10, "stop_count":  50 },
    { "name": "copper-cable",         "start_count":200, "stop_count": 500 },
    { "name": "electronic-circuit",   "start_count":200, "stop_count": 500 },
    { "name": "fast-splitter",        "start_count": 10, "stop_count":  50 },
    { "name": "solar-panel",          "start_count": 10, "stop_count": 500, "needs": ["steel-plate"] },
    { "name": "heat-exchanger",       "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },
    { "name": "steam-turbine",        "start_count": 10, "stop_count":  20, "needs": ["steel-plate"] },
    { "name": "heat-pipe",            "start_count": 10, "stop_count": 100, "needs": ["steel-plate"] },
]

todo_test = [
    { "name": "iron-gear-wheel",      "start_count": 10, "stop_count":  40 },
    { "name": "transport-belt",       "start_count": 10, "stop_count":  90 },
    { "name": "iron-gear-wheel",      "start_count": 50, "stop_count": 800 },
]


filters = []
conditions = []

item_values = {}
needed_checks = {}
next_virtual_signal = 1

function ensure_filter(name, virtual=false) {
    if(item_values[name] !== undefined)
        return

    item_values[name] = Object.keys(item_values).length*2 + 1
    signal = {
        "index": 1 + (item_values[name]-1)/2,
        "name": name,
        "quality": "normal",
        "comparator": "=",
        "count": item_values[name]
    }
    if (virtual)
        signal.type = "virtual"
    filters.push(signal)
    return signal
}

function start_condition(name, count) {
    return {
        "first_signal": {
            "name": name
        },
        "constant": count,
        "first_signal_networks": {
            "red": false,
            "green": true
        }
    }
}

function stop_condition(name, count) {
    return {
        "first_signal": {
            "name": name
        },
        "constant": count,
        "first_signal_networks": {
            "red": false,
            "green": true
        }
    }
}

function enable_condition(name, offset=0) {
    return {
        "first_signal": {
            "type": "virtual",
            "name": "signal-each"
        },
        "constant": item_values[name] + offset,
        "comparator": "=",
        "first_signal_networks": {
            "red": true,
            "green": false
        },
        "compare_type": "and"
    }
}

function check_condition(name) {
    let signal = {
        "name": name
    }
    if (name.startsWith("signal-"))
        signal.type = "virtual"
    return {
        "first_signal": signal,
        "constant": item_values[name] + (signal.type === "virtual" ? 1 : 0),
        "comparator": "=",
        "first_signal_networks": {
            "red": true,
            "green": false
        },
        "compare_type": "and"
    }
}

function check_count_condition(name, count) {
    let signal = {
        "name": name
    }
    if (name.startsWith("signal-"))
        signal.type = "virtual"
    return {
        "first_signal": signal,
        "constant": count,
        "comparator": ">=",
        "first_signal_networks": {
            "red": false,
            "green": true
        },
        "compare_type": "and"
    }
}

for (const t of todo) {
    ensure_filter(t.name)
    if (needed_checks[t.name] !== undefined) {
        ensure_filter(`signal-${next_virtual_signal}`, true)
        conditions.push({
            "first_signal": {
                "type": "virtual",
                "name": `signal-each`
            },
            "constant": item_values[`signal-${next_virtual_signal}`],
            "comparator": ">=",
            "first_signal_networks": {
                "red": true,
                "green": false
            }
        })
        conditions.push({
            "first_signal": {
                "type": "virtual",
                "name": `signal-each`
            },
            "constant": item_values[`signal-${next_virtual_signal}`] + 1,
            "comparator": "<=",
            "first_signal_networks": {
                "red": true,
                "green": false
            },
            "compare_type": "and"
        })
        for(let [name, count] of Object.entries(needed_checks))
            conditions.push(check_count_condition(name, count))
        needed_checks = { [`signal-${next_virtual_signal}`]: item_values[`signal-${next_virtual_signal}`] }
        next_virtual_signal++
    }
    conditions.push(stop_condition(t.name, t.stop_count), enable_condition(t.name, 1))
    for(let name in needed_checks) {
        if(signal_order.indexOf(name) > signal_order.indexOf(t.name) || signal_order.indexOf(name) == -1)
            conditions.push(check_condition(name))
    }
    conditions.push(start_condition(t.name, t.start_count), enable_condition(t.name))
    for(let name in needed_checks) {
        if(signal_order.indexOf(name) > signal_order.indexOf(t.name) || signal_order.indexOf(name) == -1)
            conditions.push(check_condition(name))
    }
    needed_checks[t.name] = t.start_count
}

b.blueprint.entities[5].control_behavior.decider_conditions.conditions = conditions
b.blueprint.entities[6].control_behavior.sections.sections[0].filters = filters
blueprintEditor.blueprintData = b