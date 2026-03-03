const AUTOMALL_BASE_BLUEPRINT = {
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
};

