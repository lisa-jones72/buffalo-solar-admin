# Branching Guidelines

This document outlines the branching strategy and workflow for the Buffalo Solar Admin Dashboard project.

## 🌳 Branching Strategy (PRODUCTION ENVIRONMENT)

### 1. **Always create a new branch for each feature/fix**
   - Branch naming: `feature/descriptive-name` or `fix/descriptive-name`
   - Example: `feature/add-team-photos` or `fix/contact-form-validation`
   - Never commit directly to `main` or `dev` branches

### 2. **Before starting any work:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

### 3. **After completing work:**
   - Test thoroughly on your feature branch
   - Create a pull request to merge into `dev` branch
   - After approval and merge to `dev`, test on dev environment
   - Only after dev testing passes, create PR from `dev` to `main`
   - **Features NEVER go directly to main – always through dev first**

## 🔄 Complete Workflow Example

```bash
# Step 1: Start from dev branch
git checkout dev
git pull origin dev

# Step 2: Create feature branch
git checkout -b feature/add-analytics-dashboard

# Step 3: Make changes and commit
git add .
git commit -m "feat: add analytics dashboard"

# Step 4: Push to remote
git push origin feature/add-analytics-dashboard

# Step 5: Create PR to dev
# - Open GitHub/GitLab
# - Create PR: feature/add-analytics-dashboard → dev
# - Get approval and merge

# Step 6: After merge to dev, test on dev environment
# - Verify feature works correctly
# - Check for any issues

# Step 7: Create PR from dev to main
# - Open GitHub/GitLab
# - Create PR: dev → main
# - Get approval and merge
# - Deploy to production
```

## 📋 Development Guidelines (STRICT ENFORCEMENT)

### DO: ✅

- ✅ Only fix/change what is explicitly requested
- ✅ Test changes to ensure nothing breaks
- ✅ Follow the existing code patterns and structure
- ✅ Ask for clarification if requirements are unclear

### DO NOT: ❌

- ❌ Break existing functionality
- ❌ Fix things that weren't asked to be fixed
- ❌ Refactor code unless specifically requested
- ❌ Add features beyond the scope of the request
- ❌ Make "improvements" that weren't requested
- ❌ Change patterns or architecture without explicit approval

**Remember:** Stick to the task at hand. Unsolicited changes, even with good intentions, are not acceptable in production.

## 🌿 Branch Structure

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Always deployable, requires pull request reviews
- **Workflow**: Only receives code from `dev` branch via PR
- **Lifecycle**: Permanent branch, never force push
- **Deployment**: Automatically deployed to production

#### `dev`
- **Purpose**: Integration and testing branch for all features
- **Protection**: Requires pull request reviews
- **Workflow**: Receives code from feature/fix branches
- **Lifecycle**: Permanent branch, merged to `main` for releases
- **Testing**: All features must be tested here before going to `main`

### Branch Types

#### Feature Branches
**Prefix**: `feature/`

**Examples**:
- `feature/add-team-photos`
- `feature/improve-analytics-dashboard`
- `feature/integrate-firebase-auth`

#### Fix Branches
**Prefix**: `fix/`

**Examples**:
- `fix/contact-form-validation`
- `fix/resolve-login-redirect-issue`
- `fix/correct-analytics-calculation`

## 🔄 Two-Stage PR Process

### Stage 1: Feature Branch → `dev`

```bash
# Create PR on GitHub/GitLab
# Source: feature/your-feature-name
# Target: dev

# Requirements:
# - Code review approval
# - All tests pass
# - No merge conflicts
```

### Stage 2: `dev` → `main`

```bash
# After testing on dev environment:

# Create PR on GitHub/GitLab
# Source: dev
# Target: main

# Requirements:
# - Feature tested and verified on dev
# - Code review approval
# - All tests pass
# - No merge conflicts
```

## ⚠️ Critical Rules

### Branch Workflow
- ✅ Always start from `dev` branch
- ✅ Never commit directly to `main` or `dev`
- ✅ Always go through `dev` before `main`
- ❌ Never merge feature branches directly to `main`
- ❌ Never skip the `dev` testing stage

### Code Changes
- ✅ Only change what's explicitly requested
- ✅ Test your changes thoroughly
- ✅ Follow existing code patterns
- ❌ No unsolicited improvements
- ❌ No refactoring unless requested
- ❌ No breaking existing functionality

## 🧹 Branch Cleanup

After your branch is merged:

```bash
# Delete local branch
git checkout dev
git pull origin dev
git branch -d feature/your-feature-name

# Remote branch is usually auto-deleted on merge
# If not, delete manually:
git push origin --delete feature/your-feature-name
```

## 📊 Branch Lifecycle Diagram

```
dev (integration & testing)
  │
  ├── feature/add-analytics → [PR → dev] → [Test on dev] → [PR → main] ✅
  │
  ├── fix/form-validation → [PR → dev] → [Test on dev] → [PR → main] ✅
  │
  └── feature/new-feature → [In Progress]
```

**Important**: All branches flow through `dev` before reaching `main`.

## 🚨 Emergency Situations

For critical production hotfixes that cannot wait for dev testing:

1. Create hotfix branch from `main`
   ```bash
   git checkout main
   git pull origin main
   git checkout -b fix/critical-production-issue
   ```

2. Fix, test, and merge to `main` (with team lead approval)

3. **Immediately merge back to `dev`** to keep branches in sync
   ```bash
   git checkout dev
   git pull origin dev
   git merge main
   git push origin dev
   ```

## 📝 Commit Messages

Use clear, descriptive commit messages:

```bash
# Good examples:
feat: add analytics dashboard
fix: resolve form validation error
docs: update installation instructions

# Bad examples:
update
fix stuff
changes
```

## 🤝 Questions?

If you're unsure about:
- What branch to create from → Always use `dev`
- What to change → Only what's explicitly requested
- Workflow questions → Ask the team lead

Consistency and strict adherence to these guidelines ensures stable production deployments.

---

**Last Updated**: 2024-12-19
