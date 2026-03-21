# Continuous Integration (CI) Workflow

This document explains our GitHub Actions Continuous Integration (CI) pipeline strategy for the Careero monorepo setup.

## 🚀 Overview

The CI pipeline (`.github/workflows/ci.yml`) acts as an automated safety check for the codebase. It guarantees that any new code pushed or proposed via Pull Requests fits our quality standards and successfully builds before it reaches production.

Because we operate in a **monorepo** (with `apps/web` and `apps/api`), our pipeline is highly optimized via **Parallelization**.

## 🔄 Triggers

The CI pipeline runs automatically on:
- **Pushes** directly to the `main` or `dev` branches.
- **Pull Requests (PRs)** targeting the `main` or `dev` branches.

> **Developer Workflow:** Whenever you push new commits to an open PR targeting `dev`, GitHub Actions will automatically re-run the pipeline to verify your latest changes.

## ⚡ The Pipeline (Parallel Jobs)

To minimize the time developers wait for feedback, compiling the entire stack sequentially is avoided. Instead, GitHub Actions spawns two isolated, independent virtual machine instances at the exact same time.

### Job 1: Build Web (Next.js Frontend)
1. **Checks out the repository.**
2. **Setup Node.js & Caching:** Uses Node 20 and caches `~/.npm` to dramatically reduce package download times (`npm ci`).
3. **Linter Check:** Runs standard Next.js linting across `apps/web` to catch syntactical bad practices.
4. **Production Build:** Triggers `next build` to verify the frontend logic correctly compiles to a production deployment format without failing.

### Job 2: Build API (Express Backend)
1. **Checks out the repository.**
2. **Setup Node.js & Caching:** Pulls from the same `~/.npm` cache logic.
3. **Production Build:** Triggers the TypeScript Compiler (`tsc`) to verify the Node server codebase (`apps/api/src/**/*.ts`) successfully transpiles to JavaScript (`apps/api/dist/**/*.js`) without typing errors.

## 🚦 Best Practices for Developers

- **Never force merge a failing PR:** If you receive a ❌ next to your Pull Request commit history, a build or lint test failed. **You must fix the issue on your local feature branch, commit, and push.** When the push reaches GitHub, the CI pipeline restarts automatically to check your fix.
- **Why do we wait for CI?** Even if your code "works on my machine", waiting for the CI pipeline ensures it works in a sterile, fresh environment independently from your cached local modules.
- **Keep `dev` green!** By restricting merges into `dev` unless CI passes, we guarantee that the rest of the developers on the team always pull down a stable, working branch.
