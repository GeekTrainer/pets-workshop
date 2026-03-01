import { test, expect } from '@playwright/test';

test.describe('Tailspin Shelter Homepage', () => {
  test('should load homepage and display title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Tailspin Shelter - Find Your Forever Friend/);

    await expect(page.getByRole('heading', { name: 'Welcome to Tailspin Shelter' })).toBeVisible();

    await expect(page.getByText('Find your perfect companion from our wonderful selection')).toBeVisible();
  });

  test('should display dog list with mock data', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Available Dogs' })).toBeVisible();

    const dogList = page.getByTestId('dog-list');
    await expect(dogList).toBeVisible();

    const dogCards = page.getByTestId('dog-card');
    await expect(dogCards).toHaveCount(3);
  });

  test('should display dog names and breeds from mock API', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('dog-name').nth(0)).toHaveText('Buddy');
    await expect(page.getByTestId('dog-breed').nth(0)).toHaveText('Golden Retriever');

    await expect(page.getByTestId('dog-name').nth(1)).toHaveText('Luna');
    await expect(page.getByTestId('dog-breed').nth(1)).toHaveText('Husky');

    await expect(page.getByTestId('dog-name').nth(2)).toHaveText('Max');
    await expect(page.getByTestId('dog-breed').nth(2)).toHaveText('German Shepherd');
  });
});
