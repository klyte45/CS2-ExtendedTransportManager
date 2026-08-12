using Game.Policies;
using Game.Prefabs;
using Unity.Entities;

namespace BelzontTLM
{
    public static class XTMFareGroupUtils
    {
        public static float ResolveEffectiveFare(float defaultFare, DynamicBuffer<XTMFareGroupHourException> exceptions, int hour)
        {
            for (int i = 0; i < exceptions.Length; i++)
            {
                if (exceptions[i].ContainsHour(hour))
                {
                    return exceptions[i].m_fareValue;
                }
            }
            return defaultFare;
        }

        public static float ReadTicketPriceAdjustment(EntityManager em, Entity line, Entity ticketPricePolicy)
        {
            if (!em.HasBuffer<Policy>(line))
            {
                return 0f;
            }
            DynamicBuffer<Policy> policies = em.GetBuffer<Policy>(line, true);
            for (int i = 0; i < policies.Length; i++)
            {
                if (policies[i].m_Policy != ticketPricePolicy)
                {
                    continue;
                }
                return (policies[i].m_Flags & PolicyFlags.Active) != 0 ? policies[i].m_Adjustment : 0f;
            }
            return 0f;
        }

        public static bool IsValidFareGroup(EntityManager em, Entity group)
        {
            return group != Entity.Null && em.Exists(group) && em.HasComponent<XTMFareGroup>(group);
        }

        public static bool TryClampFare(EntityManager em, Entity ticketPricePolicy, float fare, out float clamped)
        {
            // 0 = free (vanilla TicketPriceSection); always allowed.
            if (fare <= 0f)
            {
                clamped = 0f;
                return true;
            }

            clamped = fare;
            if (!em.HasComponent<PolicySliderData>(ticketPricePolicy))
            {
                return true;
            }
            PolicySliderData slider = em.GetComponentData<PolicySliderData>(ticketPricePolicy);
            if (fare < slider.m_Range.min)
            {
                clamped = slider.m_Range.min;
            }
            else if (fare > slider.m_Range.max)
            {
                clamped = slider.m_Range.max;
            }
            return true;
        }

        public static float GetTicketSliderDefault(EntityManager em, Entity ticketPricePolicy)
        {
            if (em.HasComponent<PolicySliderData>(ticketPricePolicy))
            {
                return em.GetComponentData<PolicySliderData>(ticketPricePolicy).m_Default;
            }
            return 0f;
        }
    }
}
