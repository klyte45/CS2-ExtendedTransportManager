export class ArrayUtils {
    static getRandomItem<T>(anyArray: T[]): T {
        return anyArray[(Math.random() * anyArray.length) << 0];
    }
    public static paginate<T>(arr: T[], size: number): T[][] {
        return arr.reduce((acc, val, i) => {
            let idx = Math.floor(i / size)
            let page = acc[idx] || (acc[idx] = [])
            page.push(val)

            return acc
        }, [] as T[][])
    }
    public static groupBy<T, I extends string | number>(inputArray: T[], groupKey: (item: T) => I) {
        return inputArray.reduce(function (rv, x) {
            const groupKeyRes = groupKey(x);
            (rv[groupKeyRes] ??= []).push(x);
            return rv;
        }, {} as { [id in I]: T[] });
    };
    public static shuffle<E>(array: E[]) {
        let m = array.length, i;
        while (m) {
            i = (Math.random() * m--) >>> 0;
            [array[m], array[i]] = [array[i], array[m]]
        }
        return array;
    }
    public static runRoundRobin<E>(inputq: E[]): [E, E][] {
        const arr: (E | undefined)[] = [...inputq];
        let pairs: [E, E][] = [];
        if (arr.length % 2) {
            arr.push(undefined);
        }
        const k = arr.length

        for (let r = 1; r < k; r++) {
            for (let i = 1; i <= k / 2; i++) {
                if (i == 1) {
                    const pair = [arr[1 - 1], arr[(k - 1 + r - 1) % (k - 1) + 1]];
                    if (pair[0] && pair[1]) {
                        pairs.push((r % 2 ? pair : pair.reverse()) as [E, E]);
                    }
                } else {
                    const pair = [arr[(r + i - 2) % (k - 1) + 1], arr[(k - 1 + r - i) % (k - 1) + 1]];
                    if (pair[0] && pair[1]) {
                        pairs.push((r % 2 ? pair : pair.reverse()) as [E, E]);
                    }
                }
            }
        }


        return pairs;
    }

}