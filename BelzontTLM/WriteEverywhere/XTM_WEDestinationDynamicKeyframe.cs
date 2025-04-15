using Belzont.Utils;
using Colossal.Entities;
using Colossal.OdinSerializer.Utilities;
using Colossal.Serialization.Entities;
using Game.Areas;
using Game.Common;
using Game.Net;
using Game.Objects;
using Game.Routes;
using Game.UI;
using Unity.Collections;
using Unity.Entities;

namespace BelzontTLM
{
    public struct XTM_WEDestinationDynamicKeyframe : ISerializable
    {
        private const uint CURRENT_VERSION = 0;
        public FixedString32Bytes prefix;
        public FixedString32Bytes suffix;
        public XTM_WEDestinationKeyframeType type;
        public ushort framesLength;

        public struct UIData
        {
            public string prefix;
            public string suffix;
            public XTM_WEDestinationKeyframeType type;
            public int framesLength;
            public string sample;

            public readonly XTM_WEDestinationDynamicKeyframe ToComponent()
                => new()
                {
                    prefix = prefix ?? "",
                    suffix = suffix ?? "",
                    type = type,
                    framesLength = (ushort)framesLength,

                };

            public readonly bool IsValid()
                => framesLength > 0 && type switch
                {
                    XTM_WEDestinationKeyframeType.RouteName or
                    XTM_WEDestinationKeyframeType.EntityName or
                    XTM_WEDestinationKeyframeType.EntityNameOrDistrict or
                    XTM_WEDestinationKeyframeType.RouteNumber or
                    XTM_WEDestinationKeyframeType.NextStopSimple => true,
                    XTM_WEDestinationKeyframeType.FixedString => !prefix.IsNullOrWhitespace(),
                    _ => false
                };
        }

        public readonly UIData ToUI(EntityManager em, NameSystem ns, XTMLineManagementController xtmlms, Entity stopEntity, XTM_WEDestinationBlind parent)
            => new()
            {
                prefix = prefix.ToString(),
                suffix = suffix.ToString(),
                type = type,
                framesLength = framesLength,
                sample = GetString(em, ns, xtmlms, stopEntity, parent, 0)
            };

        public readonly void Serialize<TWriter>(TWriter writer) where TWriter : IWriter
        {
            writer.Write(CURRENT_VERSION);
            writer.Write(type);
            writer.Write(framesLength);
            writer.Write(prefix);
            writer.Write(suffix);
        }

        public void Deserialize<TReader>(TReader reader) where TReader : IReader
        {
            reader.CheckVersionK45(CURRENT_VERSION, GetType());
            reader.Read(out type);
            reader.Read(out framesLength);
            reader.Read(out prefix);
            reader.Read(out suffix);
        }

        public readonly string GetString(EntityManager em, NameSystem ns, XTMLineManagementController xtmlms, Entity stopEntity, XTM_WEDestinationBlind parent, int offsetStops)
            => type switch
            {
                XTM_WEDestinationKeyframeType.EntityName => $"{prefix}{(parent.UseUntilStop == Entity.Null ? GetFirstStop(em, ns, stopEntity, false) : GetNextStop(em, ns, parent.UseUntilStop, false))}{suffix}",
                XTM_WEDestinationKeyframeType.RouteNumber => $"{prefix}{(em.TryGetComponent<Owner>(stopEntity, out var ownerLine) ? xtmlms.GetEffectiveRouteNumber(ownerLine.m_Owner) : "<?>")}{suffix}",
                XTM_WEDestinationKeyframeType.RouteName => $"{prefix}{(em.TryGetComponent<Owner>(stopEntity, out var ownerLine) ? ns.GetName(ownerLine.m_Owner).Translate() : "<?>")}{suffix}",
                XTM_WEDestinationKeyframeType.FixedString => prefix.ToString(),
                XTM_WEDestinationKeyframeType.NextStopSimple => $"{prefix}{GetNextStop(em, ns, stopEntity, false, offsetStops)}{suffix}",
                XTM_WEDestinationKeyframeType.EntityNameOrDistrict => $"{prefix}{(parent.UseUntilStop == Entity.Null ? GetFirstStop(em, ns, stopEntity, true) : GetNextStop(em, ns, parent.UseUntilStop, true))}{suffix}",
                _ => "????"
            };
        private static string GetNextStop(EntityManager em, NameSystem ns, Entity stopEntity, bool checkAttachment, int startOffset = 0)
        {
            if (!em.TryGetComponent(stopEntity, out Waypoint waypoint)) return "??";
            if (!em.TryGetComponent(stopEntity, out Owner line)) return "???";
            if (!em.TryGetBuffer(line.m_Owner, true, out DynamicBuffer<RouteWaypoint> waypoints)) return "?!??";
            for (int i = startOffset; i < waypoints.Length; i++)
            {
                var wp = waypoints[(waypoint.m_Index + i) % waypoints.Length].m_Waypoint;
                if (em.TryGetComponent(wp, out Connected connected))
                {
                    return checkAttachment ? CheckAttachment(em, ns, connected) : ns.GetName(connected.m_Connected).Translate();
                }
            }
            return "!!!!?";
        }



        private static string CheckAttachment(EntityManager em, NameSystem ns, Connected connected)
            => em.HasComponent<Owner>(connected.m_Connected)
                || em.HasComponent<CustomName>(connected.m_Connected)
                || !em.TryGetComponent(connected.m_Connected, out Attached attached)
                     ? ns.GetName(connected.m_Connected).Translate()
                : !em.TryGetComponent(attached.m_Parent, out BorderDistrict border) ? ns.GetName(attached.m_Parent).Translate()
                : border.m_Left != Entity.Null ? ns.GetName(border.m_Left).Translate()
                : border.m_Right != Entity.Null ? ns.GetName(border.m_Right).Translate()
                : !em.TryGetComponent(attached.m_Parent, out Aggregated agg) ? "?????"
                : ns.GetName(agg.m_Aggregate).Translate();

        private static string GetFirstStop(EntityManager em, NameSystem ns, Entity stopEntity, bool checkAttachment)
                        => !em.TryGetComponent(stopEntity, out Owner line) ? "??!?"
                            : !em.TryGetBuffer(line.m_Owner, true, out DynamicBuffer<RouteWaypoint> waypoints) ? "?!?!?"
                            : GetNextStop(em, ns, waypoints[0].m_Waypoint, checkAttachment);
    }
}
