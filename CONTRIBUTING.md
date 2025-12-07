# Contributing to React DevTools Plus

Thank you for your interest in contributing to React DevTools Plus! This guide will help you get started.

## 🌟 Ways to Contribute

- **Report bugs** - Open an issue describing the problem
- **Request features** - Open an issue describing your use case
- **Fix bugs** - Submit a PR with the fix
- **Add features** - Discuss in an issue first, then submit a PR
- **Improve documentation** - Fix typos, add examples, clarify explanations
- **Share feedback** - Tell us about your stack and pain points

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 16.0.0
- pnpm >= 10.0.0

### Getting Started

1. **Fork the repository**

   Click the "Fork" button at the top right of the [repository page](https://github.com/wzc520pyfm/react-devtools-plus).

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/react-devtools-plus.git
   cd react-devtools-plus
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Start development mode**

   ```bash
   pnpm dev
   ```

5. **Run the playground**

   ```bash
   # Vite playground
   pnpm play

   # Webpack playground
   pnpm play:webpack
   ```

## 📁 Project Structure

```
packages/
├── react-devtools/           # Main Vite/Webpack plugin (entry point)
├── react-devtools-client/    # DevTools client UI
├── react-devtools-core/      # Core functionality & plugin system
├── react-devtools-kit/       # State management & messaging
├── react-devtools-overlay/   # Floating overlay component
├── react-devtools-scan/      # Render scanning utilities
├── react-devtools-ui/        # Shared UI components
├── shared/                   # Shared utilities
└── playground/               # Example projects
```

### Key Packages

| Package                  | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `react-devtools`         | The main package users install. Contains Vite/Webpack plugins. |
| `react-devtools-core`    | Core functionality, plugin system, and RPC communication.      |
| `react-devtools-kit`     | State management using Zustand-like stores.                    |
| `react-devtools-client`  | The DevTools UI that runs at `/__react_devtools__/`.           |
| `react-devtools-overlay` | The floating overlay toggled with keyboard shortcut.           |

## 🔄 Development Workflow

### Building Packages

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:core    # react-devtools-core
pnpm build:ui      # react-devtools-ui
pnpm build:kit     # react-devtools-kit
pnpm build:client  # react-devtools-client
pnpm build:overlay # react-devtools-overlay
```

### Running Tests

```bash
pnpm test
```

### Linting

```bash
# Check for lint errors
pnpm lint

# Auto-fix lint errors
pnpm lint:fix
```

## 📝 Submitting Changes

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(overlay): add keyboard shortcut customization
fix(core): resolve fiber scanning memory leak
docs: update installation guide
```

### Pull Request Process

1. **Create a branch**

   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes**
   - Write clear, documented code
   - Add tests if applicable
   - Update documentation if needed

3. **Run checks**

   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push and create PR**

   ```bash
   git push origin feat/my-feature
   ```

   Then open a Pull Request on GitHub.

### PR Guidelines

- **Title**: Use conventional commit format
- **Description**: Explain what, why, and how
- **Screenshots**: Include for UI changes
- **Testing**: Describe how to test your changes

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Environment**
   - Node.js version
   - pnpm version
   - React version
   - Vite/Webpack version
   - Browser and version

2. **Steps to reproduce**
   - Minimal code example
   - Expected behavior
   - Actual behavior

3. **Screenshots/Videos** (if applicable)

## 💡 Feature Requests

When requesting features:

1. **Describe the problem** - What pain point does this solve?
2. **Describe the solution** - How would this feature work?
3. **Alternatives** - What alternatives have you considered?
4. **Context** - Share your use case and stack

## 🔒 Security

If you discover a security vulnerability, please email the maintainers directly instead of opening a public issue.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, helps make React DevTools Plus better. Thank you for being part of our community!
