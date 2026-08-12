using Game;
using Game.Common;
using Game.Routes;
using System.Collections.Generic;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    /// <summary>
    /// Drains vehicle-model apply queue into <see cref="ModificationBarrier4"/> ECBs.
    /// Must run after <see cref="XTMVehicleModelGroupSystem"/> in Modification4.
    /// </summary>
    public partial class XTMVehicleModelGroupApplySystem : GameSystemBase
    {
        private ModificationBarrier4 m_ModificationBarrier4;
        private NativeHashSet<Entity> m_AppliedThisInterval;
        private readonly Queue<Entity> m_ApplyQueue = new();

        protected override void OnCreate()
        {
            base.OnCreate();
            m_ModificationBarrier4 = World.GetOrCreateSystemManaged<ModificationBarrier4>();
            m_AppliedThisInterval = new NativeHashSet<Entity>(64, Allocator.Persistent);
        }

        protected override void OnDestroy()
        {
            if (m_AppliedThisInterval.IsCreated)
            {
                m_AppliedThisInterval.Dispose();
            }
            base.OnDestroy();
        }

        public override int GetUpdateInterval(SystemUpdatePhase phase)
        {
            return 32;
        }

        public void EnqueueApply(Entity line)
        {
            if (line != Entity.Null)
            {
                m_ApplyQueue.Enqueue(line);
            }
        }

        public bool WasAppliedThisInterval(Entity line)
        {
            return m_AppliedThisInterval.Contains(line);
        }

        protected override void OnUpdate()
        {
            m_AppliedThisInterval.Clear();
            if (m_ApplyQueue.Count == 0)
            {
                return;
            }

            EntityCommandBuffer ecb = m_ModificationBarrier4.CreateCommandBuffer();
            while (m_ApplyQueue.TryDequeue(out Entity line))
            {
                if (!TryApplyLine(ecb, line))
                {
                    continue;
                }
                m_AppliedThisInterval.Add(line);
            }
        }

        private bool TryApplyLine(EntityCommandBuffer ecb, Entity line)
        {
            if (line == Entity.Null || !EntityManager.Exists(line)
                || !EntityManager.HasComponent<XTMVehicleModelLineAssociation>(line)
                || EntityManager.HasComponent<XTMVehicleModelPersistingConflict>(line)
                || !EntityManager.HasBuffer<VehicleModel>(line))
            {
                return false;
            }

            XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
            Entity group = assoc.m_group;
            if (!XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, group)
                || !XTMVehicleModelGroupUtils.HasAtLeastOneValidModel(EntityManager, group)
                || !EntityManager.HasBuffer<VehicleModel>(group))
            {
                return false;
            }

            DynamicBuffer<VehicleModel> desired = EntityManager.GetBuffer<VehicleModel>(group, true);
            DynamicBuffer<VehicleModel> target = ecb.SetBuffer<VehicleModel>(line);
            for (int i = 0; i < desired.Length; i++)
            {
                target.Add(desired[i]);
            }
            return true;
        }
    }
}
