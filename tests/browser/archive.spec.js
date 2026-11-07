import {test,expect} from '@playwright/test';
test('compara, publica e restaura preservando o histórico após recarga',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Revisão anterior').selectOption('2');
 await page.getByRole('button',{name:'Comparar',exact:true}).click();
 await expect(page.getByText('PROVA TIPOGRÁFICA / R2 → R3')).toBeVisible();
 await page.getByLabel('Texto do boletim').fill('A biblioteca abre com uma sessão de leitura no cais.');
 await page.getByRole('button',{name:'Publicar revisão'}).click();
 await expect(page.getByRole('status')).toContainText('Revisão R4 publicada.');
 await page.getByLabel('Restaurar uma edição').selectOption('1');
 await page.getByRole('button',{name:'Restaurar como nova'}).click();
 await expect(page.getByRole('status')).toContainText('Revisão R5 publicada.');
 await page.reload();
 await expect(page.getByText('Restauração de R1',{exact:true})).toBeVisible();
 await expect(page.getByText('Revisão da bancada',{exact:true})).toBeVisible();
 await expect(page.getByLabel('Texto do boletim')).toHaveValue(/retorna ao cais em agosto/);
});
test('tela móvel permite navegação por teclado sem rolagem horizontal',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto('/');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Ir para a bancada'})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{name:'Histórico'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(360);
});
