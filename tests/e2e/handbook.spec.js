import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  {path: './', heading: 'Descreva o que você está vendo. A gente te diz o que fazer.'},
  {path: 'docs/intro', heading: 'Sobre o Handbook A11Y'},
  {path: 'docs/como-usar', heading: 'Como ler um card'},
];

for (const currentPage of pages) {
  test(`não apresenta violações automáticas de acessibilidade em "${currentPage.heading}"`, async ({page}) => {
    await page.goto(currentPage.path);
    await expect(page.getByRole('heading', {level: 1, name: currentPage.heading, exact: true})).toBeVisible();
    await expect(page.locator('footer').getByRole('link', {name: /CC BY-NC 4\.0/})).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by-nc/4.0/deed.pt-br',
    );

    const results = await new AxeBuilder({page}).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test('combina filtros, limpa a busca e opera cards pelo teclado', async ({page}) => {
  await page.goto('./');

  const search = page.getByLabel('Buscar sintoma', {exact: true});
  await search.fill('captcha');
  await expect(page.locator('#sintomas article')).toHaveCount(1);
  await expect(page.getByText('O CAPTCHA impede concluir a tarefa de forma acessível')).toBeVisible();

  await page.getByRole('button', {name: 'Limpar filtros'}).click();
  await expect(search).toBeFocused();
  await expect(page.locator('#sintomas article')).toHaveCount(64);

  await page.getByLabel('Categoria', {exact: true}).selectOption('teclado');
  await page.getByLabel('Componente', {exact: true}).selectOption('modal');
  await expect(page.locator('#sintomas article')).not.toHaveCount(0);

  const firstCardButton = page.locator('#sintomas article').first().getByRole('button');
  await firstCardButton.focus();
  await expect(firstCardButton).toHaveAttribute('aria-expanded', 'false');
  await firstCardButton.press('Enter');
  await expect(firstCardButton).toHaveAttribute('aria-expanded', 'true');
  await firstCardButton.press('Space');
  await expect(firstCardButton).toHaveAttribute('aria-expanded', 'false');
});
