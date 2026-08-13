using Belzont.Interfaces;
using Belzont.Utils;
using Colossal.Entities;
using Game;
using Game.City;
using Game.Common;
using Game.Economy;
using Game.Prefabs;
using Game.Routes;
using Game.Tools;
using Game.UI;
using Game.Vehicles;
using System;
using System.Collections.Generic;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    public partial class XTMVehicleModelGroupController : GameSystemBase, IBelzontBindable
    {
        private const string PREFIX = "vehicleModelGroups.";
        private const string UnnamedLocaleKey = "K45::XTM.vuio[vehicleModelGroups.unnamed]";

        private EntityQuery m_GroupQuery;
        private EntityQuery m_AssociatedLinesQuery;
        private EntityQuery m_LinesQuery;
        private EntityQuery m_DepotQuery;
        private EntityQuery m_TransportVehiclePrefabQuery;

        private NameSystem m_NameSystem;
        private PrefabSystem m_PrefabSystem;
        private CityConfigurationSystem m_CityConfigurationSystem;
        private TransportVehicleSelectData m_TransportVehicleSelectData;
        private ImageSystem m_ImageSystem;
        private EntityArchetype m_GroupArchetype;

        private readonly Dictionary<Entity, VehicleModelGroupDetail> m_PendingSaves = new();

        public void SetupCaller(Action<string, object[]> eventCaller) { }

        public void SetupEventBinder(Action<string, Delegate> eventCaller) { }

        public void SetupCallBinder(Action<string, Delegate> callBinder)
        {
            callBinder($"{PREFIX}lineBelongsToGroup", LineBelongsToGroup);
            callBinder($"{PREFIX}lineMembership", LineMembership);
            callBinder($"{PREFIX}list", ListVehicleModelGroups);
            callBinder($"{PREFIX}create", CreateVehicleModelGroup);
            callBinder($"{PREFIX}delete", DeleteVehicleModelGroup);
            callBinder($"{PREFIX}detail", DetailVehicleModelGroup);
            callBinder($"{PREFIX}listShieldLines", ListShieldLines);
            callBinder($"{PREFIX}save", EnqueueSaveVehicleModelGroup);
            callBinder($"{PREFIX}listAvailableVehicles", ListAvailableVehicles);
            callBinder($"{PREFIX}listPresentTypes", ListPresentTypes);
            callBinder($"{PREFIX}assignLine", AssignLine);
            callBinder($"{PREFIX}lineTypeInfo", LineTypeInfo);
        }

        public override int GetUpdateInterval(SystemUpdatePhase phase)
        {
            return 64;
        }

        protected override void OnCreate()
        {
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_PrefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();
            m_CityConfigurationSystem = World.GetOrCreateSystemManaged<CityConfigurationSystem>();
            m_ImageSystem = World.GetOrCreateSystemManaged<ImageSystem>();
            m_TransportVehicleSelectData = new TransportVehicleSelectData(this);

            m_GroupQuery = GetEntityQuery(ComponentType.ReadOnly<XTMVehicleModelGroup>());
            m_AssociatedLinesQuery = GetEntityQuery(ComponentType.ReadOnly<XTMVehicleModelLineAssociation>());
            m_LinesQuery = GetEntityQuery(new EntityQueryDesc
            {
                All = new ComponentType[]
                {
                    ComponentType.ReadOnly<Route>(),
                    ComponentType.ReadOnly<RouteNumber>(),
                    ComponentType.ReadOnly<TransportLine>(),
                    ComponentType.ReadOnly<RouteWaypoint>(),
                    ComponentType.ReadOnly<PrefabRef>(),
                    ComponentType.ReadOnly<Game.Routes.Color>(),
                    ComponentType.ReadOnly<VehicleModel>()
                },
                None = new ComponentType[]
                {
                    ComponentType.ReadOnly<Deleted>(),
                    ComponentType.ReadOnly<Temp>()
                }
            });
            m_DepotQuery = GetEntityQuery(new ComponentType[]
            {
                ComponentType.ReadOnly<Game.Buildings.TransportDepot>(),
                ComponentType.Exclude<Temp>(),
                ComponentType.Exclude<Deleted>()
            });
            m_TransportVehiclePrefabQuery = GetEntityQuery(new EntityQueryDesc[]
            {
                TransportVehicleSelectData.GetEntityQueryDesc()
            });

            m_GroupArchetype = EntityManager.CreateArchetype(
                ComponentType.ReadWrite<XTMVehicleModelGroup>(),
                ComponentType.ReadWrite<VehicleModel>());
        }

        protected override void OnUpdate()
        {
            if (m_PendingSaves.Count == 0)
            {
                return;
            }

            var pending = new List<KeyValuePair<Entity, VehicleModelGroupDetail>>(m_PendingSaves);
            m_PendingSaves.Clear();
            for (int i = 0; i < pending.Count; i++)
            {
                ApplyVehicleModelGroupSave(pending[i].Key, pending[i].Value);
            }
        }

        private bool LineBelongsToGroup(Entity line)
        {
            if (line == Entity.Null || !EntityManager.Exists(line)
                || !EntityManager.HasComponent<XTMVehicleModelLineAssociation>(line))
            {
                return false;
            }
            XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
            return XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, assoc.m_group);
        }

        /// <summary>
        /// Transport type / cargo flag for an unassigned line (from its route prefab).
        /// </summary>
        private VehicleModelPresentType LineTypeInfo(Entity line)
        {
            if (line == Entity.Null || !EntityManager.Exists(line)
                || !EntityManager.HasComponent<TransportLine>(line)
                || !EntityManager.TryGetComponent(line, out PrefabRef prefabRef)
                || !EntityManager.TryGetComponent(prefabRef.m_Prefab, out TransportLineData lineData))
            {
                return null;
            }

            return new VehicleModelPresentType
            {
                transportType = (int)lineData.m_TransportType,
                isCargo = lineData.m_CargoTransport
            };
        }

        private VehicleModelGroupLineMembership LineMembership(Entity line)
        {
            if (line == Entity.Null || !EntityManager.Exists(line)
                || !EntityManager.HasComponent<XTMVehicleModelLineAssociation>(line))
            {
                return null;
            }

            XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
            Entity group = assoc.m_group;
            if (!XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, group))
            {
                return null;
            }

            XTMVehicleModelGroup settings = EntityManager.GetComponentData<XTMVehicleModelGroup>(group);

            Entity[] lines = CollectLinesForGroup(group);
            Array.Sort(lines, (a, b) => a.Index.CompareTo(b.Index));

            const int SoftCapThreshold = 7;
            const int SoftCapTake = 5;
            int n = lines.Length;
            int take = n >= SoftCapThreshold ? SoftCapTake : n;
            int overflow = n >= SoftCapThreshold ? n - SoftCapTake : 0;

            var labels = new string[take];
            for (int i = 0; i < take; i++)
            {
                labels[i] = FormatLineMembershipLabel(lines[i]);
            }

            return new VehicleModelGroupLineMembership
            {
                group = group,
                groupName = m_NameSystem.GetName(group).Translate(),
                lineCount = n,
                lineLabels = labels,
                overflowCount = overflow,
                transportType = (int)settings.m_transportType,
                isCargo = settings.m_isCargo
            };
        }

        private string FormatLineMembershipLabel(Entity lineEntity)
        {
            string code;
            if (EntityManager.TryGetComponent(lineEntity, out XTMRouteExtraData xtmData)
                && !string.IsNullOrWhiteSpace(xtmData.Acronym))
            {
                code = xtmData.Acronym;
            }
            else
            {
                EntityManager.TryGetComponent(lineEntity, out RouteNumber routeNumber);
                code = routeNumber.m_Number.ToString();
            }

            string name = m_NameSystem.GetName(lineEntity).Translate() ?? string.Empty;
            return string.IsNullOrWhiteSpace(name) ? code : $"{code} {name}";
        }

        private VehicleModelGroupListItem[] ListVehicleModelGroups()
        {
            using NativeArray<Entity> groups = m_GroupQuery.ToEntityArray(Allocator.Temp);
            var ordered = new Entity[groups.Length];
            for (int i = 0; i < groups.Length; i++)
            {
                ordered[i] = groups[i];
            }
            Array.Sort(ordered, (a, b) => a.Index.CompareTo(b.Index));

            var counts = CountLinesPerGroup();
            var items = new VehicleModelGroupListItem[ordered.Length];
            for (int i = 0; i < ordered.Length; i++)
            {
                Entity group = ordered[i];
                XTMVehicleModelGroup data = EntityManager.GetComponentData<XTMVehicleModelGroup>(group);
                counts.TryGetValue(group, out int count);
                items[i] = new VehicleModelGroupListItem
                {
                    entity = group,
                    name = m_NameSystem.GetName(group).Translate(),
                    transportType = (int)data.m_transportType,
                    isCargo = data.m_isCargo,
                    modelCount = XTMVehicleModelGroupUtils.CountValidModelEntries(EntityManager, group),
                    lineCount = count
                };
            }
            return items;
        }

        private Entity CreateVehicleModelGroup(int transportType, bool isCargo)
        {
            var type = (TransportType)transportType;
            Entity group = EntityManager.CreateEntity(m_GroupArchetype);
            EntityManager.SetComponentData(group, new XTMVehicleModelGroup
            {
                m_transportType = type,
                m_isCargo = isCargo
            });
            m_NameSystem.SetCustomName(group, LocalizationExtensions.Translate(UnnamedLocaleKey));
            return group;
        }

        private bool DeleteVehicleModelGroup(Entity group)
        {
            if (!XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, group))
            {
                return false;
            }
            m_PendingSaves.Remove(group);
            EntityManager.DestroyEntity(group);
            return true;
        }

        private VehicleModelGroupDetail DetailVehicleModelGroup(Entity group)
        {
            if (!XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, group))
            {
                return null;
            }

            XTMVehicleModelGroup data = EntityManager.GetComponentData<XTMVehicleModelGroup>(group);
            DynamicBuffer<VehicleModel> buffer = EntityManager.GetBuffer<VehicleModel>(group, true);
            var models = new VehicleModelPairDto[buffer.Length];
            for (int i = 0; i < buffer.Length; i++)
            {
                models[i] = new VehicleModelPairDto
                {
                    primaryPrefab = buffer[i].m_PrimaryPrefab,
                    secondaryPrefab = buffer[i].m_SecondaryPrefab
                };
            }

            return new VehicleModelGroupDetail
            {
                entity = group,
                name = m_NameSystem.GetName(group).Translate(),
                transportType = (int)data.m_transportType,
                isCargo = data.m_isCargo,
                models = models,
                lines = CollectLinesForGroup(group)
            };
        }

        private VehicleModelGroupLineShieldInfo[] ListShieldLines(int transportType, bool isCargo, bool includeInactive)
        {
            var type = (TransportType)transportType;
            using NativeArray<Entity> lineEntities = m_LinesQuery.ToEntityArray(Allocator.Temp);
            var matching = new List<Entity>(lineEntities.Length);
            for (int i = 0; i < lineEntities.Length; i++)
            {
                Entity lineEntity = lineEntities[i];
                if (!EntityManager.TryGetComponent(lineEntity, out Route route))
                {
                    continue;
                }
                bool inactive = RouteUtils.CheckOption(route, RouteOption.Inactive);
                if (inactive && !includeInactive)
                {
                    continue;
                }
                if (!EntityManager.TryGetComponent(lineEntity, out PrefabRef prefabRef)
                    || !EntityManager.TryGetComponent(prefabRef.m_Prefab, out TransportLineData lineData))
                {
                    continue;
                }
                if (lineData.m_TransportType != type || lineData.m_CargoTransport != isCargo)
                {
                    continue;
                }
                matching.Add(lineEntity);
            }

            var result = new VehicleModelGroupLineShieldInfo[matching.Count];
            for (int i = 0; i < matching.Count; i++)
            {
                Entity line = matching[i];
                Entity vehicleModelGroup = Entity.Null;
                if (EntityManager.HasComponent<XTMVehicleModelLineAssociation>(line))
                {
                    XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
                    if (XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, assoc.m_group))
                    {
                        vehicleModelGroup = assoc.m_group;
                    }
                }
                Route route = EntityManager.GetComponentData<Route>(line);
                result[i] = new VehicleModelGroupLineShieldInfo
                {
                    shield = LineShieldBuilder.Build(EntityManager, m_NameSystem, line),
                    vehicleModelGroup = vehicleModelGroup,
                    active = !RouteUtils.CheckOption(route, RouteOption.Inactive)
                };
            }
            return result;
        }

        private VehicleModelAvailableVehicles ListAvailableVehicles(int transportType, bool isCargo)
        {
            var type = (TransportType)transportType;
            using NativeArray<int> depotResults = new(2, Allocator.TempJob);
            CollectDepotEnergyTypes(type, depotResults);

            m_TransportVehicleSelectData.PreUpdate(this, m_CityConfigurationSystem, m_TransportVehiclePrefabQuery, Allocator.TempJob, out JobHandle prefabJob);
            using NativeList<Entity> primary = new(32, Allocator.TempJob);
            using NativeList<Entity> secondary = new(32, Allocator.TempJob);

            var listJob = new TransportVehiclesListJob
            {
                m_Resources = isCargo ? Resource.All : Resource.NoResource,
                m_EnergyTypes = (EnergyTypes)depotResults[1],
                m_SizeClass = SizeClass.Large,
                m_PublicTransportPurpose = isCargo ? (PublicTransportPurpose)0 : PublicTransportPurpose.TransportLine,
                m_TransportType = type,
                m_PrimaryList = primary,
                m_SecondaryList = secondary,
                m_VehicleSelectData = m_TransportVehicleSelectData
            };
            JobHandle handle = listJob.Schedule(JobHandle.CombineDependencies(Dependency, prefabJob));
            depotResults.Dispose(handle);
            handle.Complete();
            m_TransportVehicleSelectData.PostUpdate(handle);

            var primaryArr = new VehicleModelPrefabInfo[primary.Length];
            for (int i = 0; i < primary.Length; i++)
            {
                primaryArr[i] = BuildPrefabInfo(primary[i]);
            }
            VehicleModelPrefabInfo[] secondaryArr;
            if (XTMVehicleModelGroupUtils.SupportsSecondary(type, isCargo))
            {
                secondaryArr = new VehicleModelPrefabInfo[secondary.Length];
                for (int i = 0; i < secondary.Length; i++)
                {
                    secondaryArr[i] = BuildPrefabInfo(secondary[i]);
                }
            }
            else
            {
                secondaryArr = Array.Empty<VehicleModelPrefabInfo>();
            }

            return new VehicleModelAvailableVehicles
            {
                primary = primaryArr,
                secondary = secondaryArr
            };
        }

        private VehicleModelPresentType[] ListPresentTypes()
        {
            using NativeArray<Entity> lineEntities = m_LinesQuery.ToEntityArray(Allocator.Temp);
            var seen = new HashSet<long>();
            var list = new List<VehicleModelPresentType>();
            for (int i = 0; i < lineEntities.Length; i++)
            {
                Entity lineEntity = lineEntities[i];
                if (!EntityManager.TryGetComponent(lineEntity, out PrefabRef prefabRef)
                    || !EntityManager.TryGetComponent(prefabRef.m_Prefab, out TransportLineData lineData))
                {
                    continue;
                }
                long key = ((long)(int)lineData.m_TransportType << 1) | (lineData.m_CargoTransport ? 1L : 0L);
                if (!seen.Add(key))
                {
                    continue;
                }
                list.Add(new VehicleModelPresentType
                {
                    transportType = (int)lineData.m_TransportType,
                    isCargo = lineData.m_CargoTransport
                });
            }
            list.Sort((a, b) =>
            {
                int cmp = a.transportType.CompareTo(b.transportType);
                return cmp != 0 ? cmp : a.isCargo.CompareTo(b.isCargo);
            });
            return list.ToArray();
        }

        private VehicleModelPrefabInfo BuildPrefabInfo(Entity prefab)
        {
            string name = m_PrefabSystem.GetPrefabName(prefab) ?? string.Empty;
            // Same source as SelectVehiclesSection SIP chips/dropdown (`VehiclePrefab.thumbnail`).
            string imageUrl = m_ImageSystem.GetThumbnail(prefab) ?? m_ImageSystem.placeholderIcon;
            bool isCarriage = EntityManager.HasComponent<TrainCarriageData>(prefab);

            int ownCapacity = GetPrefabCapacity(prefab);
            GetPrefabMeshSize(prefab, out float meshWidth, out float meshHeight, out float ownLength);

            int capacity = ownCapacity;
            float meshDepth = ownLength;
            string compositionDescriptor = string.Empty;
            int compositionUnitCount = 0;
            int carsPerUnitCount = 0;

            // Rail engines / MU fronts: sum cars per unit × unit count (vanilla TransportVehicleSelectData).
            if (EntityManager.TryGetComponent(prefab, out TrainEngineData engineData))
            {
                int unitMin = Math.Max(1, engineData.m_Count.x);
                int unitMax = Math.Max(unitMin, engineData.m_Count.y);
                compositionUnitCount = unitMax;

                int carsMin = 1;
                int carsMax = 1;
                int capacityPerUnit = ownCapacity;
                float lengthPerUnit = ownLength;

                if (EntityManager.TryGetBuffer(prefab, true, out DynamicBuffer<VehicleCarriageElement> carriages))
                {
                    for (int i = 0; i < carriages.Length; i++)
                    {
                        VehicleCarriageElement el = carriages[i];
                        int cMin = Math.Max(0, el.m_Count.x);
                        int cMax = Math.Max(cMin, el.m_Count.y);
                        carsMin += cMin;
                        carsMax += cMax;

                        // Entity.Null slots are filled by the selected secondary carriage at spawn time.
                        if (el.m_Prefab == Entity.Null)
                        {
                            continue;
                        }

                        int carriageCapacity = GetPrefabCapacity(el.m_Prefab);
                        GetPrefabMeshSize(el.m_Prefab, out _, out _, out float carriageLength);
                        // Match vanilla: use m_Count.x when aggregating.
                        capacityPerUnit += carriageCapacity * cMin;
                        lengthPerUnit += carriageLength * cMin;
                    }
                }

                carsPerUnitCount = carsMax;
                // Match vanilla unitCount = TrainEngineData.m_Count.x
                capacity = capacityPerUnit * unitMin;
                meshDepth = lengthPerUnit * unitMin;
                compositionDescriptor = FormatCompositionDescriptor(unitMin, unitMax, carsMin, carsMax);
            }

            return new VehicleModelPrefabInfo
            {
                entity = prefab,
                name = name,
                imageUrl = imageUrl,
                capacity = capacity,
                isSecondary = isCarriage,
                meshWidth = meshWidth,
                meshHeight = meshHeight,
                meshDepth = meshDepth,
                singleMeshDepth = ownLength,
                compositionDescriptor = compositionDescriptor,
                compositionUnitCount = compositionUnitCount,
                carsPerUnitCount = carsPerUnitCount
            };
        }

        private static string FormatCompositionDescriptor(int unitMin, int unitMax, int carsMin, int carsMax)
        {
            string units = unitMin == unitMax ? $"{unitMin}" : $"{unitMin}-{unitMax}";
            string cars = carsMin == carsMax ? $"{carsMin}" : $"{carsMin}-{carsMax}";
            return $"{units}×{cars}";
        }

        private int GetPrefabCapacity(Entity prefab)
        {
            if (EntityManager.TryGetComponent(prefab, out PublicTransportVehicleData ptData))
            {
                return ptData.m_PassengerCapacity;
            }
            if (EntityManager.TryGetComponent(prefab, out CargoTransportVehicleData cargoData))
            {
                return cargoData.m_CargoCapacity;
            }
            return 0;
        }

        private void GetPrefabMeshSize(Entity prefab, out float width, out float height, out float depth)
        {
            width = 0f;
            height = 0f;
            depth = 0f;
            if (EntityManager.TryGetComponent(prefab, out ObjectGeometryData geometry))
            {
                width = geometry.m_Size.x;
                height = geometry.m_Size.y;
                depth = geometry.m_Size.z;
            }
        }

        private void CollectDepotEnergyTypes(TransportType transportType, NativeArray<int> results)
        {
            results[0] = 0;
            results[1] = 0;
            using NativeArray<Entity> depots = m_DepotQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < depots.Length; i++)
            {
                Entity depot = depots[i];
                if (!EntityManager.TryGetComponent(depot, out PrefabRef prefabRef)
                    || !EntityManager.TryGetComponent(prefabRef.m_Prefab, out TransportDepotData depotData))
                {
                    continue;
                }
                if (EntityManager.TryGetBuffer(depot, true, out DynamicBuffer<Game.Buildings.InstalledUpgrade> upgrades))
                {
                    UpgradeUtils.CombineStats(EntityManager, ref depotData, upgrades);
                }
                if (depotData.m_TransportType == transportType)
                {
                    results[0] = 1;
                    results[1] = results[1] | (int)depotData.m_EnergyTypes;
                }
            }
            if (results[1] == 0)
            {
                results[1] = (int)EnergyTypes.FuelAndElectricity;
            }
        }

        private bool EnqueueSaveVehicleModelGroup(Entity group, VehicleModelGroupDetail detail)
        {
            if (!XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, group) || detail == null)
            {
                return false;
            }
            if (!HasAtLeastOneNonEmptyModel(detail.models))
            {
                return false;
            }
            // Empty line membership is allowed: groups may hold compositions before any lines are linked.
            detail.lines ??= Array.Empty<Entity>();
            detail.entity = group;
            m_PendingSaves[group] = detail;
            return true;
        }

        private static bool HasAtLeastOneNonEmptyModel(VehicleModelPairDto[] models)
        {
            if (models == null || models.Length == 0)
            {
                return false;
            }
            for (int i = 0; i < models.Length; i++)
            {
                VehicleModelPairDto model = models[i];
                if (model == null)
                {
                    continue;
                }
                if (model.primaryPrefab != Entity.Null || model.secondaryPrefab != Entity.Null)
                {
                    return true;
                }
            }
            return false;
        }

        private bool ApplyVehicleModelGroupSave(Entity group, VehicleModelGroupDetail detail)
        {
            if (!XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, group) || detail == null)
            {
                return false;
            }
            if (!HasAtLeastOneNonEmptyModel(detail.models))
            {
                return false;
            }

            // Transport type / cargo are immutable after create — keep existing settings.
            XTMVehicleModelGroup settings = EntityManager.GetComponentData<XTMVehicleModelGroup>(group);

            var accepted = new List<VehicleModel>();
            var seenPairs = new HashSet<(Entity, Entity)>();
            VehicleModelPairDto[] models = detail.models ?? Array.Empty<VehicleModelPairDto>();
            for (int i = 0; i < models.Length; i++)
            {
                Entity primary = models[i]?.primaryPrefab ?? Entity.Null;
                Entity secondary = models[i]?.secondaryPrefab ?? Entity.Null;
                if (primary == Entity.Null && secondary == Entity.Null)
                {
                    continue;
                }
                if (primary != Entity.Null
                    && !XTMVehicleModelGroupUtils.IsCompatibleVehiclePrefab(
                        EntityManager, primary, settings.m_transportType, settings.m_isCargo, isSecondary: false))
                {
                    primary = Entity.Null;
                }
                if (secondary != Entity.Null
                    && !XTMVehicleModelGroupUtils.IsCompatibleVehiclePrefab(
                        EntityManager, secondary, settings.m_transportType, settings.m_isCargo, isSecondary: true))
                {
                    secondary = Entity.Null;
                }
                if (primary == Entity.Null && secondary == Entity.Null)
                {
                    continue;
                }
                if (!seenPairs.Add((primary, secondary)))
                {
                    continue;
                }
                accepted.Add(new VehicleModel
                {
                    m_PrimaryPrefab = primary,
                    m_SecondaryPrefab = secondary
                });
            }
            if (accepted.Count == 0)
            {
                return false;
            }

            string name = string.IsNullOrWhiteSpace(detail.name)
                ? LocalizationExtensions.Translate(UnnamedLocaleKey)
                : detail.name;
            m_NameSystem.SetCustomName(group, name);

            DynamicBuffer<VehicleModel> buffer = EntityManager.GetBuffer<VehicleModel>(group, false);
            buffer.Clear();
            for (int i = 0; i < accepted.Count; i++)
            {
                buffer.Add(accepted[i]);
            }

            XTMVehicleModelGroupUtils.StripInvalidGroupModels(EntityManager, group);
            // Accepted models already passed IsCompatible; if strip emptied the buffer, restore them.
            if (!XTMVehicleModelGroupUtils.HasAtLeastOneValidModel(EntityManager, group))
            {
                buffer = EntityManager.GetBuffer<VehicleModel>(group, false);
                buffer.Clear();
                for (int i = 0; i < accepted.Count; i++)
                {
                    buffer.Add(accepted[i]);
                }
            }

            // Zero lines is valid — clear membership and keep the group + models.
            ReplaceMembership(group, settings, detail.lines ?? Array.Empty<Entity>());

            if (!EntityManager.HasComponent<XTMVehicleModelGroupDirty>(group))
            {
                EntityManager.AddComponent<XTMVehicleModelGroupDirty>(group);
            }

            return true;
        }

        private void ReplaceMembership(Entity group, XTMVehicleModelGroup settings, Entity[] desiredLines)
        {
            desiredLines ??= Array.Empty<Entity>();
            var desired = new HashSet<Entity>();
            for (int i = 0; i < desiredLines.Length; i++)
            {
                Entity line = desiredLines[i];
                if (XTMVehicleModelGroupUtils.LineMatchesGroup(EntityManager, line, settings))
                {
                    desired.Add(line);
                }
            }

            using NativeArray<Entity> associated = m_AssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            for (int i = 0; i < associated.Length; i++)
            {
                Entity line = associated[i];
                XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(line);
                if (assoc.m_group != group)
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
            if (EntityManager.HasComponent<XTMVehicleModelConflictCounter>(line))
            {
                EntityManager.RemoveComponent<XTMVehicleModelConflictCounter>(line);
            }
            if (EntityManager.HasComponent<XTMVehicleModelPersistingConflict>(line))
            {
                EntityManager.RemoveComponent<XTMVehicleModelPersistingConflict>(line);
            }

            var assoc = new XTMVehicleModelLineAssociation { m_group = group };
            if (EntityManager.HasComponent<XTMVehicleModelLineAssociation>(line))
            {
                EntityManager.SetComponentData(line, assoc);
            }
            else
            {
                EntityManager.AddComponentData(line, assoc);
            }

            if (!EntityManager.HasComponent<XTMVehicleModelLineDirty>(line))
            {
                EntityManager.AddComponent<XTMVehicleModelLineDirty>(line);
            }
        }

        private void RemoveLineFromGroup(Entity line)
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

        /// <summary>
        /// Assign <paramref name="line"/> to <paramref name="group"/>, or clear membership when group is null.
        /// Target group must match the line transport type / cargo flag.
        /// </summary>
        private bool AssignLine(Entity line, Entity group)
        {
            if (line == Entity.Null || !EntityManager.Exists(line)
                || !EntityManager.HasComponent<TransportLine>(line))
            {
                return false;
            }

            if (group == Entity.Null || !EntityManager.Exists(group)
                || !XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, group))
            {
                RemoveLineFromGroup(line);
                return true;
            }

            XTMVehicleModelGroup settings = EntityManager.GetComponentData<XTMVehicleModelGroup>(group);
            if (!XTMVehicleModelGroupUtils.LineMatchesGroup(EntityManager, line, settings))
            {
                return false;
            }

            AssociateLine(line, group);
            if (!EntityManager.HasComponent<XTMVehicleModelGroupDirty>(group))
            {
                EntityManager.AddComponent<XTMVehicleModelGroupDirty>(group);
            }
            return true;
        }

        private Entity[] CollectLinesForGroup(Entity group)
        {
            using NativeArray<Entity> associated = m_AssociatedLinesQuery.ToEntityArray(Allocator.Temp);
            var list = new List<Entity>();
            for (int i = 0; i < associated.Length; i++)
            {
                XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(associated[i]);
                if (assoc.m_group == group)
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
                XTMVehicleModelLineAssociation assoc = EntityManager.GetComponentData<XTMVehicleModelLineAssociation>(associated[i]);
                if (!XTMVehicleModelGroupUtils.IsValidVehicleModelGroup(EntityManager, assoc.m_group))
                {
                    continue;
                }
                if (!counts.TryGetValue(assoc.m_group, out int c))
                {
                    c = 0;
                }
                counts[assoc.m_group] = c + 1;
            }
            return counts;
        }

        private struct TransportVehiclesListJob : IJob
        {
            public Resource m_Resources;
            public EnergyTypes m_EnergyTypes;
            public SizeClass m_SizeClass;
            public PublicTransportPurpose m_PublicTransportPurpose;
            public TransportType m_TransportType;
            public NativeList<Entity> m_PrimaryList;
            public NativeList<Entity> m_SecondaryList;
            [ReadOnly] public TransportVehicleSelectData m_VehicleSelectData;

            public void Execute()
            {
                m_VehicleSelectData.ListVehicles(
                    m_TransportType,
                    m_EnergyTypes,
                    m_SizeClass,
                    m_PublicTransportPurpose,
                    m_Resources,
                    m_PrimaryList,
                    m_SecondaryList,
                    true);
            }
        }
    }
}
