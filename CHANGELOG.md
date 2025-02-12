# Changelog

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
