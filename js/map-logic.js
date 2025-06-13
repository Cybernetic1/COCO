/* Map logic */
!(function (e) {
  var t,
    o,
    r,
    n = {};
  (function () {
    var e,
      t,
      o,
      r,
      n,
      s,
      a,
      l,
      c,
      p,
      m,
      u = this || Function("return this")(),
      d = (function () {
        "use strict";
        var e,
          t,
          o,
          r,
          n,
          s = "linear",
          a =
            Date.now ||
            function () {
              return +new Date();
            },
          l = "undefined" != typeof SHIFTY_DEBUG_NOW ? SHIFTY_DEBUG_NOW : a;
        function c() {}
        function p(e, t) {
          for (var o in e) Object.hasOwnProperty.call(e, o) && t(o);
        }
        function m(e, t) {
          return (
            p(t, function (o) {
              e[o] = t[o];
            }),
            e
          );
        }
        function d(e, t) {
          p(t, function (o) {
            void 0 === e[o] && (e[o] = t[o]);
          });
        }
        function f(t, o, r, n, s, a, l) {
          var c,
            p,
            m,
            u,
            d,
            f,
            h = t < a ? 0 : (t - a) / s;
          for (d in o) {
            o.hasOwnProperty(d) &&
              ((f = "function" == typeof (f = l[d]) ? f : e[f]),
              (o[d] =
                ((c = r[d]),
                (p = n[d]),
                (m = f),
                (u = h),
                c + (p - c) * m(u))));
          }
          return o;
        }
        function h(e, t, o, r) {
          return e + (t - e) * o(r);
        }
        function y(e, t) {
          var o = _.prototype.filter,
            r = e._filterArgs;
          p(o, function (n) {
            void 0 !== o[n][t] && o[n][t].apply(e, r);
          });
        }
        function $(e, t, s, a, c, p, m, u, d, h, $) {
          (n = t + s + a),
            (o = Math.min($ || l(), n)),
            (r = n <= o),
            (n = a - (n - o)),
            e.isPlaying() &&
              (r
                ? (d(m, e._attachment, n), e.stop(!0))
                : ((e._scheduleId = h(e._timeoutHandler, 1e3 / 60)),
                  y(e, "beforeTween"),
                  o < t + s
                    ? f(1, c, p, m, 1, 1, u)
                    : f(o, c, p, m, a, t + s, u),
                  y(e, "afterTween"),
                  d(c, e._attachment, n)));
        }
        function v(e, t) {
          var o = {},
            r = typeof t;
          return (
            p(
              e,
              "string" == r || "function" == r
                ? function (e) {
                    o[e] = t;
                  }
                : function (e) {
                    o[e] || (o[e] = t[e] || s);
                  },
            ),
            o
          );
        }
        function _(e, o) {
          (this._currentState = e || {}),
            (this._configured = !1),
            (this._scheduleFunction = t),
            void 0 !== o && this.setConfig(o);
        }
        return (
          (t =
            ("undefined" != typeof window &&
              (window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                (window.mozCancelRequestAnimationFrame &&
                  window.mozRequestAnimationFrame))) ||
            setTimeout),
          (_.prototype.tween = function (e) {
            return this._isTweening
              ? this
              : ((void 0 === e && this._configured) || this.setConfig(e),
                (this._timestamp = l()),
                this._start(this.get(), this._attachment),
                this.resume());
          }),
          (_.prototype.setConfig = function (e) {
            (e = e || {}),
              (this._configured = !0),
              (this._attachment = e.attachment),
              (this._pausedAtTime = null),
              (this._scheduleId = null),
              (this._delay = e.delay || 0),
              (this._start = e.start || c),
              (this._step = e.step || c),
              (this._finish = e.finish || c),
              (this._duration = e.duration || 500),
              (this._currentState = m({}, e.from || this.get())),
              (this._originalState = this.get()),
              (this._targetState = m({}, e.to || this.get()));
            var t = this;
            this._timeoutHandler = function () {
              $(
                t,
                t._timestamp,
                t._delay,
                t._duration,
                t._currentState,
                t._originalState,
                t._targetState,
                t._easing,
                t._step,
                t._scheduleFunction,
              );
            };
            var o = this._currentState,
              r = this._targetState;
            return (
              d(r, o),
              (this._easing = v(o, e.easing || s)),
              (this._filterArgs = [o, this._originalState, r, this._easing]),
              y(this, "tweenCreated"),
              this
            );
          }),
          (_.prototype.get = function () {
            return m({}, this._currentState);
          }),
          (_.prototype.set = function (e) {
            this._currentState = e;
          }),
          (_.prototype.pause = function () {
            return (this._pausedAtTime = l()), (this._isPaused = !0), this;
          }),
          (_.prototype.resume = function () {
            return (
              this._isPaused && (this._timestamp += l() - this._pausedAtTime),
              (this._isPaused = !1),
              (this._isTweening = !0),
              this._timeoutHandler(),
              this
            );
          }),
          (_.prototype.seek = function (e) {
            e = Math.max(e, 0);
            var t = l();
            return (
              this._timestamp + e === 0 ||
                ((this._timestamp = t - e),
                this.isPlaying() ||
                  ((this._isTweening = !0),
                  (this._isPaused = !1),
                  $(
                    this,
                    this._timestamp,
                    this._delay,
                    this._duration,
                    this._currentState,
                    this._originalState,
                    this._targetState,
                    this._easing,
                    this._step,
                    this._scheduleFunction,
                    t,
                  ),
                  this.pause())),
              this
            );
          }),
          (_.prototype.stop = function (e) {
            return (
              (this._isTweening = !1),
              (this._isPaused = !1),
              (this._timeoutHandler = c),
              (
                u.cancelAnimationFrame ||
                u.webkitCancelAnimationFrame ||
                u.oCancelAnimationFrame ||
                u.msCancelAnimationFrame ||
                u.mozCancelRequestAnimationFrame ||
                u.clearTimeout
              )(this._scheduleId),
              e &&
                (y(this, "beforeTween"),
                f(
                  1,
                  this._currentState,
                  this._originalState,
                  this._targetState,
                  1,
                  0,
                  this._easing,
                ),
                y(this, "afterTween"),
                y(this, "afterTweenEnd"),
                this._finish.call(this, this._currentState, this._attachment)),
              this
            );
          }),
          (_.prototype.isPlaying = function () {
            return this._isTweening && !this._isPaused;
          }),
          (_.prototype.setScheduleFunction = function (e) {
            this._scheduleFunction = e;
          }),
          (_.prototype.dispose = function () {
            for (var e in this) this.hasOwnProperty(e) && delete this[e];
          }),
          (_.prototype.filter = {}),
          (e = _.prototype.formula =
            {
              linear: function (e) {
                return e;
              },
            }),
          m(_, {
            now: l,
            each: p,
            tweenProps: f,
            tweenProp: h,
            applyFilter: y,
            shallowCopy: m,
            defaults: d,
            composeEasingObject: v,
          }),
          "function" == typeof SHIFTY_DEBUG_NOW && (u.timeoutHandler = $),
          (u.Tweenable = _)
        );
      })();
    function f(e) {
      t.each(e, function (t) {
        var o = e[t];
        "string" == typeof o && o.match(l) && (e[t] = $(l, o, h));
      });
    }
    function h(e) {
      var t;
      return (
        "rgb(" +
        (e =
          (3 === (t = (t = e).replace(/#/, "")).length &&
            (t = (t = t.split(""))[0] + t[0] + t[1] + t[1] + t[2] + t[2]),
          (p[0] = y(t.substr(0, 2))),
          (p[1] = y(t.substr(2, 2))),
          (p[2] = y(t.substr(4, 2))),
          p))[0] +
        "," +
        e[1] +
        "," +
        e[2] +
        ")"
      );
    }
    function y(e) {
      return parseInt(e, 16);
    }
    function $(e, t, o) {
      var r = t.match(e),
        n = t.replace(e, c);
      if (r)
        for (var s, a = r.length, l = 0; l < a; l++)
          (s = r.shift()), (n = n.replace(c, o(s)));
      return n;
    }
    function v(e) {
      for (
        var t = e.match(n), o = t.length, r = e.match(a)[0], s = 0;
        s < o;
        s++
      )
        r += parseInt(t[s], 10) + ",";
      return r.slice(0, -1) + ")";
    }
    function _(e, o) {
      t.each(o, function (t) {
        for (var r = b(e[t]), n = r.length, s = 0; s < n; s++)
          e[o[t].chunkNames[s]] = +r[s];
        delete e[t];
      });
    }
    function g(e, o) {
      t.each(o, function (t) {
        var r = e[t],
          n = (function (e, t) {
            m.length = 0;
            for (var o = t.length, r = 0; r < o; r++) m.push(e[t[r]]);
            return m;
          })(
            (function (e, t) {
              for (var o, r = {}, n = t.length, s = 0; s < n; s++)
                (r[(o = t[s])] = e[o]), delete e[o];
              return r;
            })(e, o[t].chunkNames),
            o[t].chunkNames,
          ),
          r = (function (e, t) {
            for (var o = e, r = t.length, n = 0; n < r; n++)
              o = o.replace(c, +t[n].toFixed(4));
            return o;
          })(o[t].formatString, n);
        e[t] = $(s, r, v);
      });
    }
    function b(e) {
      return e.match(n);
    }
    d.shallowCopy(d.prototype.formula, {
      easeInQuad: function (e) {
        return Math.pow(e, 2);
      },
      easeOutQuad: function (e) {
        return -(Math.pow(e - 1, 2) - 1);
      },
      easeInOutQuad: function (e) {
        return (e /= 0.5) < 1
          ? 0.5 * Math.pow(e, 2)
          : -0.5 * ((e -= 2) * e - 2);
      },
      easeInCubic: function (e) {
        return Math.pow(e, 3);
      },
      easeOutCubic: function (e) {
        return Math.pow(e - 1, 3) + 1;
      },
      easeInOutCubic: function (e) {
        return (e /= 0.5) < 1
          ? 0.5 * Math.pow(e, 3)
          : 0.5 * (Math.pow(e - 2, 3) + 2);
      },
      easeInQuart: function (e) {
        return Math.pow(e, 4);
      },
      easeOutQuart: function (e) {
        return -(Math.pow(e - 1, 4) - 1);
      },
      easeInOutQuart: function (e) {
        return (e /= 0.5) < 1
          ? 0.5 * Math.pow(e, 4)
          : -0.5 * ((e -= 2) * Math.pow(e, 3) - 2);
      },
      easeInQuint: function (e) {
        return Math.pow(e, 5);
      },
      easeOutQuint: function (e) {
        return Math.pow(e - 1, 5) + 1;
      },
      easeInOutQuint: function (e) {
        return (e /= 0.5) < 1
          ? 0.5 * Math.pow(e, 5)
          : 0.5 * (Math.pow(e - 2, 5) + 2);
      },
      easeInSine: function (e) {
        return 1 - Math.cos(e * (Math.PI / 2));
      },
      easeOutSine: function (e) {
        return Math.sin(e * (Math.PI / 2));
      },
      easeInOutSine: function (e) {
        return -0.5 * (Math.cos(Math.PI * e) - 1);
      },
      easeInExpo: function (e) {
        return 0 === e ? 0 : Math.pow(2, 10 * (e - 1));
      },
      easeOutExpo: function (e) {
        return 1 === e ? 1 : 1 - Math.pow(2, -10 * e);
      },
      easeInOutExpo: function (e) {
        return 0 === e
          ? 0
          : 1 === e
            ? 1
            : (e /= 0.5) < 1
              ? 0.5 * Math.pow(2, 10 * (e - 1))
              : 0.5 * (2 - Math.pow(2, -10 * --e));
      },
      easeInCirc: function (e) {
        return -(Math.sqrt(1 - e * e) - 1);
      },
      easeOutCirc: function (e) {
        return Math.sqrt(1 - Math.pow(e - 1, 2));
      },
      easeInOutCirc: function (e) {
        return (e /= 0.5) < 1
          ? -0.5 * (Math.sqrt(1 - e * e) - 1)
          : 0.5 * (Math.sqrt(1 - (e -= 2) * e) + 1);
      },
      easeOutBounce: function (e) {
        return e < 1 / 2.75
          ? 7.5625 * e * e
          : e < 2 / 2.75
            ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75
            : e < 2.5 / 2.75
              ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375
              : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
      },
      easeInBack: function (e) {
        return e * e * (2.70158 * e - 1.70158);
      },
      easeOutBack: function (e) {
        return --e * e * (2.70158 * e + 1.70158) + 1;
      },
      easeInOutBack: function (e) {
        var t = 1.70158;
        return (e /= 0.5) < 1
          ? e * e * ((1 + (t *= 1.525)) * e - t) * 0.5
          : 0.5 * ((e -= 2) * e * ((1 + (t *= 1.525)) * e + t) + 2);
      },
      elastic: function (e) {
        return (
          -1 *
            Math.pow(4, -8 * e) *
            Math.sin(((6 * e - 1) * (2 * Math.PI)) / 2) +
          1
        );
      },
      swingFromTo: function (e) {
        var t = 1.70158;
        return (e /= 0.5) < 1
          ? e * e * ((1 + (t *= 1.525)) * e - t) * 0.5
          : 0.5 * ((e -= 2) * e * ((1 + (t *= 1.525)) * e + t) + 2);
      },
      swingFrom: function (e) {
        return e * e * (2.70158 * e - 1.70158);
      },
      swingTo: function (e) {
        return --e * e * (2.70158 * e + 1.70158) + 1;
      },
      bounce: function (e) {
        return e < 1 / 2.75
          ? 7.5625 * e * e
          : e < 2 / 2.75
            ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75
            : e < 2.5 / 2.75
              ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375
              : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
      },
      bouncePast: function (e) {
        return e < 1 / 2.75
          ? 7.5625 * e * e
          : e < 2 / 2.75
            ? 2 - (7.5625 * (e -= 1.5 / 2.75) * e + 0.75)
            : e < 2.5 / 2.75
              ? 2 - (7.5625 * (e -= 2.25 / 2.75) * e + 0.9375)
              : 2 - (7.5625 * (e -= 2.625 / 2.75) * e + 0.984375);
      },
      easeFromTo: function (e) {
        return (e /= 0.5) < 1
          ? 0.5 * Math.pow(e, 4)
          : -0.5 * ((e -= 2) * Math.pow(e, 3) - 2);
      },
      easeFrom: function (e) {
        return Math.pow(e, 4);
      },
      easeTo: function (e) {
        return Math.pow(e, 0.25);
      },
    }),
      (d.setBezierFunction = function (e, t, o, r, n) {
        var s,
          a,
          l,
          c,
          p =
            ((s = t),
            (a = o),
            (l = r),
            (c = n),
            function (e) {
              return (function e(t, o, r, n, s, a) {
                var l,
                  c = 0,
                  p = 0,
                  m = 0,
                  u = 0,
                  d = 0,
                  f = 0;
                function h(e) {
                  return ((c * e + p) * e + m) * e;
                }
                function y(e) {
                  return 0 <= e ? e : 0 - e;
                }
                return (
                  (c = 1 - (m = 3 * o) - (p = 3 * (n - o) - m)),
                  (((u = 1 - (f = 3 * r) - (d = 3 * (s - r) - f)) *
                    (l = (function (e, t) {
                      var o, r, n, s, a, l, u;
                      for (n = e, l = 0; l < 8; l++) {
                        if (y((s = h(n) - e)) < t) return n;
                        if (1e-6 > y((a = (3 * c * (u = n) + 2 * p) * u + m)))
                          break;
                        n -= s / a;
                      }
                      if (((r = 1), (n = e) < (o = 0))) return o;
                      if (r < n) return r;
                      for (; o < r && !(y((s = h(n)) - e) < t); )
                        s < e ? (o = n) : (r = n), (n = 0.5 * (r - o) + o);
                      return n;
                    })(t, (l = 0.005))) +
                    d) *
                    l +
                    f) *
                    l
                );
              })(e, s, a, l, c, 1);
            });
        return (
          (p.displayName = e),
          (p.x1 = t),
          (p.y1 = o),
          (p.x2 = r),
          (p.y2 = n),
          (d.prototype.formula[e] = p)
        );
      }),
      (d.unsetBezierFunction = function (e) {
        delete d.prototype.formula[e];
      }),
      ((e = new d())._filterArgs = []),
      (d.interpolate = function (t, o, r, n, s) {
        var a = d.shallowCopy({}, t),
          l = s || 0,
          s = d.composeEasingObject(t, n || "linear");
        return (
          e.set({}),
          ((n = e._filterArgs).length = 0),
          (n[0] = a),
          (n[1] = t),
          (n[2] = o),
          (n[3] = s),
          d.applyFilter(e, "tweenCreated"),
          d.applyFilter(e, "beforeTween"),
          (s = d.tweenProps(r, a, t, o, 1, l, s)),
          d.applyFilter(e, "afterTween"),
          s
        );
      }),
      (t = d),
      (o = /(\d|\-|\.)/),
      (r = /([^\-0-9\.]+)/g),
      (s = RegExp(
        "rgb\\(" +
          (n = /[0-9.\-]+/g).source +
          /,\s*/.source +
          n.source +
          /,\s*/.source +
          n.source +
          "\\)",
        "g",
      )),
      (a = /^.*\(/),
      (l = /#([0-9]|[a-f]){3,6}/gi),
      (c = "VAL"),
      (p = []),
      (m = []),
      (t.prototype.filter.token = {
        tweenCreated: function (e, n, s, a) {
          var l, p;
          f(e),
            f(n),
            f(s),
            (this._tokenData =
              ((l = e),
              (p = {}),
              t.each(l, function (e) {
                var t,
                  n,
                  s = l[e];
                "string" == typeof s &&
                  ((t = b(s)),
                  (p[e] = {
                    formatString:
                      ((s = (n = s).match(r))
                        ? (1 === s.length || n.charAt(0).match(o)) &&
                          s.unshift("")
                        : (s = ["", ""]),
                      s.join(c)),
                    chunkNames: (function (e, t) {
                      for (var o = [], r = e.length, n = 0; n < r; n++)
                        o.push("_" + t + "_" + n);
                      return o;
                    })(t, e),
                  }));
              }),
              p));
        },
        beforeTween: function (e, o, r, n) {
          var s, a;
          (s = n),
            (a = this._tokenData),
            t.each(a, function (e) {
              var t = a[e].chunkNames,
                o = t.length,
                r = s[e];
              if ("string" == typeof r)
                for (
                  var n = r.split(" "), l = n[n.length - 1], c = 0;
                  c < o;
                  c++
                )
                  s[t[c]] = n[c] || l;
              else for (c = 0; c < o; c++) s[t[c]] = r;
              delete s[e];
            }),
            _(e, this._tokenData),
            _(o, this._tokenData),
            _(r, this._tokenData);
        },
        afterTween: function (e, o, r, n) {
          var s, a;
          g(e, this._tokenData),
            g(o, this._tokenData),
            g(r, this._tokenData),
            (s = n),
            (a = this._tokenData),
            t.each(a, function (e) {
              var t = a[e].chunkNames,
                o = t.length,
                r = s[t[0]];
              if ("string" == typeof r) {
                for (var n = "", l = 0; l < o; l++)
                  (n += " " + s[t[l]]), delete s[t[l]];
                s[e] = n.substr(1);
              } else s[e] = r;
            });
        },
      });
  }).call(null),
    (function (e, t) {
      (e = e || "docReady"), (t = t || window);
      var o = [],
        r = !1,
        n = !1;
      function s() {
        if (!r) {
          r = !0;
          for (var e = 0; e < o.length; e++) o[e].fn.call(window, o[e].ctx);
          o = [];
        }
      }
      function a() {
        "complete" === document.readyState && s();
      }
      t[e] = function (e, t) {
        if (r) {
          setTimeout(function () {
            e(t);
          }, 1);
          return;
        }
        o.push({ fn: e, ctx: t }),
          "complete" !== document.readyState &&
          (document.attachEvent || "interactive" !== document.readyState)
            ? n ||
              (document.addEventListener
                ? (document.addEventListener("DOMContentLoaded", s, !1),
                  window.addEventListener("load", s, !1))
                : (document.attachEvent("onreadystatechange", a),
                  window.attachEvent("onload", s)),
              (n = !0))
            : setTimeout(s, 1);
      };
    })("docReady", n),
    (t = window.console),
    (o = window.Object),
    (r = window.Array),
    (void 0 === t || void 0 === t.log) && ((t = {}).log = function () {}),
    "function" != typeof o.create &&
      (o.create = function (e) {
        function t() {}
        return (t.prototype = e), new t();
      }),
    r.prototype.forEach ||
      (r.prototype.forEach = function (e, t) {
        for (var o = 0, r = this.length; o < r; ++o)
          e.call(t, this[o], o, this);
      }),
    (Object.size = function (e) {
      var t,
        o = 0;
      for (t in e) e.hasOwnProperty(t) && o++;
      return o;
    });
  var s = (function () {
      var e = {
        Android: function () {
          return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
          return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
          return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
          return navigator.userAgent.match(/Opera\sMini/i);
        },
        Windows: function () {
          return navigator.userAgent.match(/IEMobile/i);
        },
        iPad: function () {
          return (
            null !== navigator.userAgent.match(/Macintosh/i) &&
            !!navigator.maxTouchPoints &&
            !!(navigator.maxTouchPoints > 0)
          );
        },
        any: function () {
          return (
            e.Android() ||
            e.BlackBerry() ||
            e.iOS() ||
            e.Opera() ||
            e.Windows() ||
            e.iPad()
          );
        },
      };
      function t(e, t) {
        var o = e[0],
          r = e[1],
          n = Raphael.transformPath("M" + o + "," + r, t).toString(),
          s = /M(-?\d+.?\d*),(-?\d+.?\d*)/.exec(n);
        return [s[1], s[2]];
      }
      function o(e) {
        return Math.min.apply(Math, e);
      }
      function r(e) {
        return Math.max.apply(Math, e);
      }
      return {
        min: o,
        max: r,
        addEvent: function e(t, o, r) {
          t.attachEvent
            ? ((t["e" + o + r] = r),
              (t[o + r] = function () {
                t["e" + o + r](window.event);
              }),
              t.attachEvent("on" + o, t[o + r]))
            : t.addEventListener(o, r, !1);
        },
        isMobile: e,
        linePath: function e(t, o, r, n) {
          var s = { x: t, y: o },
            a = { x: r, y: n };
          return "M" + s.x + " " + s.y + " L" + a.x + " " + a.y;
        },
        clone: function e(t) {
          if ("object" != typeof t || null === t) return t;
          var o = t.constructor();
          for (var r in t) o[r] = e(t[r]);
          return o;
        },
        isFunction: function e(t) {
          return t && "[object Function]" === {}.toString.call(t);
        },
        findPos: function e(t) {
          function o(e, t) {
            if (e.currentStyle) var o = e.currentStyle[t];
            else if (window.getComputedStyle)
              var o = window.getComputedStyle(e, null)[t];
            return o;
          }
          var r,
            n = o(document.body, "position");
          "relative" == n &&
            document.body.style.setProperty("position", "static"),
            o(document.body, "position");
          for (
            var s = (r = 0), a = t, l = !1;
            (a = a.parentNode) && a != document.body;

          )
            (s -= a.scrollLeft || 0),
              (r -= a.scrollTop || 0),
              "fixed" == o(a, "position") && (l = !0);
          if (l && !window.opera) {
            var c,
              p =
                ((c = document.getElementsByTagName("html")[0]),
                c.scrollTop && document.documentElement.scrollTop
                  ? [c.scrollLeft, c.scrollTop]
                  : c.scrollTop || document.documentElement.scrollTop
                    ? [
                        c.scrollLeft + document.documentElement.scrollLeft,
                        c.scrollTop + document.documentElement.scrollTop,
                      ]
                    : document.body.scrollTop
                      ? [document.body.scrollLeft, document.body.scrollTop]
                      : [0, 0]);
            (s += p[0]), (r += p[1]);
          }
          do (s += t.offsetLeft), (r += t.offsetTop);
          while ((t = t.offsetParent));
          return document.body.style.setProperty("position", n), [s, r];
        },
        replaceAll: function e(t, o, r) {
          return t.replace(RegExp(o, "g"), r);
        },
        rotate_bbox: function e(n, s) {
          var a = [n.x, n.y],
            l = [n.x2, n.y],
            c = [n.x, n.y2],
            p = [n.x2, n.y2],
            m = t(a, s),
            u = t(l, s),
            d = t(c, s),
            f = t(p, s),
            h = [m[0], u[0], d[0], f[0]],
            y = [m[1], u[1], d[1], f[1]],
            $ = o(h),
            v = r(h),
            _ = o(y),
            g = r(y);
          return { x: $, y: _, x2: v, y2: g, width: v - $, height: g - _ };
        },
        rotate: t,
        bbox_union: function e(t) {
          for (var o = [], r = [], n = [], a = [], l = 0; l < t.length; l++) {
            var c = t[l];
            o.push(c.x), r.push(c.x2), a.push(c.y), n.push(c.y2);
          }
          var p = s.min(o),
            m = s.max(r),
            u = s.min(a),
            d = s.max(n);
          return { x: p, x2: m, y: u, y2: d, width: m - p, height: d - u };
        },
        distance: function e(t, o) {
          var r = t.x,
            n = t.y,
            s = o.x,
            a = o.y,
            l = s - r,
            c = a - n;
          return Math.sqrt(c * c + l * l);
        },
        distance_lnglat: function e(t, o) {
          var r = t.lng,
            n = t.lat,
            s = o.lng,
            a = o.lat;
          function l(e) {
            return e * (Math.PI / 180);
          }
          function c(e) {
            return Math.pow(e, 2);
          }
          n = l(n);
          var p,
            m,
            u,
            d,
            f = (a = l(a)) - n,
            h = l(s - r),
            y =
              12756.274 *
              Math.asin(
                Math.sqrt(
                  c(Math.sin(f / 2)) +
                    Math.cos(n) * Math.cos(a) * c(Math.sin(h / 2)),
                ),
              );
          return (
            console.log(y),
            (y =
              ((p = (n + a) * 0.5),
              (m = y),
              m * Math.cos((d = ((u = p) * Math.PI) / 180)))),
            console.log(y),
            y
          );
        },
        x_in_array: function e(t, o) {
          for (var r = o.length; r--; ) if (o[r] === t) return !0;
          return !1;
        },
        clear_sets: function e(t) {
          for (var o = 0; o < t.length; o++) {
            var r = t[o];
            r.forEach(function (e) {
              e.remove();
            }),
              r.splice(0, r.length);
          }
        },
        delete_element: function e(t) {
          t.parentNode && t.parentNode.removeChild(t);
        },
        to_float: function e(t) {
          var o = parseFloat(t);
          return !isNaN(o) && o;
        },
        callback_closure: function e(t, o) {
          return function () {
            return o(t);
          };
        },
        load_script: function e(t, o) {
          var r = document.createElement("script");
          (r.type = "text/javascript"),
            r.readyState
              ? (r.onreadystatechange = function () {
                  ("loaded" == r.readyState || "complete" == r.readyState) &&
                    ((r.onreadystatechange = null), o());
                })
              : (r.onload = function () {
                  o();
                }),
            (r.src = t),
            document.getElementsByTagName("head")[0].appendChild(r);
        },
        is_in_range: function e(t, o) {
          let r = t.split(":").map(Number);
          if (1 === r.length) return o <= r[0];
          let [n, s] = r;
          return o >= s && o <= n;
        },
        new_style: function e(t) {
          var o = document.getElementsByTagName("head")[0],
            r = document.createElement("style");
          return (
            (r.type = "text/css"),
            (r.media = "screen"),
            r.styleSheet
              ? (r.styleSheet.cssText = t)
              : r.appendChild(document.createTextNode(t)),
            o.appendChild(r),
            r
          );
        },
      };
    })(),
    a = !!window[e + "_mapdata"] && window[e + "_mapdata"],
    l = !!window[e + "_mapinfo"] && window[e + "_mapinfo"],
    c = e.substring(0, e.length - 3).replace("simplemaps_", ""),
    p = !0,
    m = !1,
    u = [],
    d = {
      rounded_box:
        "m2.158.263h5.684c1.05 0 1.895.845 1.895 1.895v5.684c0 1.05-.845 1.895-1.895 1.895h-5.684c-1.05 0-1.895-.845-1.895-1.895v-5.684c0-1.05.845-1.895 1.895-1.895z",
      plus: "m4.8 1.5c-.111 0-.2.089-.2.2v3h-2.9c-.111 0-.2.134-.2.3 0 .166.089.3.2.3h2.9v3c0 .111.089.2.2.2h.2c.111 0 .2-.089.2-.2v-3h3.1c.111 0 .2-.134.2-.3 0-.166-.089-.3-.2-.3h-3.1v-3c0-.111-.089-.2-.2-.2z",
      minus:
        "m1.8 4.7h6.6c.111 0 .2.134.2.3 0 .166-.089.3-.2.3h-6.6c-.111 0-.2-.134-.2-.3 0-.166.089-.3.2-.3",
      arrow:
        "m7.07 8.721c2.874-1.335 2.01-5.762-2.35-5.661v-1.778l-3.445 2.694 3.445 2.843v-1.818c3.638-.076 3.472 2.802 2.35 3.721z",
    },
    f = {
      mapdata: a,
      mapinfo: l,
      load: h,
      hooks: s.clone({
        over_state: !1,
        over_region: !1,
        over_location: !1,
        out_state: !1,
        out_region: !1,
        out_location: !1,
        click_state: !1,
        click_region: !1,
        click_location: !1,
        close_popup: !1,
        zoomable_click_state: !1,
        zoomable_click_region: !1,
        complete: !1,
        refresh_complete: !1,
        zooming_complete: !1,
        viewbox_updated: !1,
        back: !1,
        ready: !1,
        click_xy: !1,
      }),
      plugin_hooks: s.clone({
        over_state: [],
        over_region: [],
        over_location: [],
        out_state: [],
        out_region: [],
        out_location: [],
        click_state: [],
        click_region: [],
        click_location: [],
        preclick_state: [],
        preclick_region: [],
        preclick_location: [],
        close_popup: [],
        zoomable_click_state: [],
        zoomable_click_region: [],
        complete: [],
        refresh_complete: [],
        zooming_complete: [],
        viewbox_updated: [],
        back: [],
        ready: [],
        click_xy: [],
      }),
      copy: function () {
        var e = {
          mapdata: s.clone(this.mapdata),
          mapinfo: s.clone(this.mapinfo),
          hooks: s.clone(this.hooks),
          plugin_hooks: s.clone(this.plugin_hooks),
          copy: this.copy,
          load: h,
        };
        return u.push(e), e;
      },
      create: function () {
        var t = {
          mapdata: !!window[e + "_mapdata"] && s.clone(window[e + "_mapdata"]),
          mapinfo: !!window[e + "_mapinfo"] && s.clone(window[e + "_mapinfo"]),
          hooks: s.clone(this.hooks),
          plugin_hooks: s.clone(this.plugin_hooks),
          copy: this.copy,
          load: h,
        };
        return u.push(t), t;
      },
      mobile_device: !!s.isMobile.any(),
      loaded: !1,
    };
  function h() {
    var e,
      t,
      o,
      r,
      a,
      l,
      u,
      f,
      h,
      y,
      $,
      v,
      _,
      g,
      b,
      x,
      w,
      k,
      z,
      P,
      E,
      A,
      C,
      S,
      j,
      B,
      T,
      I,
      F,
      O,
      L,
      M,
      N,
      D,
      R,
      q,
      H,
      V,
      W,
      X,
      Y,
      Q,
      Z,
      U,
      G,
      J,
      K,
      ee,
      et,
      eo,
      ei,
      er,
      en,
      es,
      ea,
      el,
      ec,
      ep,
      em,
      eu,
      e8,
      ed,
      ef,
      eh,
      ey,
      e$,
      ev,
      e_,
      eg,
      e0,
      eb,
      ex,
      e3,
      ew,
      ek,
      e1,
      ez,
      e5,
      eP,
      e6,
      e4,
      e2,
      e7,
      eE,
      eA,
      eC,
      eS,
      ej,
      eB,
      eT,
      eI,
      eF,
      eO,
      eL,
      eM,
      eN,
      eD,
      eR,
      eq,
      eH,
      eV,
      eW,
      eX,
      eY,
      eQ,
      eZ,
      eU,
      eG,
      eJ,
      eK,
      e9,
      te,
      tt,
      to,
      ti,
      tr,
      tn,
      ts,
      ta,
      tl,
      tc,
      tp,
      tm,
      tu,
      t8,
      td,
      tf,
      th,
      ty,
      t$,
      tv,
      t_,
      tg,
      t0,
      tb,
      tx,
      t3,
      tw,
      tk,
      t1,
      tz,
      t5,
      tP,
      t6 = this,
      t4 = t6.mapdata,
      t2 = t6.mapinfo;
    if (!t4 || !t2) {
      console.log("The mapdata or mapinfo object is missing or corrupted.");
      return;
    }
    var t7 = t6.hooks,
      tE = t6.plugin_hooks,
      tA =
        !!t4.main_settings.backgroundmap_js_url &&
        "no" != t4.main_settings.backgroundmap_js_url &&
        t4.main_settings.backgroundmap_js_url;
    function tC(e, t) {
      var o = t7[e];
      o && o.apply(null, t);
      for (var r = t6.plugin_hooks[e], n = 0; n < r.length; n++) {
        var o = r[n];
        o && o.apply(null, t);
      }
    }
    var g = void 0 === t4.main_settings.div ? "map" : t4.main_settings.div;
    if (!document.getElementById(g))
      return (
        console.log(
          "Can't find target for map #" +
            g +
            ".  Check mapdata.main_settings.div",
        ),
        !1
      );
    function tS() {
      (A =
        !!a.backgroundmap_tiles_url &&
        "no" != a.backgroundmap_tiles_url &&
        a.backgroundmap_tiles_url),
        (C =
          !!a.background_image_url &&
          "no" != a.background_image_url &&
          a.background_image_url),
        (S = !!a.background_image_bbox && a.background_image_bbox),
        (X = "yes" == a.background_transparent || A ? 0 : 1),
        (Q = a.label_size ? a.label_size : 22),
        (Z = a.label_color ? a.label_color : "#ffffff"),
        (U = "yes" == a.url_new_tab),
        (G = a.location_opacity ? a.location_opacity : 1),
        (J = "yes" == a.js_hooks),
        (K = a.border_size ? a.border_size : 1.5),
        (ee = a.popup_color ? a.popup_color : "#ffffff"),
        (O = a.popup_orientation ? a.popup_orientation : "auto"),
        (F = a.popup_centered ? a.popup_centered : "auto"),
        (eo = a.popup_opacity ? a.popup_opacity : 0.9),
        (ei = a.popup_shadow > -1 ? a.popup_shadow : 1),
        (er = a.popup_corners ? a.popup_corners : 5),
        (en = "yes" == a.popup_nocss),
        (et = !!a.popup_maxwidth && a.popup_maxwidth),
        (es = a.popup_font
          ? a.popup_font
          : "12px/1.5 Verdana, Arial, Helvetica, sans-serif"),
        (Y = "no" != a.zoom_out_incrementally),
        (W = a.adjacent_opacity ? a.adjacent_opacity : 0.3),
        (j = a.zoom_time ? a.zoom_time : 0.5),
        (T = a.zoom_increment ? a.zoom_increment : 2),
        (B = "no" != a.zoom_mobile),
        (q = a.fade_time ? 1e3 * a.fade_time : 200),
        (V = t4.labels),
        (I = a.custom_shapes ? a.custom_shapes : {}),
        (N = !!a.initial_back && "no" != a.initial_back && a.initial_back),
        (H = "yes" == a.hide_eastern_labels),
        (D = a.link_text ? a.link_text : "View Website"),
        (L = !!a.order_number && a.order_number),
        (M = a.zoom_percentage ? a.zoom_percentage : 0.99);
    }
    function tj(e) {
      return "on_click" == e || ("detect" == e && !!em);
    }
    function tB(e) {
      return "off" == e;
    }
    var tT = !1;
    function tI(e) {
      if (
        (t2.calibrate
          ? (((e1 = {}).x = -1 * t2.calibrate.x_adjust),
            (e1.y = -1 * t2.calibrate.y_adjust),
            (e1.x2 = e1.x + t2.calibrate.width),
            (e1.y2 = (e1.x2 - e1.x) / t2.calibrate.ratio))
          : (e1 = t2.initial_view),
        (e5 = (ew = e1.x2 - e1.x) / (ek = e1.y2 - e1.y)),
        eh.style.setProperty("width", ""),
        ey.style.setProperty("width", ""),
        _
          ? ((eb = eh.offsetWidth) < 1 && (eb = eh.parentNode.offsetWidth),
            ey.style.setProperty("width", eb + "px"))
          : ((eb =
              void 0 !== a.width && a.width && "auto" != a.width
                ? a.width
                : a.height && "auto" != a.height
                  ? a.height * e5
                  : 800),
            eh.style.setProperty("width", eb + "px")),
        (eb *= 1),
        (ex = eb / e5),
        (l = ew / 1e3),
        ef.style.setProperty("height", ex + "px"),
        a.height &&
          _ &&
          "auto" != a.height &&
          ((eb = (ex = a.height) * e5),
          map.style.setProperty("text-align", "center"),
          ey.style.setProperty("text-align", "left"),
          ey.style.setProperty("width", eb + "px"),
          ey.style.setProperty("display", "inline-block"),
          ef.style.setProperty("height", ex + "px")),
        eg.style.setProperty("width", eb + "px"),
        eg.style.setProperty("height", ex + "px"),
        !e)
      ) {
        if (((e3 = eb / ew), (ez = 1), $)) {
          var t = [];
          for (var o in t2.state_bbox_array) {
            var r = t2.state_bbox_array[o];
            t.push(r);
          }
          var n,
            c = s.bbox_union(t);
          e0 =
            "r" +
            $ +
            "," +
            0.5 * (c.x2 + c.x) * e3 +
            "," +
            0.5 * (c.y2 + c.y) * e3;
          var p = s.rotate_bbox(e1, e0);
          (ew = p.width), (ek = p.height);
        }
        (eS = "s" + e3 + "," + e3 + ",0,0"), (eC = $ ? eS + e0 : eS);
      }
    }
    function tF(e) {
      if (
        t4.legend &&
        t4.legend.entries &&
        !(t4.legend.entries.length < 1) &&
        (!el || !ea)
      ) {
        e && e_ && (e_.innerHTML = "");
        var t = {};
        e_.style.setProperty("left", "0em"),
          e_.style.setProperty("bottom", "0em"),
          e_.style.setProperty("padding", ".8em"),
          e_.style.setProperty("lineHeight", "1em"),
          e_.style.setProperty(
            "background-color",
            el ? "#ffffff" : "rgba(186, 186, 186, 0.2)",
          );
        var o = document.createElement("ul");
        o.style.setProperty("display", "inline-block"),
          o.style.setProperty("list-style-type", "none"),
          o.style.setProperty("margin", "0"),
          o.style.setProperty("padding", "0"),
          e_.appendChild(o);
        var r =
          "#" +
          g +
          "_holder .sm_legend_item{float: left; cursor: pointer; margin-right: .75em; margin-bottom: .4em; margin-top: .4em;} #" +
          g +
          "_holder{font: " +
          es +
          ";}";
        s.new_style(r);
        for (var n = t4.legend.entries, a = 0; a < n.length; a++) m(a, n[a]);
        var l = t4.legend.html;
        l && "no" != l
          ? (e_.innerHTML = l)
          : (function e() {
              for (var t = 0; t < n.length; t++) {
                var r = n[t];
                (r.shape = r.shape ? r.shape : "circle"),
                  (r.color = r.color ? r.color : "#cecece"),
                  (r.type = r.type ? r.type : "location");
                var s = document.createElement("li");
                s.setAttribute("class", "sm_legend_item"),
                  s.setAttribute("data-id", t);
                var a = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "svg",
                );
                if (
                  (a.setAttributeNS(
                    "http://www.w3.org/2000/xmlns/",
                    "xmlns:xlink",
                    "http://www.w3.org/1999/xlink",
                  ),
                  a.style.setProperty("display", "inline-block"),
                  a.style.setProperty("margin-right", ".2em"),
                  a.style.setProperty("width", "1em"),
                  a.style.setProperty("height", "1em"),
                  a.style.setProperty("stroke", "#ffffff"),
                  a.style.setProperty("stroke-width", "3"),
                  a.style.setProperty("fill", "#ff0067"),
                  a.style.setProperty("vertical-align", "-0.15em"),
                  "circle" == r.shape)
                ) {
                  var l = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle",
                  );
                  l.setAttribute("cx", "50"),
                    l.setAttribute("cy", "50"),
                    l.setAttribute("r", "40");
                } else if ("square" == r.shape) {
                  var l = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "rect",
                  );
                  l.setAttribute("x", "10"),
                    l.setAttribute("y", "10"),
                    l.setAttribute("width", "80"),
                    l.setAttribute("height", "80");
                } else {
                  var c = o3[r.shape],
                    l = document.createElementNS(
                      "http://www.w3.org/2000/svg",
                      "path",
                    );
                  l.setAttribute("d", c),
                    a.setAttribute("width", "1.5"),
                    a.setAttribute("height", "1.5"),
                    l.setAttribute("stroke-width", ".1");
                }
                ["square", "circle"].indexOf(r.shape) > -1
                  ? (l.setAttribute("stroke-width", "10"),
                    a.setAttribute("viewBox", "0 0 100 100"),
                    a.setAttribute("width", "100"),
                    a.setAttribute("height", "100"))
                  : ["diamond", "star"].indexOf(r.shape) > -1
                    ? (a.setAttribute("viewBox", "-.5 -.6 1 1.2"),
                      a.setAttribute("height", "1.8"))
                    : ["triangle"].indexOf(r.shape) > -1
                      ? (a.setAttribute("viewBox", "-.6 -.7 1.2 1.1"),
                        a.setAttribute("width", "1.8"),
                        a.setAttribute("height", "1.8"))
                      : ["heart"].indexOf(r.shape) > -1
                        ? (a.setAttribute("viewBox", "-.7 -.5 1.3 1"),
                          a.setAttribute("width", "2"))
                        : ["marker"].indexOf(r.shape) > -1 &&
                          (a.setAttribute("viewBox", "-.6 -.9 1.1 .8"),
                          a.setAttribute("width", "1.7"),
                          a.setAttribute("height", "1.7")),
                  l.setAttribute("fill", r.color),
                  l.setAttribute("stroke", "white"),
                  a.appendChild(l),
                  s.appendChild(a);
                var p = document.createTextNode(r.name);
                s.appendChild(p), o.appendChild(s);
              }
            })();
        for (
          var c = ey.getElementsByClassName("sm_legend_item"), a = 0;
          a < c.length;
          a++
        )
          s.addEvent(c[a], "mouseover", p), s.addEvent(c[a], "mousedown", p);
      }
      function p() {
        for (var e = t[this.dataset.id], o = 0; o < e.length; o++) {
          var r = e[o].sm;
          ("state" == r.type ? tg : oU)(r.id);
        }
      }
      function m(e, o) {
        t[e] = [];
        var r = "state" == o.type ? tp : t$;
        for (var n in r) {
          var s = r[n];
          o.ids
            ? o.ids.split(",").indexOf(s.sm.id) > -1 && t[e].push(s)
            : s.sm.attributes.fill != o.color || s.sm.hide || t[e].push(s);
        }
      }
    }
    function tO(e, t, o) {
      if ((void 0 === o && (o = "location" == e ? 4 : 1), "location" == e))
        var r = t$[t];
      else if ("state" == e) var r = tp[t];
      else if ("region" != e) return !1;
      else var r = tm[t];
      var n = function () {
        var e = r.sm.on_click;
        (r.sm.on_click = !0),
          (r.sm.content = o8(r)),
          oZ(r.sm.type, r.sm.id, function t() {
            (r.sm.on_click = e), (r.sm.content = o8(r));
          });
      };
      if ("state" == e) {
        function s() {
          r.sm.zoomable || r.sm.region ? oX(r.sm.id, n) : n();
        }
        o4(k, s);
      } else if ("location" == e) {
        function s() {
          oY(r.sm.id, o, n);
        }
        o4(k, s);
      } else if ("region" == e) {
        function s() {
          var e,
            t,
            o = 1;
          (e = r.sm.bbox),
            (t = n),
            void 0 === o && (o = 4),
            void 0 === t && (t = function () {}),
            om({ sm: { type: "manual", zp: o, bbox: e } }, !1, function () {
              t(), tR();
            });
        }
        o4(k, s);
      }
    }
    var tL = !1,
      tM = !1;
    function tN() {
      if (p) {
        if (location.hostname.match("simplemaps.com")) {
          p = !1;
          return;
        }
        if (tL) {
          if (Math.random() > 0.05) return;
          s.delete_element(tL);
        }
        tL = document.createElement("div");
        var e = m ? "20px" : "5px";
        (tL.style.cssText =
          "overflow: visible !important; clip-path: none !important; display:inline !important; opacity:1 !important; transform: none !important; visibility: visible !important; z-index: 1 !important; right: 5px !important; bottom:" +
          e +
          " !important; z-index: 1 !important; position: absolute !important; filter: opacity(1) !important;"),
          ef.appendChild(tL),
          (tL.innerHTML =
            '<a style="overflow: visible !important; clip-path: none !important; opacity: 1 !important;  filter: opacity(1) !important; transform: none !important; display: block !important; visibility: visible !important; font: 18px Verdana, Arial, Helvetica, sans-serif !important; cursor: pointer !important; font-weight: bold !important; float: right !important; color: #ffffff !important; text-decoration: none !important;" href="https://simplemaps.com" title="For evaluation use only.">Simplemaps.com Trial</a>'),
          !el && 503 != tL.innerHTML.length && (ef.innerHTML = "");
      }
    }
    function tD() {
      eq.hide(), ed.style.setProperty("display", "none");
    }
    function tR() {
      eq.show(), ed.style.setProperty("display", "block");
    }
    function tq() {
      (te = t4.locations),
        (eZ = {}),
        (eU = {}),
        (eK = {}),
        (e9 = []),
        (eG = {}),
        (ti = {}),
        !(function () {
          var e = {};
          if (
            ((e.color = !1),
            (e.hover_color = !1),
            (e.opacity = a.region_opacity ? a.region_opacity : 1),
            (e.hover_opacity = a.region_hover_opacity
              ? a.region_hover_opacity
              : 0.6),
            (e.url = !1),
            (e.description = !1),
            (e.description_mobile = !1),
            (e.inactive = !1),
            (e.zoomable = !0),
            (e.hide_name = "yes" == a.region_hide_name),
            (e.popup = a.region_popups ? a.region_popups : eu),
            (e.cascade = "yes" == a.region_cascade_all),
            (e.zoom_percentage = M),
            (e.x = !1),
            (e.y = !1),
            (e.x2 = !1),
            (e.y2 = !1),
            P)
          )
            for (var t in P)
              for (var o = 0; o < P[t].states.length; o++)
                eK[P[t].states[o]] = t;
          for (var r in P)
            for (var n in ((eG[r] = Object.create(e)),
            P[r].url && (eG[r].zoomable = !1),
            P[r]))
              "default" != P[r][n] && (eG[r][n] = P[r][n]),
                "yes" == P[r][n] && (eG[r][n] = !0),
                "no" == P[r][n] && (eG[r][n] = !1);
        })(),
        (function () {
          for (var e in ((tt = function (e) {
            var t = {};
            (t.color = a.state_color),
              (t.display = a.state_display ? a.state_display : 1),
              (t.geojson_url = !!a.state_geojson_url && a.state_geojson_url),
              (t.geojson_field = a.state_geojson_field
                ? a.state_geojson_field
                : "id"),
              (t.geojson_value =
                !!a.state_geojson_value && a.state_geojson_value),
              (t.type = a.state_type ? a.state_type : "default"),
              (t.image_url = !!a.state_image_url && a.state_image_url),
              (t.image_size = a.state_image_size ? a.state_image_size : "auto"),
              (t.image_position = a.state_image_position
                ? a.state_image_position
                : "center"),
              (t.image_x = a.state_image_x ? a.state_image_x : "0"),
              (t.image_y = a.state_image_y ? a.state_image_y : "0"),
              (t.image_color = !!a.state_image_color && a.state_image_color),
              (t.image_background_opacity = a.image_background_opacity
                ? a.image_background_opacity
                : "1"),
              (t.image_hover_url =
                !!a.state_image_hover_url && a.state_image_hover_url),
              (t.image_hover_size = a.state_image_hover_size
                ? a.state_image_hover_size
                : "auto"),
              (t.image_hover_position = a.state_image_hover_position
                ? a.state_image_hover_position
                : "center"),
              (t.image_hover_x = a.state_image_hover_x
                ? a.state_image_hover_x
                : "0"),
              (t.image_hover_y = a.state_image_hover_y
                ? a.state_image_hover_y
                : "0"),
              (t.image_hover_color =
                !!a.state_image_hover_color && a.state_image_hover_color),
              (t.pulse_size = a.state_pulse_size ? a.state_pulse_size : 1.1),
              (t.pulse_speed = a.state_pulse_speed ? a.state_pulse_speed : 1);
            var o = a.state_pulse_color;
            (t.pulse_color = !!o && "auto" != o && o),
              (t.hover_color = a.state_hover_color),
              (t.image_source = !1),
              (t.description = a.state_description),
              (t.url = a.state_url),
              (t.inactive = "yes" == a.all_states_inactive),
              (t.hide = "yes" == a.all_states_hidden),
              (t.hide_label = !1),
              (t.hide_name = "yes" == a.state_hide_name),
              (t.border_color = a.border_color ? a.border_color : "#ffffff"),
              (t.border_hover_color =
                !!a.border_hover_color && a.border_hover_color),
              (t.border_hover_size =
                !!a.border_hover_size && a.border_hover_size),
              (t.emphasize = "yes"),
              (t.zoom_percentage = M),
              (t.zoomable = "yes" == a.all_states_zoomable),
              (t.popup = a.state_popups ? a.state_popups : eu),
              (t.opacity = a.state_opacity ? a.state_opacity : 1),
              (t.hover_opacity = a.state_hover_opacity
                ? a.state_hover_opacity
                : 1),
              (t.description_mobile =
                !!a.state_description_mobile && state_description_mobile),
              (t.path = !1),
              (t.level = 0),
              (t.link_text = D);
            var n = !!eK[e] && eK[e];
            for (var s in (n && eG[n].hide && (t.hide = !0),
            n &&
              eG[n].cascade &&
              (eG[n].color && (t.color = eG[n].color),
              eG[n].hover_color && (t.hover_color = eG[n].hover_color),
              eG[n].description && (t.description = eG[n].description),
              eG[n].url && (t.url = eG[n].url),
              eG[n].inactive && (t.inactive = eG[n].inactive),
              eG[n].hide && (t.hide = eG[n].hide)),
            (eZ[e] = Object.create(t)),
            "us" == c &&
              ("GU" == e || "PR" == e || "VI" == e || "MP" == e || "AS" == e) &&
              (eZ[e].hide = "yes"),
            "us" == c &&
              H &&
              ("VT" == e ||
                "NJ" == e ||
                "DE" == e ||
                "DC" == e ||
                "NH" == e ||
                "MA" == e ||
                "CT" == e ||
                "RI" == e ||
                "MD" == e) &&
              (eZ[e].hide_label = "yes"),
            r[e]))
              "default" != r[e][s] && (eZ[e][s] = r[e][s]),
                "yes" == r[e][s] && (eZ[e][s] = !0),
                "no" == r[e][s] && (eZ[e][s] = !1);
            "off" == a.state_hover_color && (eZ[e].hover_color = eZ[e].color);
          }),
          (eJ = {}),
          t2.paths))
            eJ[e] = !0;
          for (var e in t4.state_specific)
            t4.state_specific[e] &&
              (t4.state_specific[e].path ||
                t4.state_specific[e].feature ||
                t4.main_settings.state_geojson_url ||
                t4.state_specific[e].geojson_url) &&
              (eJ[e] = !0);
          for (var e in eJ) tt(e);
        })(),
        (function () {
          var e = {};
          (e.font_family = a.label_font ? a.label_font : "arial,sans-serif"),
            (e.color = a.label_color ? a.label_color : "white"),
            (e.hover_color = a.label_hover_color
              ? a.label_hover_color
              : e.color),
            (e.opacity =
              a.label_opacity || "0" == a.label_opacity ? a.label_opacity : 1),
            (e.hover_opacity = a.label_hover_opacity
              ? a.label_hover_opacity
              : e.opacity),
            (e.size = Q),
            (e.hide = "yes" == a.hide_labels),
            (e.line = !1),
            (e.scale = !!a.label_scale && a.label_scale),
            (e.scale_limit = a.scale_limit ? a.scale_limit : 0.0625),
            (e.rotate = a.label_rotate ? a.label_rotate : 0),
            (e.line_color = a.label_line_color
              ? a.label_line_color
              : "#000000"),
            (e.line_size = a.label_line_size ? a.label_line_size : "1"),
            (e.line_x = !1),
            (e.line_y = !1),
            (e.parent_type = "state"),
            (e.parent_id = !1),
            (e.anchor = a.label_anchor ? a.label_anchor : "middle"),
            (e.pill = !1),
            (e.width = !!a.pill_width && a.pill_width),
            (e.x = !1),
            (e.y = !1),
            (e.name = "Not Named"),
            (e.pill_radius = a.pill_radius ? a.pill_radius : "auto"),
            (e.display = !!a.label_display && a.label_display),
            (e.display_ids = !1),
            (e.id = !1),
            (e.level = 3);
          var t = "no" == a.import_labels ? {} : t2.default_labels,
            o = function (o) {
              for (var r in ((e9[o] = Object.create(e)), t[o]))
                "default" != t[o][r] && (e9[o][r] = t[o][r]),
                  "yes" == t[o][r] && (e9[o][r] = !0),
                  "no" == t[o][r] && (e9[o][r] = !1);
            },
            r = function (t) {
              for (var o in (e9[t] || (e9[t] = Object.create(e)), V[t]))
                "default" != V[t][o] && (e9[t][o] = V[t][o]),
                  "yes" == V[t][o] && (e9[t][o] = !0),
                  "no" == V[t][o] && (e9[t][o] = !1);
            };
          for (var n in t) o(n);
          for (var n in V) r(n);
          to = function (e) {
            o(e), r(e);
          };
        })(),
        (function () {
          var e = {},
            t = em
              ? a.scale_limit_mobile
                ? a.scale_limit_mobile
                : 0.4
              : 0.0625;
          (e.scale_limit = a.scale_limit ? a.scale_limit : t),
            (e.geojson_url =
              !!a.location_geojson_url && a.location_geojson_url),
            (e.geojson_field = a.location_geojson_field
              ? a.location_geojson_field
              : "id"),
            (e.geojson_value =
              !!a.location_geojson_value && a.location_geojson_value),
            (e.color = a.location_color ? a.location_color : "#FF0067"),
            (e.hover_color =
              !!a.location_hover_color && a.location_hover_color),
            (e.border = a.location_border ? a.location_border : 1.5),
            (e.border_color = a.location_border_color
              ? a.location_border_color
              : "#FFFFFF"),
            (e.hover_border = a.location_hover_border
              ? a.location_hover_border
              : 2),
            (e.size = a.location_size),
            (e.description = a.location_description),
            (e.description_mobile =
              !!a.location_description_mobile && location_description_mobile),
            (e.url = a.location_url),
            (e.inactive = "yes" == a.all_locations_inactive),
            (e.type = a.location_type),
            (e.position = "top"),
            (e.level = 5),
            (e.pulse = "yes" == a.location_pulse),
            (e.pulse_size = a.location_pulse_size ? a.location_pulse_size : 4),
            (e.pulse_speed = a.location_pulse_speed
              ? a.location_pulse_speed
              : 0.5);
          var o = a.location_pulse_color;
          for (var r in ((e.pulse_color = !!o && "auto" != o && o),
          (e.image_source = a.location_image_source
            ? a.location_image_source
            : ""),
          (e.hide = a.all_locations_hide ? a.all_locations_hide : "no"),
          (e.opacity = G),
          (e.scale = !a.location_scale || a.location_scale),
          (e.hover_opacity =
            !!a.location_hover_opacity && a.location_hover_opacity),
          (e.image_source = a.location_image_source
            ? a.location_image_source
            : ""),
          (e.image_url = !!a.location_image_url && a.location_image_url),
          (e.image_position = a.location_image_position
            ? a.location_image_position
            : "center"),
          (e.image_hover_source = a.location_image_hover_source
            ? a.location_image_hover_source
            : ""),
          (e.image_hover_url =
            !!a.location_image_hover_url && a.location_image_hover_url),
          (e.image_hover_position = a.location_image_hover_position
            ? a.location_image_hover_position
            : "center"),
          (e.popup = a.location_popups ? a.location_popups : eu),
          (e.x = !1),
          (e.y = !1),
          (e.link_text = D),
          (e.display = a.location_display ? a.location_display : "all"),
          (e.display_ids = !1),
          (e.hide = "yes" == a.all_locations_hidden),
          (e.hide_name = "yes" == a.location_hide_name),
          void 0 == e.type && (e.type = "square"),
          te)) {
            for (var n in ((eU[r] = Object.create(e)), te[r])) {
              if ("overwrite_image_location" == n) {
                eU[r].image_url = te[r][n];
                continue;
              }
              "region" == n && (eU[r].display = "region"),
                "default" != te[r][n] && (eU[r][n] = te[r][n]),
                "yes" == te[r][n] && (eU[r][n] = !0),
                "no" == te[r][n] && (eU[r][n] = !1);
            }
            eU[r].hover_opacity || (eU[r].hover_opacity = eU[r].opacity),
              eU[r].hover_color || (eU[r].hover_color = eU[r].color);
          }
        })(),
        (function () {
          var e = {};
          (e.color = a.line_color ? a.line_color : "#000000"),
            (e.size = a.line_size ? a.line_size : 1.5),
            (e.dash = a.line_dash ? a.line_dash : ""),
            (e.origin_location = !1),
            (e.destination_location = !1),
            (e.angle = !1),
            (e.level = 2);
          var t = t4.lines ? t4.lines : t4.borders;
          for (var o in t)
            for (var r in ((ti[o] = Object.create(e)), t[o]))
              "default" != t[o][r] && (ti[o][r] = t[o][r]),
                "yes" == t[o][r] && (ti[o][r] = !0),
                "no" == t[o][r] && (ti[o][r] = !1);
        })();
    }
    var tH = !1,
      tV = !1,
      tW = !1;
    function tX(e, t, o, r, n) {
      function s(e) {
        var t = [];
        if (!e) return null;
        var o = e.geometry.type,
          r = e.geometry.coordinates;
        if ("Polygon" === o) for (var n = 0; n < r.length; n++) t.push(c(r[n]));
        else if ("MultiPolygon" === o)
          for (var s = 0; s < r.length; s++)
            for (var a = 0; a < r[s].length; a++) t.push(c(r[s][a]));
        else if ("LineString" === o) t.push(c(r));
        else if ("MultiLineString" === o)
          for (var l = 0; l < r.length; l++) t.push(c(r[l]));
        function c(e) {
          for (var t = [], o = 0; o < e.length; o++) {
            var r = tZ(e[o][1], e[o][0]),
              n = [parseFloat(r.x.toFixed(4)), parseFloat(r.y.toFixed(4))];
            t.push(n);
          }
          return (
            "M " +
            t
              .map(function (e) {
                return e.join(",");
              })
              .join(" L ") +
            " Z"
          );
        }
        return t.join(" ");
      }
      function a(e, t, o) {
        if (!e || !e.features || !Array.isArray(e.features)) return !1;
        for (let r of e.features)
          if (r.properties && r.properties[t] === o) return r;
        return !1;
      }
      var l = (function e(t, o) {
        var r = {},
          n = 0;
        for (var s in t) "geojson" === o[s].type && ((r[s] = n), n++);
        return r;
      })(t, o);
      if (e.feature) var c = s(e.feature);
      else {
        var p = (function e(t) {
          if (!t) return !1;
          var o = new XMLHttpRequest();
          o.open("GET", t, !1);
          try {
            if ((o.send(), 200 !== o.status))
              return (
                console.error("Error loading GeoJSON:", o.statusText), null
              );
            return JSON.parse(o.responseText);
          } catch (r) {
            return console.error("Request failed:", r), null;
          }
        })(e.geojson_url);
        if (e.geojson_value) u = a(p, e.geojson_field, e.geojson_value);
        else if ("geojson" == e.type && e.geojson_field && "state" == n)
          u = a(p, e.geojson_field, r);
        else
          var m = l[r],
            u = p.features[m];
        var c = s(u);
      }
      return c;
    }
    function tY(e, t, o, r, n) {
      var s = e.x,
        a = e.y,
        l = e.lat,
        c = e.lng,
        p = t.x,
        m = t.y,
        u = t.lat,
        d = t.lng,
        f = o.x,
        h = o.y,
        y = o.lat,
        $ = o.lng,
        v = (m - h) * (s - f) + (f - p) * (a - h),
        _ = ((m - h) * (r - f) + (f - p) * (n - h)) / v,
        g = ((h - a) * (r - f) + (s - f) * (n - h)) / v,
        b = 1 - _ - g;
      return { lat: _ * l + g * u + b * y, lng: _ * c + g * d + b * $ };
    }
    function tQ(e, t) {
      var o = t2.proj_coordinates;
      function r(e, t) {
        for (var o in t) {
          var r = t[o];
          if (r.x == e.x || r.y == e.y) return !1;
        }
        return !0;
      }
      o.sort(function (o, r) {
        var n;
        return (
          Math.sqrt(Math.pow(o.x - e, 2) + Math.pow(o.y - t, 2)) -
          Math.sqrt(Math.pow(r.x - e, 2) + Math.pow(r.y - t, 2))
        );
      });
      var n = [o[0]];
      for (i in o)
        if (!(i < 1)) {
          var s = o[i];
          if ((r(s, n) && n.push(s), n.length > 2)) break;
        }
      return (function e(t, o, r, n, s) {
        var a, l;
        function c(e, t) {
          return {
            x: 6378137 * t * (Math.PI / 180),
            y: 6378137 * Math.log(Math.tan(Math.PI / 4 + e * (Math.PI / 360))),
          };
        }
        let p = c(t.lat, t.lng),
          m = c(o.lat, o.lng),
          u = c(r.lat, r.lng),
          d = t.x - r.x,
          f = t.y - r.y,
          h = o.x - r.x,
          y = o.y - r.y,
          $ = p.x - u.x,
          v = p.y - u.y,
          _ = m.x - u.x,
          g = m.y - u.y,
          b = d * y - h * f,
          x =
            (($ * y - _ * f) / b) * (n - r.x) +
            ((_ * d - $ * h) / b) * (s - r.y) +
            u.x,
          w =
            ((v * y - g * f) / b) * (n - r.x) +
            ((g * d - v * h) / b) * (s - r.y) +
            u.y,
          k =
            ((a = x),
            {
              lat: Math.atan(Math.sinh((l = w) / 6378137)) * (180 / Math.PI),
              lng: (a / 6378137) * (180 / Math.PI),
            });
        return k;
      })(n[0], n[1], n[2], e, t);
    }
    function tZ(e, t) {
      if ("lambert" == t2.proj)
        var o = function e(t) {
          var o = Math.PI,
            r = 0.017453293 * t.lat,
            n = 0.017453293 * t.lng,
            s =
              Math.log(0.8386705593173225 * (1 / 0.7071067659112366)) /
              Math.log(
                Math.tan(0.25 * o + 0.3926990925) *
                  (1 / Math.tan(0.25 * o + 0.2879793345)),
              ),
            a =
              (0.8386705593173225 *
                Math.pow(Math.tan(0.25 * o + 0.2879793345), s)) /
              s,
            l = a * Math.pow(1 / Math.tan(0.25 * o + 0.5 * r), s);
          return {
            x: l * Math.sin(s * (n - 1.57079637)),
            y:
              a * Math.pow(1 / Math.tan(0.25 * o + 0.3926990925), s) -
              l * Math.cos(s * (n - 1.57079637)),
          };
        };
      else if ("xy" == t2.proj)
        var o = function e(t) {
          return { x: t.lng, y: t.lat };
        };
      else if ("robinson_pacific" == t2.proj)
        var o = function e(t) {
          var o = t.lng - 150;
          return o < -180 && (o += 360), n({ lat: t.lat, lng: o });
        };
      else if ("mercator" == t2.proj)
        var o = function e(t, o = 6378137) {
          var r,
            n = t.lat * (Math.PI / 180);
          return {
            x: o * t.lng * (Math.PI / 180),
            y: o * Math.log(Math.tan(Math.PI / 4 + n / 2)),
          };
        };
      else var o = n;
      var r = { lat: e, lng: t };
      function n(e) {
        var t,
          o,
          r = 5,
          n = function (e) {
            return e < 0 ? -1 : 1;
          },
          s = n(e.lng),
          a = n(e.lat),
          l = Math.abs(e.lng),
          c = Math.abs(e.lat),
          p = ((t = c - 1e-10), Math.floor(t / r) * r),
          m = (p = 0 == c ? 0 : p) + 5,
          u = p / 5,
          d = m / 5,
          f = (c - p) / 5,
          h = [
            0.8487, 0.84751182, 0.84479598, 0.840213, 0.83359314, 0.8257851,
            0.814752, 0.80006949, 0.78216192, 0.76060494, 0.73658673, 0.7086645,
            0.67777182, 0.64475739, 0.60987582, 0.57134484, 0.52729731,
            0.48562614, 0.45167814,
          ],
          y = [
            0, 0.0838426, 0.1676852, 0.2515278, 0.3353704, 0.419213, 0.5030556,
            0.5868982, 0.67182264, 0.75336633, 0.83518048, 0.91537187,
            0.99339958, 1.06872269, 1.14066505, 1.20841528, 1.27035062,
            1.31998003, 1.3523,
          ];
        return {
          x: ((h[d] - h[u]) * f + h[u]) * l * 0.017453293 * s * 1,
          y: ((y[d] - y[u]) * f + y[u]) * a * 1,
        };
      }
      var a = t2.proj_coordinates;
      function l(e, t, r, n) {
        var a,
          l,
          c,
          p,
          m,
          u,
          d,
          f,
          h,
          y,
          $,
          v,
          _,
          g,
          b,
          x,
          w,
          k = o(e),
          z = o(t),
          P = o(r),
          E = o(n),
          A = s.distance(k, z),
          C = s.distance(k, P),
          S = s.distance(z, P),
          j = s.distance(t, r),
          B = S / j,
          T =
            ((a = t.x),
            (l = t.y),
            (c = A / B),
            (p = r.x),
            (m = r.y),
            (u = C / B),
            (f = p - a),
            (y = Math.sqrt((h = m - l) * h + f * f)),
            (g = a + (f * (d = (c * c - u * u + y * y) / (2 * y))) / y),
            (b = l + (h * d) / y),
            (v = -h * (($ = Math.sqrt(c * c - d * d)) / y)),
            (_ = f * ($ / y)),
            (x = g + v),
            { opt1: { x: x, y: (w = b + _) }, opt2: { x: g - v, y: b - _ } }),
          I = s.distance(k, E) / B,
          F = Math.abs(s.distance(T.opt1, n) - I),
          O = Math.abs(s.distance(T.opt2, n) - I);
        return F < O
          ? { x: T.opt1.x, y: T.opt1.y }
          : { x: T.opt2.x, y: T.opt2.y };
      }
      function c(e, t, o) {
        var r = /lat[ ]?<([-]?\d+[\.]?\d+)/g.exec(d);
        if (r && e > s.to_float(r[1])) return !1;
        var n = /lat[ ]?>([-]?\d+[\.]?\d+)/g.exec(d);
        if (n && e < s.to_float(n[1])) return !1;
        var a = /lng[ ]?<([-]?\d+[\.]?\d+)/g.exec(d);
        if (a && t > s.to_float(a[1])) return !1;
        var l = /lng[ ]?>([-]?\d+[\.]?\d+)/g.exec(d);
        return !(l && t < s.to_float(l[1]));
      }
      var p = t2.proj_rules;
      if (p)
        for (var m = 0; m < p.length; m++) {
          var u = p[m],
            d = u.condition;
          if (c(e, t, u.condition)) {
            var f = u.points;
            return l(r, a[f[0]], a[f[1]], a[f[2]]);
          }
        }
      return l(r, a[0], a[1], a[2]);
    }
    var tU = !1;
    function tG(e) {
      if (e.sm.zooming_dimensions) return e.sm.zooming_dimensions;
      var t,
        o = s.rotate_bbox(e.sm.bbox, eC),
        r = o.x,
        n = o.y,
        a = o.width,
        l = o.height,
        c = e.sm.zp,
        p = ew * e3,
        m = ek * e3;
      return (
        (r -= (a / c - a) * 0.5),
        (n -= (l / c - l) * 0.5),
        (a /= c) / (l /= c) > e5
          ? ((n -= (m * (t = a / p) - l) / 2), (l = a / e5))
          : ((r -= (p * (t = l / m) - a) / 2), (a = l * e5)),
        { x: r, y: n, w: a, h: l, r: t }
      );
    }
    function tJ(e) {
      if (e) {
        eF.stop();
        for (var t = 0; t < e.sm.states.length; ++t) {
          var o = tp[e.sm.states[t]];
          o.attr(o.sm.attributes), oP(o, "reset", !1, "state");
        }
      }
    }
    function tK() {
      tu &&
        "state" == tu.sm.type &&
        tu.sm.attributes &&
        (tu.sm.ignore_hover || tu.attr(tu.sm.attributes), oP(tu, "out"));
    }
    function t9(e) {
      if (e) {
        e.stop(), e.attr(e.sm.attributes);
        for (var t = 0; t < e.sm.states.length; ++t)
          oP(tp[e.sm.states[t]], "reset", !1, "region");
      }
    }
    function oe() {
      eO.forEach(function (e) {
        -1 != e.sm.id && t9(e);
      });
    }
    function ot(e, t) {
      var o,
        r,
        n,
        a = e.sm.display,
        l = t.sm.type;
      if ("all" == a || ("out" == a && "out" == l)) return !0;
      if ("region" == a && "region" == l) {
        return (
          (o = e),
          (r = t),
          (n = o.sm.point0),
          o.sm.display_ids
            ? o.sm.display_ids.indexOf(r.sm.id) > -1
            : !!Raphael.isPointInsideBBox(r.sm.bbox, n.x, n.y)
        );
      }
      if ("state" == a && "state" == l)
        return (function e(t, o) {
          var r = t.sm.point0;
          if (t.sm.display_ids) return t.sm.display_ids.indexOf(o.sm.id) > -1;
          if (Raphael.isPointInsideBBox(o.sm.bbox, r.x, r.y)) {
            var n = t2.paths[o.sm.id];
            if (Raphael.isPointInsidePath(n, r.x, r.y)) return !0;
          }
          return !1;
        })(e, t);
      var c = s.is_in_range(a.toString(), ez - 1e-4);
      if (e.sm.parent && "state" == e.sm.parent.sm.type) {
        var p = s.is_in_range(e.sm.parent.sm.display.toString(), ez - 1e-4);
        return c && p;
      }
      return c;
    }
    function oo(e, t, o) {
      var r = { transform: t };
      ea || em || o ? e.attr(r) : e.animate(r, 1e3 * j);
    }
    function oi() {
      for (id in tp) {
        var e = tp[id],
          t = e.sm.display;
        ("all" == t || "out" == t) && (t = 1),
          s.is_in_range(t.toString(), ez - 1e-4) && !e.sm.hide
            ? e.show()
            : e.hide();
      }
      for (id in ty) {
        var o = ty[id],
          t = o.sm.parent.sm.display;
        ("all" == t || "out" == t) && (t = 1),
          s.is_in_range(t.toString(), ez - 1e-4) && !o.sm.hide
            ? o.show()
            : o.hide();
      }
    }
    function or(e, t) {
      var o,
        r,
        n = e.sm.type;
      tD(),
        (o = e),
        (r = t),
        eL.hide(),
        eL.forEach(function (e) {
          if (!e.sm.hide && (ot(e, o) && e.show(), e.sm.scale)) {
            var t = ez > e.sm.scale_limit ? ez : e.sm.scale_limit,
              n = ox(e, t * e3);
            oo(e, n, r);
          }
        }),
        (function e(t, o) {
          for (var r in (eD.hide(), td)) {
            var n = td[r];
            if (!n.sm.hide) {
              if ((ot(n, t) && tf[n.sm.id].show(), n.sm.line)) {
                var s = ob(n);
                n.sm.line.attr({ path: s, transform: eC });
              }
              if (n.sm.scale) {
                var a = ez > n.sm.scale_limit ? ez : n.sm.scale_limit,
                  l = ox(n, a * e3);
                oo(n, l, o), n.sm.pill && oo(ty[n.sm.id], l, o);
              }
            }
          }
        })(e, t),
        s.x_in_array(n, ["state", "region", "out"]) && oe(),
        "region" == n
          ? tJ(e)
          : "state" == n
            ? tJ(tm[e.sm.region])
            : "manual" == n &&
              eO.forEach(function (e) {
                -1 != e.sm.id &&
                  (e.sm.zooming_dimensions.r > ez && e.sm.zoomable
                    ? tJ(e)
                    : t9(e));
              }),
        "out" != n && "manual" != n
          ? (eF.stop(),
            eI.stop(),
            eF.attr({ "fill-opacity": W }),
            eI.attr({ "fill-opacity": W }),
            e.stop(),
            e.attr({ "fill-opacity": 1 }),
            e.sm.labels.forEach(function (e) {
              e.sm &&
                e.sm.pill &&
                (e.sm.pill.stop(), e.sm.pill.attr({ "fill-opacity": 1 }));
            }),
            e.animate(
              { "stroke-width": e.sm.border_hover_size * (eb / ew) * l * 1.25 },
              1e3 * j,
            ))
          : (eF.attr({ "fill-opacity": 1 }), eI.attr({ "fill-opacity": 1 })),
        eF.animate({ "stroke-width": K * (eb / ew) * l * 1.25 }, 1e3 * j),
        oi();
    }
    function on(e) {
      x && "-1" != b && "region" == e.sm.type
        ? !!N && tR()
        : "state" == e.sm.type || "region" == e.sm.type || N
          ? tR()
          : v && "out" != e.sm.type && tR();
    }
    function os(e) {
      return { x: e.x, y: e.y, w: e.w, h: e.h };
    }
    function oa() {
      k.sm && z && (tP.hide(), (z = !1), k.sm && t3.call(k), (ep = !1));
    }
    var ol = !1;
    function oc(e) {
      var t = tQ(e.x / e3, e.y / e3 + e.h / e3),
        o = tQ(e.x / e3 + e.w / e3, e.y / e3);
      return [
        [t.lng, t.lat],
        [o.lng, o.lat],
      ];
    }
    function op(e) {
      tC("viewbox_updated", [e]), ol && ol.fitBounds(oc(e), { animate: !1 });
    }
    function om(e, t, o) {
      if (!tH) {
        oa(),
          o7 && (o7.stop(), (o7 = !1)),
          o2 && e != o2 && t3.call(o2),
          (k = !1),
          (tn = e),
          tP.hide(),
          (z = !1),
          (tH = !0),
          (e.sm.zooming_dimensions = tG(e));
        var r = os(e.sm.zooming_dimensions),
          a = os(tu.sm.zooming_dimensions);
        (ez = e.sm.zooming_dimensions.r),
          or(e, t),
          ea || (em && !B) || t
            ? ((ta = r), eP.setViewBox(r.x, r.y, r.w, r.h, !1), l())
            : (ts = (n.Tweenable ? new n.Tweenable() : new Tweenable()).tween({
                from: a,
                to: r,
                duration: 1e3 * j,
                easing: "easeOutQuad",
                step: function (e) {
                  var t;
                  (ta = t = e), eP.setViewBox(t.x, t.y, t.w, t.h, !1), op(t);
                },
                finish: function () {
                  l(r);
                },
              }));
      }
      function l() {
        on(e, t),
          (tu = e),
          (tH = !1),
          (ep = !1),
          op(e.sm.zooming_dimensions),
          (t6.zoom_level = tu.sm.type),
          (t6.zoom_level_id = !!tu.sm.id && tu.sm.id),
          (t6.zoom_ratio = ez),
          tC("zooming_complete", []),
          s.isFunction(o) && o();
      }
    }
    function ou(e) {
      var t = "",
        o = {};
      for (var r in t2.paths) {
        var n,
          s = t2.paths[r];
        s = Raphael._pathToAbsolute(s);
        var a = Raphael.pathBBox(s);
        n = a.x2 - a.x < 10 ? 10 : 1;
        var l = Math.round(a.x * n) / n,
          c = Math.round(a.y * n) / n,
          p = Math.round(a.y2 * n) / n;
        (t +=
          "'" +
          r +
          "':{x: " +
          l +
          ",y:" +
          c +
          ",x2:" +
          Math.round(a.x2 * n) / n +
          ",y2:" +
          p +
          "},"),
          (o[r] = a);
      }
      return (
        (t = t.substring(0, t.length - 1)),
        (t += "}"),
        e || console.log("The new state_bbox_array is: \n\n{" + t),
        o
      );
    }
    function o8(e) {
      var t = e.sm.description,
        o =
          '<a id="xpic_sm_' +
          g +
          '" href="#"><img src="data:image/svg+xml,%3Csvg%20enable-background%3D%22new%200%200%20256%20256%22%20height%3D%22256px%22%20id%3D%22Layer_1%22%20version%3D%221.1%22%20viewBox%3D%220%200%20256%20256%22%20width%3D%22256px%22%20xml%3Aspace%3D%22preserve%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M137.051%2C128l75.475-75.475c2.5-2.5%2C2.5-6.551%2C0-9.051s-6.551-2.5-9.051%2C0L128%2C118.949L52.525%2C43.475%20%20c-2.5-2.5-6.551-2.5-9.051%2C0s-2.5%2C6.551%2C0%2C9.051L118.949%2C128l-75.475%2C75.475c-2.5%2C2.5-2.5%2C6.551%2C0%2C9.051%20%20c1.25%2C1.25%2C2.888%2C1.875%2C4.525%2C1.875s3.275-0.625%2C4.525-1.875L128%2C137.051l75.475%2C75.475c1.25%2C1.25%2C2.888%2C1.875%2C4.525%2C1.875%20%20s3.275-0.625%2C4.525-1.875c2.5-2.5%2C2.5-6.551%2C0-9.051L137.051%2C128z%22%2F%3E%3C%2Fsvg%3E" style="width: 100%" alt="Close" border="0" /></a>',
        r = '<a style="line-height: 1.5" id="xpic_sm_' + g + '">X</a>',
        n = ea ? r : o;
      n = '<div class="xmark_sm">' + n + "</div>";
      var a = e.sm.url ? e.sm.url : "",
        l = a,
        c = "javascript:" == l.substring(0, 11),
        p = s.replaceAll(l, "'", '"'),
        m = U
          ? 'return (function(e){window.open("' +
            a +
            '","_blank"); return false})()'
          : c
            ? 'return (function(){window.location.href="' +
              a +
              '"; return false;})()'
            : 'return (function(){window.top.location.href="' +
              a +
              '"; return false;})()';
      c && (m = "(function(){" + p + "})()");
      var u = e.sm.description_mobile
        ? e.sm.description_mobile
        : '<div class="tt_mobile_sm"><a tabindex="0" onkeydown="if (event.keyCode == 13) this.click()" class="btn_simplemaps" onClick=\'' +
          m +
          "'>" +
          e.sm.link_text +
          "</a></div>";
      e.sm.on_click || ((n = ""), (u = "")),
        "" != e.sm.url || e.sm.description_mobile || (u = "");
      var d =
        "" == t ? (d = "") : '<div class="tt_custom_sm"; />' + t + "</div>";
      return (
        '<div class="tt_sm"><div>' +
        (e.sm.hide_name
          ? ""
          : '<div class="tt_name_sm">' + e.sm.name + "</div>") +
        n +
        '<div style="clear: both;"></div></div>' +
        d +
        u +
        "</div></div>"
      );
    }
    function od(e, t) {
      var o = e.sm.zooming_dimensions;
      if (o.w > t.sm.zooming_dimensions.w) return !1;
      var r = t.sm.bbox,
        n = { x: r.x * e3, y: r.y * e3, x2: r.x2 * e3, y2: r.y2 * e3 },
        s = o.x + o.w / 2,
        a = o.y + o.h / 2;
      return !!(s > n.x) && !!(a > n.y) && !!(s < n.x2) && !!(a < n.y2);
    }
    function of(e, t) {
      var o = t.hover ? "_hover" : "",
        r = g + "_pattern_" + e.sm.id + o,
        n = document.getElementById(r);
      n && s.delete_element(n);
      var a = ef.firstChild,
        c = a.namespaceURI,
        p = a.querySelector("defs"),
        m = document.createElementNS(c, "pattern"),
        u = e.sm.id;
      (m.id = r), m.setAttribute("patternUnits", "objectBoundingBox");
      var d = document.createElementNS(c, "image"),
        f = document.createElementNS(c, "rect"),
        h = t.image_color ? t.image_color : t.color;
      f.setAttribute("fill", "#ffffff"),
        f.setAttribute("opacity", t.bg_opacity),
        d.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          t.image_url,
        ),
        m.appendChild(f),
        m.appendChild(d),
        p.appendChild(m),
        a.appendChild(p);
      var y = t.image_position,
        v = "auto" == t.image_size,
        _ = "repeat" == y,
        b = "manual" == y,
        x = "center" == y,
        w = Raphael.pathBBox(t2.paths[u]),
        k = w.x2 - w.x,
        z = w.y2 - w.y,
        P = k / z;
      return (
        Raphael._preload(t.image_url, function () {
          var e,
            o,
            r,
            n = this.offsetWidth,
            s = this.offsetHeight,
            a = n / s,
            c =
              ((r = t.image_size),
              v
                ? _ || b
                  ? (r =
                      a > 1 ? (n > k ? 1 : n / k) : s > z ? 1 / P : s / z / P)
                  : x && ((r = a / P), a > P || (r = 1 / r))
                : r > 1 && (r = (t.image_size * l) / k),
              r),
            p = k * c,
            u = p / a,
            y = 0,
            g = 0;
          if (
            (_
              ? ((e = c), (o = (c * P) / a))
              : b
                ? ((e = 1), (o = 1), (y = t.image_x * k), (g = t.image_y * z))
                : x &&
                  ((e = 1), (o = 1), (y = 0.5 * (k - p)), (g = 0.5 * (z - u))),
            f.setAttribute("x", 0),
            f.setAttribute("y", 0),
            f.setAttribute("width", k),
            f.setAttribute("height", z),
            f.setAttribute("fill", h),
            f.setAttribute("opacity", "1"),
            m.setAttribute("y", 0),
            m.setAttribute("x", 0),
            m.setAttribute("y", 0),
            m.setAttribute("width", e),
            m.setAttribute("height", o),
            d.setAttribute("x", y),
            d.setAttribute("y", g),
            d.setAttribute("width", p),
            $)
          ) {
            var w = y + 0.5 * p,
              E = g + 0.5 * u;
            d.setAttribute(
              "transform",
              "rotate(-" + $ + "," + w + "," + E + ")",
            );
          }
          d.setAttribute("height", u);
        }),
        'url("#' + m.id + '")'
      );
    }
    t6.get_latlng_bounds = oc;
    var oh = !1;
    function oy(e) {
      e || ((tc = {}), (tp = {})), (oh = t2.state_bbox_array);
      var t = K * e3 * l * 1.25;
      for (var r in ((tl = function (e) {
        var r = !tp[e],
          n = eZ[e];
        !n.path &&
          (n.geojson_value || n.feature || "geojson" == n.type) &&
          (n.path = tX(n, oh, eZ, e, "state"));
        var s = n.path ? n.path : t2.paths[e],
          c = r ? eP.path(s) : tp[e];
        r && (c.sm = { id: e }),
          ea || c.node.setAttribute("class", "sm_state sm_state_" + e);
        var p = {
            fill: n.color,
            opacity: n.opacity,
            stroke: n.border_color,
            cursor: "pointer",
            "stroke-opacity": 1,
            "stroke-width": t,
            "stroke-linejoin": "round",
          },
          m = n.border_hover_color ? n.border_hover_color : a.border_color,
          u = n.border_hover_size ? n.border_hover_size : K,
          d = u * e3 * l * 1.25,
          f = {
            opacity: n.hover_opacity,
            fill: n.hover_color,
            stroke: m,
            "stroke-width": d,
          };
        if (((c.sm.image = !1), n.image_url && !ea)) {
          var h = {
              hover: !1,
              image_url: n.image_url,
              image_size: n.image_size,
              image_position: n.image_position,
              image_x: n.image_x,
              image_y: n.image_y,
              image_color: n.image_color,
              bg_opacity: n.image_background_opacity,
            },
            y = of(c, h);
          if (((c.sm.image = !0), (p.fill = y), n.image_hover_url)) {
            var h = {
                hover: !0,
                image_url: n.image_hover_url,
                image_size: n.image_hover_size,
                image_position: n.image_hover_position,
                image_x: n.image_hover_x,
                image_y: n.image_hover_y,
                image_color: n.image_hover_color,
                bg_opacity: n.image_background_opacity,
              },
              y = of(c, h);
            f.fill = y;
          } else f.fill = y;
        }
        n.inactive && (p.cursor = "default"),
          n.image_source &&
            ((c.sm.ignore_hover = !0),
            (p.fill = "url(" + o + n.image_source + ")")),
          (n.border_hover_color || n.border_hover_size) && n.emphasize
            ? (c.sm.emphasizable = !0)
            : (c.sm.emphasizable = !1),
          (c.sm.border_hover_size = u),
          c.attr(p),
          c.transform(eC),
          (c.sm.attributes = p),
          (c.sm.over_attributes = f),
          (c.sm.description = n.description),
          (c.sm.adjacent_attributes = { "fill-opacity": W }),
          (c.sm.hide = n.hide),
          (c.sm.display = n.display),
          (c.sm.link_text = n.link_text),
          (c.sm.hide_label = n.hide_label),
          (c.sm.hide_name = n.hide_name),
          r && (c.sm.region = !1),
          (c.sm.name = n.name ? n.name : t2.names[e]),
          c.sm.name || (c.sm.name = e),
          (c.sm.url = n.url),
          (c.sm.inactive = n.inactive),
          (c.sm.on_click = tj(n.popup)),
          (c.sm.popup_off = tB(n.popup)),
          (c.sm.labels = []),
          (c.sm.zp = n.zoom_percentage),
          (c.sm.zoomable = n.zoomable),
          (c.sm.level = n.level),
          (c.sm.description_mobile = n.description_mobile),
          (c.sm.type = "state"),
          (c.sm.hide_labels = n.hide_label),
          (c.sm.content = o8(c));
        var $ = oh[e];
        $ || ($ = Raphael.pathBBox(s));
        var v = { x: $.x, x2: $.x2, y: $.y, y2: $.y2 };
        (c.sm.bbox = v),
          (c.sm.bbox.width = v.x2 - v.x),
          (c.sm.bbox.height = v.y2 - v.y),
          (c.sm.pulse_speed = n.pulse_speed),
          (c.sm.pulse_size = n.pulse_size),
          (c.sm.pulse_color = n.pulse_color ? n.pulse_color : n.border_color),
          c.sm.hide ? c.hide() : r && e2.push(c),
          r && ((tp[e] = c), eF.push(c));
      }),
      eJ))
        tl(r);
      tl[-1], eF.hide();
    }
    function o$() {
      eB.attr({ fill: a.background_color, "fill-opacity": X, stroke: "none" });
    }
    var ov = !1;
    function o_(e) {
      if ((e || (tm = {}), P))
        for (var t in P) {
          var o = eG[t],
            r = P[t],
            n = e ? tm[t] : eP.set();
          if (!e) {
            if (((n.sm = {}), (n.sm.states = []), tm[t])) {
              console.log("Duplicate Regions");
              continue;
            }
            for (var a = [], l = 0; l < r.states.length; l++) {
              var c = r.states[l],
                p = tp[c];
              if (!p) {
                console.log(c + " does not exist");
                continue;
              }
              if (p.sm.region) {
                console.log(p.sm.name + " already assigned to a region");
                continue;
              }
              (p.sm.region = t),
                n.sm.states.push(c),
                (ea && p.sm.ignore_hover && (o.color || o.hover_color)) ||
                  n.push(p),
                a.push(p.sm.bbox);
            }
            o.x &&
              o.y &&
              o.x2 &&
              o.y2 &&
              (a = [{ x: o.x, y: o.y, x2: o.x2, y2: o.y2 }]),
              (n.sm.bbox = s.bbox_union(a));
          }
          var m = { "fill-opacity": o.opacity, cursor: "pointer" },
            u = { "fill-opacity": o.hover_opacity };
          o.color && (m.fill = o.color),
            o.hover_color && (u.fill = o.hover_color),
            o.inactive && (m.cursor = "default"),
            (n.sm.attributes = m),
            (n.sm.name = r.name),
            (n.sm.description = o.description),
            (n.sm.description_mobile = o.description_mobile),
            (n.sm.url = o.url),
            (n.sm.labels = eP.set()),
            (n.sm.on_click = tj(o.popup)),
            (n.sm.over_attributes = u),
            (n.sm.hide_name = o.hide_name),
            (n.sm.adjacent_attributes = { "fill-opacity": W }),
            (n.sm.zoomable = o.zoomable),
            (n.sm.popup_off = tB(o.popup)),
            (n.sm.zp = o.zoom_percentage),
            (n.sm.inactive = o.inactive),
            (n.sm.type = "region"),
            (n.sm.id = t),
            (n.sm.content = o8(n)),
            e || (eO.push(n), (tm[t] = n)),
            (n.sm.zooming_dimensions = tG(n));
        }
      if (!e) {
        tm[-1] = {};
        var d = tm[-1];
        (d.sm = {}), (d.sm.type = "out"), (d.sm.zp = 1);
        var f = s.clone(e1);
        if (
          ((f.width = f.x2 - f.x),
          (f.height = f.y2 - f.y),
          (d.sm.bbox = f),
          (d.sm.zooming_dimensions = tG(d)),
          (tu = d),
          "object" == typeof b
            ? (((t8 = {}).sm = { type: "manual", zp: 1, bbox: b }),
              (t8.sm.zooming_dimensions = tG(t8)),
              (b = -1),
              (x = !1))
            : -1 == b ||
              b in tm ||
              (b in tp
                ? ((ov = tp[b]), (x = !1))
                : console.log(
                    "The initial_zoom is not the id of a region or state",
                  ),
              (b = -1)),
          y)
        ) {
          tm[-2] = {};
          var h = tm[-2];
          h.sm = { type: "manual", zp: 1 };
          var $ = tG(tm[b]),
            v = $.w,
            _ = $.h,
            g = $.w * (y - 1) * 0.5,
            w = $.h * (y - 1) * 0.5;
          h.sm.zooming_dimensions = {
            x: $.x - g,
            y: $.y - w,
            w: v * y,
            h: _ * y,
            r: y,
          };
        }
      }
    }
    function og(e) {
      var t = e.getBBox(!0);
      if (ea) {
        var o = e._getBBox(!0);
        t.height = o.height;
      }
      var r = 0.5 * t.width,
        n = 0.5 * t.height,
        s = e.sm.point0;
      return {
        x: s.x - r,
        y: s.y - n,
        x2: s.x + r,
        y2: s.y + n,
        width: t.width,
        height: t.height,
      };
    }
    function o0() {
      for (var e in (s.clear_sets([eD, e4, eI]),
      (td = {}),
      (ty = {}),
      (tf = {}),
      (th = function (e) {
        var t = e9[e],
          o = !1,
          r = !1;
        if (e9.hasOwnProperty(e)) {
          var n = !td[e],
            c = eP.set(),
            p = { x: 1 * t.x, y: 1 * t.y },
            m = {},
            u = !1,
            d = !1;
          if (
            ("state" == t.parent_type
              ? (u = tp[t.parent_id])
              : "region" == t.parent_type
                ? (u = tm[t.parent_id])
                : "location" == t.parent_type && (u = t$[t.parent_id]),
            !t.x && !t.y && u)
          ) {
            if ("location" == u.sm.type)
              (r = !0),
                (m.x = u.sm.x),
                (m.y = u.sm.y),
                (p = u.sm.point0),
                (o = !0),
                u.sm.auto_size && (d = !0);
            else if ("state" == u.sm.type) {
              var f = u.sm.bbox;
              if (f.cx && f.cy)
                var h = S,
                  y = j;
              else
                var h = (f.x + f.x2) / 2,
                  y = (f.y + f.y2) / 2;
              (t.x = h), (t.y = y), (m.x = h), (m.y = y), (p = { x: h, y: y });
            }
          }
          if ((t.parent_type, !u)) {
            console.log("The following object does not exist: " + e);
            return;
          }
          if (("Not Named" == t.name && u && (t.name = u.sm.id), n)) {
            if (!r) {
              var $ = s.rotate([t.x, t.y], eC);
              m = { x: $[0], y: $[1] };
            }
            var v = eP.text(m.x, m.y, t.name);
            td[e] = v;
          } else var v = td[e];
          (v.sm = {}),
            (v.sm.hide = t.hide),
            u && (u.sm.hide_label || u.sm.hide) && (v.sm.hide = !0),
            (v.sm.parent = u),
            u.sm.labels.push(v),
            u.sm.region && tm[u.sm.region].sm.labels.push(v);
          var _ = {
              "stroke-width": 0,
              fill: t.color,
              "font-size": t.size,
              "font-weight": "bold",
              cursor: "pointer",
              "font-family": t.font_family,
              "text-anchor": t.anchor,
              opacity: t.opacity,
            },
            g = { fill: t.hover_color, opacity: t.hover_opacity },
            b = { fill: t.color, opacity: t.opacity };
          if (
            (u.sm.inactive && (_.cursor = "default"),
            v.attr(_),
            (v.sm.attributes = _),
            (v.sm.over_attributes = g),
            (v.sm.out_attributes = b),
            (v.sm.type = "label"),
            (v.sm.id = e),
            (v.sm.scale = o || t.scale),
            (v.sm.scale_limit = t.scale_limit),
            (v.sm.x = m.x),
            (v.sm.y = m.y),
            (v.sm.level = s.to_float(u.sm.level) + 0.1),
            (v.sm.point0 = p),
            (v.sm.line_x = t.line_x),
            (v.sm.line_y = t.line_y),
            (v.sm.line = !1),
            (v.sm.rotate = t.rotate),
            v.transform(ox(v, e3)),
            t.display
              ? (v.sm.display = t.display)
              : "region" == t.parent_type
                ? (v.sm.display = "out")
                : "location" == t.parent_type
                  ? (v.sm.display = u.sm.display)
                  : (v.sm.display = a.labels_display
                      ? a.labels_display
                      : "all"),
            (v.sm.display_ids = !!t.display_ids && t.display_ids),
            (t.line || t.pill || d) && (v.sm.bbox = og(v)),
            "auto" == t.display && "state" == t.parent_type)
          ) {
            (v.sm.display = 1e-4), v.sm.bbox || (v.sm.bbox = og(v));
            var x = [
                0.99, 0.501, 0.251, 0.1251, 0.06251, 0.031251, 0.0156255,
                0.00781275,
              ],
              w = t2.paths[u.sm.id],
              k = u.sm.bbox;
            for (var z in x) {
              var P = x[z],
                E = og(v),
                A = E.width * P * 0.5,
                C = E.height * P * 0.5,
                S = 0.5 * (E.x2 + E.x),
                j = 0.5 * (E.y2 + E.y),
                h = S - A,
                B = S + A,
                y = j - C,
                T = j + C,
                I = h > k.x && B < k.x2,
                F = y > k.y && T < k.y2;
              if (I && F) {
                var O = Raphael.isPointInsidePath(w, h, y),
                  L = Raphael.isPointInsidePath(w, B, y),
                  M = Raphael.isPointInsidePath(w, h, T),
                  N = Raphael.isPointInsidePath(w, B, T),
                  D = O && L && M && N,
                  R = E.width / P < ew;
                if (D && R) {
                  v.sm.display = P;
                  break;
                }
              }
              if (!v.sm.scale) break;
            }
          }
          if (t.line) {
            var q = ob(v),
              H = eP.path(q),
              V = t.line_size * l * e3 * 1.25,
              W = {
                stroke: t.line_color,
                cursor: "pointer",
                "stroke-width": V,
              };
            H.attr(W),
              (H.sm = {}),
              (H.sm.type = "label"),
              (v.sm.pill = !1),
              (H.sm.size = t.line_size),
              (H.sm.id = e),
              (H.sm.level = t.level),
              (v.sm.line = H),
              e4.push(H),
              c.push(H);
          }
          if ("state" == u.sm.type && t.pill) {
            var X = v.sm.bbox,
              Y = 1.45 * X.width,
              Q = t.width ? t.width : Y,
              Z = 1.15 * X.height,
              h = v.sm.x - 0.5 * Q,
              y = v.sm.y - 0.5 * Z,
              U = "auto" != t.pill_radius ? t.pill_radius : Z / 5;
            if (ty[e]) var G = ty[e];
            else {
              var G = eP.rect(h, y, Q, Z, U);
              ty[e] = G;
            }
            if (
              (G.transform(ox(v, e3)),
              (G.sm = {}),
              (G.sm.parent = u),
              (G.sm.level = u.sm.level),
              (G.sm.attributes = s.clone(u.sm.attributes)),
              u.sm.image && (G.sm.attributes.fill = eZ[u.sm.id].color),
              (G.sm.over_attributes = s.clone(u.sm.over_attributes)),
              u.sm.image &&
                (G.sm.over_attributes.fill = eZ[u.sm.id].hover_color),
              (G.sm.adjacent_attributes = s.clone(u.sm.adjacent_attributes)),
              G.attr(G.sm.attributes),
              s.x_in_array(v.sm.display, ["state", "all"]) &&
                (u.sm.bbox = s.bbox_union([u.sm.bbox, v.sm.bbox])),
              s.x_in_array(v.sm.display, ["region", "all"]) && u.sm.region)
            ) {
              var J = tm[u.sm.region];
              (J.sm.bbox = s.bbox_union([J.sm.bbox, v.sm.bbox])),
                (J.sm.zooming_dimensions = !1),
                (J.sm.zooming_dimensions = tG(J));
            }
            (v.sm.pill = G), eI.push(G), c.push(G), c.push(v);
          } else c.push(v);
          if (
            (("out" != v.sm.display && "all" != v.sm.display) || v.sm.hide
              ? c.hide()
              : eA.push(c),
            "location" != v.sm.parent.sm.type || v.sm.line || e7.push(c),
            eD.push(c),
            (tf[e] = c),
            ea || v.node.setAttribute("class", "sm_label sm_label_" + e),
            d)
          ) {
            var K =
                ((a.location_auto_padding
                  ? 1 + 2 * a.location_auto_padding
                  : 1.3) *
                  v.sm.bbox.width) /
                l,
              ee = v.sm.parent,
              et = ee.sm.labels,
              eo = ee.sm.shape_type;
            "triangle" == eo ? (K *= 1.3) : "star" == eo && (K *= 2);
            var ei = ee.sm.id;
            (eU[ei].size = K), tv(ei);
            var ee = t$[ei];
            (v.sm.parent = ee),
              (ee.sm.labels = et),
              ee.sm.labels.push(v),
              (ee.sm.auto_size = !0);
          }
        }
      }),
      e9))
        th(e);
      eD.hide();
    }
    function ob(e) {
      var t = e.sm.bbox,
        o = t.x2 - t.x,
        r = t.y2 - t.y,
        n = e.sm.scale ? ez : 1,
        a = 0.5 * (1 - n) * o,
        l = 0.5 * (1 - n) * r,
        c = e.sm.line_x,
        p = e.sm.line_y,
        m = !c || !p,
        u = e.sm.parent.sm.type;
      if ("location" == u && m)
        (c = e.sm.parent.sm.point0.x), (p = e.sm.parent.sm.point0.y);
      else if ("state" == u && m) {
        var d = e.sm.parent.sm.bbox;
        (c = 0.5 * (d.x2 + d.x)), (p = 0.5 * (d.y2 + d.y));
      }
      var f = { x: c, y: p },
        h = [];
      h.push({ x: t.x2 - a, y: 0.5 * (t.y + t.y2) }),
        h.push({ x: t.x + a, y: 0.5 * (t.y + t.y2) }),
        h.push({ x: 0.5 * (t.x + t.x2), y: t.y + l }),
        h.push({ x: 0.5 * (t.x + t.x2), y: t.y2 - l });
      var y = {};
      for (var $ in h) {
        var v = h[$],
          _ = s.distance(v, f);
        (0 == $ || _ < y.distance) &&
          ((y.label = v), (y.location = f), (y.distance = _));
      }
      return s.linePath(y.label.x, y.label.y, y.location.x, y.location.y);
    }
    function ox(e, t, o, r, n, s) {
      var a = void 0 === r ? e.sm.x : r,
        l = void 0 === n ? e.sm.y : n;
      return (
        void 0 === o && (o = "0,0"),
        void 0 === s && (s = e.sm.rotate),
        "t " + o + " s" + t + "," + t + "," + a + "," + l + "r" + s
      );
    }
    var o3 = {
      triangle: "M -0.57735,.3333 .57735,.3333 0,-.6666 Z",
      diamond: "M 0,-0.5 -0.4,0 0,0.5 0.4,0 Z",
      marker:
        "m-.015-.997c-.067 0-.13.033-.18.076-.061.054-.099.136-.092.219-.0001.073.034.139.068.201.058.104.122.206.158.32.021.058.039.117.058.175.006.009.011-.004.011-.009.037-.125.079-.249.144-.362.043-.08.095-.157.124-.244.022-.075.016-.161-.026-.229-.048-.08-.134-.136-.227-.146-.013-.0001-.027-.0001-.04-.0001z",
      heart:
        "m-.275-.5c-.137.003-.257.089-.3.235-.073.379.348.539.58.765.202-.262.596-.33.576-.718-.017-.086-.065-.157-.13-.206-.087-.066-.208-.089-.311-.05-.055.02-.106.053-.143.098-.065-.081-.169-.127-.272-.125",
      star: "m0-.549c-.044.126-.084.252-.125.379-.135.0001-.271.0001-.405.002.108.078.216.155.323.233-.002.029-.016.057-.023.085-.032.099-.066.199-.097.298.049-.031.095-.068.143-.101.062-.044.124-.089.185-.133.109.077.216.158.326.233-.04-.127-.082-.253-.123-.379.109-.079.219-.156.327-.236-.135-.0001-.27-.002-.405-.003-.042-.126-.081-.252-.125-.377",
    };
    function ow(e) {
      for (var t in I) o3[t] = I[t];
      var r = [];
      for (var t in o3) r.push(t);
      for (var t in (s.clear_sets([eL]),
      (t$ = {}),
      (tv = function (e) {
        var t = "center",
          n = eU[e];
        if ("image" != n.type)
          var a = {
              "stroke-width": n.border * e3 * l,
              stroke: n.border_color,
              fill: n.color,
              opacity: n.opacity,
              cursor: "pointer",
            },
            c = {
              "stroke-width": n.hover_border * e3 * l,
              stroke: n.border_color,
              fill: n.hover_color,
              opacity: n.hover_opacity,
              cursor: "pointer",
            };
        else {
          t = n.image_position;
          var a = { cursor: "pointer" },
            c = { cursor: "pointer" };
        }
        n.inactive && (a.cursor = "default");
        var p = eU[e].type,
          m = n.size * l;
        if (n.x && n.y) {
          var u = {};
          (u.x = n.x), (u.y = n.y);
        } else var u = tZ(n.lat, n.lng);
        var d = s.rotate([u.x, u.y], eC),
          f = { x: d[0], y: d[1] };
        if ("auto" == n.size) {
          var h = { sm: {} };
          (h.sm.display = n.display),
            (h.sm.auto_size = !0),
            (h.sm.type = "location"),
            (h.sm.hide_label = !1),
            (h.sm.labels = []),
            (h.sm.point0 = u),
            (h.sm.x = f.x),
            (h.sm.y = f.y),
            (h.sm.shape_type = p),
            (h.sm.id = e),
            (t$[e] = h);
          return;
        }
        if ("circle" == p)
          var y = eP.circle(f.x, f.y, 0.5 * m),
            $ = {
              x: f.x - 0.5 * m * ez,
              y: f.y - 0.5 * m * ez,
              x2: f.x + 0.5 * m * ez,
              y2: f.y + 0.5 * m * ez,
            };
        else if (s.x_in_array(p, r)) {
          var v = m,
            _ = "S" + v + "," + v + ",0,0 T" + f.x + "," + f.y,
            g = Raphael.transformPath(o3[p], _).toString() + "Z";
          "marker" == p && (t = "bottom-center");
          var $ = Raphael.pathBBox(g),
            y = eP.path(g);
        } else if ("path" == p && eU[e].path) {
          var $ = Raphael.pathBBox(g),
            y = eP.path(eU[e].path);
          n.scale = !1;
        } else if ("geojson" == p) {
          var g = tX(eU[e], te, eU, e, "location"),
            $ = Raphael.pathBBox(g);
          n.scale = !1;
          var y = eP.path(g);
        } else if ("image" == p) {
          var b = n.image_url ? n.image_url : o + n.image_source,
            y = eP.image(b, 0, 0);
          (a.src = b), (y.sm = {});
          var $ = !1;
          if (
            (Raphael._preload(b, function () {
              var e = this.width / this.height,
                o = m,
                r = o * e,
                n = f.x - r / 2,
                s = "bottom-center" == t ? f.y - o : f.y - o / 2;
              y.attr({ height: o, width: r, x: n, y: s }),
                (y.sm.bbox = { x: n, y: s, x2: n + r, y2: s + o });
            }),
            n.image_hover_url || n.image_hover_source)
          ) {
            var x = n.image_hover_url
              ? n.image_hover_url
              : o + n.image_hover_source;
            c.src = x;
          }
        } else
          var w = m,
            k = w,
            z = f.x - k / 2,
            P = f.y - w / 2,
            y = eP.rect(z, P, k, w),
            $ = { x: z, y: P, x2: z + k, y2: P + ex };
        (y.sm = {}),
          (y.sm.image = "image" == p),
          (y.sm.attributes = a),
          y.attr(a),
          (y.sm.link_text = n.link_text),
          (y.sm.original_transform = eC),
          (y.sm.over_attributes = c),
          (y.sm.id = e),
          (y.sm.name = n.name),
          (y.sm.scale = n.scale),
          (y.sm.scale_limit = n.scale_limit),
          (y.sm.position = t),
          (y.sm.url = n.url),
          (y.sm.type = "location"),
          (y.sm.shape_type = p),
          (y.sm.description = n.description),
          (y.sm.description_mobile = n.description_mobile),
          (y.sm.inactive = n.inactive),
          (y.sm.on_click = tj(n.popup)),
          (y.sm.popup_off = tB(n.popup)),
          (y.sm.pulse = n.pulse),
          (y.sm.level = n.level),
          "bottom" == n.position && (y.sm.level = -1),
          (y.sm.pulse_speed = n.pulse_speed),
          (y.sm.pulse_size = n.pulse_size),
          (y.sm.pulse_color = n.pulse_color ? n.pulse_color : n.color),
          (y.sm.x = f.x),
          (y.sm.y = f.y),
          (y.sm.point0 = u),
          (y.sm.bbox = $),
          (y.sm.labels = []),
          (y.sm.size = m),
          (y.sm.hide = n.hide),
          (y.sm.hide_name = n.hide_name),
          (y.sm.display = n.display),
          (y.sm.display_ids = !!n.display_ids && n.display_ids),
          y.transform(ox(y, ez * e3)),
          ("region" == y.sm.display || "state" == y.sm.display || n.hide) &&
            y.hide(),
          (y.sm.content = o8(y)),
          eL.push(y),
          (t$[e] = y),
          ea || y.node.setAttribute("class", "sm_location sm_location_" + e);
      }),
      te))
        tv(t);
    }
    function ok(e) {
      if (!e.sm) return e;
      var t = t6.zoom_level,
        o = t6.zoom_level_id,
        r = !!e.sm.region && tm[e.sm.region];
      if (!r) return e;
      if ("out" == t) return r;
      if ("region" == t) return o == r.sm.id ? e : r;
      if ("state" == t) return tp[o].sm.region === r.sm.id ? e : r;
      if ("manual" == t)
        return ez > r.sm.zooming_dimensions.r || !r.sm.zoomable ? r : e;
    }
    function o1(e) {
      var t = t6.zoom_level,
        o = t6.zoom_level_id;
      if ("state" == t) return o != e.sm.id;
      if ("region" != t) return !1;
      var r = !!e.sm.region && tm[e.sm.region];
      return !r || (o != r.sm.id && void 0);
    }
    var oz = function (e, t, o, r) {
        void 0 == o && (o = !1),
          void 0 == r && (r = !1),
          r ||
            (r =
              "over" == t
                ? e.sm.over_attributes
                : "adjacent" == t
                  ? e.sm.adjacent_attributes
                  : e.sm.attributes),
          !o || e.sm.image ? e.attr(r) : e.animate(r, q);
      },
      o5 = function (e, t, o) {
        if ((void 0 == o && (o = !1), "state" == o))
          var r,
            n = e.sm.parent;
        else if ("region" == o) var n = tm[e.sm.parent.sm.region];
        else var n = ok(e.sm.parent);
        if (
          ((r =
            "over" == t
              ? s.clone(n.sm.over_attributes)
              : "adjacent" == t
                ? s.clone(n.sm.adjacent_attributes)
                : s.clone(n.sm.attributes)),
          n.sm.image && "state" == n.sm.type)
        ) {
          var a = eZ[n.sm.id];
          "over" == t ? (r.fill = a.hover_color) : (r.fill = a.color);
        }
        oz(e, t, !1, r);
      };
    function oP(e, t, o, r) {
      if (e.sm.labels) {
        var n;
        e.sm.labels.forEach(function (e) {
          if (e.sm) {
            var n = e.sm.pill;
            "over" == t
              ? (e.stop(), oz(e, "over"), n && o5(n, "over"))
              : ("reset" == t || "out" == t) &&
                (oz(e, "out"),
                n && (o5(n, "out", r), o && o5(n, "adjacent", r)));
          }
        });
      }
    }
    var o6 = !1,
      o4 = function (e, t) {
        if (!e.sm || !e) {
          s.isFunction(t) && t();
          return;
        }
        var o = !!e.sm.image || (!!em && !!v);
        if ((tP.hide(), o1(e)))
          e.sm.ignore_hover || e.animate(e.sm.attributes, q, r),
            e.animate(e.sm.adjacent_attributes, q, r),
            oP(e, "out", !0);
        else {
          if (
            (ea && "location" == e.sm.type && "image" == e.sm.shape_type) ||
            !e ||
            !e.sm
          )
            return;
          e.sm.ignore_hover ||
            (o
              ? (e.attr(e.sm.attributes), r())
              : e.animate(e.sm.attributes, q, r)),
            oP(e, "out");
        }
        function r() {
          s.isFunction(t) && t();
        }
      },
      o2 = !1,
      o7 = !1;
    function oE(e) {
      if (e.touches) {
        var t = e.changedTouches ? e.changedTouches[0] : e.touches[0];
        return { x: t.clientX, y: t.clientY };
      }
      var o = el ? e.clientY + document.documentElement.scrollTop : e.pageY;
      return {
        x: el ? e.clientX + document.documentElement.scrollLeft : e.pageX,
        y: o,
      };
    }
    var oA = function () {
        oa();
      },
      oC = {};
    function oS() {
      var e = [eF, eL, eD, e4, eI];
      all = [];
      for (var t = 0; t < e.length; t++)
        for (var o = 0; o < e[t].length; o++)
          if (e[t][o].length > 0)
            for (var r = 0; r < e[t][o].length; r++) all.push(e[t][o][r]);
          else all.push(e[t][o]);
      var n = (function e(t) {
          for (var o = {}, r = 0; r < t.length; r++) {
            var n = t[r],
              a = n.sm.level.toString();
            o[a] || (o[a] = []), o[a].push(n);
          }
          var l = [];
          for (var a in o) o.hasOwnProperty(a) && l.push(s.to_float(a));
          l.sort(function (e, t) {
            return t - e;
          });
          for (var c = [], p = {}, m = 0; m < l.length; m++) {
            for (var u = o[l[m]], d = eP.set(), f = 0; f < u.length; f++)
              d.push(u[f]);
            d.push(eP.circle(0, 0, 0));
            var h = l[m].toString();
            d.items.reverse(), (p[h] = d), c.push(d);
          }
          return [c, p];
        })(all),
        a = n[0];
      oC = n[1];
      for (var t = 0; t < a.length; t++) a[t].toBack();
      ej.toBack();
    }
    function oj(e) {
      !e &&
        (ec
          ? (eF.mouseup(tb), ej.mouseup(oA), eq.mouseup(tz), ej.mouseup(oQ))
          : (eF.hover(tx, t3),
            eF.click(tb),
            ej.click(oA),
            eq.click(tz),
            ej.hover(oQ, oQ)),
        _ &&
          (function e() {
            var t;
            function o() {
              oB();
            }
            (t5 = function () {
              clearTimeout(t), (t = setTimeout(o, 200));
            }),
              window.addEventListener
                ? (window.addEventListener("resize", t5, !1),
                  window.addEventListener("orientationchange", t5, !1))
                : (window.attachEvent("resize", t5, !1),
                  window.attachEvent("orientationchange", t5, !1)),
              ea &&
                (document.body.onresize = function () {
                  o();
                });
          })(),
        v &&
          (eF.touchstart(tb),
          eF.touchend(tb),
          eq.touchend(t1),
          (function e() {
            function t(e) {
              var t = oE(e),
                s = t.x,
                a = t.y,
                l = (r - s) * o.r,
                c = (n - a) * o.r,
                p = 5 * o.r;
              return (
                (Math.abs(l) > p || Math.abs(c) > p) && (tV = !0),
                { x: o.x + l, y: o.y + c, w: o.w, h: o.h, r: o.r }
              );
            }
            var o,
              r,
              n,
              a = !1;
            function l(e) {
              if (z) return !1;
              e.preventDefault ? e.preventDefault() : (e.returnValue = !1),
                (o = { x: ta.x, y: ta.y, w: ta.w, h: ta.h, r: ta.w / ew / e3 }),
                (a = !0);
              var t = oE(e);
              (r = t.x), (n = t.y), tP.hide(), tP.pos(e);
            }
            function c(e) {
              if (a && (!e.touches || !(e.touches.length > 1))) {
                var o = t(e);
                eP.setViewBox(o.x, o.y, o.w, o.h), op(o);
              }
            }
            function p(e) {
              if (!a || !tV) {
                (tV = !1), (a = !1);
                return;
              }
              var o = t(e);
              eP.setViewBox(o.x, o.y, o.w, o.h),
                (ta = o),
                ((tu = { sm: {} }).sm.zooming_dimensions = ta),
                (tu.sm.type = "manual"),
                (a = !1),
                setTimeout(function () {
                  tV = !1;
                }, 1),
                tR();
            }
            s.addEvent(ef, "mousedown", l),
              s.addEvent(ef, "mousemove", c),
              s.addEvent(ef, "mouseup", p),
              s.addEvent(ef, "mouseleave", p),
              s.addEvent(ef, "touchstart", l),
              s.addEvent(ef, "touchmove", c),
              s.addEvent(ef, "touchend", p);
          })(),
          (function e() {
            var t = !1;
            function o(e) {
              if (!tH && e.touches && e.touches.length > 1) {
                tW = !0;
                var o,
                  r,
                  n,
                  a =
                    ((r = {
                      x: (o = e).touches[0].pageX,
                      y: o.touches[0].pageY,
                    }),
                    (n = { x: o.touches[1].pageX, y: o.touches[1].pageY }),
                    s.distance(r, n));
                if (t) {
                  var l = a - t;
                  Math.abs(l) > 10 && (l > 0 ? eX() : eY(), (t = a));
                } else t = a;
              }
            }
            s.addEvent(ey, "touchstart", o),
              s.addEvent(ey, "touchmove", o),
              s.addEvent(ey, "touchend", function e(o) {
                (t = !1),
                  setTimeout(function () {
                    tW = !1;
                  }, 100);
              });
          })()),
        (eh.mouseIsOver = !1),
        (eh.onmouseover = function () {
          this.mouseIsOver = !0;
        }),
        (eh.onmouseout = function () {
          this.mouseIsOver = !1;
        }),
        (eh.onwheel = function (e) {
          eh.mouseIsOver &&
            v &&
            E &&
            (e.preventDefault(), e.deltaY < 0 ? eX() : eY());
        }),
        s.addEvent(document, "keyup", function e(t) {
          "auto" == f &&
            (ey.contains(document.activeElement)
              ? ev.style.setProperty("display", "block")
              : ev.style.setProperty("display", "none"));
        })),
        eL.hover(tx, t3),
        eL.click(tb),
        eD.hover(tw, tk),
        eD.click(t0),
        v && (eL.touchend(tb), eL.touchstart(tb), eD.touchend(t0));
    }
    function oB() {
      if (!(eh.offsetWidth < 1)) {
        tI(!0),
          eP.setSize(eb, ex),
          setTimeout(function () {
            op(ta);
          }, 50);
        var e = K * (eb / ew) * l * 1.25;
        eF &&
          eL &&
          (eF.forEach(function (t) {
            t.attr({ "stroke-width": e }),
              (t.sm.attributes["stroke-width"] = e),
              (t.sm.over_attributes["stroke-width"] =
                t.sm.border_hover_size * (eb / ew) * l * 1.25);
          }),
          eL.forEach(function (e) {
            "image" != eU[e.sm.id].type &&
              ((e.sm.attributes["stroke-width"] =
                eU[e.sm.id].border * (eb / ew) * l * 1.25),
              (e.sm.over_attributes["stroke-width"] =
                eU[e.sm.id].hover_border * (eb / ew) * l * 1.25),
              e.attr({ "stroke-width": e.sm.attributes["stroke-width"] }));
          }),
          e4.forEach(function (e) {
            var t = e.sm.size * (eb / ew) * l * 1.25;
            e.attr({ "stroke-width": t });
          }),
          eE.forEach(function (e) {
            var t = e.sm.size * (eb / ew) * l * 1.25;
            e.attr({ "stroke-width": t });
          })),
          tN();
        var t = eb / 2 > 250 ? eb / 2 : 250;
        tr = et || t;
      }
    }
    function oT(e) {
      var t = y ? tm[-2] : tm[b],
        o = tm[b];
      if ((N || tD(), !e)) {
        if (ov) var r = ov;
        else if (t8) var r = t8;
        else var r = t;
        om(r, (!ov && !t8) || !y);
      }
      if (x && -1 != b) {
        for (id in (ej.show(), N || tD(), tp)) {
          var n = tp[id];
          (!n.sm.region || n.sm.region != b) &&
            x &&
            ((n.sm.hide = !0), n.hide());
        }
        for (var s in td) {
          var a = td[s],
            l = tf[s];
          a.sm.parent &&
            "state" == a.sm.parent.sm.type &&
            (a.sm.parent.sm.region != o.sm.id || !a.sm.parent.sm.region) &&
            ((a.sm.hide = !0), l.hide());
        }
        eE.forEach(function (e) {
          Raphael.isPointInsideBBox(o.sm.bbox, e.sm.bbox.x, e.sm.bbox.y) &&
            e.show();
        }),
          !e && y && om(tm[b]);
        return;
      }
      ej.show(),
        e2.show(),
        eA.show(),
        oi(),
        eE.show(),
        e || !y || ov || t8 || om(tm[b]);
    }
    function oI(e) {
      tS(),
        tq(),
        oy(!0),
        o_(!0),
        ow(!0),
        o0(),
        o$(),
        or(tu, !0),
        oS(),
        oj(!0),
        oB(),
        oT(!0),
        on(tu),
        il(),
        oN(!0),
        tC("refresh_complete", []),
        tF(!0),
        s.isFunction(e) && e();
    }
    function oF(n) {
      var p,
        j,
        B,
        I,
        L,
        M,
        D,
        q,
        H,
        W,
        X,
        Q,
        Z,
        G,
        J,
        K,
        e0,
        e5,
        eZ,
        eU,
        eG,
        eJ,
        eK,
        e9,
        te,
        tt,
        to,
        tn;
      if (
        ((t4 = t6.mapdata),
        (t2 = t6.mapinfo),
        ef && delete window.paper,
        ia(),
        (r = t4.state_specific),
        (a = t4.main_settings),
        (j = (p = document.getElementsByTagName("script"))[p.length - 1].src),
        (B = "no" != a.back_image && a.back_image),
        (e = "no" != a.back_image_url && a.back_image_url),
        (o =
          (t = "default" != a.images_directory && a.images_directory) ||
          j.substring(0, j.lastIndexOf("/countrymap.js") + 1) + "map_images/"),
        !e && B && (e = o + B),
        (ea = "VML" == Raphael.type),
        (el = !!window.document.documentMode),
        (ec = !!s.isMobile.iOS()),
        (em = !!s.isMobile.any()),
        (eu = a.pop_ups ? a.pop_ups : a.popups),
        (e8 =
          void 0 === a.mobile_scaling && "no" != a.mobile_scaling
            ? 1
            : a.mobile_scaling),
        (ep = !1),
        (tT = tB(eu)),
        (g = void 0 === a.div ? "map" : a.div),
        (b = void 0 === a.initial_zoom ? -1 : a.initial_zoom),
        (x = "yes" == a.initial_zoom_solo && -1 != b),
        (y =
          void 0 !== a.fly_in_from && "no" != a.fly_in_from && a.fly_in_from),
        (_ = "responsive" == a.width),
        "0" == ($ = !!a.rotate && a.rotate) && ($ = !1),
        (R = "no" != a.zoom),
        (v = "yes" == a.manual_zoom),
        (f = void 0 === a.keyboard_navigation ? "auto" : a.keyboard_navigation),
        (h = void 0 === a.legend_position ? "inside" : a.legend_position),
        (E = "no" != a.allow_scrolling),
        (P = !!t2.default_regions && !!R && t2.default_regions),
        t4.regions && (P = t4.regions),
        t4.labels && (V = t4.labels),
        (w = !1),
        (k = !1),
        (z = !1),
        (u = !1),
        (function e() {
          if ("continent" != c) return !1;
          var t = 0;
          for (var o in t2.paths) t++;
          return t > 8;
        })())
      ) {
        alert("The continent map can't be used with other data.");
        return;
      }
      tS(),
        (function e() {
          if (
            ((eh = document.getElementById(g)),
            (ey =
              !!document.getElementById(g + "_holder") &&
              document.getElementById(g + "_holder")))
          ) {
            eh.removeChild(ey);
            var t = document.getElementById("tt_sm_" + g);
            t && t.parentNode.removeChild(t);
          }
          (ey = document.createElement("div")),
            (ed = document.createElement("div")),
            (ev = document.createElement("div")),
            (e$ = document.createElement("div")),
            (ef = document.createElement("div")),
            (e_ = document.createElement("div")),
            (eg = document.createElement("div")),
            (ed.id = g + "_outer"),
            (e$.id = g + "_zoom"),
            (ev.id = g + "_access"),
            (e_.id = g + "_legend"),
            (eg.id = g + "_background"),
            (ef.id = g + "_inner"),
            (ey.id = g + "_holder"),
            ey.style.setProperty("position", "relative"),
            ey.setAttribute("tabIndex", 0),
            ey.style.setProperty("outline", "none"),
            ef.style.setProperty("position", "relative"),
            ed.style.setProperty("position", "absolute"),
            e$.style.setProperty("position", "absolute"),
            ev.style.setProperty("position", "absolute"),
            ev.style.setProperty("max-width", "75%"),
            eg.style.setProperty("position", "absolute"),
            e_.style.setProperty(
              "position",
              "inside" == h ? "absolute" : "relative",
            ),
            e$.style.setProperty("z-index", "2"),
            ef.style.setProperty("z-index", "1"),
            ed.style.setProperty("z-index", "2"),
            ev.style.setProperty("z-index", "2"),
            eg.style.setProperty("z-index", "0"),
            eg.style.setProperty("visibility", "hidden"),
            eg.style.setProperty("width", "1000px"),
            eg.style.setProperty("height", "636px"),
            eg.style.setProperty("top", "0"),
            eg.style.setProperty("left", "0"),
            ev.style.setProperty("display", "yes" == f ? "block" : "none"),
            e_.style.setProperty("z-index", "1"),
            eh.appendChild(ey),
            ey.appendChild(e$),
            ey.appendChild(ed),
            ey.appendChild(ev),
            ey.appendChild(ef),
            ey.appendChild(e_),
            ey.appendChild(eg);
        })(),
        tI(),
        (function e() {
          var t = a.backgroundmap_tiles_url;
          if (t) {
            var o = simplemaps_backgroundmap.pmtiles;
            s.new_style(simplemaps_backgroundmap.css);
            var r = t2.initial_view,
              n = tQ(r.x, r.y2),
              l = tQ(r.x2, r.y),
              c = [];
            (c[0] = n.lng), (c[1] = n.lat), (c[2] = l.lng), (c[3] = l.lat);
            var p = [
                [c["0"], c["1"]],
                [c["2"], c["3"]],
              ],
              m = {
                version: simplemaps_backgroundmap.settings.version,
                glyphs: simplemaps_backgroundmap.settings.glyphs,
                sources: { protomaps: { type: "vector" } },
                layers: simplemaps_backgroundmap.settings.layers,
              };
            t &&
              (t.includes("pmtiles")
                ? (m.sources.protomaps.url = "pmtiles://" + t)
                : ((m.sources.protomaps.tiles = []),
                  m.sources.protomaps.tiles.push(t)));
            var u = new o.Protocol();
            maplibregl.addProtocol("pmtiles", u.tile),
              (ol = new maplibregl.Map({
                container: eg.id,
                attributionControl: !1,
                style: m,
              })),
              (t6.maplibre = ol),
              ol.once("load", () => {
                ol.fitBounds(p, { padding: 0, animate: !1 }),
                  eg.style.setProperty("visibility", "visible");
              });
          }
        })(),
        (function e() {
          if (
            ((ej = (eP = Raphael(ef, eb, ex)).set()),
            (eB = eP.rect(e1.x - 2 * ew, e1.y - 2 * ek, 5 * ew, 5 * ek)),
            C)
          ) {
            C.indexOf("/osm/noattr/") > -1 && (m = !0);
            var t = S || e1;
            (eT = eP.image(C, t.x, t.y, t.x2 - t.x, t.y2 - t.y)), ej.push(eT);
          }
          A && (m = !0),
            ej.push(eB),
            ej.transform(eS),
            ej.hide(),
            (eF = eP.set()),
            (e2 = eP.set()),
            (eO = eP.set()),
            (eL = eP.set()),
            (eM = eP.set()),
            (eN = eP.set()),
            (eD = eP.set()),
            (e7 = eP.set()),
            (eA = eP.set()),
            (eE = eP.set()),
            (eI = eP.set()),
            (e4 = eP.set()),
            (e6 = eP.set()).push(eF, eL, ej, eD, eE);
        })(),
        tN(),
        (function e() {
          if (
            ((tM = document.createElement("div")).style.setProperty(
              "overflow",
              "visible",
              "important",
            ),
            tM.style.setProperty("clip-path", "none", "important"),
            tM.style.setProperty("display", "inline", "important"),
            tM.style.setProperty("opacity", "1", "important"),
            tM.style.setProperty("transform", "none", "important"),
            tM.style.setProperty("visibility", "visibible", "important"),
            tM.style.setProperty("z-index", "1", "important"),
            tM.style.setProperty("position", "absolute", "important"),
            tM.style.setProperty("filter", "opacity(1)", "important"),
            tM.style.setProperty("right", "5px", "important"),
            tM.style.setProperty("bottom", "5px", "important"),
            ef.appendChild(tM),
            m)
          ) {
            var t = document.createElement("a");
            (t.href = "https://www.openstreetmap.org/copyright"),
              (t.title = "Background \xa9 OpenStreetMap contributors"),
              (t.innerHTML = "&copy; OSM"),
              t.style.setProperty(
                "font",
                "12px Verdana, Arial, Helvetica, sans-serif",
                "important",
              ),
              t.style.setProperty("cursor", "pointer", "important"),
              t.style.setProperty("float", "right", "important"),
              t.style.setProperty("color", "#000000", "important"),
              t.style.setProperty("text-decoration", "none", "important"),
              t.style.setProperty("marginLeft", ".5em"),
              tM.appendChild(t);
          }
        })(),
        en ||
          (function e() {
            if (!tU) {
              var t = p([
                  "borderRadius",
                  "MozBorderRadius",
                  "WebkitBorderRadius",
                ]),
                o = em ? 2 * er : er,
                r = eb / 2 > 250 ? eb / 2 : 250;
              tr = et || r;
              var n = p(["boxShadow", "MozBoxShadow", "WebkitBoxShadow"]),
                a = n
                  ? n +
                    ": " +
                    3 * ei +
                    "px " +
                    3 * ei +
                    "px " +
                    4 * ei +
                    "px rgba(0,0,0,.5);"
                  : "";
              if ((ei < 0.01 && (a = ""), em)) {
                var l = /(\d+)(px|em|rem)(.*)/g.exec(es);
                es = parseFloat(l[1]) * e8 + l[2] + l[3];
              }
              var c =
                ".tt_mobile_sm{margin-top: .4em;} .tt_sm{" +
                (t ? t + ": " + o + "px;" : "") +
                a +
                "z-index: 1000000; background-color: " +
                ee +
                "; padding: .6em; opacity:" +
                eo +
                "; font: " +
                es +
                "; color: black;} .tt_name_sm{float: left; font-weight: bold} .tt_custom_sm{overflow: hidden;}";
              (c +=
                ".btn_simplemaps{color: black;text-decoration: none;background: #ffffff;display: inline-block;padding: .5em .5em;margin: 0; width: 100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; line-height: 1.43;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;border: 1px solid;border-radius: .3em;}    .btn_simplemaps:hover{  text-decoration: underline;}"),
                (c +=
                  ".xmark_sm{float: " +
                  (ea ? "left" : "right") +
                  "; margin-left: .5em; cursor: pointer; line-height: 0px; width: 1.3em !important;}"),
                s.new_style(c),
                (tU = !0);
            }
            function p(e) {
              for (var t = document.documentElement, o = 0; o < e.length; o++)
                if (e[o] in t.style) {
                  var r = e[o];
                  return (r = (r = (r = (r = (r = r.replace(
                    "borderRadius",
                    "border-radius",
                  )).replace("MozBorderRadius", "-moz-border-radius")).replace(
                    "WebkitBorderRadius",
                    "-webkit-border-radius",
                  )).replace("boxShadow", "box-shadow")).replace(
                    "MozBoxShadow",
                    "-moz-box-shadow",
                  )).replace("WebkitBoxShadow", "-webkit-box-shadow");
                }
            }
          })(),
        (tP =
          ((X = (W = s.findPos(ef))[0]),
          (Q = W[1]),
          (H = 0),
          (Z = 0),
          {
            create: function () {
              (q = document.createElement("div")).setAttribute(
                "id",
                "tt_sm_" + g,
              ),
                q.style.setProperty("position", "absolute"),
                q.style.setProperty("display", "none"),
                ef.appendChild(q),
                (ef.onmousemove = this.pos),
                (q.onmousemove = this.pos);
            },
            show: function (e) {
              !tT &&
                ((u = !1),
                null == q && tP.create(),
                q.style.setProperty("display", "block"),
                q.style.setProperty("z-index", 2),
                q.style.setProperty("max-width", tr + "px"),
                (q.innerHTML = e.sm.content),
                tP.update_pos(e));
            },
            reset_pos: function (e, t, o) {
              void 0 == q && tP.create(), tP.set_pos(0 + t, 0 + e, o);
            },
            update_pos: function (e) {
              tP.set_pos(I, L, e);
            },
            pos: function (e, t) {
              t && ((I = t.u), (L = t.l), (I -= Q), (L -= X));
              var o = ef.getBoundingClientRect();
              o &&
                e &&
                (e.clientX &&
                  ((I = e.clientY - o.top), (L = e.clientX - o.left)),
                e.touches &&
                  e.touches[0] &&
                  ((I = e.touches[0].clientY - o.top),
                  (L = e.touches[0].clientX - o.left))),
                !tT && !w && !u && (!z || !ep) && tP.set_pos(I, L);
            },
            set_pos: function (e, t, o) {
              if (q) {
                if (
                  !(
                    o &&
                    o.sm.on_click &&
                    ("yes" == F || ("auto" == F && eb < 401))
                  ) &&
                  e &&
                  t
                ) {
                  if (((M = 0 + 0.5 * eb), (D = 0 + 0.5 * ex), t > M && e > D))
                    r = 4;
                  else if (t < M && e > D) r = 3;
                  else if (t > M && e < D) r = 2;
                  else var r = 1;
                  "below" == O
                    ? (3 == r && (r = 1), 4 == r && (r = 2))
                    : "above" == O && (1 == r && (r = 3), 2 == r && (r = 4)),
                    1 == r
                      ? (q.style.setProperty("bottom", "auto"),
                        q.style.setProperty("top", e + 5 + "px"),
                        q.style.setProperty("left", t + 5 + 5 + "px"),
                        q.style.setProperty("right", "auto"))
                      : 2 == r
                        ? (q.style.setProperty("bottom", "auto"),
                          q.style.setProperty("top", e + 5 + "px"),
                          q.style.setProperty("right", eb - t + 5 + "px"),
                          q.style.setProperty("left", "auto"))
                        : 3 == r
                          ? (q.style.setProperty("bottom", ex - e + 5 + "px"),
                            q.style.setProperty("top", "auto"),
                            q.style.setProperty("left", t + 5 + 3 + "px"),
                            q.style.setProperty("right", "auto"))
                          : (q.style.setProperty("bottom", ex - e + 5 + "px"),
                            q.style.setProperty("top", "auto"),
                            q.style.setProperty("right", eb - t + 5 + "px"),
                            q.style.setProperty("left", "auto"));
                } else {
                  q.style.setProperty("top", "-100px"),
                    q.style.setProperty("left", "-100px"),
                    q.style.setProperty("bottom", "auto"),
                    q.style.setProperty("right", "auto"),
                    (H = parseInt(q.offsetHeight, 10));
                  var n =
                      eb - (Z = parseInt(q.offsetWidth, 10)) > 0
                        ? 0.5 * (eb - Z)
                        : 0,
                    s = ex - H > 0 ? 0.5 * (ex - H) : 0;
                  q.style.setProperty("top", s + "px"),
                    q.style.setProperty("left", n + "px"),
                    q.style.setProperty("right", "auto"),
                    q.style.setProperty("bottom", "auto");
                }
              }
            },
            hide: function () {
              void 0 != q && q.style.setProperty("display", "none"),
                (W = s.findPos(ef)) && ((X = W[0]), (Q = W[1]));
            },
          })),
        (K = a.navigation_color ? a.navigation_color : "#f7f7f7"),
        (e0 = a.navigation_border_color
          ? a.navigation_border_color
          : "#636363"),
        (e5 = a.navigation_opacity ? a.navigation_opacity : 0.8),
        (eZ = a.arrow_color ? a.arrow_color : K),
        (eU = a.arrow_color_border ? a.arrow_color_border : e0),
        (eG = a.arrow_border_color ? a.arrow_border_color : eU),
        (eJ = void 0 === a.navigation_size ? 40 : a.navigation_size),
        (eK =
          void 0 === a.navigation_size_mobile
            ? e8 * eJ
            : a.navigation_size_mobile),
        (e9 = em ? eK : eJ),
        (te = "yes" == a.arrow_box ? 1 : 0),
        (tt = e9 *= 1),
        (to = 0.1 * e9),
        (tn = e9 / 10),
        (function t() {
          eq = eP.set();
          var o = e9,
            r = e9;
          if (e) {
            var n = new Image();
            (n.onload = function () {
              (G = n.width), (J = n.height), s();
            }),
              (n.src = e);
          } else s();
          function s() {
            if (e) {
              var t = (eR = Raphael(ed, G, J)).image(e, 0, 0, G, J);
              (tt = J), t.attr({ cursor: "pointer" }), eq.push(t), eq.click(tz);
            } else {
              var n = (eR = Raphael(ed, o, r))
                  .path(d.rounded_box)
                  .attr({
                    fill: eZ,
                    "stroke-width": 1,
                    stroke: eG,
                    "stroke-opacity": te,
                    "fill-opacity": 0,
                    cursor: "pointer",
                  }),
                s = eR
                  .path(d.arrow)
                  .attr({
                    stroke: eG,
                    "stroke-width": 1.5,
                    "stroke-opacity": 1,
                    fill: eZ,
                    "fill-opacity": 1,
                    cursor: "pointer",
                  });
              (eq = eP.set()).push(n, s),
                eq.transform("S" + tn + "," + tn + ",0,0 T0,0");
            }
            N || tD(),
              ed.style.setProperty("left", to + "px"),
              ed.style.setProperty("top", to + "px"),
              v &&
                (function e() {
                  eW = Raphael(e$, e9, 2 * e9 + to);
                  var t = d.plus,
                    o = d.minus,
                    r = d.rounded_box,
                    n = eW
                      .path(r)
                      .attr({
                        fill: K,
                        "stroke-width": 1,
                        stroke: e0,
                        "stroke-opacity": 1,
                        "fill-opacity": e5,
                        cursor: "pointer",
                      }),
                    s = eW
                      .path(t)
                      .attr({
                        "stroke-width": 0,
                        "stroke-opacity": 0,
                        fill: e0,
                        "fill-opacity": 1,
                        opacity: 1,
                        cursor: "pointer",
                      });
                  (eH = eP.set()).push(n, s);
                  var a = "S" + tn + "," + tn + ",0,0 T0,0";
                  eH.transform(a);
                  var l = eW
                      .path(r)
                      .attr({
                        fill: K,
                        "stroke-width": 1,
                        stroke: e0,
                        "stroke-opacity": 1,
                        "fill-opacity": e5,
                        cursor: "pointer",
                      }),
                    c = eW
                      .path(o)
                      .attr({
                        "stroke-width": 0,
                        "stroke-opacity": 0,
                        fill: e0,
                        "fill-opacity": 1,
                        opacity: 1,
                        cursor: "pointer",
                      });
                  (eV = eP.set()).push(l, c);
                  var a = "S" + tn + "," + tn + ",0,0 T0," + (e9 + to);
                  function p(e, t) {
                    if ((void 0 === t && (t = "z"), k && "region" != k.sm.type))
                      t3.call(k, !0, function () {
                        (k = !1), p(e);
                      });
                    else {
                      if (
                        "z" == t &&
                        !(function e(t) {
                          var o = tu.sm.zooming_dimensions.w / t,
                            r = t < 1;
                          if (-1 != b && ("manual" == tu.sm.type || x)) {
                            var n = tm[b].sm.zooming_dimensions.w;
                            if (r && o > n - 1 && (od(tu, tm[b]) || x))
                              return om(tm[b]), !1;
                          }
                          return (
                            !r ||
                            !(o > tm[-1].sm.zooming_dimensions.w - 1) ||
                            (x || om(tm[-1]), !1)
                          );
                        })(e)
                      )
                        return;
                      var o = { sm: { type: "manual", zp: 1 } };
                      ts &&
                        (((tu = {
                          sm: { type: "manual", zp: 1 },
                        }).sm.zooming_dimensions = ta),
                        (tu.sm.bbox = {
                          x: ta.x / e3,
                          y: ta.y / e3,
                          width: ta.w / e3,
                          height: ta.h / e3,
                        }));
                      var r = (function e(t, o) {
                        var r = tu.sm.zooming_dimensions.w,
                          n = tu.sm.zooming_dimensions.h,
                          s = tu.sm.zooming_dimensions.x,
                          a = tu.sm.zooming_dimensions.y;
                        if ("x" == o)
                          var s =
                            tu.sm.zooming_dimensions.x +
                            tu.sm.zooming_dimensions.w * t;
                        else if ("y" == o)
                          var a =
                            tu.sm.zooming_dimensions.y +
                            tu.sm.zooming_dimensions.h * t;
                        else
                          var r = tu.sm.zooming_dimensions.w / t,
                            n = tu.sm.zooming_dimensions.h / t,
                            s =
                              tu.sm.zooming_dimensions.x +
                              (tu.sm.zooming_dimensions.w - r) / 2,
                            a =
                              tu.sm.zooming_dimensions.y +
                              (tu.sm.zooming_dimensions.h - n) / 2;
                        var l = r / (ew * e3);
                        return { x: s, y: a, w: r, h: n, r: l };
                      })(e, t);
                      if (!r) return;
                      (o.sm.zooming_dimensions = r), om(o);
                    }
                  }
                  eV.transform(a),
                    e$.style.setProperty("top", tt + 2 * to + "px"),
                    e$.style.setProperty("left", to + "px"),
                    (eV = eP.set()).push(l, c),
                    (eX = function () {
                      p(T);
                    }),
                    (eQ = function (e, t) {
                      p(e, t);
                    }),
                    (eY = function () {
                      p(1 / T);
                    }),
                    (t6.zoom_in = eX),
                    (t6.zoom_out = eY),
                    eH.click(eX),
                    eV.click(eY),
                    eH.touchend(eX),
                    eV.touchend(eY);
                })();
          }
        })(),
        tq(),
        o$(),
        oy(),
        o_(),
        setTimeout(function () {
          var e;
          ow(),
            o0(),
            (function e() {
              var t = t4.lines ? t4.lines : t4.borders;
              if (t) {
                for (var o in t) {
                  var r = t[o],
                    n = ti[o],
                    s = n.size * (eb / ew) * l * 1.25,
                    a = !1;
                  if (n.origin_location && n.destination_location) {
                    var c = t$[n.origin_location].sm.point0,
                      p = t$[n.destination_location].sm.point0;
                    if (
                      ((a =
                        "M " + c.x + "," + c.y + " " + p.x + "," + p.y + " Z"),
                      n.angle)
                    ) {
                      var m = parseFloat(n.angle);
                      if (m > -61 && m < 61) {
                        c.x <= p.x && (m *= -1);
                        var u = Raphael.transformPath(
                            a,
                            "R" + m + "," + c.x + "," + c.y + "S2",
                          ).toString(),
                          d = Raphael.transformPath(a, "R-90S2").toString(),
                          f = Raphael.pathIntersection(u, d)[0];
                        a =
                          "M " +
                          c.x +
                          "," +
                          c.y +
                          " C" +
                          c.x +
                          "," +
                          c.y +
                          "," +
                          f.x +
                          "," +
                          f.y +
                          "," +
                          p.x +
                          "," +
                          p.y;
                      }
                    }
                  }
                  var h = a || r.path,
                    y = eP.path(h);
                  y.transform(eC),
                    y.attr({
                      stroke: n.color,
                      fill: "none",
                      cursor: "pointer",
                      "stroke-dasharray": [n.dash],
                      "stroke-width": s,
                      "stroke-linejoin": "round",
                      "stroke-miterlimit": 4,
                    }),
                    (y.sm = {}),
                    (y.sm.size = n.size),
                    (y.sm.level = n.level),
                    (y.sm.bbox = y.getBBox(!0)),
                    ea || y.node.setAttribute("class", "sm_line sm_line_" + o),
                    eE.push(y);
                }
                eE.hide();
              }
            })(),
            tF(),
            oe(),
            oS(),
            tP.create(),
            (tw = function () {
              this.sm.parent && tx.call(this.sm.parent);
            }),
            (tk = function () {
              this.sm.parent && t3.call(this.sm.parent);
            }),
            (t0 = function (e) {
              this.sm.parent && tb.call(this.sm.parent, e);
            }),
            (t_ = function (e, t) {
              if (e.sm.pulse || t) {
                var o = e.sm.shape_type;
                if ("location" == e.sm.type && "image" != o && !(ez < 0.05)) {
                  var r = e.clone();
                  r.insertBefore(e);
                  var n = 1 * e.sm.pulse_size,
                    s = {
                      "stroke-width": 4 * e.attrs["stroke-width"],
                      "stroke-opacity": 0,
                    };
                  r.attr({ "fill-opacity": 0, stroke: e.sm.pulse_color });
                  var a = function () {
                      r.remove();
                    },
                    l = e.sm.scale ? ez : 1,
                    c = (n - 1) * 0.5 * e.sm.size * l * e3,
                    p =
                      "bottom-center" == e.sm.position
                        ? ox(e, l * e3 * n, "0," + c)
                        : ox(e, l * e3 * n);
                  (s.transform = p),
                    r.animate(s, 1e3 * e.sm.pulse_speed, "ease-out", a);
                }
              }
            }),
            (tg = function (e) {
              if (!ea || !el)
                for (
                  var t = Array.isArray(e) ? e : [e], o = 0;
                  o < t.length;
                  o++
                ) {
                  var r = tp[t[o]];
                  if (!r || !r.sm || ez < 0.05) return;
                  var n = r.clone(),
                    s = 1 * r.sm.pulse_size,
                    a = {
                      "stroke-width":
                        4 *
                        (r.attrs["stroke-width"] ? r.attrs["stroke-width"] : 1),
                      "stroke-opacity": 0,
                      "fill-opacity": 0,
                    };
                  n.attr({ "fill-opacity": 0, stroke: r.sm.pulse_color });
                  var l = function () {
                      n.remove();
                    },
                    c = r.sm.bbox;
                  (r.sm.x = (c.x2 + c.x) / 2),
                    (r.sm.y = (c.y2 + c.y) / 2),
                    (r.sm.rotate = 0);
                  var p = ox(r, s, "0,0");
                  (a.transform = eC + p),
                    r.sm.bbox,
                    n.animate(a, 1e3 * r.sm.pulse_speed, "ease-out", l);
                }
            }),
            (tx = function () {
              if (
                (tN(),
                oN(),
                oQ(),
                (this.id || "set" != !this.type) && !o6 && !oK)
              ) {
                var e = ok(this);
                if (e.sm.on_click) var t = !0;
                if (((tT = e.sm.popup_off), !tV && !tW && !tH && (!z || !ep))) {
                  if (o2 && !w) return !1;
                  if (((o2 = this), e)) {
                    if (
                      ((function e(t) {
                        if (t.sm.labels) {
                          var o;
                          t.sm.labels.forEach(function (e) {
                            t.sm.inactive
                              ? e.attr({ cursor: "default" })
                              : e.attr({ cursor: "pointer" });
                          });
                        }
                      })(e),
                      !e.sm.inactive)
                    ) {
                      if (
                        ((function e(t) {
                          if ("state" == t.sm.type && t.sm.emphasizable) {
                            var o = oC[t.sm.level.toString()];
                            o &&
                              ((o6 = !0),
                              t.insertBefore(o[o.length - 1]),
                              setTimeout(function () {
                                o6 = !1;
                              }, 1));
                          }
                        })(e),
                        oD(e),
                        t)
                      ) {
                        if (!z) {
                          if (
                            (e.stop(),
                            ea &&
                              "location" == e.sm.type &&
                              "image" == e.sm.shape_type)
                          )
                            return;
                          e.sm.ignore_hover || (oz(e, "over"), t_(e)),
                            oP(e, "over");
                        }
                      } else {
                        if (
                          (tP.show(e),
                          e.stop(),
                          ea &&
                            "location" == e.sm.type &&
                            "image" == e.sm.shape_type)
                        )
                          return;
                        e.sm.ignore_hover ||
                          (oz(e, "over"), oP(e, "over"), t_(e), tg(e));
                      }
                    }
                  }
                }
              }
            }),
            (t3 = function (e, t) {
              if (
                ((t && "function" == typeof t) || (t = !1),
                !tH && !oK && ((o2 = !1), this.id || "set" != !this.type))
              ) {
                var o = ok(this);
                if (o && o.sm && !o.sm.inactive) {
                  if ((oR(o), ep)) (z && !0 !== e) || (o4(o, t), (o7 = o));
                  else {
                    if ((tP.hide(), o1(o))) {
                      if (tH) return !1;
                      o.sm.ignore_hover || oz(o, "out", !0),
                        oz(o, "adjacent", !0),
                        oP(o, "out", !0);
                    } else {
                      if (
                        ea &&
                        "location" == o.sm.type &&
                        "image" == o.sm.shape_type
                      )
                        return;
                      o.sm.ignore_hover || oz(o, "out", !0), oP(o, "out");
                    }
                    o4(o, t);
                  }
                }
              }
            }),
            (e = !1),
(tb = function (t) {
  if (!tH && !tV && !tW) {
    var o = ok(this);
    if (
      o &&
      o.sm &&
      !o.sm.inactive &&
      ((o.sm.on_click && !o.sm.popup_off) || !e)
    ) {
      tN();
      var r = !!t && "touchstart" == t.type;
      if (
        (em &&
          !r &&
          ((e = !0),
          setTimeout(function () {
            e = !1;
          }, 500)),
        e || oa(),
        oH(o, t),
        !t6.ignore_clicks)
      ) {
        if (
          ((ep = o.sm.on_click),
          !t ||
            ((!z || "touchend" != t.type) &&
              (z || "touchstart" != t.type)))
        ) {
          // Always show popup (do not zoom)
          k != o &&
            k &&
            ((n = o),
            (s = k),
            "state" != n.sm.type ||
              "region" != s.sm.type ||
              s.sm.id != n.sm.region) &&
            o4(k),
            t && tP.pos(t),
            tP.show(o),
            (z = !0),
            oP(o, "over"),
            t_(o),
            (ea &&
              "location" == o.sm.type &&
              "image" == o.sm.shape_type) ||
              o.sm.ignore_hover ||
              o.attr(o.sm.over_attributes),
            (k = o);
          var n,
            s,
            a = document.getElementById("xpic_sm_" + g);
          a &&
            (a.onclick = function () {
              return (
                tP.hide(),
                (z = !1),
                k.sm && t3.call(k),
                (ep = !1),
                tC("close_popup", []),
                !1
              );
            }),
            oq(o, t);
        } else {
          var l = o.sm.url;
          if ("" != l && !it) {
            var c = "javascript" == l.substring(0, 10);
            !U || c
              ? c
                ? (window.location.href = l)
                : (window.top.location.href = l)
              : (window.open(l, "_blank"), tP.hide());
          }
          oq(o, t), o4(o);
        }
      }
    }
  }
}),
            (t1 = function (e) {
              if (
                (void 0 === e && (e = !1),
                tC("back", []),
                ("out" == tu.sm.type || ("region" == tu.sm.type && x)) && N)
              )
                window.location.href = "javascript:" + N;
              else if (Y && "state" == tu.sm.type && tu.sm.region)
                k
                  ? t3.call(k, !0, function () {
                      om(tm[tu.sm.region]);
                    })
                  : om(tm[tu.sm.region], !1, e);
              else {
                var t = od(tu, tm[b]),
                  o = "manual" == tu.sm.type && t ? tm[b] : tm[-1];
                k && k.sm && "region" != k.sm.type
                  ? t3.call(k, !0, function () {
                      om(o);
                    })
                  : om(o, !1, e);
              }
            }),
            (tz = function () {
              t1();
            }),
            oj(),
            oT(),
            (function e() {
              ev.style.setProperty("right", "0em"),
                ev.style.setProperty("top", "0em");
              var t =
                  void 0 === a.navigate_title ? "Navigate" : a.navigate_title,
                o = void 0 === a.keyboard_omit ? "" : a.keyboard_omit;
              if (!(o.indexOf("navigat") > -1)) {
                var r = document.createElement("select");
                r.options.add(new Option(t, "-1")),
                  r.options.add(new Option("Back", "back")),
                  v &&
                    (r.options.add(new Option("Zoom in", "in")),
                    r.options.add(new Option("Zoom out", "out")),
                    r.options.add(new Option("Left", "left")),
                    r.options.add(new Option("Right", "right")),
                    r.options.add(new Option("Up", "up")),
                    r.options.add(new Option("Down", "down"))),
                  r.style.setProperty("margin-right", ".5em"),
                  r.style.setProperty("margin-top", ".5em"),
                  r.style.setProperty("float", "left"),
                  ev.appendChild(r),
                  (r.onchange = function (e) {
                    if ("-1" == this.value) return !1;
                    "back" == this.value && t1(),
                      "out" == this.value && eY(),
                      "in" == this.value && eX(),
                      "left" == this.value && eQ("-.25", "x"),
                      "right" == this.value && eQ(".25", "x"),
                      "up" == this.value && eQ("-.25", "y"),
                      "down" == this.value && eQ(".25", "y"),
                      setTimeout(function () {
                        r.value = "-1";
                      }, 1e3);
                  });
              }
              var n = void 0 === a.states_title ? "States" : a.states_title,
                l = void 0 === a.regions_title ? "Regions" : a.regions_title,
                c = {
                  state: { title: n, array: tp },
                  location: {
                    title:
                      void 0 === a.locations_title
                        ? "Locations"
                        : a.locations_title,
                    array: t$,
                  },
                  region: { title: l, array: tm },
                };
              for (var p in c) {
                var m = c[p],
                  u = o.indexOf(p) > -1,
                  d = Object.size(m.array);
                if (!(d < 1) && (!(d < 2) || "region" != p) && !u) {
                  var f = document.createElement("select");
                  f.options.add(new Option(m.title, "-1")),
                    f.style.setProperty("margin-right", ".5em"),
                    f.style.setProperty("margin-top", ".5em"),
                    f.style.setProperty("float", "left");
                  var h = [];
                  for (var y in m.array) h.push(m.array[y]);
                  for (
                    var $ = h.sort(function (e, t) {
                        return e.sm.name > t.sm.name ? 1 : -1;
                      }),
                      y = 0;
                    y < $.length;
                    y++
                  ) {
                    var _ = $[y];
                    "out" != _.sm.type &&
                      !_.sm.inactive &&
                      !_.sm.hide &&
                      f.options.add(new Option(_.sm.name, _.sm.id));
                  }
                  (f.onchange = s.callback_closure(
                    { entry: m, dropdown: f },
                    function (e) {
                      var t = e.dropdown,
                        o = e.entry;
                      if ("-1" == t.value) return !1;
                      var r,
                        n = o.array[t.value];
                      tO(n.sm.type, n.sm.id);
                    },
                  )),
                    ev.appendChild(f);
                }
              }
            })(),
            il(),
            tC("complete", []),
            s.isFunction(n) && n(),
            oN();
        }, 1);
    }
    var oO = !1,
      oL = function (e, t) {
        if (!oO || e || t) {
          oO = !0;
          var o = function (t) {
            var o = el
                ? event.clientX + document.documentElement.scrollLeft
                : t.pageX,
              r = el
                ? event.clientY + document.documentElement.scrollTop
                : t.pageY,
              n = s.findPos(ef),
              a = n[0],
              l = n[1],
              c = tu.sm.zooming_dimensions,
              p = (c.r * eb) / e3,
              m = (c.r * ex) / e3,
              u = c.x / e3 + (p * (o - a)) / eb,
              d = c.y / e3 + (m * (r - l)) / ex,
              f =
                "You clicked on\nx: " +
                (u = Math.round(1e5 * u) / 1e5) +
                ",\ny: " +
                (d = Math.round(1e5 * d) / 1e5) +
                ",";
            e && console.log(f), tC("click_xy", [{ x: u, y: d }]);
          };
          t || eF.click(o), eD.click(o);
        }
      },
      oM = function () {
        oL(!0);
      },
      oN = function (e) {
        (t7.click_xy || tE.click_xy.length > 0) && oL(!1, e);
      },
      oD = function (e) {
        var t = e.sm.type;
        "state" == t && tC("over_state", [e.sm.id]),
          "location" == t && tC("over_location", [e.sm.id]),
          "region" == t && tC("over_region", [e.sm.id]);
      },
      oR = function (e) {
        var t = e.sm.type;
        "state" == t && tC("out_state", [e.sm.id]),
          "location" == t && tC("out_location", [e.sm.id]),
          "region" == t && tC("out_region", [e.sm.id]);
      },
      oq = function (e, t) {
        var o = e.sm.type;
        "state" == o && tC("click_state", [e.sm.id, t]),
          "region" == o && tC("click_region", [e.sm.id, t]),
          "location" == o && tC("click_location", [e.sm.id, t]);
      },
      oH = function (e, t) {
        var o = e.sm.type;
        "state" == o && tC("preclick_state", [e.sm.id, t]),
          "region" == o && tC("preclick_region", [e.sm.id, t]),
          "location" == o && tC("preclick_location", [e.sm.id, t]);
      },
      oV = function (e, t) {
        var o = e.sm.type;
        "state" == o && tC("zoomable_click_state", [e.sm.id, t]),
          "region" == o && tC("zoomable_click_region", [e.sm.id, t]);
      };
    function oW(e, t) {
      om(tm[e], !1, t);
    }
    function oX(e, t) {
      om(tp[e], !1, t);
    }
    function oY(e, t, o) {
      void 0 === t && (t = 4), void 0 === o && (o = function () {});
      var r = { sm: { type: "manual", zp: t } },
        n = t$[e],
        s = n.sm.size * e3 * t,
        a = (s * ek) / ew,
        l = n.sm.x - 0.5 * s,
        c = n.sm.y - 0.5 * a,
        p = s / (ew * e3);
      (r.sm.zooming_dimensions = { x: l, y: c, w: s, h: a, r: p }),
        om(r, !1, function () {
          o(), tR();
        });
    }
    function oQ() {
      if ((o2 && t3.call(o2), w)) (w = !1), !ep && (tP.hide(), (z = !1));
    }
    function oZ(e, t, o) {
      if ((void 0 === o && (o = function () {}), "state" == e)) var r = tp[t];
      else if ("region" == e) var r = tm[t];
      else var r = t$[t];
      var n = r.sm.on_click,
        s = tu.sm.zooming_dimensions;
      if ("location" != e) {
        var a = r.sm.bbox,
          l = (a.x + a.x2) * 0.5,
          c = (a.y + a.y2) * 0.5;
        (l *= e3), (c *= e3);
      } else
        var l = r.sm.x,
          c = r.sm.y;
      var p = (l - s.x) / ez,
        m = (c - s.y) / ez,
        d = p > 1.1 * eb || m > 1.1 * ex,
        f = !r.sm.region && "region" == t6.zoom_level;
      return d || f
        ? oW("-1", function () {
            oZ(e, t, o);
          })
        : r.sm.region && "out" == t6.zoom_level
          ? oW(r.sm.region, function () {
              oZ(e, t, o);
            })
          : ((w = !0),
            n ? tb.call(r) : tx.call(r),
            tP.reset_pos(p, m, r),
            (u = !0),
            (w = !1),
            o(),
            !0);
    }
    function oU(e) {
      var t = t$[e];
      t && t_(t, !0);
    }
    function oG() {
      tP.hide(), (z = !1), ep ? t3.call(k) : o2 && t3.call(o2);
    }
    function oJ(e, t) {
      tt(e);
      var o = tp[e].sm.labels;
      tl(e);
      for (var r = 0; r < o.length; r++) {
        var n = o[r].sm.id;
        to(n), th(n);
      }
      or(tu, !0), s.isFunction(t) && t();
    }
    var oK = !1;
    function o9() {
      (oK = !0), tP.hide();
    }
    var oK = !1;
    function ie() {
      oK = !1;
    }
    var it = !1;
    function io() {
      it = !0;
    }
    var it = !1;
    function ii() {
      it = !1;
    }
    function ir(e) {
      t1(e);
    }
    function is(e) {
      tg(e);
    }
    function ia() {
      (t6.calibrate = ou),
        (t6.get_xy = oM),
        (t6.proj = tZ),
        (t6.inverse_proj = tQ),
        (t6.load = oF),
        (t6.region_zoom = oW),
        (t6.state_zoom = oX),
        (t6.zoom_in = !1),
        (t6.zoom_out = !1),
        (t6.location_zoom = oY),
        (t6.zoom_to_popup = tO),
        (t6.back = ir),
        (t6.popup = oZ),
        (t6.pulse = oU),
        (t6.pulse_state = is),
        (t6.popup_hide = oG),
        (t6.zoom_level = "out"),
        (t6.ignore_clicks = !1),
        (t6.zoom_level_id = !1),
        (t6.disable_urls = io),
        (t6.enable_urls = ii),
        (t6.disable_popups = o9),
        (t6.enable_popups = ie),
        (t6.refresh = oI),
        (t6.refresh_state = oJ),
        (t6.loaded = !0),
        (t6.resize = oB),
        (t6.trial = p),
        (t6.zoom_ratio = 1);
    }
    function il() {
      (t6.states = tp),
        (t6.regions = tm),
        (t6.locations = t$),
        (t6.labels = td),
        (t6.tooltip = tP);
    }
    if ((ia(), tA)) {
      var ic = function () {
        setTimeout(function () {
          oF();
        }, 1);
      };
      s.load_script(tA, ic);
    } else oF();
  }
  (window[e] = f),
    n.docReady(function () {
      if (
        ((function e(t, o) {
          var r = f.hooks[t];
          r && r.apply(null, o);
          for (var n = f.plugin_hooks[t], s = 0; s < n.length; s++) {
            var r = n[s];
            r && r.apply(null, o);
          }
        })("ready"),
        !window[e].loaded)
      )
        for (var t = 0; t < u.length; t++) {
          var o = u[t];
          o &&
            o.mapdata &&
            "no" != o.mapdata.main_settings.auto_load &&
            (function (e) {
              setTimeout(function () {
                e.load();
              }, 1);
            })(o);
        }
    }),
    u.push(f);
})("simplemaps_worldmap");
