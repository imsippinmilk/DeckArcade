import { test, expect } from '@playwright/test';

// Basic interaction test for solitaire UI

test('solitaire interaction', async ({ page }) => {
  await page.goto('http://localhost:5173/?game=solitaire');
  await page.getByTestId('stock').click();
  await page.getByTestId('waste').click();
  await page.getByTestId('foundation-H').click();
  await page.getByTestId('undo').click();
  await page.getByTestId('redo').click();
  await page.getByTestId('autocomplete').click();
  expect(await page.getByTestId('stock').isVisible()).toBeTruthy();
});
