using Belzont.Utils;
using Colossal.Entities;
using Colossal.Serialization.Entities;
using Game.Routes;
using Game.UI;
using System;
using System.Linq;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public struct XTM_WEDestinationBlind : ICleanupBufferElementData, ISerializable, IDisposable
    {
        private const uint CURRENT_VERSION = 0;
        private Entity useUntilStop;
        private int cachedStopOrder;
        private NativeList<XTM_WEDestinationDynamicKeyframe> keyframes;
        private int staticKeyframeIdx;
        private uint totalFrames;

        public struct UIData
        {
            public Entity useUntilStop;
            public XTM_WEDestinationDynamicKeyframe.UIData[] keyframes;
            public int staticKeyframeIdx;
        }

        public UIData ToUI(EntityManager em, NameSystem ns, XTMLineManagementSystem xtmlms, Entity lastStop)
        {
            var tempArr = keyframes.ToArray(Allocator.Temp);
            try
            {
                var y = useUntilStop == Entity.Null ? lastStop : useUntilStop;
                var _this = this;
                return new()
                {
                    useUntilStop = useUntilStop,
                    keyframes = tempArr.ToArray().Select(x => x.ToUI(em, ns, xtmlms, y, _this)).ToArray(),
                    staticKeyframeIdx = staticKeyframeIdx,
                };
            }
            finally
            {
                tempArr.Dispose();
            }
        }
        public bool OnLineStopsChanged(BufferLookup<RouteWaypoint> waypointsLists, ComponentLookup<Waypoint> waypointsComponents, Entity lineOwner)
        {
            if (useUntilStop == Entity.Null || !waypointsLists.TryGetBuffer(lineOwner, out var waypoints)) return false;
            if (waypointsComponents.TryGetComponent(useUntilStop, out Waypoint waypoint))
            {
                cachedStopOrder = waypoint.m_Index;
                return true;
            }
            if (cachedStopOrder > 0)
            {
                cachedStopOrder = Math.Min(cachedStopOrder, waypoints.Length - 1);
                useUntilStop = waypoints[cachedStopOrder].m_Waypoint;
                return true;
            }
            useUntilStop = default;
            cachedStopOrder = -1;
            return false;
        }

        public int StaticKeyframeIdx
        {
            get => staticKeyframeIdx; set
            {
                staticKeyframeIdx = Math.Clamp(value, 0, keyframes.Length);
            }
        }

        public Entity UseUntilStop
        {
            get => useUntilStop; set
            {
                useUntilStop = value;
                cachedStopOrder = value != Entity.Null ? World.DefaultGameObjectInjectionWorld.EntityManager.TryGetComponent(value, out Waypoint wp) ? wp.m_Index : -1 : -1;
            }
        }

        public void SetUseUntilStopIndirect(ref DynamicBuffer<RouteWaypoint> buff, int index)
        {
            index %= buff.Length;
            useUntilStop = buff[index].m_Waypoint;
            cachedStopOrder = index;
        }

        public readonly int StopOrder => cachedStopOrder;

        public void AddKeyframe(XTM_WEDestinationDynamicKeyframe keyframe)
        {
            if (!keyframes.IsCreated)
            {
                keyframes = new NativeList<XTM_WEDestinationDynamicKeyframe>(Allocator.Persistent);
            }
            keyframes.Add(keyframe);
            OnKeyframesChanged();
        }

        private void OnKeyframesChanged()
        {
            totalFrames = 0;
            for (int i = 0; i < keyframes.Length; i++)
            {
                totalFrames += keyframes[i].framesLength;
            }
            staticKeyframeIdx = Math.Min(staticKeyframeIdx, keyframes.Length);
        }

        public string GetCurrentText(uint simulationFrame, EntityManager em, NameSystem ns, XTMLineManagementSystem xtmlms, Entity stopEntity, XTM_WEDestinationBlind parent)
        {
            if (keyframes.IsEmpty) return "????";
            if (keyframes.Length == 1 || totalFrames == 0) return keyframes[0].GetString(em, ns, xtmlms, stopEntity, parent);
            var targetFrame = simulationFrame % totalFrames;
            var counter = 0;
            for (int i = 0; i <= keyframes.Length; i++)
            {
                counter += keyframes[i].framesLength;
                if (counter > targetFrame)
                {
                    return keyframes[i].GetString(em, ns, xtmlms, stopEntity, parent);
                }
            }
            return "!?!?!?!?";
        }

        public readonly void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(useUntilStop);
            writer.Write(cachedStopOrder);
            writer.Write(staticKeyframeIdx);
            writer.Write(keyframes);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.CheckVersionK45(CURRENT_VERSION, GetType());
            reader.Read(out useUntilStop);
            reader.Read(out cachedStopOrder);
            reader.Read(out staticKeyframeIdx);
            reader.Read(ref keyframes);
            OnKeyframesChanged();
        }

        public void Dispose()
        {
            if (keyframes.IsCreated) keyframes.Dispose();
        }

        internal XTM_WEDestinationDynamicKeyframe GetStaticKeyframe() => keyframes[staticKeyframeIdx];

        internal static XTM_WEDestinationBlind From(UIData uIData)
        {
            var data = new NativeList<XTM_WEDestinationDynamicKeyframe>(Allocator.Persistent);
            foreach (var item in uIData.keyframes) data.Add(item.ToComponent());
            var result = new XTM_WEDestinationBlind()
            {
                UseUntilStop = uIData.useUntilStop,
                keyframes = data,
                staticKeyframeIdx = uIData.staticKeyframeIdx,
            };
            result.OnKeyframesChanged();

            return result;
        }

        internal void SetUseUntilStopIndirect(ref DynamicBuffer<RouteWaypoint> waypoints, object value)
        {
            throw new NotImplementedException();
        }
    }
}
