import { test, expect } from '@playwright/test';

async function finishQuiz(page, answers) {
  for (let i = 0; i < answers.length; i++) {
    await page.locator('.option').nth(Number(answers[i])).click();
    await page.getByRole('button', { name: i === 5 ? '결과 보러 가기' : '다음 질문' }).click();
  }
}

async function mockClipboard(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { async writeText(text) { window.copiedText = text; } } });
  });
}

test('two friends complete, copy invitations, compare and return the same result', async ({ page, browser }, testInfo) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await mockClipboard(page);
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('통할까');
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  await page.getByRole('button', { name: '내 취향 알아보기' }).click();
  await expect(page.getByRole('button', { name: '다음 질문' })).toBeDisabled();
  await finishQuiz(page, '010101');
  await expect(page.getByRole('heading', { name: '내 취향, 이렇게 골랐어요.' })).toBeVisible();
  await expect(page.locator('.answer-list li')).toHaveCount(6);
  await page.getByRole('button', { name: '친구에게 비교 초대 보내기' }).click();
  await expect(page.getByRole('status')).toContainText('링크를 복사');
  const invite = (await page.evaluate(() => window.copiedText)).split('\n').at(-1);
  expect(new URL(invite).hash).toBe('#v1.i.010101');

  const friend = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const other = await friend.newPage();
  other.on('pageerror', e => errors.push(e.message));
  await mockClipboard(other);
  await other.goto(invite);
  await expect(other.locator('.answer-list')).toHaveCount(0);
  await other.getByRole('button', { name: '친구와 취향 비교하기' }).click();
  await finishQuiz(other, '000000');
  await expect(other.getByRole('heading', { name: '우리가 통하는 순간.' })).toBeVisible();
  await expect(other.locator('.score')).toHaveAttribute('aria-label', '같은 선택 3개, 전체 6개');
  await expect(other.locator('.badge:not(.different)')).toHaveCount(3);
  await expect(other.locator('.badge.different')).toHaveCount(3);
  await other.getByRole('button', { name: '친구에게 우리 결과 보내기' }).click();
  const returnLink = (await other.evaluate(() => window.copiedText)).split('\n').at(-1);
  await page.goto(returnLink);
  await expect(page.locator('.score')).toHaveAttribute('aria-label', '같은 선택 3개, 전체 6개');
  await page.reload();
  await expect(page.locator('.score')).toHaveAttribute('aria-label', '같은 선택 3개, 전체 6개');
  await expect(page.locator('.compare-row')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('comparison.png'), fullPage: true });
  await page.getByRole('button', { name: '내 링크로 다른 친구와도 비교하기' }).click();
  await page.getByRole('button', { name: '링크 복사하기', exact: true }).click();
  expect((await page.evaluate(() => window.copiedText)).split('\n').at(-1)).toContain('#v1.i.010101');
  expect(errors).toEqual([]);
  await friend.close();
});

test('previous question preserves selection and lets the answer change', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: '내 취향 알아보기' }).click();
  await page.locator('.option').nth(0).click();
  await page.getByRole('button', { name: '다음 질문' }).click();
  await page.getByRole('button', { name: '이전' }).click();
  await expect(page.locator('.option').nth(0)).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.option').nth(1).click();
  await expect(page.locator('.option').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.option').nth(0)).toHaveAttribute('aria-pressed', 'false');
});

test('share cancellation does not silently copy the invitation', async ({ page }) => {
  await page.addInitScript(() => {
    window.clipboardCalled = false;
    Object.defineProperty(navigator, 'share', { value: async () => { throw new DOMException('cancelled', 'AbortError'); } });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText() { window.clipboardCalled = true; } } });
  });
  await page.goto('./#v1.r.000000.111111');
  await page.getByRole('button', { name: '친구에게 우리 결과 보내기' }).click();
  await expect(page.getByRole('status')).toContainText('공유를 취소');
  expect(await page.evaluate(() => window.clipboardCalled)).toBe(false);
  await expect(page.getByRole('button', { name: '친구에게 우리 결과 보내기' })).toBeEnabled();
});

test('clipboard denial exposes a selectable, complete link', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { async writeText() { throw new Error('denied'); } } });
  });
  await page.goto('./#v1.r.000000.111111');
  await page.getByRole('button', { name: '링크 복사하기', exact: true }).click();
  await expect(page.getByLabel('공유 링크', { exact: true })).toBeVisible();
  await expect(page.getByLabel('공유 링크', { exact: true })).toHaveValue(/#v1.r.000000.111111$/);
  await expect(page.getByRole('status')).toContainText('자동 복사를 사용할 수 없어요');
});

test('broken link recovers and comparison extremes remain honest', async ({ page }) => {
  await page.goto('./#v1.i.not-an-answer');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('헝클어졌어요');
  await page.getByRole('button', { name: '내 취향부터 알아보기' }).click();
  await expect(page.getByRole('button', { name: '내 취향 알아보기' })).toBeVisible();
  await page.goto('./#v1.r.000000.111111');
  await expect(page.locator('.score')).toHaveAttribute('aria-label', '같은 선택 0개, 전체 6개');
  await expect(page.getByRole('heading', { name: '달라서 더 재밌는 우리' })).toBeVisible();
  await page.goto('./#v1.r.111111.111111');
  await expect(page.locator('.score')).toHaveAttribute('aria-label', '같은 선택 6개, 전체 6개');
});

test('blocked storage does not break completion or sharing', async ({ page }) => {
  await mockClipboard(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });
  });
  await page.goto('./');
  await page.getByRole('button', { name: '내 취향 알아보기' }).click();
  await finishQuiz(page, '101010');
  await expect(page.getByText('최근 결과는 보관되지 않아요', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '링크 복사하기', exact: true }).click();
  expect(await page.evaluate(() => window.copiedText)).toContain('#v1.i.101010');
});

test('saved answers can be revisited and explicitly deleted', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: '내 취향 알아보기' }).click();
  await finishQuiz(page, '111111');
  await page.goto('./');
  await page.getByRole('button', { name: '최근 내 결과 다시 보기' }).click();
  await expect(page.locator('.answer-list li')).toHaveCount(6);
  await page.getByRole('button', { name: '답변과 링크 안내' }).click();
  await page.getByRole('button', { name: '이 브라우저의 내 답변 지우기' }).click();
  await expect(page.locator('#privacy-status')).toContainText('답변을 지웠어요');
  await page.getByRole('button', { name: '확인했어요' }).click();
  await page.goto('./');
  await expect(page.getByRole('button', { name: '최근 내 결과 다시 보기' })).toHaveCount(0);
});

test('production files and project path load without external runtime services', async ({ request }) => {
  for (const file of ['', 'app.js', 'lib.js', 'styles.css', 'favicon.svg', 'share.png']) {
    const response = await request.get('./' + file);
    expect(response.status(), file).toBe(200);
  }
  expect((await request.get('./missing.js')).status()).toBe(404);
});
