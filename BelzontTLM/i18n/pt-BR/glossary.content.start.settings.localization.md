---
key: K45::XTM.vuio[glossary.content.start.settings.localization]
---
## Traduções integradas

O XTM carrega o inglês como idioma base para cada localidade de jogo suportada. O pacote atual também contém traduções de CSV para português (Brasil) e coreano.

Quando uma chave traduzida está faltando ou em branco, o valor CSV em inglês é usado.

## Arquivos CSV

O **i18n.csv** principal contém colunas de idioma. Um arquivo de idioma separado, como **ko-KR.csv**, é usado somente quando esse idioma não possui nenhuma coluna no arquivo principal.

Os arquivos CSV são separados por tabulações e exigem uma linha de cabeçalho. Mantenha a formatação de espaços reservados, como colchetes, inalterada. Use as sequências literais \n e \t quando um valor CSV precisar de uma quebra de linha ou tabulação.

## Corpos do glossário Markdown

As entradas longas do glossário usam um arquivo Markdown por chave em **i18n/en-US**. Outros idiomas podem sobrepor entradas individuais em sua própria pasta de idiomas. Um arquivo Markdown traduzido ausente mantém automaticamente o corpo em inglês.

Cada arquivo Markdown requer frontmatter contendo **key:** ou **entry:** seguido pela chave de localização montada.

Os corpos do Markdown são carregados após as entradas CSV, portanto, um arquivo Markdown substitui um valor CSV pela mesma chave.

## Testando traduções

Use **Go To Translations folder** para abrir o diretório XTM i18n instalado. Depois de editar um arquivo, use **Recarregar traduções** para remover e reconstruir todas as fontes de localização XTM sem reiniciar o jogo.

![Página de opções com a pasta de traduções e botões de recarga ao lado dos atalhos do fórum, repositório e pasta de log](coui://xtm.k45/UI/images/xtm-settings-localization-support.jpg)

Se o texto já aberto não for atualizado visualmente, feche e reabra esse painel após recarregar.
