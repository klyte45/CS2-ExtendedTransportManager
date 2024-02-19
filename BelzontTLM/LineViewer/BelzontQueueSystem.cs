using Belzont.Interfaces;
using Belzont.Utils;
using Game.Common;
using Game.Prefabs;
using Game.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using Unity.Entities;

namespace BelzontTLM
{
    public abstract partial class BelzontQueueSystem<T> : SystemBase
    {

        private UIUpdateState m_UpdateState;
        protected readonly Queue<KeyValuePair<Entity, (bool, Action<T>)>> itemsToProcess = new();

        protected readonly Dictionary<Entity, Action<T>> awaitingQueue = new();

        protected virtual ComponentType[] ComponentsToCheck => new ComponentType[]
        {
            typeof(Updated),
            typeof(BatchesUpdated),
        };

        public void Enqueue(Entity e, Action<T> onEnd, bool force = false)
        {
            LogUtils.DoLog("{0}: E = {1}, Force = {2}", GetType(), e, force);
            itemsToProcess.Enqueue(new(e, (force, onEnd)));
        }

        protected override void OnCreate()
        {
            base.OnCreate();
            m_UpdateState = UIUpdateState.Create(World, 256);
        }

        protected abstract void Reset();

        protected abstract T OnProcess(Entity e);

        protected virtual void OnPreUpdate() { }

        protected virtual bool ForceUpdate() => false;

        protected abstract void RunUpdate(Entity e);

        protected sealed override void OnUpdate()
        {
            OnPreUpdate();
            if (m_UpdateState.Advance() || ForceUpdate())
            {
                LogUtils.DoLog("{0}: ADVANCE/FORCE UNQUEUE!", GetType());
                foreach (var entry in awaitingQueue)
                {
                    itemsToProcess.Enqueue(new(entry.Key, (true, entry.Value)));
                }
                awaitingQueue.Clear();
            }
            if (ComponentsToCheck.Length > 0)
            {
                foreach (var entry in awaitingQueue.Where(x => ComponentsToCheck.Any(t => EntityManager.HasComponent(x.Key, t))).ToArray())
                {
                    if (BasicIMod.DebugMode) LogUtils.DoLog("{0}: COMPONENT FOUND! {1}", GetType(), entry.Key, ComponentsToCheck.First(x => EntityManager.HasComponent(entry.Key, x)));
                    itemsToProcess.Enqueue(new(entry.Key, (true, entry.Value)));
                    awaitingQueue.Remove(entry.Key);
                }
            }
            if (itemsToProcess.Count > 0)
            {
                var nextItem = itemsToProcess.Dequeue();
                if (nextItem.Value.Item1)
                {
                    Reset();
                    RunUpdate(nextItem.Key);
                    nextItem.Value.Item2(OnProcess(nextItem.Key));
                }
                else
                {
                    awaitingQueue[nextItem.Key] = nextItem.Value.Item2;
                }
            }
        }

        protected bool TryGetComponentWithUpgrades<X>(Entity entity, Entity prefab, out X data) where X : unmanaged, IComponentData, ICombineData<X>
            => UpgradeUtils.TryGetCombinedComponent(EntityManager, entity, prefab, out data);

        protected BelzontQueueSystem()
        {
        }
    }
}
