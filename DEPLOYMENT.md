# GitHub Pages Deployment Guide

This guide will help you deploy your PDF Review PWC app to GitHub Pages for free testing.

## Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository

## Deployment Steps

### 1. Push Your Code to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
git add .
git commit -m "Add GitHub Pages deployment configuration"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### 3. Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Build your Vite app when you push to main/master branch
- Deploy it to GitHub Pages
- Make it available at: `https://yourusername.github.io/pdf-review-pwc/`

### 4. Manual Deployment (Alternative)

If you prefer manual deployment, you can use the deploy script:

```bash
npm install -g gh-pages
npm run deploy
```

## Important Notes

### Repository Name
- Make sure to update the `base` path in `vite.config.ts` if your repository name is different from `pdf-review-pwc`
- The base path should match your repository name: `/your-repo-name/`

### Branch Configuration
- The workflow is configured to deploy from `main` or `master` branch
- Update the workflow file if you use a different default branch

### Custom Domain (Optional)
- You can set up a custom domain in the GitHub Pages settings
- Add a `CNAME` file to the `public` folder with your domain name

## Troubleshooting

### Build Failures
- Check the Actions tab in your GitHub repository for build logs
- Ensure all TypeScript errors are resolved locally before pushing

### 404 Errors
- Verify the `base` path in `vite.config.ts` matches your repository name
- Check that GitHub Pages is enabled and using GitHub Actions as the source

### Assets Not Loading
- Ensure all static assets are in the `public` folder
- Check that the base path is correctly configured

## Testing Your Deployment

1. After pushing to main/master, wait for the GitHub Action to complete
2. Visit `https://yourusername.github.io/pdf-review-pwc/`
3. Test all functionality to ensure everything works in production

## Local Testing

You can test the production build locally:

```bash
npm run build
npm run preview
```

This will serve the built files locally so you can verify everything works before deploying.
