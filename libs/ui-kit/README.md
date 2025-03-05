# ui-kit

This library was generated with [Nx](https://nx.dev) and contains shared UI components for the application.

## Project Structure

```
libs/ui-kit/
├── src/
│   ├── components/
│   │   └── ui/            # Shadcn/ui components with custom modifications
│   │       ├── alert.tsx
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...        # Other UI components
│   ├── hooks/             # Custom hooks
│   │   └── use-toast.ts
│   └── utils/             # Utility functions
│       └── index.ts
├── project.json           # Nx project configuration
└── tsconfig.json          # TypeScript configuration
```

## Key Components

-   `components/ui/`: Contains customized Shadcn/ui components (Button, Card, Dialog, etc.)
-   `hooks/`: Includes application-specific hooks like toast notifications
-   `utils/`: Shared utility functions like `cn()` for class merging

## Running unit tests

Run `nx test ui-kit` to execute the unit tests via [Jest](https://jestjs.io).

## Adding Shadcn/ui Components

```shell
npx shadcn@latest add accordion
npx shadcn@latest add button
```
