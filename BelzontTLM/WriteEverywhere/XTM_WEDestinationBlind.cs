using Belzont.Utils;
using Colossal.Serialization.Entities;
using Game.UI;
using System;
using System.Linq;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public struct XTM_WEDestinationBlind : ICleanupBufferElementData, IXTM_WEDestinationKeyframeData, ISerializable, IDisposable
    {
        private const uint CURRENT_VERSION = 0;
        public Entity useUntilStop;
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

        public UIData ToUI()
        {
            var tempArr = keyframes.ToArray(Allocator.Temp);
            try
            {
                return new()
                {
                    useUntilStop = useUntilStop,
                    keyframes = tempArr.ToArray().Select(x => x.ToUI()).ToArray(),
                    staticKeyframeIdx = staticKeyframeIdx,
                };
            }
            finally
            {
                tempArr.Dispose();
            }
        }

        Entity IXTM_WEDestinationKeyframeData.UseUntilStop { readonly get => useUntilStop; set => useUntilStop = value; }
        int IXTM_WEDestinationKeyframeData.CachedStopOrder { readonly get => cachedStopOrder; set => cachedStopOrder = value; }
        public int StaticKeyframeIdx
        {
            get => staticKeyframeIdx; set
            {
                staticKeyframeIdx = Math.Clamp(value, 0, keyframes.Length);
            }
        }

        public void AddKeyframe(XTM_WEDestinationDynamicKeyframe keyframe)
        {
            if (!keyframes.IsCreated)
            {
                keyframes = new NativeList<XTM_WEDestinationDynamicKeyframe>(Allocator.Persistent);
            }
            keyframes.Add(keyframe);
            OnKeyframesChanged();
        }
        public bool SetKeyframeAt(XTM_WEDestinationDynamicKeyframe keyframe, int pos)
        {
            if (pos >= keyframes.Length) return false;
            keyframes[pos] = keyframe;
            OnKeyframesChanged();
            return true;
        }
        public bool RemoveKeyframeAt(int pos)
        {
            if (pos >= keyframes.Length || keyframes.Length <= 1) return false;
            keyframes.RemoveAt(pos);
            OnKeyframesChanged();
            return true;
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

        public string GetCurrentText(uint simulationFrame, EntityManager em, NameSystem ns, XTMLineManagementSystem xtmlms, Entity stopEntity)
        {
            if (keyframes.IsEmpty) return "????";
            if (keyframes.Length == 1 || totalFrames == 0) return ((IXTM_WEDestinationData)keyframes[0]).GetString(em, ns, xtmlms, stopEntity);
            var targetFrame = simulationFrame % totalFrames;
            var counter = 0;
            for (int i = 0; i <= keyframes.Length; i++)
            {
                counter += keyframes[i].framesLength;
                if (counter > targetFrame)
                {
                    return ((IXTM_WEDestinationData)keyframes[i]).GetString(em, ns, xtmlms, stopEntity);
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

        internal IXTM_WEDestinationData GetStaticKeyframe() => keyframes[staticKeyframeIdx];

        internal static XTM_WEDestinationBlind From(UIData uIData)
        {
            var data = new NativeList<XTM_WEDestinationDynamicKeyframe>(Allocator.Persistent);
            foreach (var item in uIData.keyframes) data.Add(item.ToComponent());
            var result = new XTM_WEDestinationBlind()
            {
                useUntilStop = uIData.useUntilStop,
                keyframes = data,
                staticKeyframeIdx = uIData.staticKeyframeIdx,
            };
            result.OnKeyframesChanged();

            return result;
        }
    }
}
