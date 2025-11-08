using Belzont.Interfaces;
using Belzont.Utils;
using Colossal.Entities;
using Game.Prefabs;
using Game.UI;
using System;
using Unity.Entities;
using static Belzont.Utils.NameSystemExtensions;

namespace BelzontTLM
{
    public partial class XTMPrefabDataController : SystemBase, IBelzontBindable
    {
        private const string PREFIX = "prefabData.";
        private PrefabSystem m_prefabSystem;
        private NameSystem m_nameSystem;

        public void SetupCallBinder(Action<string, Delegate> callBinderFn)
        {
            callBinderFn($"{PREFIX}getPrefabData", GetData);
        }

        public void SetupCaller(Action<string, object[]> eventEmitter)
        {
        }

        public void SetupEventBinder(Action<string, Delegate> eventBinderFn)
        {
        }

        protected override void OnCreate()
        {
            base.OnCreate();
            m_prefabSystem = World.GetOrCreateSystemManaged<PrefabSystem>();
            m_nameSystem = World.GetOrCreateSystemManaged<NameSystem>();
        }

        protected override void OnUpdate()
        {
        }

        private struct PrefabDataUI
        {
            public int index;
            public string name;
            public string imageUrl;
        }

        private PrefabDataUI GetData(Entity prefabEntity)
        {

            return EntityManager.TryGetComponent<PrefabData>(prefabEntity, out var data) && m_prefabSystem.TryGetPrefab(data, out PrefabBase prefabBase)
                ? new PrefabDataUI
                {
                    index = data.m_Index,
                    name = m_prefabSystem.GetPrefabName(prefabEntity),
                    imageUrl = prefabBase.thumbnailUrl
                }
                : new PrefabDataUI
                {
                    index = -1,
                    name = m_prefabSystem.GetPrefabName(prefabEntity),
                    imageUrl = string.Empty
                };
        }
    }
}
