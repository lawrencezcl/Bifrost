# Contributing to FrostyFlow

Thank you for your interest in contributing to FrostyFlow! This document provides guidelines and information for contributors.

## 🤝 Welcome Contributors

We welcome all forms of contributions, including but not limited to:
- 🐛 Bug reports and fixes
- ✨ New features and enhancements
- 📝 Documentation improvements
- 🎨 UI/UX improvements
- 🧪 Testing and quality assurance
- 📊 Performance optimizations

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Git**: Basic understanding of Git and GitHub
- **React**: Familiarity with React hooks and modern patterns
- **CSS**: Understanding of responsive design and CSS-in-JS

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork locally
   git clone https://github.com/YOUR_USERNAME/frosty-flow.git
   cd frosty-flow
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm run test
   ```

5. **Check Code Quality**
   ```bash
   npm run lint
   ```

## 📋 Development Guidelines

### Code Style

We use ESLint and Prettier to maintain consistent code style:

```bash
# Format code
npm run format

# Fix linting issues
npm run lint:fix
```

### Component Structure

Follow this component structure:

```jsx
// Component imports
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Typography } from 'antd';

// Component implementation
const ComponentName = ({ prop1, prop2 }) => {
  // Hooks
  const [localState, setLocalState] = useState(null);
  const dispatch = useDispatch();
  const globalState = useSelector(state => state.example);

  // Effects
  useEffect(() => {
    // Side effects
  }, []);

  // Event handlers
  const handleAction = () => {
    // Handle user actions
  };

  // Render
  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
};

// Props validation (if using PropTypes)
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

export default ComponentName;
```

### File Naming

- **Components**: PascalCase (e.g., `WalletConnector.jsx`)
- **Services**: camelCase (e.g., `walletService.js`)
- **Utils**: camelCase (e.g., `formatUtils.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

### CSS Guidelines

- Use utility classes from `index.css`
- Follow BEM methodology for component-specific styles
- Ensure responsive design for mobile and desktop
- Use semantic HTML elements

```jsx
<div className="feature-container">
  <div className="feature-header">
    <h3 className="feature-title">Title</h3>
  </div>
  <div className="feature-content">
    {/* Content */}
  </div>
</div>
```

## 🔧 Branch Strategy

### Branch Naming

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/feature-name` - New features
- `fix/issue-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/component-name` - Code refactoring

### Workflow

1. **Create Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**
   - Write clean, well-documented code
   - Follow coding standards
   - Add tests if applicable

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/new-feature
   # Create Pull Request on GitHub
   ```

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect code meaning (white-space, formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```bash
feat(wallet): add multi-wallet support for Talisman
fix(dashboard): resolve asset loading issue on mobile
docs(readme): update installation instructions
style(analytics): improve chart responsive design
refactor(components): extract common card component
perf(launch): optimize initial bundle size
test(transaction): add transaction service unit tests
chore(deps): update React to latest version
```

## 🐛 Bug Reporting

### Before Reporting

1. **Check existing issues** - Search for similar reports
2. **Try to reproduce** - Ensure the issue is reproducible
3. **Test latest version** - Verify the issue exists in the latest code

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 95, Firefox 94]
- Device: [e.g. Desktop, Mobile]
- Version: [e.g. v1.2.3]

## Additional Context
Add any other context about the problem here.
```

## ✨ Feature Requests

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of the feature you want to add.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How do you envision this feature working?

## Alternatives Considered
What other approaches have you considered?

## Additional Context
Add any other context or screenshots about the feature request here.
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

### Writing Tests

- Test components with React Testing Library
- Test Redux slices with appropriate tools
- Mock external dependencies
- Test both happy paths and error scenarios
- Ensure tests are maintainable and readable

### Test Structure

```jsx
// __tests__/ComponentName.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  test('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    const mockHandler = jest.fn();
    render(<ComponentName onAction={mockHandler} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

## 📖 Documentation

### Documentation Types

- **README.md**: Project overview and getting started
- **API Documentation**: Code documentation with JSDoc
- **Component Documentation**: Props and usage examples
- **Guides**: Step-by-step tutorials

### Writing Documentation

- Use clear, concise language
- Include code examples
- Add screenshots for UI components
- Keep documentation up to date
- Use consistent formatting

## 🎨 UI/UX Guidelines

### Design Principles

- **User First**: Prioritize user experience
- **Consistency**: Maintain design consistency across components
- **Accessibility**: Ensure WCAG 2.1 AA compliance
- **Mobile First**: Design for mobile devices first
- **Performance**: Optimize for fast loading and interactions

### Component Guidelines

- Use Ant Design components as base
- Customize with theme tokens when needed
- Ensure responsive design
- Add loading states and error handling
- Include proper hover and focus states

## 🚀 Pull Request Process

### Before Submitting

1. **Code Review**: Self-review your changes
2. **Tests**: Ensure all tests pass
3. **Documentation**: Update relevant documentation
4. **Linting**: Fix all linting issues

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Ready for review
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews the changes
3. **Testing**: Changes are tested in different environments
4. **Merge**: Once approved, changes are merged to main branch

## 🔒 Security Guidelines

### Security Considerations

- Never commit sensitive information (API keys, passwords)
- Validate all user inputs
- Use HTTPS for all external requests
- Follow secure coding practices
- Report security vulnerabilities privately

### Reporting Security Issues

Email security issues to: security@frostyflow.dev

## 📊 Performance Guidelines

### Performance Best Practices

- **Bundle Size**: Keep JavaScript bundle under 3MB
- **Images**: Optimize images and use appropriate formats
- **Lazy Loading**: Implement code and data lazy loading
- **Caching**: Use appropriate caching strategies
- **Monitoring**: Monitor performance metrics

### Performance Testing

```bash
# Build and analyze bundle size
npm run build
npm run analyze

# Run performance tests
npm run test:performance
```

## 🏆 Recognition

### Contributor Recognition

- Contributors are recognized in the README
- Significant contributors may be offered maintainer access
- Contributions are highlighted in release notes

### Getting Help

- **Discord**: Join our community for discussions
- **GitHub Issues**: Ask questions and report issues
- **Documentation**: Check existing documentation first

## 📄 License

By contributing to FrostyFlow, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You

Thank you for contributing to FrostyFlow! Your contributions help make this project better for everyone.

<div align="center">

**🌟 Happy Coding! 🌟**

Made with ❤️ by the FrostyFlow Team

</div>