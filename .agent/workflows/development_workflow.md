---
description: Standard workflow for new projects, branching, and Vercel deployment
---

# New Project Workflow

## Local Setup (computer)
1. **Initialise**: `git init`
2. **Stage**: `git add .`
3. **Commit**: `git commit -m "initial commit"`

## Remote Setup (GitHub)
1. **Create repo**: `gh repo create --public --source=. --remote=origin`
2. **Push**: `git push --set-upstream origin main`

## Security (GitHub)
1. **Authorise**: github.com -> settings -> applications -> vercel -> add new repository.

## Deployment & Connection (Vercel)
1. **Create project**: `npx vercel`
2. **Connect**: `npx vercel git connect`

## LRSD Configured Workflow
1. **Stage**: `git add .`
2. **Commit**: `git commit -m "descriptive message"`
3. **Push**: `git push`

## Branching Workflow

### Part A: New Feature/Update
1. **Create branch**: `git checkout -b feature-name`
2. Make changes to code (features, bug fixes, etc.)

### Part B: Work
1. **Stage**: `git add .`
2. **Commit**: `git commit -m "descriptive message"`
3. **Push**: `git push origin feature-name`
4. **Test**: View Vercel preview URL (generated automatically by Vercel bot in PR or dashboard) to test.

### Part C: Finish (Merge to live/main)
1. **Switch to main**: `git checkout main`
2. **Merge**: `git merge feature-name`
3. **Push**: `git push` (Triggers production deployment)
4. **Cleanup**: `git branch -d feature-name`

## Feature Flags Workflow
### Developing a Feature
1. Create branch: `git checkout -b feature-calendar`
2. **Local**: Set `ENABLE_CALENDAR = true` in `src/config/features.ts`.
3. Build & Test.

### Releasing a Feature
1. **Merge**: When the feature is ready for users, keep the flag `true` in your PR.
2. **Deploy**: Merging to `main` with `true` will make it live for everyone.

### Dark Launch (Merge code but keep hidden)
1. **Merge**: If code is stable but feature isn't ready for public, set flag back to `false` before committing/merging.
2. The code lives in `main` (hidden) until you are ready to switch it on.

## Sensitive Information

### Part A: Local Storage
1. Create `.env.local` in project root.
2. Add keys: `VITE_API_KEY=123456`
   > **Note**: This file is ignored by git.

### Part B: Production (Vercel)
1. Go to Vercel dashboard -> project -> settings -> environment variables.
2. Copy/paste the same keys from the local file.
