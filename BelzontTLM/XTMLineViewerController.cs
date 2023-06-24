using Colossal.UI.Binding;
using Game.Common;
using Game.Prefabs;
using Game.Routes;
using Game.Tools;
using Game.UI;
using Game.UI.InGame;
using System;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public class XTMLineViewerController : SystemBase
    {
        private Action<string, object[]> eventCaller;
        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            this.eventCaller = eventCaller;
        }

        private void SendEvent(string eventName, params object[] eventArgs)
        {
            eventCaller?.Invoke(eventName, eventArgs);
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
                this.BindLine(sortedLines[i], binder);
            }
            binder.ArrayEnd();



            //NativeArray<Entity> nativeArray = m_linesQueue.ToEntityArray(Allocator.TempJob);
            //int length = nativeArray.Length;
            //NativeArray<UITransportLineData> nativeArray2 = new NativeArray<UITransportLineData>(length, Allocator.Temp, NativeArrayOptions.ClearMemory);
            //for (int i = 0; i < length; i++)
            //{
            //    nativeArray2[i] = TransportUIUtils.BuildTransportLine(nativeArray[i], EntityManager, m_PrefabSystem);
            //}
            //nativeArray2.Sort();

            //var result = nativeArray2.Select(x => $"{x.entity.Index}∫{GetNameStr(x)}∫{x.type}").ToArray();
            //nativeArray.Dispose();
            //nativeArray2.Dispose();
            //return result;
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
            binder.TypeEnd();
        }

        protected override void OnUpdate()
        {
            OnTick((uint)World.Time.ElapsedTime);
            if (!m_ModifiedLineQuery.IsEmptyIgnoreFilter || m_UpdateState.Advance())
            {
                m_linesListingBinding.Update();
            }
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
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
        private UIUpdateState m_UpdateState;

        protected override void OnCreate()
        {
            m_linesQueue = GetEntityQuery(new EntityQueryDesc[]                {
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
                        ComponentType.ReadOnly<Updated>()
},
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>()
                    }
                }
           });
            m_UpdateState = UIUpdateState.Create(base.World, 256);
        }
    }
}
