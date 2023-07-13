using Belzont.Interfaces;
using Belzont.Utils;
using Colossal;
using Colossal.Serialization.Entities;
using Colossal.UI.Binding;
using Game;
using MonoMod.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;
using Unity.Collections;
using Unity.Jobs;

namespace BelzontTLM.Palettes
{
    public class XTMPaletteSystem : GameSystemBase, IBelzontBindable, IJobSerializable
    {

        #region UI Bindings
        public void SetupCallBinder(Action<string, Delegate> eventCaller)
        {
            eventCaller.Invoke("palettes.listCityPalettes", ListCityPalettes);
            eventCaller.Invoke("palettes.listLibraryPalettes", ListLibraryPalettes);
        }

        private Action<string, object[]> eventCaller;
        public void SetupCaller(Action<string, object[]> eventCaller)
        {
            this.eventCaller = eventCaller;
        }

        public void SetupEventBinder(Action<string, Delegate> eventCaller)
        {
        }

        public void SetupRawBindings(Func<string, Action<IJsonWriter>, RawValueBinding> eventBinder)
        {
        }
        #endregion

        protected override void OnUpdate()
        {

        }
        private readonly Dictionary<Guid, XTMPaletteFile> CityPalettes = new();
        private List<XTMPaletteFile> ListCityPalettes() => CityPalettes.Values.ToList();
        private List<XTMPaletteFile> ListLibraryPalettes() => XTMPaletteManager.Instance.FullLibrary.ToList();

        #region Serialization

        private XTMPaletteSystemXML ToXml()
        {
            var xml = new XTMPaletteSystemXML();
            xml.CityPalettes = CityPalettes.Values.Select(x => x.ToXML()).ToList();
            return xml;
        }

        public JobHandle Serialize<TWriter>(EntityWriterData writerData, JobHandle inputDeps) where TWriter : struct, IWriter
        {
            SerializeJob<TWriter> jobData = default;
            jobData.m_paletteDataToWrite = new NativeArray<char>(XmlUtils.DefaultXmlSerialize(ToXml()).ToCharArray(), Allocator.Persistent);
            jobData.m_WriterData = writerData;
            return jobData.Schedule(inputDeps);
        }

        public JobHandle Deserialize<TReader>(EntityReaderData readerData, JobHandle inputDeps) where TReader : struct, IReader
        {
            DeserializeJob<TReader> jobData = default;
            jobData.m_ReaderData = readerData;
            inputDeps = jobData.Schedule(inputDeps);
            inputDeps.GetAwaiter().OnCompleted(() => OnDataRead(ref jobData));
            return inputDeps;
        }

        private void OnDataRead<TReader>(ref DeserializeJob<TReader> jobData) where TReader : struct, IReader
        {
            try
            {
                var palettes = XmlUtils.DefaultXmlDeserialize<XTMPaletteSystemXML>(new string(jobData.m_paletteDataRead.ToArray()));
                CityPalettes.Clear();
                CityPalettes.AddRange(palettes.CityPalettes.ToDictionary(x => x.Guid, x => XTMPaletteFile.FromXML(x)));
                jobData.m_paletteDataRead.Dispose();
            }
            catch (Exception e)
            {
                LogUtils.DoWarnLog("Error loading route auto color data! {0}", e);
            }
            finally
            {
                jobData.m_paletteDataRead.Dispose();
            }
            LogUtils.DoInfoLog("Palette data read!");
        }

        public JobHandle SetDefaults(Context context)
        {
            return default;
        }

        private struct SerializeJob<TWriter> : IJob where TWriter : struct, IWriter
        {
            public void Execute()
            {
                TWriter writer = this.m_WriterData.GetWriter<TWriter>();
                writer.Write(new string(m_paletteDataToWrite.ToArray()));
                m_paletteDataToWrite.Dispose();
                LogUtils.DoInfoLog("Palette data saved!");

            }
            public NativeArray<char> m_paletteDataToWrite;
            public EntityWriterData m_WriterData;
        }

        private struct DeserializeJob<TReader> : IJob where TReader : struct, IReader
        {
            public void Execute()
            {
                try
                {
                    var reader = m_ReaderData.GetReader<TReader>(); 
                    reader.Read(out string paletteListXML);
                    m_paletteDataRead = new NativeArray<char>(paletteListXML.ToCharArray(), Allocator.Persistent);
                }
                catch (Exception e)
                {
                    LogUtils.DoWarnLog($"Error loading deserialization for XTMPaletteSystem!\n{e}");
                }
            }
            public NativeArray<char> m_paletteDataRead;
            public EntityReaderData m_ReaderData;
        }

        [XmlRoot("XtmPaletteSystem")]
        public class XTMPaletteSystemXML
        {
            public List<XTMPaletteFileXML> CityPalettes;
        }
        #endregion
    }
}

