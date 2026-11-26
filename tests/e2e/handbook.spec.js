import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  {path: './', heading: 'Encontre soluções para problemas de acessibilidade'},
  {path: 'docs/intro', heading: 'Sobre o Handbook A11Y'},
  {path: 'docs/como-usar', heading: 'Como ler um card'},
  {path: 'markdown-page', heading: 'Exemplo de página em Markdown'},
];

for (const currentPage of pages) {
  test(`não apresenta violações automáticas de acessibilidade em "${currentPage.heading}"`, async ({page}) => {
    await page.goto(currentPage.path);
    await expect(page.getByRole('heading', {level: 1, name: currentPage.heading, exact: true})).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    const navigation = page.getByRole('navigation', {name: 'Navegação principal'});
    const githubLink = navigation.getByRole('link', {name: /^GitHub\s*\(abre em uma nova aba\)$/});
    await expect(githubLink).toHaveAttribute('target', '_blank');
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
