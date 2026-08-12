using Game;
using Game.Prefabs;
using Game.UI.InGame;
using System.Collections.Generic;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public partial class XTMFareGroupEndFrameSystem : GameSystemBase
    {

        private PoliciesUISystem m_PoliciesUISystem;
        private PrefabSystem m_PrefabSystem;
        private NativeHashSet<Entity> m_AppliedThisFrame;
        private readonly Queue<(Entity, float)> m_fareChangeQueue = new();
        private Entity m_TicketPricePolicy;
        private bool m_TicketPolicyResolved;
        private EntityQuery m_ConfigQuery;
        public Entity TicketPricePolicy
        {
            get
            {
                TryResolveTicketPolicy();
                return m_TicketPricePolicy;
            }
        }

        protected override void OnCreate()
        {
            base.OnCreate();
            m_PoliciesUISystem = World.GetOrCreateSystemManaged<PoliciesUISystem>();

            m_PrefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();
            m_ConfigQuery = GetEntityQuery(ComponentType.ReadOnly<UITransportConfigurationData>());
            m_AppliedThisFrame = new NativeHashSet<Entity>(64, Allocator.Persistent);
        }
        protected override void OnDestroy()
        {
            if (m_AppliedThisFrame.IsCreated)
            {
                m_AppliedThisFrame.Dispose();
            }
            base.OnDestroy();
        }

        public override int GetUpdateInterval(SystemUpdatePhase phase)
        {
            return 32;
        }
        public void EnqueueFareChange(Entity target, float newValue)
        {
            m_fareChangeQueue.Enqueue((target, newValue));
        }

        public bool WasAppliedLastFrame(Entity e)
        {
            return m_AppliedThisFrame.Contains(e);
        }


        protected override void OnUpdate()
        {
            if (!TryResolveTicketPolicy())
            {
                return;
            }
            m_AppliedThisFrame.Clear();
            while (m_fareChangeQueue.TryDequeue(out var result))
            {
                ApplyFareToLine(result.Item1, result.Item2);
            }
        }

        private bool TryResolveTicketPolicy()
        {
            if (m_TicketPolicyResolved && EntityManager.Exists(m_TicketPricePolicy))
            {
                return true;
            }
            if (m_ConfigQuery.IsEmptyIgnoreFilter)
            {
                return false;
            }
            UITransportConfigurationPrefab config = m_PrefabSystem.GetSingletonPrefab<UITransportConfigurationPrefab>(m_ConfigQuery);
            m_TicketPricePolicy = m_PrefabSystem.GetEntity(config.m_TicketPricePolicy);
            m_TicketPolicyResolved = m_TicketPricePolicy != Entity.Null;
            return m_TicketPolicyResolved;
        }

        private void ApplyFareToLine(Entity line, float fare)
        {
            XTMFareGroupUtils.TryClampFare(EntityManager, m_TicketPricePolicy, fare, out float clamped);
            m_PoliciesUISystem.SetPolicy(line, m_TicketPricePolicy, clamped > 0f, clamped);

            if (EntityManager.HasComponent<XTMFareLineAssociation>(line))
            {
                XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(line);
                assoc.m_lastAdjustment = clamped;
                EntityManager.SetComponentData(line, assoc);
            }

            m_AppliedThisFrame.Add(line);
        }
    }
}
