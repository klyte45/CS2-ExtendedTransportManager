---
key: K45::XTM.vuio[glossary.content.groups.incompatibilities.external]
---
Para cada linha membro, a XTM espera que a lista de modelos de veículos corresponda exatamente às composições do grupo, incluindo pedidos e modelos primários e secundários. Ações Vanilla ou outro mod podem entrar em conflito ao reescrever essa lista.

O XTM verifica as linhas gerenciadas periodicamente e normalmente reaplica as composições do grupo após uma incompatibilidade. Os conflitos de preços dos ingressos são tratados separadamente; este watchdog monitora apenas a seleção do modelo.

## Corte de conflito

**Após a décima sexta incompatibilidade detectada, o XTM para de aplicar o grupo de modelos de veículo naquela linha individual.** As primeiras quinze incompatibilidades podem acionar a reaplicação; outros membros continuam normalmente.

Atualmente não há aviso de conflito visível. Remova ou desative a origem das alterações conflitantes e, em seguida, edite o grupo ou remova e reatribua a linha afetada para retomar a aplicação. Recarregar a cidade também elimina este estado de conflito transitório.
