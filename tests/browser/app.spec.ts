import { test, expect } from "@playwright/test";

test("dashboard, filters, customer ledger, simulator, report and upload", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByText("144건의 거래를 집계했습니다.", { exact: false }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.getByLabel("분석 기간").selectOption("2025-01");
  await expect(
    page.getByText("12건의 거래를 집계했습니다.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "고객별 수익성", exact: true })
    .click();
  await page.getByLabel("고객 검색").fill("Nordvik");
  await expect(
    page.getByRole("cell", { name: "Nordvik Automation", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "원장 조회" }).click();
  await expect(
    page.getByRole("heading", { name: "Nordvik Automation 거래 원장" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "할인 시뮬레이터", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "제품", exact: true })
    .selectOption("BCR-A200");
  await page
    .getByRole("combobox", { name: "원가 기준월", exact: true })
    .selectOption("2025-01");
  await page.getByRole("button", { name: "시뮬레이션 실행" }).click();
  await expect(page.getByText("₩3,550,000").first()).toBeVisible();
  await page.getByLabel("판매 수량").fill("40");
  await expect(page.getByText("할인의 영향, 숫자로 확인하세요")).toBeVisible();
  await page
    .getByRole("button", { name: "보고서 초안 생성", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("총 매출", { exact: false }).last(),
  ).toBeVisible();
  await expect(
    page.getByText("2025-01 제품·고객별 수익성 분석 보고서"),
  ).toBeVisible();
  await page.getByRole("button", { name: "데이터 검증", exact: true }).click();
  const template = await request.get("/api/files/template");
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "test-upload.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: await template.body(),
    });
  await expect(
    page.locator(".source").filter({ hasText: "test-upload.xlsx" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "검증 실행", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "데이터 검증 완료" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "대시보드 보기" }).click();
  await expect(page.getByText("업로드 데이터 검증 완료")).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile navigation and layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByText("144건의 거래를 집계했습니다.", { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Excel 업로드", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
