using Belzont.Interfaces;
using Belzont.Serialization;
using Belzont.Utils;
using Colossal.Serialization.Entities;
using Colossal.UI.Binding;
using Game;
using Game.Common;
using Game.Notifications;
using Game.Prefabs;
using Game.Routes;
using Game.Tools;
using MonoMod.Utils;
using System;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Xml.Serialization;
using Unity.Burst.Intrinsics;
using Unity.Collections;
using Unity.Entities;
using Unity.Jobs;
using TransportType = Game.Prefabs.TransportType;

namespace BelzontTLM.Palettes
{
    public class XTMRouteAutoColorSystem : GameSystemBase, IBelzontBindable, IBelzontSerializableSingleton<XTMRouteAutoColorSystem>
    {
        private const int CURRENT_VERSION = 1;

        #region Bindings
        private Action<string, object[]> eventCaller;
        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            this.eventCaller = eventCaller;
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }
        private TransportType[] PassengerLineAllowed = new[] { TransportType.Bus, TransportType.Tram, TransportType.Subway, TransportType.Train, TransportType.Ship, TransportType.Airplane };
        private TransportType[] CargoLineAllowed = new[] { TransportType.Train, TransportType.Ship, TransportType.Airplane };
        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller.Invoke("autoColor.passengerModalAvailable", () => PassengerLineAllowed.Select(x => x.ToString()).ToList());
            eventCaller.Invoke("autoColor.cargoModalAvailable", () => CargoLineAllowed.Select(x => x.ToString()).ToList());
            eventCaller.Invoke("autoColor.passengerModalSettings", () => PaletteSettingsPassenger.ToDictionary(x => x.Key.ToString(), x => x.Value.ToString()));
            eventCaller.Invoke("autoColor.cargoModalSettings", () => PaletteSettingsCargo.ToDictionary(x => x.Key.ToString(), x => x.Value.ToString()));
            eventCaller.Invoke("autoColor.setAutoColorFor", SetModalAutoColorSettings);
            //     File.WriteAllLines(Path.Combine(BasicIMod.Instance.ModRootFolder, "localeDump.txt"), GameManager.instance.localizationManager.activeDictionary.entries.Select(x => $"{x.Key}\t{x.Value.Replace("\n", "\\n").Replace("\r", "\\r")}").ToArray());
        }   
        #endregion

        private void SetModalAutoColorSettings(string transportTypeStr, bool isCargo, string guid)
        {
            if (Enum.TryParse(transportTypeStr, true, out TransportType transportType))
            {
                LogUtils.DoLog($"Called to setup: {transportType} {isCargo} {guid}");
                var targetArr = isCargo ? PaletteSettingsCargo : PaletteSettingsPassenger;
                if (Guid.TryParse(guid, out var targetGuid))
                {
                    var targetPalette = paletteSystem.GetForGuid(targetGuid);
                    if (targetPalette != null)
                    {
                        targetArr[transportType] = targetPalette.Guid;
                        OnAutoColorSettingsChanged();
                    }
                }
                else if (targetArr.ContainsKey(transportType))
                {
                    targetArr.Remove(transportType);
                    OnAutoColorSettingsChanged();
                }
            }
        }
        private void OnAutoColorSettingsChanged()
        {
            LogUtils.DoLog("Forcing OnAutoColorSettingsChanged!!!!!!!");
            eventCaller.Invoke("autoColor.onAutoColorSettingsChanged", null);
            m_setupIsDirty = true;
        }

        protected override void OnUpdate()
        {
            if (!m_linesWithNoData.IsEmptyIgnoreFilter)
            {
                typeHandle.DoUpdate(ref CheckedStateRef);
                var paletteJob = default(XTMApplyPalleteJob);
                paletteJob.m_CommandBuffer = m_EndFrameBarrier.CreateCommandBuffer().AsParallelWriter();
                paletteJob.m_TypeHandle = typeHandle;
                XTMApplyPalleteJob jobData = paletteJob;
                JobHandle jobHandle = jobData.ScheduleParallel(m_linesWithNoData, Dependency);
                m_EndFrameBarrier.AddJobHandleForProducer(jobHandle);
                m_IconCommandSystem.AddCommandBufferWriter(jobHandle);
                Dependency = jobHandle;
            }
            if ((m_setupIsDirty || paletteSystem.RequireLinesColorsReprocess()) && !m_linesWithDataToForceUpdate.IsEmptyIgnoreFilter)
            {
                LogUtils.DoLog("Forcing update!");
                RunUpdatePalettesWithQuery(m_linesWithDataToForceUpdate);
                paletteSystem.OnLinesColorsReprocessed();
                m_setupIsDirty = false;
            }
            else if (!m_linesToUpdateData.IsEmptyIgnoreFilter)
            {
                RunUpdatePalettesWithQuery(m_linesToUpdateData);
            }
            
        }

        private void RunUpdatePalettesWithQuery(EntityQuery query)
        {
            typeHandle.DoUpdate(ref CheckedStateRef);
            var paletteJob = default(XTMUpdatePalleteJob);
            paletteJob.m_CommandBuffer = m_EndFrameBarrier.CreateCommandBuffer().AsParallelWriter();
            paletteJob.m_TypeHandle = typeHandle;
            XTMUpdatePalleteJob jobData = paletteJob;
            JobHandle jobHandle = jobData.ScheduleParallel(query, Dependency);
            m_EndFrameBarrier.AddJobHandleForProducer(jobHandle);
            m_IconCommandSystem.AddCommandBufferWriter(jobHandle);
            Dependency = jobHandle;
        }


        public SimpleEnumerableList<TransportType, Guid> PaletteSettingsPassenger = new();
        public SimpleEnumerableList<TransportType, Guid> PaletteSettingsCargo = new();


        private EntityQuery m_linesWithNoData;
        private EntityQuery m_linesToUpdateData;
        private EntityQuery m_linesWithDataToForceUpdate;

        private static XTMRouteAutoColorSystem Instance { get; set; }

        private EndFrameBarrier m_EndFrameBarrier;
        private IconCommandSystem m_IconCommandSystem;
        private TypeHandle typeHandle;
        private XTMPaletteSystem paletteSystem;
        private bool m_setupIsDirty;

        protected override void OnCreate()
        {
            Instance = this;
            m_EndFrameBarrier = World.GetOrCreateSystemManaged<EndFrameBarrier>();
            m_IconCommandSystem = World.GetOrCreateSystemManaged<IconCommandSystem>();
            m_linesWithNoData = GetEntityQuery(new EntityQueryDesc[] {
                new EntityQueryDesc
                {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadWrite<RouteNumber>(),
                        ComponentType.ReadWrite<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>(),
                        ComponentType.ReadWrite<Color>()
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<XTMPaletteSettedUpInformation>(),
                        ComponentType.ReadOnly<XTMPaletteLockedColor>(),
                        ComponentType.ReadOnly<Temp>()
                    },
                }
            });
            m_linesToUpdateData = GetEntityQuery(new EntityQueryDesc[] {
                new EntityQueryDesc
                {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadWrite<RouteNumber>(),
                        ComponentType.ReadWrite<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>(),
                        ComponentType.ReadWrite<XTMPaletteSettedUpInformation>(),
                        ComponentType.ReadOnly<XTMPaletteRequireUpdate>(),
                        ComponentType.ReadWrite<Color>()
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<XTMPaletteLockedColor>(),
                    }
                }
            });
            m_linesWithDataToForceUpdate = GetEntityQuery(new EntityQueryDesc[] {
                new EntityQueryDesc
                {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadWrite<RouteNumber>(),
                        ComponentType.ReadWrite<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>(),
                        ComponentType.ReadWrite<XTMPaletteSettedUpInformation>(),
                        ComponentType.ReadWrite<Color>()
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<XTMPaletteLockedColor>(),
                        ComponentType.ReadOnly<Temp>()
                    }
                }
            });

            paletteSystem = World.GetOrCreateSystemManaged<XTMPaletteSystem>();


        }

        private static XTMPaletteSystem PaletteSystem => Instance.paletteSystem;

        #region Runtime Jobs
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private void __AssignQueries(ref SystemState state)
        {
        }
        protected override void OnCreateForCompiler()
        {
            base.OnCreateForCompiler();
            __AssignQueries(ref CheckedStateRef);
            typeHandle.AssignHandles(ref CheckedStateRef);
        }
        private struct TypeHandle
        {
            [ReadOnly]
            public EntityTypeHandle m_EntityTypeHandle;
            public ComponentLookup<TransportLineData> m_TransportLineDataLookup;
            public ComponentLookup<XTMPaletteSettedUpInformation> m_XTMPaletteSettedUpInformationLookup;
            public ComponentLookup<PrefabRef> m_PrefabRefLookup;
            public ComponentLookup<TransportLine> m_TransportLineLookup;
            public ComponentLookup<RouteNumber> m_RouteNumberLookup;

            public void AssignHandles(ref SystemState state)
            {
                m_EntityTypeHandle = state.GetEntityTypeHandle();
                m_TransportLineLookup = state.GetComponentLookup<TransportLine>(true);
                m_TransportLineDataLookup = state.GetComponentLookup<TransportLineData>(true);
                m_PrefabRefLookup = state.GetComponentLookup<PrefabRef>(true);
                m_RouteNumberLookup = state.GetComponentLookup<RouteNumber>(true);
                m_XTMPaletteSettedUpInformationLookup = state.GetComponentLookup<XTMPaletteSettedUpInformation>(true);
            }

            public void DoUpdate(ref SystemState state)
            {
                m_TransportLineLookup.Update(ref state);
                m_TransportLineDataLookup.Update(ref state);
                m_PrefabRefLookup.Update(ref state);
                m_RouteNumberLookup.Update(ref state);
                m_EntityTypeHandle.Update(ref state);
            }
        }

        private struct XTMApplyPalleteJob : IJobChunk
        {
            [ReadOnly]
            public TypeHandle m_TypeHandle;
            public EntityCommandBuffer.ParallelWriter m_CommandBuffer;
            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                NativeArray<Entity> unitializedLines = chunk.GetNativeArray(m_TypeHandle.m_EntityTypeHandle);
                for (int i = 0; i < chunk.Count; i++)
                {
                    LogUtils.DoLog($"XTMApplyPalleteJob Processing entity {unitializedLines[i].Index}");
                    if (!GetTransportLineData(unitializedLines[i], out var routeNumber, out TransportLineData transportLineData))
                    {
                        LogUtils.DoWarnLog($"INVALID ENTITY: {unitializedLines[i].Index}");
                        continue;
                    }

                    var refPalletList = transportLineData.m_CargoTransport ? Instance.PaletteSettingsCargo : Instance.PaletteSettingsPassenger;
                    var targetPaletteGuid = refPalletList.TryGetValue(transportLineData.m_TransportType, out var paletteValue) ? paletteValue as Guid? : null;

                    XTMPaletteSettedUpInformation info = new()
                    {
                        lineNumberRef = routeNumber.m_Number,
                        paletteGuid = targetPaletteGuid ?? default,
                        paletteEnabled = targetPaletteGuid is not null
                    };
                    if (targetPaletteGuid is not null)
                    {
                        var targetColorList = PaletteSystem.GetForGuid(paletteValue)?.Colors;
                        if (targetColorList is null || targetColorList.Count == 0)
                        {
                            info.paletteEnabled = false;
                            LogUtils.DoLog($"Entity #{unitializedLines[i].Index} tried to be setup to palette {paletteValue}, but it doesn't exists...");
                        }
                        else
                        {
                            var targetIdx = ((routeNumber.m_Number % targetColorList.Count) + targetColorList.Count - 1) % targetColorList.Count;
                            m_CommandBuffer.SetComponent(unfilteredChunkIndex, unitializedLines[i], new Game.Routes.Color(targetColorList[targetIdx]));
                            LogUtils.DoLog($"Entity #{unitializedLines[i].Index} setup to palette {paletteValue}");
                        }
                    }

                    m_CommandBuffer.AddComponent(unfilteredChunkIndex, unitializedLines[i], info);
                    m_CommandBuffer.AddComponent<Updated>(unfilteredChunkIndex, unitializedLines[i]);
                    LogUtils.DoLog($"Initialized palette data @ entity id #{unitializedLines[i].Index}");
                }
                LogUtils.DoLog("XTMApplyPalleteJob JobComplete");
            }
            private bool GetTransportLineData(Entity owner, out RouteNumber routeNum, out TransportLineData lineData)
            {
                if (m_TypeHandle.m_TransportLineLookup.HasComponent(owner))
                {
                    routeNum = m_TypeHandle.m_RouteNumberLookup[owner];
                    PrefabRef prefabRef = m_TypeHandle.m_PrefabRefLookup[owner];
                    lineData = m_TypeHandle.m_TransportLineDataLookup[prefabRef.m_Prefab];
                    return true;
                }
                routeNum = default;
                lineData = default;
                return false;
            }
        }

        private struct XTMUpdatePalleteJob : IJobChunk
        {
            [ReadOnly]
            public TypeHandle m_TypeHandle;
            public EntityCommandBuffer.ParallelWriter m_CommandBuffer;
            public void Execute(in ArchetypeChunk chunk, int unfilteredChunkIndex, bool useEnabledMask, in v128 chunkEnabledMask)
            {
                NativeArray<Entity> unitializedLines = chunk.GetNativeArray(m_TypeHandle.m_EntityTypeHandle);
                for (int i = 0; i < chunk.Count; i++)
                {
                    LogUtils.DoLog($"XTMUpdatePalleteJob Updating entity {unitializedLines[i].Index}");
                    if (!GetTransportLineData(unitializedLines[i], out var routeNumber, out TransportLineData transportLineData, out var xtmInfo))
                    {
                        LogUtils.DoWarnLog($"INVALID ENTITY: {unitializedLines[i].Index}");
                        continue;
                    }

                    GetCurrentChecksum(transportLineData, out Guid? targetPaletteGuid, out Guid paletteValue, out Guid? checksum);

                    if (((targetPaletteGuid is null && !xtmInfo.paletteEnabled) || (targetPaletteGuid == xtmInfo.paletteGuid && checksum == xtmInfo.paletteChecksum)) && xtmInfo.lineNumberRef == routeNumber.m_Number)
                    {
                        LogUtils.DoLog($"Palette already updated @ entity id #{unitializedLines[i].Index}. Skipping...");
                        continue;
                    }

                    xtmInfo.lineNumberRef = routeNumber.m_Number;
                    xtmInfo.paletteGuid = targetPaletteGuid ?? default;

                    var targetColorList = PaletteSystem.GetForGuid(paletteValue)?.Colors;
                    if (targetColorList is null || targetColorList.Count == 0)
                    {
                        xtmInfo.paletteEnabled = false;
                        LogUtils.DoLog($"Entity #{unitializedLines[i].Index} tried to be setup to palette {paletteValue}, but it doesn't exists...");
                    }
                    else
                    {
                        xtmInfo.paletteEnabled = true;
                        var targetIdx = ((routeNumber.m_Number % targetColorList.Count) + targetColorList.Count - 1) % targetColorList.Count;
                        m_CommandBuffer.SetComponent(unfilteredChunkIndex, unitializedLines[i], new Game.Routes.Color(targetColorList[targetIdx]));
                        LogUtils.DoLog($"Entity #{unitializedLines[i].Index} setup to palette {paletteValue}");
                    }

                    m_CommandBuffer.SetComponent(unfilteredChunkIndex, unitializedLines[i], xtmInfo);
                    m_CommandBuffer.AddComponent<Updated>(unfilteredChunkIndex, unitializedLines[i]);
                    m_CommandBuffer.RemoveComponent<XTMPaletteRequireUpdate>(unfilteredChunkIndex, unitializedLines[i]);
                    LogUtils.DoLog($"Updated palette data @ entity id #{unitializedLines[i].Index}");
                }
                LogUtils.DoLog("XTMUpdatePalleteJob JobComplete");
            }

            private static void GetCurrentChecksum(TransportLineData transportLineData, out Guid? targetPaletteGuid, out Guid paletteValue, out Guid? checksum)
            {
                var refPalletList = transportLineData.m_CargoTransport ? Instance.PaletteSettingsCargo : Instance.PaletteSettingsPassenger;
                targetPaletteGuid = refPalletList.TryGetValue(transportLineData.m_TransportType, out paletteValue) ? paletteValue : null;
                checksum = PaletteSystem.GetForGuid(paletteValue)?.Checksum;
            }

            private bool GetTransportLineData(Entity owner, out RouteNumber routeNum, out TransportLineData lineData, out XTMPaletteSettedUpInformation info)
            {
                if (m_TypeHandle.m_TransportLineLookup.HasComponent(owner))
                {
                    routeNum = m_TypeHandle.m_RouteNumberLookup[owner];
                    PrefabRef prefabRef = m_TypeHandle.m_PrefabRefLookup[owner];
                    lineData = m_TypeHandle.m_TransportLineDataLookup[prefabRef.m_Prefab];
                    info = m_TypeHandle.m_XTMPaletteSettedUpInformationLookup[prefabRef.m_Prefab];
                    return true;
                }
                routeNum = default;
                lineData = default;
                info = default;
                return false;
            }
        }
        #endregion

        #region Serialization

        private XTMRouteAutoColorSystemXML ToXml()
        {
            var xml = new XTMRouteAutoColorSystemXML();
            xml.PaletteSettingsCargo.AddRange(xml.PaletteSettingsCargo.ToDictionary(x => x.Key, x => x.Value.ToString()));
            xml.PaletteSettingsPassenger.AddRange(xml.PaletteSettingsPassenger.ToDictionary(x => x.Key, x => x.Value.ToString()));
            return xml;
        }

        [XmlRoot("XtmRouteAutoColorSystem")]
        public class XTMRouteAutoColorSystemXML
        {
            public SimpleEnumerableList<TransportType, string> PaletteSettingsPassenger = new();
            public SimpleEnumerableList<TransportType, string> PaletteSettingsCargo = new();
        }

        private void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMRouteAutoColorSystem!");
            }
            reader.Read(out string autoColorData);
            try
            {
                var settings = XmlUtils.DefaultXmlDeserialize<XTMRouteAutoColorSystemXML>(new string(autoColorData));
                PaletteSettingsPassenger.Clear();
                PaletteSettingsPassenger.AddRange(settings.PaletteSettingsPassenger.ToDictionary(x => x.Key, x => new Guid(x.Value)));
                PaletteSettingsCargo.Clear();
                PaletteSettingsCargo.AddRange(settings.PaletteSettingsCargo.ToDictionary(x => x.Key, x => new Guid(x.Value)));
            }
            catch (Exception e)
            {
                LogUtils.DoWarnLog($"XTMRouteAutoColorDataSerializer: Could not load palettes for the City!!!\n{e}");
            }
        }

        private void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(XmlUtils.DefaultXmlSerialize(ToXml()));
        }

        void IBelzontSerializableSingleton<XTMRouteAutoColorSystem>.Serialize<TWriter>(TWriter writer) => Serialize(writer);
        void IBelzontSerializableSingleton<XTMRouteAutoColorSystem>.Deserialize<TReader>(TReader reader) => Deserialize(reader);
        JobHandle IJobSerializable.SetDefaults(Context context) => default;

        #endregion
    }

}

