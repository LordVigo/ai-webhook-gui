# Contributing to WebhookUI

Thank you for your interest in contributing to WebhookUI! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/WebhookUI.git
   cd WebhookUI
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Include explicit type annotations for function parameters and return types
- Avoid using `any` type unless absolutely necessary
- Use interfaces for object types
- Enable strict mode in TypeScript configuration

### React Components

- Use functional components with hooks
- Include JSDoc comments for component documentation
- Define prop types using TypeScript interfaces
- Follow component file structure:
  ```typescript
  // Imports
  import React from 'react';
  
  // Types/Interfaces
  interface Props {
    // ...
  }
  
  // Component
  const Component = ({ ...props }: Props) => {
    // ...
  };
  
  export default Component;
  ```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theme values
- Keep styles modular and component-specific

## Testing

- Write tests for new features and bug fixes
- Use Vitest for unit and integration tests
- Follow test file naming convention: `*.test.tsx`
- Include both positive and negative test cases
- Mock external dependencies appropriately

Example test structure:
```typescript
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('should render correctly', () => {
    // ...
  });

  it('should handle user interaction', () => {
    // ...
  });
});
```

## Git Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Keep your branch up to date:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. Push your changes:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or modifying tests
- `chore:` Maintenance tasks

## Pull Request Process

1. Update documentation for any new features
2. Add or update tests as needed
3. Ensure all tests pass locally
4. Fill out the pull request template completely
5. Request review from maintainers
6. Address review feedback
7. Ensure CI checks pass

## Documentation

- Update README.md for new features or changes
- Include JSDoc comments for all functions and components
- Document complex logic with inline comments
- Update API documentation if applicable
- Include examples for new features

## Code Review Guidelines

When reviewing code:

1. Check for TypeScript type safety
2. Verify test coverage
3. Review documentation updates
4. Check for code style consistency
5. Verify performance implications
6. Look for security concerns
7. Ensure accessibility standards

## Development Tools

- VSCode with recommended extensions
- ESLint for code linting
- Prettier for code formatting
- Vitest for testing
- React DevTools for debugging

## Getting Help

- Check existing issues and pull requests
- Join our community chat
- Read the documentation
- Ask questions in discussions

## License

By contributing to WebhookUI, you agree that your contributions will be licensed under the project's license.
