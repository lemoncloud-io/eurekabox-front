# Changelog

## [2025-05-26] - root@0.22.1, @eurekabox/web@0.22.1

### Refactor

-   chatbot page style

## [2025-03-05] - root@0.22.0, @eurekabox/web@0.22.0

### Features

-   add jsdoc comments for web-core

### Documentation

-   update READMEs for libs and root

## [2025-03-05] - root@0.21.1, @eurekabox/web@0.21.1

### Refactor

-   darkmode loader, selection color

## [2025-03-05] - root@0.21.0, @eurekabox/web@0.21.0

### Features

-   add env vars to github actions
-   remove unused search functionality

### Documentation

-   update README with project introduction
-   add LICENSE and update README
-   add README for contents and web-core
-   enhance README with architecure image

### Chores

-   add architecture.png

## [2025-03-04] - root@0.20.0, @eurekabox/web@0.20.0

### Features

-   add env variables for deployment

## [2025-02-28] - root@0.19.0, @eurekabox/web@0.19.0

### Features

-   add token validation in refreshToken

## [2025-02-27] - root@0.18.2, @eurekabox/web@0.18.2

### Refactor

-   dialog z-index

## [2025-02-26] - root@0.18.1, @eurekabox/web@0.18.1

### Refactor

-   detail style

## [2025-02-26] - root@0.18.0, @eurekabox/web@0.18.0

### Features

-   add bookmark functionality to contents
-   add bookmark functionality to content page
-   display bookmarked content in sidebar
-   add create child content functionality
-   add children to content list
-   refactor content list display
-   improve sidebar content display
-   add caching to child content creation
-   add support for expanding parent content items
-   remove floating action button
-   limit content item nesting depth
-   add max length to page title input
-   add active title to sidebar
-   update query cache to include content with activity
-   search all content, including children
-   (i18n) add 'no bookmarks' translation

### Bug Fixes

-   update sidebar logic to handle nested content

### Documentation

-   update README with project info

### Refactor

-   remove unused dashboard components
-   refactor folder structure
-   extract activity update logic

### Chores

-   remove unused code

## [2025-02-25] - root@0.17.1, @eurekabox/web@0.17.1

### Refactor

-   search detail style

## [2025-02-20] - root@0.17.0, @eurekabox/web@0.17.0

### Features

-   persist language preference in local storage
-   add query retry to improve resilience

### Chores

-   update lemon-web-core dependency

## [2025-02-12] - root@0.16.1, @eurekabox/web@0.16.1

### Refactor

-   language button style

## [2025-02-12] - root@0.16.0, @eurekabox/web@0.16.0

### Features

-   show logout message after logout

## [2025-02-12] - root@0.15.0, @eurekabox/web@0.15.0

### Features

-   show loader while saving
-   disable title edit in editor layout
-   add title input ref
-   improve editor focus handling
-   update focus logic on content update page
-   add child content creation to side bar
-   improve search dialog UI and UX
-   update dashboard page to display contents
-   display current content title in sidebar
-   add i18n support
-   support language in all pages
-   add language toggle button with images

## [2025-02-12] - root@0.14.1, @eurekabox/web@0.14.1

### Refactor

-   add home page
-   nav style, input remove btn

## [2025-02-11] - root@0.14.0, @eurekabox/web@0.14.0

### Features

-   add error-case.json to public directory

### Bug Fixes

-   hide menu button when sidebar is open

### Refactor

-   redirect to home from root path

## [2025-02-11] - root@0.13.1, @eurekabox/web@0.13.1

### Refactor

-   detail style

## [2025-02-11] - root@0.13.0, @eurekabox/web@0.13.0

### Features

-   change default title to 'New Page'
-   move 'New Page' button to bottom
-   make logo clickable to navigate home
-   support dark theme in Sidebar

## [2025-02-11] - root@0.12.0, @eurekabox/web@0.12.0

### Features

-   update routes for cleaner URLs
-   update eureka box logo

## [2025-02-10] - root@0.11.0, @eurekabox/web@0.11.0

### Features

-   add eureka box logo to login page
-   improve sidebar UI and functionality
-   add search dialog to side bar
-   highlight home button when on home page

## [2025-02-10] - root@0.10.0, @eurekabox/web@0.10.0

### Features

-   fetch all contents at once
-   improve search dialog with highlighting
-   update contents list after content update

### Bug Fixes

-   logout on init error to prevent loop
-   update content title in query cache

## [2025-01-24] - root@0.9.3, @eurekabox/web@0.9.3

### Bug Fixes

-   handle refresh token error

### Chores

-   update favicon

## [2025-01-16] - root@0.9.2, @eurekabox/web@0.9.2

### Bug Fixes

-   update code to correctly handle storage receiver initialization

## [2025-01-15] - root@0.9.1, @eurekabox/web@0.9.1

### Bug Fixes

-   disable fail-fast strategy in deploy workflows

## [2025-01-15] - root@0.9.0, @eurekabox/web@0.9.0

### Features

-   ensure data transfer reliability

### Chores

-   update Slack message icon

## [2025-01-14] - root@0.8.0, @eurekabox/web@0.8.0

### Features

-   add token-transfer lib
-   increase timeout for storage transfer

## [2025-01-07] - root@0.7.4, @eurekabox/web@0.7.4

### Refactor

-   side nav style, darkmode style

## [2025-01-03] - root@0.7.3, @eurekabox/web@0.7.3

### Chores

-   improve eslint rules

### Other

-   style: set eslint new rule

## [2025-01-03] - root@0.7.2, @eurekabox/web@0.7.2

### Other

-   style: set curly rule

## [2025-01-03] - root@0.7.1, @eurekabox/web@0.7.1

### Chores

-   update @yoopta packages

### Other

-   style: set eslint-import plugin

## [2024-12-31] - root@0.7.0, @eurekabox/web@0.7.0

### Features

-   add page leave blocker
-   add export options for markdown and html

### Refactor

-   improve content caching
-   move beforeunload to shared hook

### Chores

-   update @yoopta packages to 4.9.3

### Other

-   perf: (web) reduce unnecessary content updates
-   perf: (web) parallelize element updates

## [2024-12-30] - root@0.6.1, @eurekabox/web@0.6.1

### Refactor

-   dark mode color, detail style

## [2024-12-27] - root@0.6.0, @eurekabox/web@0.6.0

### Features

-   preserve redirect URL after login

## [2024-12-27] - root@0.5.0, @eurekabox/web@0.5.0

### Features

-   update paths-filter dependency

## [2024-12-23] - root@0.4.1, @eurekabox/web@0.4.1

### Bug Fixes

-   conditionally render import button
-   prevent duplicate content loading

## [2024-12-23] - root@0.4.0, @eurekabox/web@0.4.0

### Features

-   support html import in editor

### Chores

-   update deploy message url

## [2024-12-23] - root@0.3.0, @eurekabox/web@0.3.0

### Features

-   add markdown import functionality
-   add tooltip for markdown import button

### Refactor

-   rename Sidebar to SideBar

## [2024-12-20] - root@0.2.0, @eurekabox/web@0.2.0

### Features

-   set link target to \_blank

### Chores

-   simplify deploy message logic

### Other

-   ci: improve deploy workflow

## [2024-12-20] - root@0.1.1, @eurekabox/web@0.1.1

### Bug Fixes

-   fix nx.json configuration
-   update deployment message format

## [2024-12-19] - root@0.1.0, @eurekabox/web@0.1.0

### Features

-   add markdown export functionality
-   add export markdown functionality

### Chores

-   add version update script

### Other

-   ci: update deployment workflow

All notable changes to this project will be documented in this file.
