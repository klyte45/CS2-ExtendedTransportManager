using Game;
using Game.Common;
using Game.Policies;
using Game.Prefabs;
using Game.Simulation;
using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using Unity.Mathematics;
using UnityEngine;
using Event = Game.Common.Event;

namespace BelzontTLM
{
    /// <summary>
    /// Applies fare-group ticket prices on hour change / dirty tags, strips invalid associations,
    /// and re-applies when external policy drift is detected.
    /// Runs after <see cref="ModifiedSystem"/> in Modification4.
    /// </summary>
    public partial class XTMFareGroupSystem : GameSystemBase
    {
        private EntityQuery m_FareGroupQuery;
        private EntityQuery m_AssociatedLinesQuery;
        private EntityQuery m_AllAssociatedLinesQuery;
        private EntityQuery m_DirtyGroupsQuery;
        private EntityQuery m_DirtyLinesQuery;
        private EntityQuery m_ModifyEventsQuery;
        private EntityQuery m_UpdatedAssociatedQuery;
        private EntityQuery m_ConflictedElementsQuery;
        private TimeSystem m_TimeSystem;
        private XTMFareGroupEndFrameSystem m_XTMFareGroupEndFrameSystem;
        private PrefabSystem m_PrefabSystem;
        private int m_LastHour = -1;


        protected override void OnCreate()
        {
            base.OnCreate();
            m_TimeSystem = World.GetOrCreateSystemManaged<TimeSystem>();
            m_XTMFareGroupEndFrameSystem = World.GetOrCreateSystemManaged<XTMFareGroupEndFrameSystem>();
            m_PrefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();

            m_FareGroupQuery = GetEntityQuery(ComponentType.ReadOnly<XTMFareGroup>());
            m_AssociatedLinesQuery = GetEntityQuery(
                ComponentType.ReadWrite<XTMFareLineAssociation>(),
                ComponentType.Exclude<XTMFarePersistingConflict>());
            m_AllAssociatedLinesQuery = GetEntityQuery(ComponentType.ReadOnly<XTMFareLineAssociation>());
            m_DirtyGroupsQuery = GetEntityQuery(
                ComponentType.ReadOnly<XTMFareGroup>(),
                ComponentType.ReadOnly<XTMFareGroupDirty>());
            m_DirtyLinesQuery = GetEntityQuery(
                ComponentType.ReadOnly<XTMFareLineAssociation>(),
                ComponentType.ReadOnly<XTMFareLineDirty>(),
                ComponentType.Exclude<XTMFarePersistingConflict>());
            m_ModifyEventsQuery = GetEntityQuery(
                ComponentType.ReadOnly<Event>(),
                ComponentType.ReadOnly<Modify>());
            m_UpdatedAssociatedQuery = GetEntityQuery(
                ComponentType.ReadOnly<XTMFareLineAssociation>(),
                ComponentType.ReadOnly<Updated>(),
                ComponentType.Exclude<XTMFarePersistingConflict>());
            m_ConflictedElementsQuery = GetEntityQuery(
              ComponentType.ReadOnly<XTMFareConflictCounter>(),
              ComponentType.Exclude<XTMFarePersistingConflict>());
        }

        public override int GetUpdateInterval(SystemUpdatePhase phase)
        {
            return 32;
        }



        protected override void OnUpdate()
        {

            int hour = Mathf.Clamp(Mathf.FloorToInt(24f * m_TimeSystem.normalizedTime), 0, 23);
            bool firstTick = m_LastHour < 0;
            bool hourChanged = !firstTick && hour != m_LastHour;
            int previousHour = m_LastHour;
            m_LastHour = hour;

            StripInvalidAssociations();

            if (firstTick)
            {
                ForceApplyAllGroups(hour);
            }
            else if (hourChanged)
            {
                ProcessHourChange(previousHour, hour);
            }

            ProcessDirtyGroups(hour);
            ProcessDirtyLines(hour);
            ProcessExternalConflicts(hour);
        }




        private void StripInvalidAssociations()
        {
            using NativeArray<Entity> lines = m_AllAssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lines.Length; i++)
            {
                Entity line = lines[i];
                XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(line);
                if (XTMFareGroupUtils.IsValidFareGroup(EntityManager, assoc.m_fareGroup))
                {
                    continue;
                }
                EntityManager.RemoveComponent<XTMFareLineAssociation>(line);
                if (EntityManager.HasComponent<XTMFareConflictCounter>(line))
                {
                    EntityManager.RemoveComponent<XTMFareConflictCounter>(line);
                }
                if (EntityManager.HasComponent<XTMFarePersistingConflict>(line))
                {
                    EntityManager.RemoveComponent<XTMFarePersistingConflict>(line);
                }
                if (EntityManager.HasComponent<XTMFareLineDirty>(line))
                {
                    EntityManager.RemoveComponent<XTMFareLineDirty>(line);
                }
            }
        }

        private void ForceApplyAllGroups(int hour)
        {
            using NativeArray<Entity> groups = m_FareGroupQuery.ToEntityArray(Allocator.Temp);
            using NativeHashMap<Entity, float> fares = new(math.max(groups.Length, 1), Allocator.TempJob);
            for (int i = 0; i < groups.Length; i++)
            {
                Entity group = groups[i];
                XTMFareGroup data = EntityManager.GetComponentData<XTMFareGroup>(group);
                DynamicBuffer<XTMFareGroupHourException> exceptions = EntityManager.GetBuffer<XTMFareGroupHourException>(group, true);
                float fare = XTMFareGroupUtils.ResolveEffectiveFare(data.m_defaultFare, exceptions, hour);
                fares.TryAdd(group, fare);
            }
            if (fares.Count > 0)
            {
                ApplyFaresFromMap(fares, clearConflictsExceptPersisting: true);
            }
        }

        private void ProcessHourChange(int previousHour, int newHour)
        {
            using NativeArray<Entity> groups = m_FareGroupQuery.ToEntityArray(Allocator.Temp);
            using NativeHashMap<Entity, float> changedFares = new(groups.Length, Allocator.TempJob);

            for (int i = 0; i < groups.Length; i++)
            {
                Entity group = groups[i];
                XTMFareGroup data = EntityManager.GetComponentData<XTMFareGroup>(group);
                DynamicBuffer<XTMFareGroupHourException> exceptions = EntityManager.GetBuffer<XTMFareGroupHourException>(group, true);
                float oldFare = XTMFareGroupUtils.ResolveEffectiveFare(data.m_defaultFare, exceptions, previousHour);
                float newFare = XTMFareGroupUtils.ResolveEffectiveFare(data.m_defaultFare, exceptions, newHour);
                if (!Mathf.Approximately(oldFare, newFare))
                {
                    changedFares.TryAdd(group, newFare);
                }
            }

            if (changedFares.Count > 0)
            {
                ApplyFaresFromMap(changedFares, clearConflictsExceptPersisting: true);
            }
            else
            {
                ClearConflictCountersExceptPersisting();
            }
        }

        private void ProcessDirtyGroups(int hour)
        {
            if (m_DirtyGroupsQuery.IsEmptyIgnoreFilter)
            {
                return;
            }

            using NativeArray<Entity> groups = m_DirtyGroupsQuery.ToEntityArray(Allocator.Temp);
            using NativeHashMap<Entity, float> fares = new(groups.Length, Allocator.TempJob);

            for (int i = 0; i < groups.Length; i++)
            {
                Entity group = groups[i];
                ClearConflictsForGroup(group);
                XTMFareGroup data = EntityManager.GetComponentData<XTMFareGroup>(group);
                DynamicBuffer<XTMFareGroupHourException> exceptions = EntityManager.GetBuffer<XTMFareGroupHourException>(group, true);
                float fare = XTMFareGroupUtils.ResolveEffectiveFare(data.m_defaultFare, exceptions, hour);
                fares.TryAdd(group, fare);
            }

            ApplyFaresFromMap(fares, clearConflictsExceptPersisting: false);

            for (int i = 0; i < groups.Length; i++)
            {
                if (EntityManager.HasComponent<XTMFareGroupDirty>(groups[i]))
                {
                    EntityManager.RemoveComponent<XTMFareGroupDirty>(groups[i]);
                }
            }
        }

        private void ProcessDirtyLines(int hour)
        {
            if (m_DirtyLinesQuery.IsEmptyIgnoreFilter)
            {
                return;
            }

            using NativeArray<Entity> lines = m_DirtyLinesQuery.ToEntityArray(Allocator.Temp);
            using NativeList<Entity> applyLines = new(lines.Length, Allocator.Temp);
            using NativeList<float> applyFares = new(lines.Length, Allocator.Temp);

            for (int i = 0; i < lines.Length; i++)
            {
                Entity line = lines[i];
                XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(line);
                if (!XTMFareGroupUtils.IsValidFareGroup(EntityManager, assoc.m_fareGroup))
                {
                    if (EntityManager.HasComponent<XTMFareLineDirty>(line))
                    {
                        EntityManager.RemoveComponent<XTMFareLineDirty>(line);
                    }
                    continue;
                }

                XTMFareGroup data = EntityManager.GetComponentData<XTMFareGroup>(assoc.m_fareGroup);
                DynamicBuffer<XTMFareGroupHourException> exceptions = EntityManager.GetBuffer<XTMFareGroupHourException>(assoc.m_fareGroup, true);
                float fare = XTMFareGroupUtils.ResolveEffectiveFare(data.m_defaultFare, exceptions, hour);
                applyLines.Add(line);
                applyFares.Add(fare);
            }

            for (int i = 0; i < applyLines.Length; i++)
            {
                m_XTMFareGroupEndFrameSystem.EnqueueFareChange(applyLines[i], applyFares[i]);
                if (EntityManager.HasComponent<XTMFareLineDirty>(applyLines[i]))
                {
                    EntityManager.RemoveComponent<XTMFareLineDirty>(applyLines[i]);
                }
            }
        }

        private void ProcessExternalConflicts(int hour)
        {
            // Prefer Modify payload when still present (same phase after ModifiedSystem).
            if (!m_ModifyEventsQuery.IsEmptyIgnoreFilter)
            {
                using NativeArray<Modify> modifies = m_ModifyEventsQuery.ToComponentDataArray<Modify>(Allocator.Temp);
                for (int i = 0; i < modifies.Length; i++)
                {
                    Modify modify = modifies[i];
                    if (modify.m_Policy != m_XTMFareGroupEndFrameSystem.TicketPricePolicy)
                    {
                        continue;
                    }
                    Entity line = modify.m_Entity;
                    if (!EntityManager.HasComponent<XTMFareLineAssociation>(line)
                        || EntityManager.HasComponent<XTMFarePersistingConflict>(line)
                        || m_XTMFareGroupEndFrameSystem.WasAppliedLastFrame(line))
                    {
                        continue;
                    }

                    float incoming = (modify.m_Flags & PolicyFlags.Active) != 0 ? modify.m_Adjustment : 0f;
                    XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(line);
                    if (Mathf.Approximately(incoming, assoc.m_lastAdjustment))
                    {
                        continue;
                    }

                    HandleConflict(line, assoc, hour);
                }
            }

            if (m_UpdatedAssociatedQuery.IsEmptyIgnoreFilter)
            {
                return;
            }

            using NativeArray<Entity> lines = m_UpdatedAssociatedQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lines.Length; i++)
            {
                Entity line = lines[i];
                if (m_XTMFareGroupEndFrameSystem.WasAppliedLastFrame(line) || EntityManager.HasComponent<XTMFarePersistingConflict>(line))
                {
                    continue;
                }
                if (!EntityManager.HasComponent<XTMFareLineAssociation>(line))
                {
                    continue;
                }

                XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(line);
                if (!XTMFareGroupUtils.IsValidFareGroup(EntityManager, assoc.m_fareGroup))
                {
                    continue;
                }

                float current = XTMFareGroupUtils.ReadTicketPriceAdjustment(EntityManager, line, m_XTMFareGroupEndFrameSystem.TicketPricePolicy);
                if (Mathf.Approximately(current, assoc.m_lastAdjustment))
                {
                    continue;
                }

                HandleConflict(line, assoc, hour);
            }
        }

        private void HandleConflict(Entity line, XTMFareLineAssociation assoc, int hour)
        {
            if (!XTMFareGroupUtils.IsValidFareGroup(EntityManager, assoc.m_fareGroup))
            {
                return;
            }

            XTMFareGroup data = EntityManager.GetComponentData<XTMFareGroup>(assoc.m_fareGroup);
            DynamicBuffer<XTMFareGroupHourException> exceptions = EntityManager.GetBuffer<XTMFareGroupHourException>(assoc.m_fareGroup, true);
            float expected = XTMFareGroupUtils.ResolveEffectiveFare(data.m_defaultFare, exceptions, hour);

            int count = 0;
            if (EntityManager.HasComponent<XTMFareConflictCounter>(line))
            {
                count = EntityManager.GetComponentData<XTMFareConflictCounter>(line).m_count;
            }
            count++;

            m_XTMFareGroupEndFrameSystem.EnqueueFareChange(line, expected);

            if (count >= XTMFareConflictCounter.PersistThreshold)
            {
                if (EntityManager.HasComponent<XTMFareConflictCounter>(line))
                {
                    EntityManager.RemoveComponent<XTMFareConflictCounter>(line);
                }
                if (!EntityManager.HasComponent<XTMFarePersistingConflict>(line))
                {
                    EntityManager.AddComponent<XTMFarePersistingConflict>(line);
                }
            }
            else if (EntityManager.HasComponent<XTMFareConflictCounter>(line))
            {
                EntityManager.SetComponentData(line, new XTMFareConflictCounter { m_count = count });
            }
            else
            {
                EntityManager.AddComponentData(line, new XTMFareConflictCounter { m_count = count });
            }
        }

        private void ApplyFaresFromMap(NativeHashMap<Entity, float> groupFares, bool clearConflictsExceptPersisting)
        {
            using NativeArray<Entity> lines = m_AssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            using NativeList<Entity> targets = new(lines.Length, Allocator.TempJob);
            using NativeList<float> fares = new(lines.Length, Allocator.TempJob);

            new CollectLinesForGroupsJob
            {
                m_Lines = lines,
                m_Associations = GetComponentLookup<XTMFareLineAssociation>(true),
                m_Persisting = GetComponentLookup<XTMFarePersistingConflict>(true),
                m_GroupFares = groupFares,
                m_Targets = targets,
                m_Fares = fares
            }.Schedule().Complete();

            for (int i = 0; i < targets.Length; i++)
            {
                m_XTMFareGroupEndFrameSystem.EnqueueFareChange(targets[i], fares[i]);
            }

            if (clearConflictsExceptPersisting)
            {
                ClearConflictCountersExceptPersisting();
            }
        }


        private void ClearConflictCountersExceptPersisting()
        {          
            if (m_ConflictedElementsQuery.IsEmptyIgnoreFilter)
            {
                return;
            }
            using NativeArray<Entity> lines = m_ConflictedElementsQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < lines.Length; i++)
            {
                EntityManager.RemoveComponent<XTMFareConflictCounter>(lines[i]);
            }
        }

        private void ClearConflictsForGroup(Entity group)
        {
            using NativeArray<Entity> allLines = m_AllAssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < allLines.Length; i++)
            {
                Entity line = allLines[i];
                XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(line);
                if (assoc.m_fareGroup != group)
                {
                    continue;
                }
                if (EntityManager.HasComponent<XTMFareConflictCounter>(line))
                {
                    EntityManager.RemoveComponent<XTMFareConflictCounter>(line);
                }
                if (EntityManager.HasComponent<XTMFarePersistingConflict>(line))
                {
                    EntityManager.RemoveComponent<XTMFarePersistingConflict>(line);
                }
            }
        }

        [BurstCompile]
        private struct CollectLinesForGroupsJob : IJob
        {
            [ReadOnly] public NativeArray<Entity> m_Lines;
            [ReadOnly] public ComponentLookup<XTMFareLineAssociation> m_Associations;
            [ReadOnly] public ComponentLookup<XTMFarePersistingConflict> m_Persisting;
            [ReadOnly] public NativeHashMap<Entity, float> m_GroupFares;
            public NativeList<Entity> m_Targets;
            public NativeList<float> m_Fares;

            public void Execute()
            {
                for (int i = 0; i < m_Lines.Length; i++)
                {
                    Entity line = m_Lines[i];
                    if (m_Persisting.HasComponent(line) || !m_Associations.HasComponent(line))
                    {
                        continue;
                    }
                    XTMFareLineAssociation assoc = m_Associations[line];
                    if (m_GroupFares.TryGetValue(assoc.m_fareGroup, out float fare))
                    {
                        m_Targets.Add(line);
                        m_Fares.Add(fare);
                    }
                }
            }
        }
    }
}
