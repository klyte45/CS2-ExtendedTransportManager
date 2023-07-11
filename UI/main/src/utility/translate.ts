export default function (key: string, fallback?: string) {
    const fullKey = `K45::XTM.main[${key}]`;
    const tr = engine.translate(`K45::XTM.main[${key}]`);
    return ((tr === fullKey) && fallback) || tr;
}