# EurekaBox

<p align="center">
  <img src="https://github.com/lemoncloud-io/eurekabox-front/blob/main/assets/src/logo/box-purple-logo2.png?raw=true" alt="EurekaBox Logo" width="200"/>
</p>

EurekaBox is a powerful SaaS (Software as a Service) documentation platform, available exclusively through [EurekaCodes](https://eureka.codes/). It provides teams with an intuitive document editor to create, share, and manage documentation efficiently, enabling team members to focus on their work while maintaining clear and accessible documentation.

## 🌟 Getting Started with EurekaBox

1. Visit [EurekaCodes](https://eureka.codes/) to subscribe to the service
2. Create your workspace through the EurekaCodes dashboard
3. Start creating your team documentation

## 🚀 Features

-   **📝 Rich Document Editor** - Create and edit documents with a powerful WYSIWYG editor
-   **🗂 Smart Organization** - Organize documents with intuitive folder structures and tags
-   **🔍 Quick Search** - Find documents instantly with powerful search capabilities
-   **🎨 Customizable Workspace** - Personalize your workspace with themes and layouts
-   **🔐 Secure Sharing** - Control access to your documents with granular permissions

## 🛠 Tech Stack

-   **Frontend Framework:** React with TypeScript
-   **Project Structure:** Nx Monorepo
-   **State Management:** TanStack Query
-   **Styling:** Tailwind CSS
-   **UI Components:** Radix UI
-   **API Integration:** Axios
-   **Internationalization:** i18next
-   **Testing:** Vitest

## 📁 Project Structure

apps/
├── web/ # Main web application
libs/
├── contents/ # Content management features
├── shared/ # Shared components and utilities
├── storage-transfer/ # Storage transfer functionality
├── theme/ # Theme management
├── ui-kit/ # UI component library
└── web-core/ # Core web functionalities

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-org/eurekabox-front.git
cd eurekabox-front
```

2. Install dependencies

```bash
yarn install
```

3. Set up environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

4. Start the development server

```
yarn web:start
```

The application will be available at http://localhost:5001

## 🧱 Available Scripts

-   yarn web:start - Start the development server
-   yarn web:build:dev - Build for development
-   yarn web:build:prod - Build for production
-   yarn lint - Run linting
-   yarn lint:fix - Fix linting issues
-   yarn prettier - Format code

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch ( git checkout -b feature/amazing-feature )
3. Commit your changes ( git commit -m 'feat: add amazing feature' )
4. Push to the branch ( git push origin feature/amazing-feature )
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Acknowledgments

-   Built with Nx
-   UI components from Radix UI
-   Styling with Tailwind CSS
