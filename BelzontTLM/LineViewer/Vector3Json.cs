using UnityEngine;

namespace BelzontTLM
{
    public class Vector3Json
    {
        public float x, y, z;

        public Vector3Json(Vector3 src)
        {
            x = src.x;
            y = src.y;
            z = src.z;
        }
    }
}
