<div align="center">
  <div>
    <img src="https://github.com/lemoncloud-io/eurekabox-front/blob/main/assets/src/logo/box-purple-symbol.png?raw=true" width="300" alt="EurekaBox"/>
    <h1 align="center">EurekaBox</h1>
  </div>
  <p>
    A powerful SaaS documentation platform, available exclusively through <a href="https://eureka.codes/" target="_blank">EurekaCodes</a>
  </p>
</div>

<div align="center" markdown="1">

[![tak-bro](https://img.shields.io/badge/by-lemoncloud--io-ED6F31?logo=github)](https://github.com/lemoncloud-io)
[![license](https://img.shields.io/badge/license-MIT-211A4C.svg?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0ibTMgNiAzIDFtMCAwLTMgOWE1IDUgMCAwIDAgNi4wMDEgME02IDdsMyA5TTYgN2w2LTJtNiAyIDMtMW0tMyAxLTMgOWE1IDUgMCAwIDAgNi4wMDEgME0xOCA3bDMgOW0tMy05LTYtMm0wLTJ2Mm0wIDE2VjVtMCAxNkg5bTMgMGgzIi8+PC9zdmc+)](https://github.com/lemoncloud-io/eureka-box/blob/main/LICENSE)

</div>

---

EurekaBox is a powerful SaaS (Software as a Service) documentation platform, available exclusively through [EurekaCodes](https://eureka.codes/). It provides teams with an intuitive document editor to create, share, and manage documentation efficiently, enabling team members to focus on their work while maintaining clear and accessible documentation.

## 🌟 Getting Started with EurekaBox

1. Visit [EurekaCodes](https://eureka.codes/) to subscribe to the service
2. Create your workspace through the EurekaCodes dashboard
3. Start creating your team documentation

## Features

-   **📝 Rich Document Editor** - Create and edit documents with a powerful WYSIWYG editor
-   **🗂 Smart Organization** - Organize documents with intuitive folder structures and tags
-   **🔍 Quick Search** - Find documents instantly with powerful search capabilities
-   **🔐 Secure Sharing** - Control access to your documents with granular permissions

## Tech Stack

-   **Frontend Framework:** React with TypeScript
-   **Project Structure:** Nx Monorepo
-   **State Management:** TanStack Query
-   **Styling:** Tailwind CSS
-   **UI Components:** Radix UI
-   **API Integration:** Axios
-   **Internationalization:** i18next

## Project Structure

    .
    apps/
    ├── web/                    # Main web application
    assets/                     # Shared assets
    libs/
    ├── contents/               # Content management features
    ├── shared/                 # Shared components and utilities
    ├── storage-transfer/       # Storage transfer functionality
    ├── theme/                  # Theme management
    ├── ui-kit/                 # UI component library
    └── web-core/               # Core web functionalities

## Getting Started

### Prerequisites

-   Node.js (v20 or higher)
-   npm or yarn
-   Git

### Installation

1. Clone the repository

```bash
$ git clone https://github.com/lemoncloud-io/eurekabox-front.git
$ cd eurekabox-front
```

2. Install dependencies

```bash
$ yarn install
```

3. Set up environment variables

```bash
$ cp apps/web/.env.example apps/web/.env.local
```

4. Start the development server

```
$ yarn web:start
```

The application will be available at http://localhost:5001

## Contributing

1. Fork the repository
2. Create your feature branch ( git checkout -b feature/amazing-feature )
3. Commit your changes ( git commit -m 'feat: add amazing feature' )
4. Push to the branch ( git push origin feature/amazing-feature )
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

-   Built with Nx
-   UI components from Radix UI
-   Styling with Tailwind CSS

## Disclaimer and Risks

This project uses functionalities from external APIs but is not officially affiliated with or endorsed by their providers. Users are responsible for complying with API terms, rate limits, and policies.

---

If this project has been helpful, please consider giving it a Star ⭐️!
