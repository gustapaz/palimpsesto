import {test,expect} from '@playwright/test';
test('duas abas preservam o rascunho quando a primeira publica',async({page,context})=>{
 await page.goto('/');
 const other=await context.newPage();
 await other.goto('/');
 await page.getByLabel('Texto do boletim').fill('Abertura confirmada no cais.');
 await other.getByLabel('Texto do boletim').fill('Sessão de leitura marcada para sábado.');
 await page.getByRole('button',{name:'Publicar revisão'}).click();
 await expect(page.getByRole('status')).toContainText('Revisão R4 publicada.');
 await other.getByRole('button',{name:'Publicar revisão'}).click();
 await expect(other.getByRole('alert')).toContainText('Outra aba publicou primeiro.');
 await expect(other.getByLabel('Texto do boletim')).toHaveValue('Sessão de leitura marcada para sábado.');
 await other.getByRole('button',{name:'Publicar revisão'}).click();
 await expect(other.getByRole('status')).toContainText('Revisão R5 publicada.');
});
