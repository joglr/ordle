## DX

- [ ] Add lint-staged
  - [ ] Prettier
  - [ ] ESLint
  - [ ] TypeScript
  - [ ] Jest
- [ ] Show todo list in app

```typescript
import { promises as fs } from "fs";
const todos = fs.readFile("./../../TODO.md");

export function getStaticProps() {
  return {
    props: { todo },
  };
}
```

## Game

- [ ] Implement word checking
  - [ ] Calculate cell colors on server
- [ ] Implement flipping animation
- [ ] Implement game over -> Reveal word
- [ ] Implement typing animation
- [ ] Implement keyboard input
- [ ] Implement help menu

## Data

- [ ] Handle words with multiple meanings (e.g. 1. skole, 2. skole)

## Bugs:

- [ ] Kan ikke skrive i det sidste forsøg
