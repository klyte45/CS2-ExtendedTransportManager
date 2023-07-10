using Belzont.Interfaces;
using Belzont.Utils;
using Colossal.Entities;
using Colossal.Serialization.Entities;
using Colossal.UI.Binding;
using Game;
using Game.Common;
using Game.Prefabs;
using Game.Routes;
using Game.Tools;
using Game.UI;
using Game.UI.InGame;
using System;
using System.Linq;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{

    public class XTMLineViewerController : SystemBase, IBelzontBindable
    {
        public Action<string, object[]> EventCaller { get; set; }
        protected void SendEvent(string eventName, params object[] eventArgs)
        {
            EventCaller?.Invoke(eventName, eventArgs);
        }
        internal void OnTick(uint version)
        {
            SendEvent("tickDone", version);
        }

        private void GetCityLines(IJsonWriter binder)
        {
            NativeArray<UITransportLineData> sortedLines = TransportUIUtils.GetSortedLines(this.m_linesQueue, base.EntityManager, this.m_PrefabSystem);
            binder.ArrayBegin(sortedLines.Length);
            for (int i = 0; i < sortedLines.Length; i++)
            {
                BindLine(sortedLines[i], binder);
            }
            binder.ArrayEnd();
        }

        private void BindLine(UITransportLineData lineData, IJsonWriter binder)
        {
            binder.TypeBegin("Game.UI.InGame.UITransportLine");
            binder.PropertyName("name");
            m_NameSystem.BindName(binder, lineData.entity);
            binder.PropertyName("vkName");
            m_NameSystem.BindNameForVirtualKeyboard(binder, lineData.entity);
            binder.PropertyName("lineData");
            binder.Write(lineData);

            binder.PropertyName("xtmData");
            if (EntityManager.TryGetComponent<XTMRouteExtraData>(lineData.entity, out var componentData))
            {
                binder.Write(componentData);
            }
            else
            {
                binder.Write(null);
            }
            binder.PropertyName("routeNumber");
            if (EntityManager.TryGetComponent<RouteNumber>(lineData.entity, out var number))
            {
                binder.Write(number.m_Number);
            }
            else
            {
                binder.Write(null);
            }

            binder.TypeEnd();
        }

        protected override void OnUpdate()
        {
            OnTick((uint)World.Time.ElapsedTime);
            if (!m_UnititalizedXTMLineQuery.IsEmptyIgnoreFilter)
            {
                NativeArray<Entity> unitializedLines = m_UnititalizedXTMLineQuery.ToEntityArray(Allocator.TempJob);
                int length = unitializedLines.Length;
                EntityCommandBuffer entityCommandBuffer = this.m_EndFrameBarrier.CreateCommandBuffer();
                for (int i = 0; i < length; i++)
                {
                    entityCommandBuffer.AddComponent<XTMRouteExtraData>(unitializedLines[i]);
                    entityCommandBuffer.AddComponent<Updated>(unitializedLines[i]);
                    LogUtils.DoInfoLog($"Initialized Line data @ entity id #{unitializedLines[i].Index}");
                }
            }
            if (m_linesListingBinding != null && (!m_ModifiedLineQuery.IsEmptyIgnoreFilter || m_UpdateState.Advance()))
            {
                m_linesListingBinding.Update();
            }
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("setAcronym", SetRouteAcronym);
        }
        public void SetupRawBindings(Func<string, Action<IJsonWriter>, RawValueBinding> eventBinder)
        {
            m_linesListingBinding = eventBinder("lineList", GetCityLines);
        }

        private RawValueBinding m_linesListingBinding;
        private EntityQuery m_linesQueue;
        private PrefabSystem m_PrefabSystem;
        private NameSystem m_NameSystem;
        private EntityQuery m_ModifiedLineQuery;
        private EntityQuery m_UnititalizedXTMLineQuery;
        private UIUpdateState m_UpdateState;
        private EndFrameBarrier m_EndFrameBarrier;


        private string SetRouteAcronym(int index, string acronym)
        {
            if (int.TryParse(acronym, out int routeNum))
            {
                var result = m_linesQueue.ToEntityArray(Allocator.TempJob);
                var targetEntity = result.FirstOrDefault(x => x.Index == index);
                result.Dispose();
                if (targetEntity.Index != index)
                {
                    return null;
                }
                EntityCommandBuffer entityCommandBuffer = this.m_EndFrameBarrier.CreateCommandBuffer();
                var componentExists = EntityManager.TryGetComponent<RouteNumber>(targetEntity, out var component);
                component.m_Number = routeNum;
                //var componentExists = EntityManager.TryGetComponent<XTMRouteExtraData>(targetEntity, out var component);
                //component.SetAcronym(acronym);
                //if (componentExists)
                //{
                entityCommandBuffer.SetComponent(targetEntity, component);
                //}
                //else
                //{
                //    entityCommandBuffer.AddComponent(targetEntity, component);
                //}
                entityCommandBuffer.AddComponent<Updated>(targetEntity);
            }
            return acronym;
        }

        protected override void OnCreate()
        {
            m_linesQueue = GetEntityQuery(new EntityQueryDesc[] {
                new EntityQueryDesc
                {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadWrite<RouteNumber>(),
                        ComponentType.ReadWrite<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>()
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Deleted>(),
                        ComponentType.ReadOnly<Temp>()
                    }
                }
            });
            m_PrefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_ModifiedLineQuery = GetEntityQuery(new EntityQueryDesc[]
            {
                new EntityQueryDesc
                {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadWrite<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>()
                    },
                    Any = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Created>(),
                        ComponentType.ReadOnly<Deleted>(),
                        ComponentType.ReadOnly<Updated>(),
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>()
                    }
                }
           });
            m_UnititalizedXTMLineQuery = GetEntityQuery(new EntityQueryDesc[]
            {
                new EntityQueryDesc
                {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadWrite<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>()
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<XTMRouteExtraData>()
                    }
                }
           });
            m_UpdateState = UIUpdateState.Create(base.World, 32);
            m_EndFrameBarrier = World.GetOrCreateSystemManaged<EndFrameBarrier>();

            CheckedStateRef.RequireAnyForUpdate(m_UnititalizedXTMLineQuery, m_ModifiedLineQuery);
        }

        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            EventCaller = eventCaller;
        }
    }

    public struct XTMRouteExtraData : IComponentData, IQueryTypeParameter, ISerializable, IJsonWritable
    {
        const uint CURRENT_VERSION = 0;

        public void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(m_acronym.ToString());
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.Read(out uint version);
            if (version > CURRENT_VERSION)
            {
                throw new Exception("Invalid version of XTMRouteExtraData!");
            }
            reader.Read(out string value);
            m_acronym = new(value);
        }

        public void Write(IJsonWriter writer)
        {
            writer.TypeBegin(GetType().FullName);
            writer.PropertyName("acronym");
            writer.Write(m_acronym.ToString());
            writer.TypeEnd();
        }

        private FixedString32Bytes m_acronym;

        public void SetAcronym(string acronym)
        {
            m_acronym = new(acronym);
        }
    }
}
