---
key: K45::XTM.vuio[glossary.content.start.settings.logging]
---
## Níveis de registro

**Normal** registra informações, avisos e erros comuns e é recomendado para jogos regulares.

**Debug** adiciona mensagens de diagnóstico dos recursos do XTM. **Trace** adiciona atividades detalhadas de eventos, localização, serialização e processamento. **Detalhado** é extremamente barulhento e deve ser usado apenas brevemente quando solicitado.

Cada entrada de log XTM inclui o identificador XTM, a versão completa do mod e o nível da mensagem.

## Rastreamentos de pilha e pop-ups de erro

Os controles de rastreamento de pilha e pop-up de erro estão disponíveis quando o log de depuração, rastreamento ou registro detalhado é selecionado. Os rastreamentos de pilha adicionam detalhes de localização de código às exceções registradas. Os pop-ups de erro permitem que erros do registrador XTM apareçam na interface do jogo.

Retornar ao registro normal desativa ambos os efeitos.

![Seção de registro das opções XTM com o seletor de nível, rastreamentos de pilha e pop-ups de erro](coui://xtm.k45/UI/images/xtm-settings-diagnostics.jpg)

## Relatando um problema

Grave a versão mod, selecione Debug, reproduza o problema uma vez e use **Ir para a pasta de log**. Envie o log do XTM junto com as etapas que desencadearam o problema e as versões relevantes do jogo e do mod.

Use Trace somente quando a depuração for insuficiente. Evite deixar Verbose ativado. Retorne o registro para Normal após coletar o relatório.
