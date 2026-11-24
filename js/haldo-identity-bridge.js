
/* ============================================================
   HALDO IDENTITY BRIDGE
   Version: 1.0.0
   Zweck:
   - Living Identity Ereignisse vereinheitlichen
   - avatar und avatarMode synchronisieren
   - Emotionen und Aktivitätszustände weitergeben
   - Vorhandene APIs erhalten
   - Keine zweite Sprachsteuerung erzeugen
   ============================================================ */

(function (window, document) {
    "use strict";

    window.HalDo = window.HalDo || {};

    const HD = window.HalDo;

    if (HD.IdentityBridge) {
        console.warn("[HalDo Bridge] Bereits geladen.");
        return;
    }

    const VERSION = "1.0.0";

    const AVATAR_MAP = {
        human: "human",
        android: "android",
        cyborg: "cyborg",
        robot: "robot",
        hologram: null
    };

    let installed = false;

    function emit(name, detail) {
        window.dispatchEvent(
            new CustomEvent(name, {
                detail: detail || {}
            })
        );
    }

    function getIdentity() {
        return HD.LivingIdentity || null;
    }

    function getSettings() {
        const identity = getIdentity();

        if (!identity ||
            typeof identity.getSettings !== "function") {
            return null;
        }

        return identity.getSettings();
    }

    function publishIdentity() {
        const settings = getSettings();

        if (!settings) return false;

        const avatar = settings.avatar || "cyborg";

        emit("haldo:identity:bridge", {
            ...settings,
            avatarMode: AVATAR_MAP[avatar] || null,
            source: "living-identity"
        });

        return true;
    }

    function wrapMethod(api, methodName, after) {
        const original = api[methodName];

        if (typeof original !== "function") return;

        if (original.__haldoBridgeWrapped) return;

        function wrappedMethod() {
            const result = original.apply(this, arguments);

            if (result !== false) {
                try {
                    after.apply(this, arguments);
                } catch (error) {
                    console.error(
                        "[HalDo Bridge] " + methodName,
                        error
                    );
                }
            }

            return result;
        }

        wrappedMethod.__haldoBridgeWrapped = true;
        wrappedMethod.__haldoOriginal = original;

        api[methodName] = wrappedMethod;
    }

    function install() {
        if (installed) return true;

        const identity = getIdentity();

        if (!identity) {
            console.warn(
                "[HalDo Bridge] Living Identity noch nicht geladen."
            );
            return false;
        }

        wrapMethod(
            identity,
            "setAvatarMode",
            publishIdentity
        );

        wrapMethod(
            identity,
            "setEmotion",
            function (emotion) {
                emit("haldo:identity:emotion", {
                    emotion: emotion
                });

                publishIdentity();
            }
        );

        wrapMethod(
            identity,
            "setActivity",
            function (activity) {
                emit("haldo:identity:activity", {
                    activity: activity
                });

                publishIdentity();
            }
        );

        wrapMethod(
            identity,
            "applySettings",
            publishIdentity
        );

        /* Bestehende Identitätsereignisse ergänzen.
           Das Originalereignis wird NICHT erneut ausgelöst. */

        window.addEventListener(
            "haldo:identity:changed",
            function (event) {
                const detail = event.detail || {};

                emit("haldo:identity:bridge", {
                    ...detail,
                    avatarMode:
                        AVATAR_MAP[detail.avatar] || null,
                    source: "living-identity-event"
                });
            }
        );

        installed = true;

        publishIdentity();

        console.info(
            "[HalDo Bridge] Version " + VERSION + " bereit."
        );

        emit("haldo:identity:bridge:ready", {
            version: VERSION
        });

        return true;
    }

    HD.IdentityBridge = {
        version: VERSION,
        install: install,
        sync: publishIdentity,
        getSettings: getSettings,
        getAvatarMap: function () {
            return { ...AVATAR_MAP };
        },
        getStatus: function () {
            return {
                installed: installed,
                identityAvailable: !!getIdentity(),
                human3DAvailable: !!HD.Human3D
            };
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            install,
            { once: true }
        );
    } else {
        install();
    }

})(window, document);
