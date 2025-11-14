# Tech FAQ Chatbot - Setup & Pre-Push Commands

This document lists all the commands that should be run before pushing code to ensure code quality, formatting, and security checks.

## 1. Setup Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate   # Linux / Mac
.venv\Scripts\activate      # Windows
pip install -r server/requirements.txt
pip install black flake8 bandit prettier
```

## 2. Linting & Code Style Checks
### Python Lint
```bash
flake8 server/ models/
```

### Python formatting
```bash
black --check server/ models/
```

### Format python files automaticlly
```bash
black server/ models/
```

## 3. Next.js / TypeScript Formatting

### Format Automatically
```bash
npm run prettier:fix"
```

## 4. Security check
### Bandit (python security linter)
```bash
bandit -r server/ models/
```

### ESLint
```bash
npm run lint
```


**NOTES**
- Make sure your virtual environment is activated before running any of these commands.
- Run all checks before pushing to avoid CI/CD errors.