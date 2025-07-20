import pygame
import sys

# Initialize Pygame
pygame.init()

# Set up display
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Character Creator")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# Basic font
font = pygame.font.SysFont(None, 48)

def draw_text(text, x, y, color=BLACK):
    img = font.render(text, True, color)
    screen.blit(img, (x, y))

def main():
    clock = pygame.time.Clock()
    running = True

    while running:
        screen.fill(WHITE)
        draw_text("Welcome to Character Creator!", 100, 100)
        draw_text("Press ESC to quit.", 100, 200)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()