import random
from typing import List, Dict, Optional, Any

# --- Core Classes and Data Structures ---

class Player:
    def __init__(self, name, race, profession, training_school=None, major=None, superpower=None):
        # Core Data/State
        self.name = name
        self.level = 1
        self.race = race
        self.profession = profession
        self.training_school = training_school
        self.major = major
        self.superpower = superpower
        self.powerPoints = 0

        # Raw base attributes
        self.base_attributes = {
            'constitution': 10,
            'dexterity': 10,
            'intelligence': 10,
            'wisdom': 10,
            'charisma': 10
        }
        self.bonuses = {
            'race': getattr(race, 'bonuses', {}) if race else {},
            'profession': getattr(profession, 'bonuses', {}) if profession else {},
            'major': getattr(major, 'attribute_bonus', {}) if major else {},
        }
        self.equipment = {
            'weapons': [],
            'armor': [],
            'layeredArmor': [],
            'inventory': []
        }
        self.skill_table = {1: 0, 2: 100, 3: 300, 4: 600, 5: 1000}
        self.skills = {
            'Artist':      {'level': 1, 'attribute': 'charisma',    'xp': 0, 'effect': None},
            'Athlete':     {'level': 1, 'attribute': 'constitution','xp': 0, 'effect': None},
            'Bureaucrat':  {'level': 1, 'attribute': 'intelligence','xp': 0, 'effect': None},
            'Business':    {'level': 1, 'attribute': 'wisdom',      'xp': 0, 'effect': None},
            'Called Shot': {'level': 1, 'attribute': 'dexterity',   'xp': 0, 'effect': None},
            'Called Strike':{'level': 1,'attribute': 'dexterity',   'xp': 0, 'effect': None},
            'Gambling':    {'level': 1, 'attribute': 'intelligence','xp': 0, 'effect': None},
            'Gunning':     {'level': 1, 'attribute': 'dexterity',   'xp': 0, 'effect': None},
            'Hijack':      {'level': 1, 'attribute': 'dexterity',   'xp': 0, 'effect': None},
            'History':     {'level': 1, 'attribute': 'intelligence','xp': 0, 'effect': None},
            'Mechanics':   {'level': 1, 'attribute': 'intelligence','xp': 0, 'effect': None},
            'Medicine':    {'level': 1, 'attribute': 'wisdom',      'xp': 0, 'effect': None},
            'Melee':       {'level': 1, 'attribute': 'constitution','xp': 0, 'effect': None},
            'Nutrition':   {'level': 1, 'attribute': 'wisdom',      'xp': 0, 'effect': None},
            'Navigation':  {'level': 1, 'attribute': 'intelligence','xp': 0, 'effect': None},
            'Operator':    {'level': 1, 'attribute': 'intelligence','xp': 0, 'effect': None},
            'Perception':  {'level': 1, 'attribute': 'wisdom',      'xp': 0, 'effect': None},
            'Religion':    {'level': 1, 'attribute': 'wisdom',      'xp': 0, 'effect': None},
            'Science':     {'level': 1, 'attribute': 'intelligence','xp': 0, 'effect': None},
            'Speech':      {'level': 1, 'attribute': 'charisma',    'xp': 0, 'effect': None},
            'Stealth':     {'level': 1, 'attribute': 'dexterity',   'xp': 0, 'effect': None},
            'Street':      {'level': 1, 'attribute': 'charisma',    'xp': 0, 'effect': None},
            'Technology':  {'level': 1, 'attribute': 'intelligence','xp': 0, 'effect': None},
            'Unarmed':     {'level': 1, 'attribute': 'constitution','xp': 0, 'effect': None},
        }

        # Store current/selected options
        self.resistances = self.calculate_resistances()
        self.vision = getattr(self.race, 'vision', ["Normal Vision"])
        self.passive_skill = getattr(self.profession, 'passive_skill', None)
        self.credits = getattr(self.profession, 'starting_credits', 0)

        # Derived stats
        self.max_health = self.calculate_health()
        self.health = self.max_health
        self.armorRating = self.calculate_armor_rating()
        self.initiative = self.calculate_initiative()
        self.movement = getattr(self.race, 'movement', 30)

    # Calculation Functions
    def calculate_attributes(self):
        attributes = self.base_attributes.copy()
        for source in self.bonuses.values():
            for attr, val in source.items():
                key = attr.lower()
                if key in attributes:
                    attributes[key] += val
        return attributes

    def calculate_resistances(self):
        resistances = {}
        if self.race:
            resistances.update(getattr(self.race, 'resistances', {}))
        for res in ['cold', 'fire', 'electricity', 'acid', 'poison']:
            if res not in resistances:
                resistances[res] = 0
        return resistances

    def calculate_armor_rating(self):
        attributes = self.calculate_attributes()
        if self.training_school:
            if self.training_school.armor_formula == "Dex + 1":
                return attributes['dexterity'] + 1
            else:
                return 10
        return 10

    def calculate_initiative(self):
        attributes = self.calculate_attributes()
        if self.training_school:
            if self.training_school.initiative_formula == "Dex + 1":
                return attributes['dexterity'] + 1
            else:
                return 0
        return 0

    def calculate_health(self):
        attributes = self.calculate_attributes()
        if self.training_school:
            if self.training_school.hp_formula == "8 + Constitution":
                return 8 + attributes['constitution']
            else:
                return 8
        return 8

    # State Changes
    def level_up(self):
        self.level += 1
        self.max_health = self.calculate_health()
        self.health = self.max_health

    def equip_armor(self, armor):
        self.equipment['armor'].append(armor)
        self.armorRating = self.calculate_armor_rating()

    def equip_weapon(self, weapon):
        self.equipment['weapons'].append(weapon)

    def gain_buff(self, buff):
        for attr, val in buff.items():
            key = attr.lower()
            if key in self.base_attributes:
                self.base_attributes[key] += val
        self.max_health = self.calculate_health()
        self.armorRating = self.calculate_armor_rating()
        self.initiative = self.calculate_initiative()

    def take_damage(self, damage):
        self.health -= damage
        if self.health <= 0:
            pass  # Handle defeat logic elsewhere

    def __str__(self):
        attributes = self.calculate_attributes()
        return (
            f"Player: {self.name}\n"
            f"  Race: {getattr(self.race, 'name', self.race)}\n"
            f"  Profession: {getattr(self.profession, 'name', self.profession)}\n"
            f"  Training School: {getattr(self.training_school, 'name', self.training_school)}\n"
            f"  Major: {getattr(self.major, 'name', self.major)}\n"
            f"  Level: {self.level}\n"
            f"  Health: {self.health}/{self.max_health}\n"
            f"  Armor Rating: {self.armorRating}\n"
            f"  Initiative: {self.initiative}\n"
            f"  Movement: {self.movement}\n"
            f"  Credits: {self.credits}\n"
            f"  Attributes: {attributes}\n"
            f"  Resistances: {self.resistances}\n"
            f"  Vision: {self.vision}\n"
            f"  Passive Skill: {self.passive_skill}\n"
            f"  Weapons: {self.equipment['weapons']}\n"
            f"  Armor: {self.equipment['armor']}\n"
            f"  Inventory: {self.equipment['inventory']}\n"
        )

# ...existing code for Race, Profession, Major, TrainingSchool, Persona, PowerAbility, SuperPower, BurnControl, STARTING_EQUIPMENT, AttributeBlock, Skill, Weapon, ArmorPiece, SuperPowerBlock, CharacterSheet...

# (Copy all class and data structure definitions from main.py here, but exclude any CLI/UI code)
