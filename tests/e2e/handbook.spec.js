import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  {path: './', heading: 'Encontre soluções para problemas de acessibilidade'},
  {path: 'docs/intro', heading: 'Sobre o Handbook A11Y'},
  {path: 'docs/como-usar', heading: 'Como ler um card'},
  {path: 'markdown-page', heading: 'Exemplo de página em Markdown'},
  {path: 'sintomas/tab-nao-acessa', heading: 'Não consigo chegar ao controle usando o teclado'},
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

  const firstCardButton = page.locator('#sintomas article').first().getByRole('heading', {level: 3}).getByRole('button');
  await firstCardButton.focus();
  await expect(firstCardButton).toHaveAttribute('aria-expanded', 'false');
  await firstCardButton.press('Enter');
  await expect(firstCardButton).toHaveAttribute('aria-expanded', 'true');
  await firstCardButton.press('Space');
  await expect(firstCardButton).toHaveAttribute('aria-expanded', 'false');
});

test('copia a URL no card aberto e na página individual do sintoma', async ({page, context}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  const card = page.locator('#sintomas article').first();
  const symptom = 'Não consigo chegar ao controle usando o teclado';
  const url = 'https://dxdad.github.io/handbook_wcag/sintomas/tab-nao-acessa';
  const copyName = `Copiar URL: ${symptom}`;

  await expect(card.getByRole('button', {name: copyName})).toHaveCount(0);
  await card.getByRole('button', {name: symptom, exact: true}).press('Enter');
  await expect(card.getByText(url, {exact: true})).toBeVisible();
  const cardCopy = card.getByRole('button', {name: copyName});
  await cardCopy.press('Enter');
  await expect(card.getByRole('status')).toHaveText('URL copiada.');
  await expect(cardCopy).toBeFocused();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(url);

  await page.goto('sintomas/tab-nao-acessa');
  await expect(page.getByRole('heading', {name: symptom, level: 1, exact: true})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Como validar', level: 2})).toBeVisible();
  await expect(page.getByText(url, {exact: true})).toBeVisible();
  await page.evaluate(() => navigator.clipboard.writeText(''));
  await page.getByRole('button', {name: copyName}).press('Space');
  await expect(page.getByRole('status')).toHaveText('URL copiada.');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(url);

  await page.evaluate(() => {
    navigator.clipboard.writeText = () => Promise.reject(new Error('Cópia indisponível'));
  });
  const pageCopy = page.getByRole('button', {name: copyName});
  await pageCopy.press('Enter');
  await expect(page.getByRole('status')).toHaveText(/URL foi selecionada para cópia manual/);
  await expect(pageCopy).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.getSelection().toString())).toBe(url);

  await page.getByRole('link', {name: 'Voltar ao catálogo de sintomas'}).click();
  await expect(page.getByRole('heading', {
    name: 'Encontre soluções para problemas de acessibilidade',
    level: 1,
  })).toBeVisible();
});
