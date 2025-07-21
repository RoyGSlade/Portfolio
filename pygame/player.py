import random


def roll_die(sides):
  return(random.randint(1,sides))


class Item:
   def __init__(self,name,value):
      self.name = name
      self.value = value

class Weapon(Item):
   def __init__(self,name,value,damage_die,bonus):
    super().__init__(name, value)
    self.damage_die = damage_die
    self.bonus = bonus

class Armor(Item):
   def __init__(self,name,value,armor_points,rating_increase):
    super().__init__(name, value)
    self.armor_points = armor_points
    self.rating_increase = rating_increase

class Consumable(Item):
   def __init__(self,name,value,uses,effect):
    super().__init__(name, value)
    self.uses = uses
    self.effect = effect
      
      

potion_healing_light = Consumable("Light Healing Brew", 50,2, "heals user by 2 hitpoints")


padded_leather = Armor("Padded Leather", 200, 5, 3)

steel_club = Weapon("Steel Club",100,10,3)


class Player:
    def __init__(self,name,race,background,hitPoints,armor_rating,constitution,dexterity,wisdom,intelligence,charisma,weapon,armor,items):
        self.name = name
        self.race = race
        self.background = background
        self.hitpoints = hitPoints
        self.armor_rating = armor_rating
        self.constitution = constitution
        self.dexterity = dexterity
        self.wisdom = wisdom
        self.intelligence = intelligence
        self.charisma = charisma
        self.weapon = weapon
        self.armor = armor
        self.items = items
        
    def attack(self,target):
     to_hit = roll_die(20) + self.weapon.bonus + self.constitution
     if to_hit > target.armor_rating:
        damage_dealt = self.constitution + roll_die(self.weapon.damage_die)
        target.health -= damage_dealt
        print(damage_dealt)
     else: 
        print("Swing and a miss")
    

    def light_healing_brew(self):
     for item in self.items:
       if item.name == "Light Healing Brew" and item.uses > 0:
        item.uses -= 1
        self.hitpoints += 2
        print(self.name + "uses Light Healing Brew! Heals 2 HP!!! ")
        return
     print("No Light Healing Brew to use")
            
        


Donaven = Player("Donaven","Human","Master of Code", 8, 10, 5,16,10,12,14, steel_club, padded_leather, [potion_healing_light])



class Enemy:
   def __init__(self,name,health,armor_rating,damage,to_hit):
      self.name = name
      self.health = health
      self.armor_rating = armor_rating
      self.damage = damage 
      self.to_hit = to_hit

TrainingDummy = Enemy("dummy",10,12,0,0)

Donaven.attack(TrainingDummy)