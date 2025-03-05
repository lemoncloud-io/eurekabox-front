# Web Core Library

Core authentication and initialization library for EurekaBox, handling OAuth integration with EurekaCodes platform.

## Project Structure

```
libs/web-core/
├── src/
│   ├── core/            # Core configuration and initialization
│   │   └── index.ts     # Environment variables and webCore instance
│   ├── hooks/           # Application hooks
│   │   ├── useInitWebCore.ts
│   │   ├── useProfile.ts
│   │   └── ...         # Other hooks
│   ├── stores/          # Zustand state management
│   │   ├── useWebCoreStore.ts
│   │   └── index.ts
│   └── ...             # Additional source files
├── project.json         # Nx project configuration
└── package.json        # Library dependencies
```

## Overview

The web-core library manages essential functionalities:

-   Authentication and authorization with EurekaCodes
-   User profile management
-   Core initialization and configuration
-   Session management

## Key Features

### Authentication

-   OAuth integration with EurekaCodes
-   Token management
-   Session handling
-   Logout functionality

### Profile Management

-   User profile fetching and caching
-   Profile state management
-   Username updates

### Core Initialization

-   Environment-based configuration
-   Service initialization
-   Error handling

## Usage

### Initialize Web Core

```typescript
import { useInitWebCore } from '@eurekabox/web-core';

const App = () => {
    const isInitialized = useInitWebCore();

    if (!isInitialized) {
        return <LoadingScreen />;
    }

    return <YourApp />;
};
```

### Handle Authentication

```typescript
import { useWebCoreStore } from '@eurekabox/web-core';

const LoginPage = () => {
    const { isAuthenticated, logout } = useWebCoreStore();

    // Use authentication state and methods
};
```

### Manage User Profile

```typescript
import { useProfile } from '@eurekabox/web-core';

const ProfilePage = () => {
    const { fetchProfile } = useProfile();

    // Fetch and manage user profile
};
```

## Configuration

The library requires the following environment variables:

```env
VITE_ENV=              # Environment (dev/prod)
VITE_PROJECT=          # Project identifier
VITE_REGION=           # AWS region (default: ap-northeast-2)
VITE_OAUTH_ENDPOINT=   # EurekaCodes OAuth endpoint
```

## Dependencies

-   @lemoncloud/lemon-web-core
-   zustand (State management)
-   react (Peer dependency)

## Contributing

When contributing to this library, please:

1. Ensure all authentication logic is centralized here
2. Follow the established patterns for hooks and stores
3. Maintain type safety throughout the codebase
4. Add appropriate error handling
5. Update tests for any new functionality
