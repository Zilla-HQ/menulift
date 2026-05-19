"use client";

import * as React from "react";

/**
 * PostHog client-side capture. Loads the snippet, identifies pageviews,
 * and exposes window.posthog for custom events.
 *
 * No-op unless NEXT_PUBLIC_POSTHOG_KEY is set, so unconfigured environments
 * stay clean.
 */
export function PostHogProvider() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  React.useEffect(() => {
    if (!apiKey) return;
    if (typeof window === "undefined") return;
    const w = window as unknown as { posthog?: unknown };
    if (w.posthog) return;

    // Standard PostHog snippet, inlined and Next.js-friendly. Loads
    // posthog-js from the configured host on first paint, then captures
    // a $pageview event automatically.
    /* eslint-disable */
    // @ts-ignore
    !(function (t: any, e: any) {
      var o: any, n: any, p: any, r: any;
      // @ts-ignore
      e.__SV ||
        // @ts-ignore
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i: any, s: any, a: any) {
          function g(t: any, e: any) {
            var o = e.split(".");
            2 == o.length && ((t = t[o[0]]), (e = o[1])),
              (t[e] = function () {
                t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
              });
          }
          ((p = t.createElement("script")).type = "text/javascript"),
            (p.crossOrigin = "anonymous"),
            (p.async = !0),
            (p.src =
              s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") +
              "/static/array.js"),
            (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
          var u: any = e;
          for (
            void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
              u.people = u.people || [],
              u.toString = function (t: any) {
                var e = "posthog";
                return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
              },
              u.people.toString = function () {
                return u.toString(1) + ".people (stub)";
              },
              o =
                "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(
                  " ",
                ),
              n = 0;
            n < o.length;
            n++
          )
            g(u, o[n]);
          e._i.push([i, s, a]);
        }),
        (e.__SV = 1));
    })(document, (window as any).posthog || []);
    // @ts-ignore
    (window as any).posthog.init(apiKey, {
      api_host: apiHost,
      person_profiles: "identified_only",
      capture_pageview: true,
    });
    /* eslint-enable */
  }, [apiKey, apiHost]);

  return null;
}
