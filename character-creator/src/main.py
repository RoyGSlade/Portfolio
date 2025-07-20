import random

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
        # Optionally: increase attributes, skills, etc.

    def equip_armor(self, armor):
        self.equipment['armor'].append(armor)
        self.armorRating = self.calculate_armor_rating()

    def equip_weapon(self, weapon):
        self.equipment['weapons'].append(weapon)

    def gain_buff(self, buff):
        # Example: buff = {'constitution': 2}
        for attr, val in buff.items():
            key = attr.lower()
            if key in self.base_attributes:
                self.base_attributes[key] += val
        # Recalculate derived stats
        self.max_health = self.calculate_health()
        self.armorRating = self.calculate_armor_rating()
        self.initiative = self.calculate_initiative()

    def take_damage(self, damage):
        self.health -= damage
        print(f"{self.name} takes {damage} damage! Health is now {self.health}.")
        if self.health <= 0:
            print(f"{self.name} has been defeated!")

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


class Race:
    def __init__(self, name, bonuses, resistances, movement, skill_choices, vision, notes=None):
        self.name = name
        self.bonuses = bonuses  # dict of attribute: value
        self.resistances = resistances  # dict
        self.movement = movement
        self.skill_choices = skill_choices
        self.vision = vision
        self.notes = notes

android = Race(
    name="Android",
    bonuses={"intelligence": 2},
    resistances={"food": False, "air": False, "must_charge": 17},
    movement=40,
    skill_choices=["Medical", "Mechanics", "Science", "Tech"],
    vision=["Night Vision", "Superior Vision"],
    notes="Must charge every 17 hours."
)
human = Race(
    name="Human",
    bonuses={"charisma": 1, "intelligence": 1},
    resistances={"cold": 0, "fire": 0, "electricity": 0, "acid": 0, "poison": 0},
    movement=30,
    skill_choices=["Artist","Bureaucrat","Business","History"],
    vision=["Normal Vision"],
    notes="Humans are versatile and adaptable."
)

Kilmerians = Race(
    name="Kilmerians",
    bonuses={"constitution": 2},
    resistances={"cold": 0, "fire": 0, "electricity": 0, "acid": 0, "poison": 0},
    movement=30,
    skill_choices=["Athlete", "Gunning", "Melee", "Unarmed"],
    vision=["Normal Vision"],
    notes="Kilmerians are known for their physical prowess."
)
Saronians = Race(
    name="Saronians",
    bonuses={"Wisdom": 2},
    resistances={"cold": 0, "fire": 0, "electricity": 0, "acid": 0, "poison": 0},
    movement=30,
    skill_choices=["Stealth", "Hijack", "Navigation", "Operator"],
    vision=["Normal Vision"],
    notes="Saronians are stealthy and agile."
)
class Profession:
    def __init__(self, name, bonuses, skills, starting_credits,passive_skill):
        self.name = name
        self.bonuses = bonuses  # dict of attribute: value
        self.skills = skills  # list of skills
        self.starting_credits = starting_credits
        self.passive_skill = passive_skill  # Passive skill effect


Astronomer = Profession(
    name="Astronomer",
    bonuses={"intelligence": 2},
    skills={
        1: {"always know true north": True, "can read star maps": True},
        2: {"can always retrace steps": True, "can predict weather patterns": True},
        3: {"gain advantage on navigations if you can see the sky": True, "can identify celestial bodies": True},
        4: {"when navigating unexplored areas, you have advantage on dexterity checks": True, "can predict celestial events": True},
        5: {"Your sense of direction can draw you to fortune. You may only use this once a month.": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on finding items on a map or in a book."
)
# these are the profession ill add later Doctor,Artificial control, Software Engineer/ Mathematician, Engineer, BountyHunter, Mechanic, ScrapyardCaptain, Miner, Entrepreneur, Hustler, Adventurist,
# Doctor Profession
Doctor = Profession(
    name="Doctor",
    bonuses={"wisdom": 2},
    skills={
        1: {"can diagnose common illnesses": True, "can stabilize wounds": True},
        2: {"can treat poisons": True, "can perform minor surgery": True},
        3: {"can cure diseases": True, "can perform advanced surgery": True},
        4: {"can create medicines": True, "can revive from near death": True},
        5: {"can perform miraculous healing once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on medical checks and finding medical supplies."
)

# Artificial Control Profession
ArtificialControl = Profession(
    name="Artificial Control",
    bonuses={"intelligence": 2},
    skills={
        1: {"can interface with basic AI": True, "can override simple commands": True},
        2: {"can control multiple devices": True, "can bypass security": True},
        3: {"can reprogram AI": True, "can access restricted systems": True},
        4: {"can create custom AI routines": True, "can remotely control machines": True},
        5: {"can take full control of advanced AI once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on technology checks involving AI."
)

# Software Engineer/Mathematician Profession
SoftwareEngineerMathematician = Profession(
    name="Software Engineer/Mathematician",
    bonuses={"intelligence": 2},
    skills={
        1: {"can debug basic code": True, "can solve simple equations": True},
        2: {"can optimize algorithms": True, "can solve complex equations": True},
        3: {"can create new software": True, "can model advanced systems": True},
        4: {"can break encryption": True, "can solve theoretical problems": True},
        5: {"can create breakthrough software or solve unsolved problems once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on programming and math-related tasks."
)

# Engineer Profession
Engineer = Profession(
    name="Engineer",
    bonuses={"constitution": 2},
    skills={
        1: {"can repair basic machinery": True, "can build simple devices": True},
        2: {"can improve machine efficiency": True, "can design new devices": True},
        3: {"can repair advanced machinery": True, "can build complex devices": True},
        4: {"can invent new technology": True, "can optimize systems": True},
        5: {"can create revolutionary inventions once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on mechanics and engineering checks."
)

# BountyHunter Profession
BountyHunter = Profession(
    name="BountyHunter",
    bonuses={"dexterity": 2},
    skills={
        1: {"can track targets": True, "can subdue suspects": True},
        2: {"can interrogate effectively": True, "can set traps": True},
        3: {"can hunt in hostile environments": True, "can capture fugitives": True},
        4: {"can predict target movements": True, "can avoid ambushes": True},
        5: {"can find any target once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on tracking and bounty-related tasks."
)

# Mechanic Profession
Mechanic = Profession(
    name="Mechanic",
    bonuses={"constitution": 2},
    skills={
        1: {"can fix basic vehicles": True, "can maintain equipment": True},
        2: {"can upgrade machines": True, "can diagnose mechanical issues": True},
        3: {"can repair advanced vehicles": True, "can build custom machines": True},
        4: {"can invent mechanical solutions": True, "can optimize engines": True},
        5: {"can restore any machine once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on vehicle and machinery checks."
)

# ScrapyardCaptain Profession
ScrapyardCaptain = Profession(
    name="ScrapyardCaptain",
    bonuses={"charisma": 2},
    skills={
        1: {"can negotiate deals": True, "can find valuable scrap": True},
        2: {"can organize crews": True, "can spot hidden treasures": True},
        3: {"can lead salvage operations": True, "can appraise items": True},
        4: {"can avoid scams": True, "can secure rare finds": True},
        5: {"can discover legendary scrap once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on negotiation and salvage checks."
)

# Miner Profession
Miner = Profession(
    name="Miner",
    bonuses={"constitution": 2},
    skills={
        1: {"can identify minerals": True, "can dig efficiently": True},
        2: {"can avoid cave-ins": True, "can find rare ores": True},
        3: {"can mine in hazardous conditions": True, "can extract valuable resources": True},
        4: {"can predict mineral locations": True, "can reinforce tunnels": True},
        5: {"can discover legendary veins once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on mining and geology checks."
)

# Entrepreneur Profession
Entrepreneur = Profession(
    name="Entrepreneur",
    bonuses={"charisma": 2},
    skills={
        1: {"can spot opportunities": True, "can negotiate contracts": True},
        2: {"can build networks": True, "can secure investments": True},
        3: {"can launch ventures": True, "can manage teams": True},
        4: {"can predict market trends": True, "can avoid losses": True},
        5: {"can create a successful business once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on business and negotiation checks."
)

# Hustler Profession
Hustler = Profession(
    name="Hustler",
    bonuses={"charisma": 2},
    skills={
        1: {"can talk your way out": True, "can spot scams": True},
        2: {"can bluff effectively": True, "can make quick deals": True},
        3: {"can avoid trouble": True, "can find loopholes": True},
        4: {"can manipulate situations": True, "can secure fast cash": True},
        5: {"can pull off a big score once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on persuasion and streetwise checks."
)

# Adventurist Profession
Adventurist = Profession(
    name="Adventurist",
    bonuses={"constitution": 2},
    skills={
        1: {"can survive in wild": True, "can find shelter": True},
        2: {"can forage food": True, "can navigate rough terrain": True},
        3: {"can escape danger": True, "can find hidden paths": True},
        4: {"can endure harsh climates": True, "can lead expeditions": True},
        5: {"can discover lost places once a month": True}
    },
    starting_credits=5000,
    passive_skill="you have advantage on survival and exploration checks."
)

class Major:
    def __init__(self, name, attribute_bonus, skill_increase):
        self.name = name
        self.attribute_bonus = attribute_bonus  # e.g., {"dexterity": 1}
        self.skill_increase = skill_increase   # e.g., "Operator"

    def __str__(self):
        bonus_str = ', '.join(f"{k.capitalize()} +{v}" for k, v in self.attribute_bonus.items())
        return f"{self.name} ({bonus_str}) - Skill Up: {self.skill_increase}"


class TrainingSchool:
    def __init__(self, name, armor_formula, initiative_formula, hp_formula, majors):
        self.name = name
        self.armor_formula = armor_formula    # e.g., "Dex + 1"
        self.initiative_formula = initiative_formula  # e.g., "Dex + 1"
        self.hp_formula = hp_formula          # e.g., "8 + Constitution"
        self.majors = majors                  # List of Major objects

    def __str__(self):
        major_list = '\n  '.join(str(m) for m in self.majors)
        return (
            f"{self.name}\n"
            f"  Armor: {self.armor_formula}\n"
            f"  Initiative: {self.initiative_formula}\n"
            f"  Hit Points: {self.hp_formula}\n"
            f"  Majors:\n  {major_list}"
        )

# Aviator School instance (move outside the class definition)
aviator_school = TrainingSchool(
    name="Aviator School",
    armor_formula="Dex + 1",
    initiative_formula="Dex + 1",
    hp_formula="8 + Constitution",
    majors=[
        Major("Control", {"dexterity": 1}, "Operator"),
        Major("Astronavigation", {"dexterity": 1}, "Navigation"),
        Major("Repo", {"dexterity": 1}, "Hijack"),
    ]
)

from typing import List, Dict, Optional

class Persona:
    """
    Represents a character persona, generated step by step based on the provided structure.
    """

    def __init__(
        self,
        name: str,
        personality: str = "",
        motivation: str = "",
        plan: str = "",
        hardships: Optional[List[str]] = None,
        learnings: Optional[List[str]] = None,
        short_term_goals: Optional[List[str]] = None,
        long_term_goal: str = "",
        empathy: str = "",
        personality_depth: str = "",
        traits: Optional[List[str]] = None,
        contacts: Optional[List[Dict[str, str]]] = None,
        description: str = "",
        skill_to_increase: Optional[str] = None,
    ):
        """
        Initializes a Persona with the given parameters.
        """
        self.name = name
        self.personality = personality  # General personality description
        self.motivation = motivation    # Step 2: Why are they an adventurer?
        self.plan = plan                # Step 3: What is their plan/search?
        self.hardships = hardships if hardships else []  # Step 4: Unexpected things
        self.learnings = learnings if learnings else []  # Growth from hardships
        self.short_term_goals = short_term_goals if short_term_goals else []  # Step 5
        self.long_term_goal = long_term_goal                                   # Step 5
        self.empathy = empathy           # Step 6: Notes on empathy
        self.personality_depth = personality_depth  # Step 6: Hidden emotional depths
        self.traits = traits if traits else []      # Step 7: Up to 8 traits
        self.contacts = contacts if contacts else []  # Step 8: List of contacts (dicts)
        self.description = description    # Step 9: Appearance/voice/other details
        self.skill_to_increase = skill_to_increase  # Skill chosen after description

    def add_hardship(self, hardship: str, learning: str):
        self.hardships.append(hardship)
        self.learnings.append(learning)

    def add_short_term_goal(self, goal: str):
        self.short_term_goals.append(goal)

    def add_trait(self, trait: str):
        if len(self.traits) < 8:
            self.traits.append(trait)

    def add_contact(self, name: str, relationship: str, description: str):
        self.contacts.append({
            "name": name,
            "relationship": relationship,  # e.g., friendly, neutral, negative
            "description": description
        })

    def set_skill(self, skill: str):
        self.skill_to_increase = skill

    def describe(self) -> str:
        """
        Returns a summary of the persona.
        """
        return (
            f"Name: {self.name}\n"
            f"Personality: {self.personality}\n"
            f"Motivation: {self.motivation}\n"
            f"Plan: {self.plan}\n"
            f"Hardships: {self.hardships}\n"
            f"Learnt: {self.learnings}\n"
            f"Short-term Goals: {self.short_term_goals}\n"
            f"Long-term Goal: {self.long_term_goal}\n"
            f"Empathy: {self.empathy}\n"
            f"Personality Depth: {self.personality_depth}\n"
            f"Traits: {self.traits}\n"
            f"Contacts: {self.contacts}\n"
            f"Description: {self.description}\n"
            f"Skill to Increase: {self.skill_to_increase}"
        )

# Example Usage:
# persona = Persona(name="Cass Valen", motivation="To find her missing sister.", plan="Track rumors of disappearances in sector 7.")
# persona.add_trait("Analytical")
# persona.add_contact("Rik", "Neutral", "Ex-smuggler with contacts in every port.")
# persona.add_hardship("Ship sabotaged", "Learned to trust her instincts, not just others.")
# print(persona.describe())

from typing import List, Dict, Optional, Any

class PowerAbility:
    """A single node/power in a superpower tree."""
    def __init__(self, name: str, level: int, activation_cost: str, duration: str, 
                 range_: str, uses: Any, effect: str, dependencies: Optional[List[str]] = None):
        self.name = name
        self.level = level
        self.activation_cost = activation_cost
        self.duration = duration
        self.range_ = range_
        self.uses = uses  # Can be "Unlimited", int, or a callable for dynamic uses
        self.effect = effect
        self.dependencies = dependencies or []
        self.uses_remaining = uses if isinstance(uses, int) else None

    def can_use(self):
        if isinstance(self.uses, int):
            return self.uses_remaining and self.uses_remaining > 0
        return True

    def use(self):
        if isinstance(self.uses, int):
            if self.uses_remaining > 0:
                self.uses_remaining -= 1
                return True
            else:
                return False
        return True

    def reset(self):
        if isinstance(self.uses, int):
            self.uses_remaining = self.uses

class SuperPower:
    """A generic base class for superpowers."""
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.abilities: Dict[str, PowerAbility] = {}
        self.unlocked: Dict[str, PowerAbility] = {}
        self.level = 0
        self.power_points = 0

    def unlock_ability(self, name: str):
        ability = self.abilities.get(name)
        if ability and all(dep in self.unlocked for dep in ability.dependencies):
            self.unlocked[name] = ability

    def use_ability(self, name: str) -> Optional[str]:
        ability = self.unlocked.get(name)
        if not ability:
            return f"Ability '{name}' not unlocked."
        if not ability.can_use():
            return f"No uses remaining for '{name}'."
        if not ability.use():
            return f"No uses remaining for '{name}'."
        return ability.effect

    def reset_uses(self):
        for a in self.unlocked.values():
            a.reset()

    def available_abilities(self) -> List[str]:
        return list(self.unlocked.keys())

class BurnControl(SuperPower):
    def __init__(self):
        super().__init__(
            name="Burn Control",
            description=(
                "Burn control is a powerful ability that allows the user to manipulate and control fire. "
                "It has five levels, each providing access to more potent and complex abilities."
            )
        )
        self._init_abilities()
        self.unlock_ability("Thermal Control")  # Starting ability

    def _init_abilities(self):
        self.abilities = {
            "Thermal Control": PowerAbility(
                name="Thermal Control",
                level=0,
                activation_cost="When an unarmed or melee attack is used",
                duration="Instant",
                range_="Self",
                uses="Unlimited",
                effect="Control temperature of hands, deal +1d4 thermal damage on melee/unarmed, take 2 damage self.",
                dependencies=[]
            ),
            "Heat Resistant": PowerAbility(
                name="Heat Resistant",
                level=1,
                activation_cost="Passive",
                duration="N/A",
                range_="N/A",
                uses="N/A",
                effect="Resistant to Thermal Damage, take half damage including self-damage.",
                dependencies=["Thermal Control"]
            ),
            # ...Add all other abilities from your power tree...
        }

STARTING_EQUIPMENT = {
    "Medieval Age": {
        "Pack 1": [
            "Calling Horns",
            "Wood Ax",
            "Hammer",
            "Rope",
            "Chisel",
            "2 Medieval Age Medicines of your choice"
        ],
        "Pack 2": [
            "Signal Flare Manual",
            "Flint & Stone",
            "Rope",
            "Spade",
            "Carving Knife",
            "2 Medieval Age Medicines of your choice"
        ]
    },
    "Colonial Age": {
        "Pack 1": [
            "Signal Flag Manual",
            "Signal Flags",
            "Tinker's Tools",
            "Compass",
            "Rope",
            "Fishing Kit",
            "Hunting Traps",
            "Backpack",
            "Camping Tent",
            "2 Colonial Age Medicines of your choice"
        ],
        "Pack 2": [
            "Smoke Signal Manual",
            "Matches",
            "Blacksmith Tools",
            "Campfire Kit",
            "Hunting Knife",
            "Backpack",
            "Rope",
            "Camping Tent",
            "2 Colonial Age Medicines of your choice"
        ]
    },
    "Modern Age": {
        "Pack 1": [
            "Solar Powerbank",
            "Portable Solar Lantern",
            "Walkie Talkies",
            "Propane Heater",
            "Bluetooth Speaker",
            "Handheld Radio",
            "CB Radio",
            "Tent",
            "Sleeping Bag",
            "Compass",
            "1 Modern Age Medicine that Cost 2000 Credits or less"
        ],
        "Pack 2": [
            "Solar LED Light",
            "Solar Charging Panel",
            "Walkie Talkies",
            "Camp Stove",
            "Portable Cooler",
            "Rope",
            "Hammock",
            "Compass",
            "Flask",
            "1 Modern Age Medicine that Cost 2000 Credits or less"
        ]
    },
    "Space Age": {
        "Pack 1": [
            "Ion Battery",
            "Wrist Sliver",
            "Data Pad",
            "Atmosuit",
            "Mess Kit",
            "Ruffage Finder",
            "Cord",
            "1 Space Age Medicine of 20,000 Credits or less"
        ],
        "Pack 2": [
            "Portable Solar Array",
            "Wrist Sliver",
            "Data Drive",
            "Monitor",
            "Atmosuit",
            "Rations",
            "Tent",
            "Survivor Compass",
            "1 Space Age Medicine of 20,000 Credits or less"
        ]
    }
}

from typing import List, Dict, Optional

class AttributeBlock:
    def __init__(self, constitution=10, dexterity=10, wisdom=10, intelligence=10, charisma=10):
        self.constitution = constitution
        self.dexterity = dexterity
        self.wisdom = wisdom
        self.intelligence = intelligence
        self.charisma = charisma

class Skill:
    def __init__(self, name: str, attribute: str, level: int = 0, bonus: int = 0):
        self.name = name
        self.attribute = attribute
        self.level = level
        self.bonus = bonus

class Weapon:
    def __init__(self, name: str, bonus: int, damage_type: str, damage: str, description: str):
        self.name = name
        self.bonus = bonus
        self.damage_type = damage_type
        self.damage = damage
        self.description = description

class ArmorPiece:
    def __init__(self, variation: str, base: int, hindrance: int, resistance: str, ar_increase: int, ap: int):
        self.variation = variation
        self.base = base
        self.hindrance = hindrance
        self.resistance = resistance
        self.ar_increase = ar_increase
        self.ap = ap

class SuperPowerBlock:
    def __init__(self, name: str, level_data: Optional[Dict[int, str]] = None, total_points=0, spent_points=0):
        self.name = name
        self.level_data = level_data if level_data else {lvl: "" for lvl in range(6)}
        self.total_points = total_points
        self.spent_points = spent_points

class CharacterSheet:
    def __init__(self,
                 name: str,
                 race: str,
                 profession: str,
                 training: str,
                 level: int = 1,
                 age: Optional[int] = None,
                 height: Optional[str] = None,
                 weight: Optional[str] = None,
                 eye_color: Optional[str] = None,
                 hair_color: Optional[str] = None,
                 vision: Optional[str] = None,
                 resistance: Optional[str] = None,
                 attributes: Optional[AttributeBlock] = None,
                 skills: Optional[List[Skill]] = None,
                 weapons: Optional[List[Weapon]] = None,
                 armor: Optional[List[ArmorPiece]] = None,
                 layered_armor: Optional[List[ArmorPiece]] = None,
                 inventory: Optional[List[str]] = None,
                 credits: int = 0,
                 hp_current: int = 10,
                 hp_max: int = 10,
                 armor_rating: int = 0,
                 armor_points_current: int = 0,
                 armor_points_max: int = 0,
                 initiative: int = 0,
                 movement: int = 0,
                 inspiration: Optional[str] = None,
                 super_power: Optional[SuperPowerBlock] = None):
        self.name = name
        self.race = race
        self.profession = profession
        self.training = training
        self.level = level
        self.age = age
        self.height = height
        self.weight = weight
        self.eye_color = eye_color
        self.hair_color = hair_color
        self.vision = vision
        self.resistance = resistance
        self.attributes = attributes if attributes else AttributeBlock()
        self.skills = skills if skills else []
        self.weapons = weapons if weapons else []
        self.armor = armor if armor else []
        self.layered_armor = layered_armor if layered_armor else []
        self.inventory = inventory if inventory else []
        self.credits = credits
        self.hp_current = hp_current
        self.hp_max = hp_max
        self.armor_rating = armor_rating
        self.armor_points_current = armor_points_current
        self.armor_points_max = armor_points_max
        self.initiative = initiative
        self.movement = movement
        self.inspiration = inspiration
        self.super_power = super_power

    def add_skill(self, skill: Skill):
        self.skills.append(skill)

    def add_weapon(self, weapon: Weapon):
        self.weapons.append(weapon)

    def add_armor(self, armor_piece: ArmorPiece, layered=False):
        if layered:
            self.layered_armor.append(armor_piece)
        else:
            self.armor.append(armor_piece)

    def add_inventory(self, item: str):
        self.inventory.append(item)

    def set_super_power(self, super_power: SuperPowerBlock):
        self.super_power = super_power

    def to_dict(self) -> Dict:
        # Export all character info as a dict (for saving or serialization)
        return self.__dict__

# -- Example Usage --
sheet = CharacterSheet(
    name="Selene Drax",
    race="Human",
    profession="Pilot",
    training="Military Academy"
)

sheet.add_skill(Skill("Art", "Charisma", 2, 1))
sheet.add_weapon(Weapon("Laser Pistol", 1, "Energy", "1d8", "Standard issue sidearm"))
sheet.add_armor(ArmorPiece("Nano Suit", 4, 0, "Thermal", 2, 5))
sheet.add_inventory("Ration Pack")
sheet.set_super_power(SuperPowerBlock("Burn Control"))

print(sheet.to_dict())



def take_damage(self, damage):
        self.health -= damage
        print(f"{self.name} takes {damage} damage! Health is now {self.health}.")
        if self.health <= 0:
            print(f"{self.name} has been defeated!")
class Weapon:
    def __init__(self, name, attack=0, damage=0, enchantment=None, special_effect=None):
        self.name = name
        self.attack = attack
        self.damage = damage
        self.enchantment = enchantment  # Can be a function
        self.special_effect = special_effect  # Can be a function

    def to_hit(self, die_roll, player_skill):
        bonus = self.attack
        if self.enchantment:
            bonus += self.enchantment()
        return die_roll + player_skill + bonus

    def apply_special(self, target):
        if self.special_effect:
            self.special_effect(target)

