# OpenAI Player Art Pipeline

This project includes an optional script that generates transparent-background character art for the player.

## Command

```bash
OPENAI_API_KEY=your_key_here node scripts/generate-player-art.mjs
```

Optional overrides:

```bash
OPENAI_IMAGE_MODEL=gpt-image-1.5 \
OPENAI_IMAGE_PROMPT="Original side-view rabbit-man..." \
OPENAI_API_KEY=your_key_here \
node scripts/generate-player-art.mjs
```

## Default art direction

- original rabbit-man platformer character
- side view, facing right
- large readable kicking leg
- compact silhouette for gameplay readability
- soft cartoon shading
- transparent background
- not based on any existing copyrighted character

## Output

The script writes:

- `public/generated/rabbit-striker.png`

That file is intentionally outside `src/` so artists can regenerate it without touching gameplay code.
