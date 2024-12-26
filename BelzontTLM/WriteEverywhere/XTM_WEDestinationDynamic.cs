using Belzont.Utils;
using Colossal.Serialization.Entities;
using Game.UI;
using System;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public struct XTM_WEDestinationDynamic : ICleanupBufferElementData, IXTM_WEDestinationKeyframeData, ISerializable, IDisposable
    {
        private const uint CURRENT_VERSION = 0;
        public Entity useUntilStop;
        private int cachedStopOrder;
        private NativeList<XTM_WEDestinationDynamicKeyframe> keyframes;
        private uint totalFrames;

        Entity IXTM_WEDestinationKeyframeData.UseUntilStop { readonly get => useUntilStop; set => useUntilStop = value; }
        int IXTM_WEDestinationKeyframeData.CachedStopOrder { readonly get => cachedStopOrder; set => cachedStopOrder = value; }



        public void AddKeyframe(XTM_WEDestinationDynamicKeyframe keyframe)
        {
            if (!keyframes.IsCreated)
            {
                keyframes = new NativeList<XTM_WEDestinationDynamicKeyframe>(Allocator.Persistent);
            }
            keyframes.Add(keyframe);
            RecalculateTotalFrames();
        }
        public bool SetKeyframeAt(XTM_WEDestinationDynamicKeyframe keyframe, int pos)
        {
            if (pos >= keyframes.Length) return false;
            keyframes[pos] = keyframe;
            RecalculateTotalFrames();
            return true;
        }
        public bool RemoveKeyframeAt(int pos)
        {
            if (pos >= keyframes.Length || keyframes.Length <= 1) return false;
            keyframes.RemoveAt(pos);
            RecalculateTotalFrames();
            return true;
        }

        private void RecalculateTotalFrames()
        {
            totalFrames = 0;
            for (int i = 0; i < keyframes.Length; i++)
            {
                totalFrames += keyframes[i].framesLength;
            }
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
            writer.Write(keyframes);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.CheckVersionK45(CURRENT_VERSION, GetType());
            reader.Read(out useUntilStop);
            reader.Read(out cachedStopOrder);
            reader.Read(ref keyframes);
            RecalculateTotalFrames();
        }

        public void Dispose()
        {
            if (keyframes.IsCreated) keyframes.Dispose();
        }
    }
}
