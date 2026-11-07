# Palimpsesto

Modo integrado. Bancada editorial de um boletim fictício sobre a reabertura de uma biblioteca flutuante. O histórico e a comparação da [Wikipédia](https://en.wikipedia.org/wiki/Help:Page_history) são referência para escolher revisões, comparar alterações e restaurar um texto preservando o histórico. O conteúdo e o visual são originais.

Hono renderiza HTML no servidor e htmx troca a bancada após ações. GET / abre o arquivo. GET /archive?left=1&right=3 compara revisões. POST /archive aceita formulário com base, action e body ou source. Ação edit publica um texto, restore copia uma revisão antiga como nova. O diff usa uma subsequência comum de linhas com entrada limitada. Comparação por número de revisão crescente.

Cada navegador recebe uma sessão anônima em cookie HttpOnly e SameSite Strict. Os textos iniciais são fictícios. As edições ficam isoladas por sessão, duram 7 dias após a última gravação e são limitadas a 12 revisões adicionais. Escrita condicional por versão em SQLite/D1 retorna 409 quando duas edições partem da mesma versão. A demo tem limite global de 2.000 sessões gravadas. Sem contas, integrações externas ou pagamentos.
