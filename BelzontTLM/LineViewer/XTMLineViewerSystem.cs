using Belzont.Interfaces;
using Belzont.Utils;
using Game;
using Game.Common;
using Game.Prefabs;
using Game.Routes;
using Game.Tools;
using Game.UI;
using System;
using Unity.Collections;
using Unity.Entities;
using static BelzontTLM.XTMLineViewerSection;

namespace BelzontTLM
{
    public partial class XTMLineViewerSystem : SystemBase, IBelzontBindable
    {
        //private const string CCTV_GO = "XTM - cctv.xtm.k45";
        public Action<string, object[]> EventCaller { get; set; }

        //public Camera cctvCamera;
        protected void SendEvent(string eventName, params object[] eventArgs)
        {
            EventCaller?.Invoke(eventName, eventArgs);
        }

        private void GetCityLines(bool force = false)
        {
            m_LineListingSection.AddDependency(m_EndFrameBarrier.producerHandle);
            m_LineListingSection.Enqueue(Entity.Null, (x) =>
            {
                if (BasicIMod.TraceMode) LogUtils.DoTraceLog("SENDING OBJ: {0}", x);
                SendEvent("lineViewer.getCityLines->", x);
            },
            force);
        }

        private void SetCctvPosition(float x, float y, float z, float angleX, float angleY, float distanceZ)
        {
            //LogUtils.DoLog("Setting CCTV pos");
            //var targetPoint = new Vector3(x, y, z);
            //var targetPositionCamera = targetPoint + (Quaternion.AngleAxis(angleX, Vector3.right) * Vector3.forward + Quaternion.AngleAxis(angleY, Vector3.up) * Vector3.forward).normalized * distanceZ;
            //cctvCamera.transform.position = targetPositionCamera;
            //cctvCamera.transform.LookAt(targetPoint);
        }

        protected override void OnUpdate()
        {
            if (!m_UnititalizedXTMLineQuery.IsEmptyIgnoreFilter)
            {
                NativeArray<Entity> unitializedLines = m_UnititalizedXTMLineQuery.ToEntityArray(Allocator.TempJob);
                int length = unitializedLines.Length;
                EntityCommandBuffer entityCommandBuffer = m_EndFrameBarrier.CreateCommandBuffer();
                for (int i = 0; i < length; i++)
                {
                    entityCommandBuffer.AddComponent<XTMRouteExtraData>(unitializedLines[i]);
                    entityCommandBuffer.AddComponent<Updated>(unitializedLines[i]);
                    LogUtils.DoInfoLog($"Initialized Line data @ entity id #{unitializedLines[i].Index}");
                }
            }
            if (!m_modifiedLineQuery.IsEmptyIgnoreFilter)
            {
                GetCityLines();
            }

        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller("lineViewer.getCityLines", GetCityLines);
            eventCaller("lineViewer.getRouteDetail", GetRouteDetail);
            eventCaller("lineViewer.setCctvPosition", SetCctvPosition);
        }

        private EntityQuery m_UnititalizedXTMLineQuery;
        private EntityQuery m_modifiedLineQuery;
        private NameSystem m_NameSystem;
        private EndFrameBarrier m_EndFrameBarrier;
        private XTMLineViewerSection m_LineVisualizerSection;
        private XTMLineListingSection m_LineListingSection;



        private void GetRouteDetail(Entity entity, bool force)
        {
            m_LineVisualizerSection.AddDependency(m_EndFrameBarrier.producerHandle);
            m_LineVisualizerSection.Enqueue(entity, SendRouteDetail, force);
        }

        private void SendRouteDetail(XTMLineViewerResult result)
        {
            LogUtils.DoInfoLog($"Send route detail to: '{$"lineViewer.getRouteDetail:{result.LineData.entity.Index}->"}'");
            SendEvent($"lineViewer.getRouteDetail:{result.LineData.entity.Index}->", result);
        }


        protected override void OnCreate()
        {
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
                        ComponentType.ReadOnly<XTMRouteExtraData>(),
                        ComponentType.ReadOnly<Deleted>()
                    }
                }
            });
            m_modifiedLineQuery = GetEntityQuery(new EntityQueryDesc[]
            {
                new EntityQueryDesc
                {
                    All = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Route>(),
                        ComponentType.ReadOnly<TransportLine>(),
                        ComponentType.ReadOnly<RouteWaypoint>(),
                        ComponentType.ReadOnly<PrefabRef>()
                    },
                    Any = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Updated>()
                    },
                    None = new ComponentType[]
                    {
                        ComponentType.ReadOnly<Temp>(),
                        ComponentType.ReadOnly<Deleted>()
                    }
                }
            });
            m_NameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_EndFrameBarrier = World.GetOrCreateSystemManaged<EndFrameBarrier>();
            m_LineVisualizerSection = World.GetOrCreateSystemManaged<XTMLineViewerSection>();
            m_LineListingSection = World.GetOrCreateSystemManaged<XTMLineListingSection>();

            //if (GameObject.Find(CCTV_GO) is null)
            //{
            //    var goCctv = new GameObject();
            //    goCctv.name = CCTV_GO;
            //    GameObject.DontDestroyOnLoad(goCctv);
            //    cctvCamera = goCctv.AddComponent<Camera>();
            //    cctvCamera.depthTextureMode = DepthTextureMode.None;
            //    cctvCamera.targetTexture = null;
            //    cctvCamera.cameraType = CameraType.Game;
            //    var liveView = goCctv.AddComponent<CohtmlLiveView>();
            //    liveView.LiveViewName = "cctv.xtm.k45";
            //    liveView.TargetTexture = new RenderTexture(512, 512, 16)
            //    {
            //        graphicsFormat = UnityEngine.Experimental.Rendering.GraphicsFormat.R8G8B8A8_UNorm
            //    };

            //    LogUtils.DoLog("ON CREATE ");
            //    LogUtils.DoLog("liveView => {0} {1} {2} {3} {4}", liveView.name, liveView.LiveViewName, liveView.TargetCamera, liveView.TargetTexture, liveView.System);
            //}

        }


        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            EventCaller = eventCaller;
        }
    }
}
