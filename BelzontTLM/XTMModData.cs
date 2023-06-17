using Belzont.Interfaces;
using System.Xml.Serialization;

public class XTMModData : IBasicModData
{
    [XmlAttribute]
    public bool DebugMode { get; set; }
}