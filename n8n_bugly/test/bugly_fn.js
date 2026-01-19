const s = function (e) {
    return "string" == typeof e && i.test(e)
};
for (var c = [], l = 0; l < 256; ++l)
    c.push((l + 256).toString(16).substr(1));
const u = function (e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
        , n = (c[e[t + 0]] + c[e[t + 1]] + c[e[t + 2]] + c[e[t + 3]] + "-" + c[e[t + 4]] + c[e[t + 5]] + "-" + c[e[t + 6]] + c[e[t + 7]] + "-" + c[e[t + 8]] + c[e[t + 9]] + "-" + c[e[t + 10]] + c[e[t + 11]] + c[e[t + 12]] + c[e[t + 13]] + c[e[t + 14]] + c[e[t + 15]]).toLowerCase();
    return n
};

const p = function (e, t, n) {
    var r = (e = e || {}).random || (e.rng || o)();
    if (r[6] = 15 & r[6] | 64,
        r[8] = 63 & r[8] | 128,
        t) {
        n = n || 0;
        for (var a = 0; a < 16; ++a)
            t[n + a] = r[a];
        return t
    }
    return u(r)
}