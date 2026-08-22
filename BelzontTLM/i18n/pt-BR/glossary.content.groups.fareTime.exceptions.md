---
key: K45::XTM.vuio[glossary.content.groups.fareTime.exceptions]
---
Use **Exceções de horário** quando uma tarifa for diferente do padrão durante parte do dia. **Adicionar exceção** cria um intervalo de uma hora na primeira hora descoberta e copia a tarifa padrão arredondada.

Defina início, fim e tarifa. O horário vai de 0 a 23 e ambos os pontos finais estão incluídos: 7 a 9 aplica-se das 07:00 às 09:59.

O início não pode ser posterior ao fim e os intervalos não podem passar da meia-noite. Use duas exceções para um período noturno. As exceções não podem se sobrepor; como os endpoints são inclusivos, os intervalos que compartilham uma hora também entram em conflito.

XTM suporta no máximo 20 exceções. Intervalos inválidos mostram um aviso e impedem que todas as alterações atuais do grupo sejam salvas até serem corrigidas ou removidas.

Defina uma tarifa de exceção como **0** para viagens gratuitas durante esse período.

![Exceções de horas com faixas pagas e gratuitas](coui://xtm.k45/UI/images/xtm-fare-group-hour-exceptions.jpg)
