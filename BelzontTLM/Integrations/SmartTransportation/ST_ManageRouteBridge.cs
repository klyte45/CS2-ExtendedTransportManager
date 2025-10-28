using System;
using System.Linq;
using Unity.Entities;

namespace BelzontTLM.Integrations.SmartTransportation
{
    internal class ST_ManageRouteBridge
    {
        /// <summary>
        /// Sets a rule for a given transport route.
        /// </summary>
        public static void SetRouteRule(Entity routeEntity, Colossal.Hash128 routeRuleId) => throw new NotImplementedException("STUB ONLY!");

        /// <summary>
        /// Gets the rule info for a given route.
        /// </summary>
        public static (Colossal.Hash128, string) GetRouteRule(Entity routeEntity) => throw new NotImplementedException("STUB ONLY!");

        /// <summary>
        /// Returns all available route rule names.
        /// </summary>
        public static (Colossal.Hash128, string)[] GetRouteRules(Entity routeEntity) => throw new NotImplementedException("STUB ONLY!");

        /// <summary>
        /// Retrieves all custom rules currently stored in the ManageRouteSystem.
        /// </summary>
        /// <returns>
        /// An array of tuples containing:
        /// - ruleId: The unique identifier of the rule
        /// - ruleName: The name of the rule
        /// - occupancy: Target occupancy percentage
        /// - stdTicket: Standard ticket price
        /// - maxTicketInc: Maximum allowed ticket price increase
        /// - maxTicketDec: Maximum allowed ticket price discount
        /// - maxVehAdj: Maximum vehicle adjustment
        /// - minVehAdj: Minimum vehicle adjustment
        /// </returns>
        internal static ST_TransportRule[] GetCustomRules_Parsed() => GetCustomRules().Cast<ST_TransportRule>().ToArray();

        public static (
             Colossal.Hash128 ruleId,
             string ruleName,
             int occupancy,
             int stdTicket,
             int maxTicketInc,
             int maxTicketDec,
             int maxVehAdj,
             int minVehAdj
         )[] GetCustomRules() => throw new NotImplementedException("STUB ONLY!");

        /// <summary>
        /// Updates the properties of an existing custom rule identified by the given ruleId.
        /// </summary>
        /// <param name="ruleId">The unique identifier of the custom rule to update.</param>
        /// <param name="ruleName">The name to assign to the rule.</param>
        /// <param name="occupancy">Target occupancy percentage for the route.</param>
        /// <param name="stdTicket">Standard ticket price for the route.</param>
        /// <param name="maxTicketInc">Maximum allowed ticket price increase.</param>
        /// <param name="maxTicketDec">Maximum allowed ticket price discount.</param>
        /// <param name="maxVehAdj">Maximum percentage of vehicle adjustment.</param>
        /// <param name="minVehAdj">Minimum percentage of vehicle adjustment.</param>
        /// 
        internal static void SetCustomRule(ST_TransportRule rule) => SetCustomRule(rule.ruleId, rule.ruleName, rule.occupancy, rule.stdTicket, rule.maxTicketInc, rule.maxTicketDec, rule.maxVehAdj, rule.minVehAdj);
        public static void SetCustomRule(
            Colossal.Hash128 ruleId,
            string ruleName,
            int occupancy,
            int stdTicket,
            int maxTicketInc,
            int maxTicketDec,
            int maxVehAdj,
            int minVehAdj) => throw new NotImplementedException("STUB ONLY!");


        /// <summary>
        /// Adds a new custom rule with default values to the ManageRouteSystem.
        /// The rule will be assigned a unique ruleId that does not conflict with built-in rules.
        /// </summary>
        /// <returns>The unique ruleId (Hash128) assigned to the newly created custom rule.</returns>
        public static Colossal.Hash128 AddCustomRule() => throw new NotImplementedException("STUB ONLY!");

        /// <summary>
        /// Removes a custom rule identified by the given ruleId from the ManageRouteSystem.
        /// </summary>
        /// <param name="ruleId">The unique identifier of the custom rule to remove.</param>
        public static void RemoveCustomRule(Colossal.Hash128 ruleId) => throw new NotImplementedException("STUB ONLY!");

        /// <summary>
        /// Retrieves a custom rule by its ruleId from the ManageRouteSystem.
        /// </summary>
        /// <param name="ruleId">The unique ID of the custom rule to retrieve.</param>
        /// <returns>
        /// A tuple containing:
        /// - ruleId: The rule's unique identifier
        /// - ruleName: The name of the rule
        /// - occupancy: The target occupancy percentage
        /// - stdTicket: The standard ticket price
        /// - maxTicketInc: Maximum allowed ticket price increase
        /// - maxTicketDec: Maximum allowed ticket price discount
        /// - maxVehAdj: Maximum vehicle adjustment
        /// - minVehAdj: Minimum vehicle adjustment
        /// </returns>
        /// 
        internal static ST_TransportRule GetCustomRule_Parsed(Colossal.Hash128 ruleId) => GetCustomRule(ruleId);

        public static (
            Colossal.Hash128 ruleId,
            string ruleName,
            int occupancy,
            int stdTicket,
            int maxTicketInc,
            int maxTicketDec,
            int maxVehAdj,
            int minVehAdj
        ) GetCustomRule(Colossal.Hash128 ruleId) => throw new NotImplementedException("STUB ONLY!");
    }

    internal record struct ST_TransportRule(Colossal.Hash128 ruleId, string ruleName, int occupancy, int stdTicket, int maxTicketInc, int maxTicketDec, int maxVehAdj, int minVehAdj)
    {
        public static implicit operator (Colossal.Hash128 ruleId, string ruleName, int occupancy, int stdTicket, int maxTicketInc, int maxTicketDec, int maxVehAdj, int minVehAdj)(ST_TransportRule value)
        {
            return (value.ruleId, value.ruleName, value.occupancy, value.stdTicket, value.maxTicketInc, value.maxTicketDec, value.maxVehAdj, value.minVehAdj);
        }

        public static implicit operator ST_TransportRule((Colossal.Hash128 ruleId, string ruleName, int occupancy, int stdTicket, int maxTicketInc, int maxTicketDec, int maxVehAdj, int minVehAdj) value)
        {
            return new ST_TransportRule(value.ruleId, value.ruleName, value.occupancy, value.stdTicket, value.maxTicketInc, value.maxTicketDec, value.maxVehAdj, value.minVehAdj);
        }
    }
}
