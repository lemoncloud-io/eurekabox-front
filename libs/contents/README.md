# Contents Library

Core content management library for EurekaBox, handling document creation, management, and organization.

## Overview

The contents library provides essential functionalities for managing documents and their elements within EurekaBox:

-   Document CRUD operations
-   Document search and filtering
-   Document activity tracking
-   Element management within documents
-   Image upload handling

## Key Features

### Document Management

-   Create, read, update, and delete documents
-   Support for nested document hierarchies
-   Document metadata management
-   Activity tracking for documents

### Search & Organization

-   Powerful document search functionality
-   Pagination support
-   Infinite scroll capabilities
-   Filtering and sorting options

### Element Management

-   Create and manage document elements
-   Support for various element types
-   Element ordering and organization
-   Element metadata handling

### Image Handling

-   Image upload support
-   Progress tracking for uploads
-   Image metadata management
-   Integration with image API

## Usage

### Document Operations

```typescript
import { useContent, useCreateContent, useUpdateContent } from '@eurekabox/contents';

// Fetch a document
const { data: content } = useContent(contentId);

// Create a new document
const createContent = useCreateContent();
await createContent.mutateAsync(newContentData);

// Update a document
const updateContent = useUpdateContent();
await updateContent.mutateAsync({ contentId, ...updateData });
```

### Search & List Documents

```typescript
import { useContents, useSearchContents } from '@eurekabox/contents';

// List documents with pagination
const { data: contents } = useContents({
    page: 0,
    limit: 10,
});

// Search documents
const { data: searchResults } = useSearchContents({
    name: searchTerm,
    limit: 10,
});
```

## Configuration

The library requires the following environment variables:

```env
VITE_CONTENT_ENDPOINT=   # Content service endpoint
VITE_IMAGE_API_ENDPOINT= # Image API endpoint
```

## Dependencies

-   @lemoncloud/eureka-contents-api
-   @lemoncloud/lemon-web-core
-   @tanstack/react-query
-   axios

## Project Structure

```plaintext
src/
├── api/        # API integration with content service
├── consts/     # Constants and query keys
├── hooks/      # React hooks for content operations
├── types/      # TypeScript type definitions
└── index.ts    # Public API exports
```
