using Belzont.Interfaces;
using Belzont.Utils;
using Colossal.Entities;
using Game.Common;
using Game.Prefabs;
using Game.Routes;
using Game.Tools;
using Game.UI;
using System;
using System.Collections.Generic;
using Unity.Collections;
using Unity.Entities;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    public partial class XTMFareGroupController : SystemBase, IBelzontBindable
    {
        private const string PREFIX = "fareGroups.";
        private const string UnnamedLocaleKey = "K45::XTM.vuio[fareGroups.unnamed]";

        private EntityQuery m_FareGroupQuery;
        private EntityQuery m_AssociatedLinesQuery;
        private EntityQuery m_PassengerLinesQuery;

        private NameSystem m_NameSystem;
        private XTMFareGroupSystem m_FareGroupSystem;
        private EntityArchetype m_FareGroupArchetype;

        public void SetupCaller(Action<string, object[]> eventCaller) { }

        public void SetupEventBinder(Action<string, Delegate> eventCaller) { }

        public void SetupCallBinder(Action<string, Delegate> callBinder)
        {
            callBinder($"{PREFIX}lineBelongsToGroup", LineBelongsToGroup);
            callBinder($"{PREFIX}list", ListFareGroups);
            callBinder($"{PREFIX}create", CreateFareGroup);
            callBinder($"{PREFIX}delete", DeleteFareGroup);
            callBinder($"{PREFIX}detail", DetailFareGroup);
            callBinder($"{PREFIX}listShieldLines", ListShieldLines);
            callBinder($"{PREFIX}save", SaveFareGroup);
        }

        protected override void OnCreate()
        {
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_FareGroupSystem = World.GetOrCreateSystemManaged<XTMFareGroupSystem>();

            m_FareGroupQuery = GetEntityQuery(ComponentType.ReadOnly<XTMFareGroup>());
            m_AssociatedLinesQuery = GetEntityQuery(ComponentType.ReadOnly<XTMFareLineAssociation>());
            m_PassengerLinesQuery = GetEntityQuery(new EntityQueryDesc
            {
                All = new ComponentType[]
                {
                    ComponentType.ReadOnly<Route>(),
                    ComponentType.ReadOnly<RouteNumber>(),
                    ComponentType.ReadOnly<TransportLine>(),
                    ComponentType.ReadOnly<RouteWaypoint>(),
                    ComponentType.ReadOnly<PrefabRef>(),
                    ComponentType.ReadOnly<Game.Routes.Color>()
                },
                None = new ComponentType[]
                {
                    ComponentType.ReadOnly<Deleted>(),
                    ComponentType.ReadOnly<Temp>()
                }
            });

            m_FareGroupArchetype = EntityManager.CreateArchetype(
                ComponentType.ReadWrite<XTMFareGroup>(),
                ComponentType.ReadWrite<XTMFareGroupHourException>());
        }

        protected override void OnUpdate() { }

        private bool LineBelongsToGroup(Entity line)
        {
            if (line == Entity.Null || !EntityManager.Exists(line)
                || !EntityManager.HasComponent<XTMFareLineAssociation>(line))
            {
                return false;
            }
            XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(line);
            return XTMFareGroupUtils.IsValidFareGroup(EntityManager, assoc.m_fareGroup);
        }

        private FareGroupListItem[] ListFareGroups()
        {
            using NativeArray<Entity> groups = m_FareGroupQuery.ToEntityArray(Allocator.Temp);
            var counts = CountLinesPerGroup();
            var items = new FareGroupListItem[groups.Length];
            for (int i = 0; i < groups.Length; i++)
            {
                Entity group = groups[i];
                XTMFareGroup data = EntityManager.GetComponentData<XTMFareGroup>(group);
                counts.TryGetValue(group, out int count);
                items[i] = new FareGroupListItem
                {
                    entity = group,
                    name = m_NameSystem.GetName(group).Translate(),
                    defaultFare = data.m_defaultFare,
                    lineCount = count
                };
            }
            return items;
        }

        private Entity CreateFareGroup()
        {
            Entity ticketPolicy = m_FareGroupSystem.TicketPricePolicy;
            float defaultFare = XTMFareGroupUtils.GetTicketSliderDefault(EntityManager, ticketPolicy);

            Entity group = EntityManager.CreateEntity(m_FareGroupArchetype);
            EntityManager.SetComponentData(group, new XTMFareGroup { m_defaultFare = defaultFare });
            m_NameSystem.SetCustomName(group, LocalizationExtensions.Translate(UnnamedLocaleKey));
            return group;
        }

        private bool DeleteFareGroup(Entity group)
        {
            if (!XTMFareGroupUtils.IsValidFareGroup(EntityManager, group))
            {
                return false;
            }
            EntityManager.DestroyEntity(group);
            return true;
        }

        private FareGroupDetail DetailFareGroup(Entity group)
        {
            if (!XTMFareGroupUtils.IsValidFareGroup(EntityManager, group))
            {
                return null;
            }

            XTMFareGroup data = EntityManager.GetComponentData<XTMFareGroup>(group);
            DynamicBuffer<XTMFareGroupHourException> buffer = EntityManager.GetBuffer<XTMFareGroupHourException>(group, true);
            var exceptions = new FareGroupHourExceptionDto[buffer.Length];
            for (int i = 0; i < buffer.Length; i++)
            {
                exceptions[i] = new FareGroupHourExceptionDto
                {
                    startingHour = buffer[i].m_startingHour,
                    endingHour = buffer[i].m_endingHour,
                    fareValue = buffer[i].m_fareValue
                };
            }

            return new FareGroupDetail
            {
                entity = group,
                name = m_NameSystem.GetName(group).Translate(),
                defaultFare = data.m_defaultFare,
                exceptions = exceptions,
                lines = CollectLinesForGroup(group)
            };
        }

        private LineShieldInfo[] ListShieldLines()
        {
            using NativeArray<Entity> lineEntities = m_PassengerLinesQuery.ToEntityArray(Allocator.Temp);
            var matching = new List<Entity>(lineEntities.Length);
            for (int i = 0; i < lineEntities.Length; i++)
            {
                Entity lineEntity = lineEntities[i];
                if (!EntityManager.TryGetComponent(lineEntity, out Route route)
                    || RouteUtils.CheckOption(route, RouteOption.Inactive))
                {
                    continue;
                }
                if (!EntityManager.TryGetComponent(lineEntity, out PrefabRef prefabRef)
                    || !EntityManager.TryGetComponent(prefabRef.m_Prefab, out TransportLineData lineData)
                    || lineData.m_CargoTransport)
                {
                    continue;
                }
                matching.Add(lineEntity);
            }
            return LineShieldBuilder.BuildMany(EntityManager, m_NameSystem, matching);
        }

        private bool SaveFareGroup(Entity group, FareGroupDetail detail)
        {
            if (!XTMFareGroupUtils.IsValidFareGroup(EntityManager, group) || detail == null)
            {
                return false;
            }

            if (!ValidateExceptions(detail.exceptions, out FareGroupHourExceptionDto[] exceptions))
            {
                return false;
            }

            Entity ticketPolicy = m_FareGroupSystem.TicketPricePolicy;
            XTMFareGroupUtils.TryClampFare(EntityManager, ticketPolicy, detail.defaultFare, out float defaultFare);

            EntityManager.SetComponentData(group, new XTMFareGroup { m_defaultFare = defaultFare });

            string name = string.IsNullOrWhiteSpace(detail.name)
                ? LocalizationExtensions.Translate(UnnamedLocaleKey)
                : detail.name;
            m_NameSystem.SetCustomName(group, name);

            DynamicBuffer<XTMFareGroupHourException> buffer = EntityManager.GetBuffer<XTMFareGroupHourException>(group, false);
            buffer.Clear();
            for (int i = 0; i < exceptions.Length; i++)
            {
                XTMFareGroupUtils.TryClampFare(EntityManager, ticketPolicy, exceptions[i].fareValue, out float fare);
                buffer.Add(new XTMFareGroupHourException
                {
                    m_startingHour = exceptions[i].startingHour,
                    m_endingHour = exceptions[i].endingHour,
                    m_fareValue = fare
                });
            }

            ReplaceMembership(group, detail.lines ?? Array.Empty<Entity>());

            if (!EntityManager.HasComponent<XTMFareGroupDirty>(group))
            {
                EntityManager.AddComponent<XTMFareGroupDirty>(group);
            }

            return true;
        }

        private void ReplaceMembership(Entity group, Entity[] desiredLines)
        {
            var desired = new HashSet<Entity>();
            for (int i = 0; i < desiredLines.Length; i++)
            {
                Entity line = desiredLines[i];
                if (line != Entity.Null && EntityManager.Exists(line)
                    && EntityManager.HasComponent<TransportLine>(line))
                {
                    desired.Add(line);
                }
            }

            using NativeArray<Entity> associated = m_AssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < associated.Length; i++)
            {
                Entity line = associated[i];
                XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(line);
                if (assoc.m_fareGroup != group)
                {
                    continue;
                }
                if (!desired.Contains(line))
                {
                    RemoveLineFromGroup(line);
                }
            }

            foreach (Entity line in desired)
            {
                AssociateLine(line, group);
            }
        }

        private void AssociateLine(Entity line, Entity group)
        {
            if (EntityManager.HasComponent<XTMFareConflictCounter>(line))
            {
                EntityManager.RemoveComponent<XTMFareConflictCounter>(line);
            }
            if (EntityManager.HasComponent<XTMFarePersistingConflict>(line))
            {
                EntityManager.RemoveComponent<XTMFarePersistingConflict>(line);
            }

            var assoc = new XTMFareLineAssociation
            {
                m_fareGroup = group,
                m_lastAdjustment = 0f
            };
            if (EntityManager.HasComponent<XTMFareLineAssociation>(line))
            {
                XTMFareLineAssociation existing = EntityManager.GetComponentData<XTMFareLineAssociation>(line);
                assoc.m_lastAdjustment = existing.m_lastAdjustment;
                EntityManager.SetComponentData(line, assoc);
            }
            else
            {
                EntityManager.AddComponentData(line, assoc);
            }

            if (!EntityManager.HasComponent<XTMFareLineDirty>(line))
            {
                EntityManager.AddComponent<XTMFareLineDirty>(line);
            }
        }

        private void RemoveLineFromGroup(Entity line)
        {
            if (EntityManager.HasComponent<XTMFareLineAssociation>(line))
            {
                EntityManager.RemoveComponent<XTMFareLineAssociation>(line);
            }
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

        private static bool ValidateExceptions(FareGroupHourExceptionDto[] exceptions, out FareGroupHourExceptionDto[] cleaned)
        {
            cleaned = exceptions ?? Array.Empty<FareGroupHourExceptionDto>();
            for (int i = 0; i < cleaned.Length; i++)
            {
                FareGroupHourExceptionDto e = cleaned[i];
                if (e.startingHour > 23 || e.endingHour > 23 || e.startingHour > e.endingHour)
                {
                    cleaned = Array.Empty<FareGroupHourExceptionDto>();
                    return false;
                }
            }
            return true;
        }

        private Entity[] CollectLinesForGroup(Entity group)
        {
            using NativeArray<Entity> associated = m_AssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            var list = new List<Entity>();
            for (int i = 0; i < associated.Length; i++)
            {
                XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(associated[i]);
                if (assoc.m_fareGroup == group)
                {
                    list.Add(associated[i]);
                }
            }
            return list.ToArray();
        }

        private Dictionary<Entity, int> CountLinesPerGroup()
        {
            var counts = new Dictionary<Entity, int>();
            using NativeArray<Entity> associated = m_AssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < associated.Length; i++)
            {
                XTMFareLineAssociation assoc = EntityManager.GetComponentData<XTMFareLineAssociation>(associated[i]);
                if (!XTMFareGroupUtils.IsValidFareGroup(EntityManager, assoc.m_fareGroup))
                {
                    continue;
                }
                if (!counts.TryGetValue(assoc.m_fareGroup, out int c))
                {
                    c = 0;
                }
                counts[assoc.m_fareGroup] = c + 1;
            }
            return counts;
        }
    }
}
