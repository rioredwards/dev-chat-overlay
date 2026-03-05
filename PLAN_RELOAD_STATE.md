## Reload State MVP Plan

1. Add an optional `appId` to widget config so hosts can provide a stable storage scope without changing existing integrations.
2. Create a small storage helper in the widget package to:
   - build a scoped `localStorage` key (`appId` first, `hostname` fallback)
   - safely read/write drawer open state with browser and `localStorage` guards
3. Update `DevChatOverlay` to initialize `open` from storage and persist changes on toggle.
4. Keep first-load behavior unchanged by defaulting to `false` when no prior value exists.
5. Add a concise manual verification section to `README.md` since no widget UI test harness is currently present.
