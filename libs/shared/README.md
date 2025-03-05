# shared

Shared utilities and components library for EurekaBox, generated with [Nx](https://nx.dev).

## Project Structure

```
libs/shared/
├── src/
│   ├── components/       # Reusable UI components and fallbacks
│   │   ├── ErrorFallback.tsx
│   │   ├── LoadingFallback.tsx
│   │   ├── GlobalLoader.tsx
│   │   └── ... │   ├── hooks/           # Custom React hooks
│   │   ├── useGlobalLoader.tsx
│   │   ├── useDebounce.ts
│   │   └── ... │   ├── types/           # Common type definitions
│   │   └── index.ts
│   └── index.ts         # Library entry point
├── project.json         # Nx project configuration
└── tsconfig.json        # TypeScript configuration
```

## Key Components

-   `components/`: Error boundaries, loading states, and global loaders
-   `hooks/`: Shared logic for loading states, local storage, and API interactions
-   `types/`: Common interface definitions like `ListResult<T>`

## Running Unit Tests

Run `nx test shared` to execute the unit tests via [Jest](https://jestjs.io).
