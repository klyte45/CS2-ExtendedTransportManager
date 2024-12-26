using Belzont.Utils;
using Colossal.Entities;
using Game.Common;
using Game.UI;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public interface IXTM_WEDestinationData
    {
        protected XTM_WEDestinationKeyframeType Type { get; }
        protected Entity TargetEntity { get; }
        protected FixedString32Bytes Prefix { get; }
        protected FixedString32Bytes Suffix { get; }

        public string GetString(EntityManager em, NameSystem ns, XTMLineManagementSystem xtmlms, Entity stopEntity)
        {
            return Type switch
            {
                XTM_WEDestinationKeyframeType.EntityName => $"{Prefix}{ns.GetName(TargetEntity)}{Suffix}",
                XTM_WEDestinationKeyframeType.RouteNumber => em.TryGetComponent<Owner>(stopEntity, out var ownerLine) ? xtmlms.GetEffectiveRouteNumber(ownerLine.m_Owner) : "<?>",
                XTM_WEDestinationKeyframeType.RouteName => em.TryGetComponent<Owner>(stopEntity, out var ownerLine) ? ns.GetName(ownerLine.m_Owner).Translate() : "<?>",
                XTM_WEDestinationKeyframeType.FixedString => Prefix.ToString(),
                _ => "????"
            };
        }
    }
}
