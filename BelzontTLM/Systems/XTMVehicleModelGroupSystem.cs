using Game;
using Game.Routes;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    /// <summary>
    /// Strips invalid vehicle-model associations/models, applies dirty tags, and polls for
    /// external VehicleModel buffer drift. Runs after <see cref="Game.Routes.InitializeSystem"/>
    /// in Modification4; enqueues applies for <see cref="XTMVehicleModelGroupApplySystem"/>.
    /// </summary>
    public partial class XTMVehicleModelGroupSystem : GameSystemBase
    {
        private EntityQuery m_GroupQuery;
        private EntityQuery m_AssociatedLinesQuery;
        private EntityQuery m_AllAssociatedLinesQuery;
        private EntityQuery m_DirtyGroupsQuery;
        private EntityQuery m_DirtyLinesQuery;
        private EntityQuery m_WatchdogLinesQuery;

        private XTMVehicleModelGroupApplySystem m_ApplySystem;
        private bool m_FirstTick = true;

        protected override void OnCreate()
        {
            base.OnCreate();
            m_ApplySystem = World.GetOrCreateSystemManaged<XTMVehicleModelGroupApplySystem>();

            m_GroupQuery = GetEntityQuery(ComponentType.ReadOnly<XTMVehicleModelGroup>());
            m_AssociatedLinesQuery = GetEntityQuery(
                ComponentType.ReadOnly<XTMVehicleModelLineAssociation>(),
                ComponentType.Exclude<XTMVehicleModelPersistingConflict>());
            m_AllAssociatedLinesQuery = GetEntityQuery(ComponentType.ReadOnly<XTMVehicleModelLineAssociation>());
            m_DirtyGroupsQuery = GetEntityQuery(
                ComponentType.ReadOnly<XTMVehicleModelGroup>(),
                ComponentType.ReadOnly<XTMVehicleModelGroupDirty>());
            m_DirtyLinesQuery = GetEntityQuery(
                ComponentType.ReadOnly<XTMVehicleModelLineAssociation>(),
                ComponentType.ReadOnly<XTMVehicleModelLineDirty>(),
                ComponentType.Exclude<XTMVehicleModelPersistingConflict>());
            m_WatchdogLinesQuery = GetEntityQuery(
                ComponentType.ReadOnly<XTMVehicleModelLineAssociation>(),
                ComponentType.ReadOnly<VehicleModel>(),
                ComponentType.Exclude<XTMVehicleModelPersistingConflict>());
        }

        public override int GetUpdateInterval(SystemUpdatePhase phase)
        {
            return 32;
        }

        protected override void OnUpdate()
        {
            StripInvalidAssociations();
            StripAllGroupModels();

            if (m_FirstTick)
            {
                m_FirstTick = false;
                ForceApplyAllGroups();
            }

            ProcessDirtyGroups();
            ProcessDirtyLines();
            ProcessExternalConflicts();
        }

        private void StripInvalidAssociations()
        {
            using NativeArray<Entity> lines = m_AllAssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lines.Length; i++)
            {
                Entity line = lines[i];
                XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
                if (XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, assoc.m_group))
                {
                    continue;
                }
                RemoveAssociationTags(line);
            }
        }

        private void StripAllGroupModels()
        {
            using NativeArray<Entity> groups = m_GroupQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < groups.Length; i++)
            {
                XTMVehicleModelGroupUtils.StripInvalidGroupModels(EntityManager, groups[i]);
            }
        }

        private void ForceApplyAllGroups()
        {
            using NativeArray<Entity> groups = m_GroupQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < groups.Length; i++)
            {
                EnqueueGroupMembers(groups[i], clearConflictsExceptPersisting: true);
            }
        }

        private void ProcessDirtyGroups()
        {
            if (m_DirtyGroupsQuery.IsEmptyIgnoreFilter)
            {
                return;
            }

            using NativeArray<Entity> groups = m_DirtyGroupsQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < groups.Length; i++)
            {
                Entity group = groups[i];
                ClearConflictsForGroup(group);
                XTMVehicleModelGroupUtils.StripInvalidGroupModels(EntityManager, group);
                EnqueueGroupMembers(group, clearConflictsExceptPersisting: false);
                if (EntityManager.HasComponent<XTMVehicleModelGroupDirty>(group))
                {
                    EntityManager.RemoveComponent<XTMVehicleModelGroupDirty>(group);
                }
            }
        }

        private void ProcessDirtyLines()
        {
            if (m_DirtyLinesQuery.IsEmptyIgnoreFilter)
            {
                return;
            }

            using NativeArray<Entity> lines = m_DirtyLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lines.Length; i++)
            {
                Entity line = lines[i];
                XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
                if (XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, assoc.m_group)
                    && XTMVehicleModelGroupUtils.HasAtLeastOneValidModel(EntityManager, assoc.m_group))
                {
                    m_ApplySystem.EnqueueApply(line);
                }
                if (EntityManager.HasComponent<XTMVehicleModelLineDirty>(line))
                {
                    EntityManager.RemoveComponent<XTMVehicleModelLineDirty>(line);
                }
            }
        }

        private void ProcessExternalConflicts()
        {
            if (m_WatchdogLinesQuery.IsEmptyIgnoreFilter)
            {
                return;
            }

            using NativeArray<Entity> lines = m_WatchdogLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lines.Length; i++)
            {
                Entity line = lines[i];
                if (m_ApplySystem.WasAppliedThisInterval(line)
                    || EntityManager.HasComponent<XTMVehicleModelPersistingConflict>(line))
                {
                    continue;
                }

                XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
                Entity group = assoc.m_group;
                if (!XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, group)
                    || !XTMVehicleModelGroupUtils.HasAtLeastOneValidModel(EntityManager, group)
                    || !EntityManager.HasBuffer<VehicleModel>(group)
                    || !EntityManager.HasBuffer<VehicleModel>(line))
                {
                    continue;
                }

                DynamicBuffer<VehicleModel> desired = EntityManager.GetBuffer<VehicleModel>(group, true);
                DynamicBuffer<VehicleModel> live = EntityManager.GetBuffer<VehicleModel>(line, true);
                if (XTMVehicleModelGroupUtils.BuffersEqualExactOrder(desired, live))
                {
                    continue;
                }

                HandleConflict(line);
            }
        }

        private void HandleConflict(Entity line)
        {
            int count = 0;
            if (EntityManager.HasComponent<XTMVehicleModelConflictCounter>(line))
            {
                count = EntityManager.GetComponentData<XTMVehicleModelConflictCounter>(line).m_count;
            }
            count++;

            m_ApplySystem.EnqueueApply(line);

            if (count >= XTMVehicleModelConflictCounter.PersistThreshold)
            {
                if (EntityManager.HasComponent<XTMVehicleModelConflictCounter>(line))
                {
                    EntityManager.RemoveComponent<XTMVehicleModelConflictCounter>(line);
                }
                if (!EntityManager.HasComponent<XTMVehicleModelPersistingConflict>(line))
                {
                    EntityManager.AddComponent<XTMVehicleModelPersistingConflict>(line);
                }
            }
            else if (EntityManager.HasComponent<XTMVehicleModelConflictCounter>(line))
            {
                EntityManager.SetComponentData(line, new XTMVehicleModelConflictCounter { m_count = count });
            }
            else
            {
                EntityManager.AddComponentData(line, new XTMVehicleModelConflictCounter { m_count = count });
            }
        }

        private void EnqueueGroupMembers(Entity group, bool clearConflictsExceptPersisting)
        {
            if (!XTMVehicleModelGroupUtils.HasAtLeastOneValidModel(EntityManager, group))
            {
                return;
            }

            using NativeArray<Entity> lines = m_AssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lines.Length; i++)
            {
                Entity line = lines[i];
                XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
                if (assoc.m_group != group)
                {
                    continue;
                }
                if (EntityManager.HasComponent<XTMVehicleModelPersistingConflict>(line))
                {
                    continue;
                }
                m_ApplySystem.EnqueueApply(line);
            }

            if (clearConflictsExceptPersisting)
            {
                ClearConflictCountersExceptPersisting();
            }
        }

        private void ClearConflictCountersExceptPersisting()
        {
            using NativeArray<Entity> lines = m_AllAssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lines.Length; i++)
            {
                Entity line = lines[i];
                if (EntityManager.HasComponent<XTMVehicleModelPersistingConflict>(line))
                {
                    continue;
                }
                if (EntityManager.HasComponent<XTMVehicleModelConflictCounter>(line))
                {
                    EntityManager.RemoveComponent<XTMVehicleModelConflictCounter>(line);
                }
            }
        }

        private void ClearConflictsForGroup(Entity group)
        {
            using NativeArray<Entity> lines = m_AllAssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lines.Length; i++)
            {
                Entity line = lines[i];
                XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
                if (assoc.m_group != group)
                {
                    continue;
                }
                if (EntityManager.HasComponent<XTMVehicleModelConflictCounter>(line))
                {
                    EntityManager.RemoveComponent<XTMVehicleModelConflictCounter>(line);
                }
                if (EntityManager.HasComponent<XTMVehicleModelPersistingConflict>(line))
                {
                    EntityManager.RemoveComponent<XTMVehicleModelPersistingConflict>(line);
                }
            }
        }

        private void RemoveAssociationTags(Entity line)
        {
            if (EntityManager.HasComponent<XTMVehicleModelLineAssociation>(line))
            {
                EntityManager.RemoveComponent<XTMVehicleModelLineAssociation>(line);
            }
            if (EntityManager.HasComponent<XTMVehicleModelConflictCounter>(line))
            {
                EntityManager.RemoveComponent<XTMVehicleModelConflictCounter>(line);
            }
            if (EntityManager.HasComponent<XTMVehicleModelPersistingConflict>(line))
            {
                EntityManager.RemoveComponent<XTMVehicleModelPersistingConflict>(line);
            }
            if (EntityManager.HasComponent<XTMVehicleModelLineDirty>(line))
            {
                EntityManager.RemoveComponent<XTMVehicleModelLineDirty>(line);
            }
        }
    }
}
