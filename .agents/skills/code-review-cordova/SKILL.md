---
name: code-review-cordova
description: Performs strict code reviews on Cordova plugin projects covering TypeScript, the Kotlin (Android) and Swift (iOS) native bridges, and plugin.xml. Focuses on optimal code, readability, maintainability, deduplication, single-responsibility, straightforward control flow, Cordova best practices, the rule that native layers must not invent hardcoded fallbacks for values the TypeScript layer or platform SDK already owns, alignment of identifiers and API surface across TypeScript/Kotlin/Swift (especially action strings, callbackId persistence, getThreatChannelData platform asymmetry, and EventIdentifiers), and explicit documentation of platform-specific features. Use when the user asks to "review PR", "do a code review", "review this code", "code review for PR#N", or otherwise requests review of changes in a Cordova plugin — including its bundled output (`www/dist/`) and native source under `src/android/` and `src/ios/`.
---

# Code Review (Cordova)

Strict, opinionated code review for Cordova plugin codebases with Kotlin + Swift bridges. Optimised for catching the kinds of issues that survive linters and tests but degrade a codebase over time.

## Review priorities, in order

1. **Correctness & contract** — bugs, breaking changes, public-API violations, SemVer; identifiers and API surface aligned across TypeScript, Kotlin, Swift, and `plugin.xml`.
2. **Native-layer cleanliness** — no hardcoded fallbacks for values owned by TypeScript or the platform SDK; no behaviour duplicated across language boundaries; platform-specific features explicitly documented.
3. **Single responsibility** — each function, class, and file does one thing.
4. **Deduplication (DRY)** — repeated parsing, serialisation, and validation patterns get extracted.
5. **Readability** — naming, argument styles, generated-vs-handwritten boundaries, no surprises.
6. **Maintainability** — built files untouched, defaults documented in one place, tests for new public surface.
7. **Cordova / TypeScript best practices** — `const`, `@deprecated` discipline, `null` vs `undefined`, strict tsconfig honoured.
8. **Polish** — JSDoc style, example brevity, changelog accuracy, PR description present.

## Workflow

### 1. Gather context

If the user references a GitHub PR by number:

```bash
gh pr view <N> --json title,body,author,state,baseRefName,headRefName,additions,deletions,changedFiles,files,url
gh pr diff <N>
git log <base>..<head> --oneline
```

If the changes are local:

```bash
git diff <base>..HEAD --stat
git diff <base>..HEAD
```

Always read the full file (not only the diff) for any non-trivial change — especially `plugin.xml`, `TalsecPlugin.swift`, `TalsecPlugin.kt`, and the TypeScript channel files in `www/src/channels/`.

### 2. Classify every changed file

Each file falls into exactly one of these buckets, and the bucket determines what's acceptable:

| Bucket | Examples | Rule |
|---|---|---|
| Hand-written TypeScript | `www/src/` | Full review applies. |
| Bundled JS output | `www/dist/talsec.js`, `www/dist/types/**/*.d.ts` | **Must not be hand-edited.** Regenerate via `npm run build` (esbuild). |
| Hand-written native | `src/android/**/*.kt`, `src/ios/**/*.swift` | Full review applies, with extra scrutiny on the bridge layer. |
| Plugin manifest | `plugin.xml` | Changes must be reflected in action strings, feature names, and TS `cordova.exec` calls. |
| Build / config | `package.json`, `tsconfig.json`, `scripts/` | Verify version bumps follow SemVer; confirm SDK/binary updates match changelog. |
| Docs / release | `CHANGELOG.md`, `README.md` | Verify claims match the diff (e.g. SDK versions, breaking-change list, public-API additions). |

### 3. Run the checklist below and produce the report

---

## Hard rules — block the merge

### 1. No hand-edits to bundled files

`www/dist/` (built by esbuild from `www/src/talsec.ts`) must be touched only by `npm run build`.

Red flags:
- Behaviour-changing edits inside `www/dist/talsec.js` that differ from what `npm run build` would produce.
- A `// eslint-disable` or `// @ts-ignore` directive added to a file inside `www/dist/`.
- Type declaration files in `www/dist/types/` edited directly instead of via `www/src/`.

Action: ask the author to run `npm run build` and commit the clean output.

### 2. SemVer must match the change

A breaking public-API change requires a major version bump. "Public" includes anything exported from `www/src/talsec.ts` and anything that changes the wire format with the native side, including `cordova.exec` action strings, callback payload keys, and `plugin.xml` feature/action names.

Common breaks to flag:
- Renamed or retyped fields on exported TypeScript types or interfaces.
- Renamed `cordova.exec` action strings.
- Removed or repurposed enum variants that map to native callback codes.
- Changed required/optional status on config parameters.

If `CHANGELOG.md` claims SemVer adherence and the bump doesn't match the change, call it out with the affected symbols and the recommended version.

### 3. No hardcoded fallbacks in the native layer

The native layer (Kotlin / Swift) is a transport adapter between TypeScript and the platform SDK. It must not:

- **Invent default values** for fields the TypeScript layer marks required.
- **Substitute defaults** for nullable/optional fields. Either the SDK has its own default (skip the call) or the default belongs in TypeScript.
- **Encode the same default in multiple places.**
- **Hardcode enum names as raw strings.** Use the SDK enum's `.name` property or avoid manual parsing.

Recommended remediation:
- For **required** TypeScript fields: drop the native default; let parsing throw and surface through the existing error path.
- For **optional** TypeScript fields: skip the builder/setter call when the field is absent; let the SDK apply its own default.
- Document the default once — in the TypeScript JSDoc — so the public contract is unambiguous.

### 4. `plugin.xml` service name and action strings aligned across all layers

The Cordova service name `TalsecPlugin` and all action strings are the junction between TypeScript and native. They must agree across four places:

| Layer | How |
|---|---|
| `plugin.xml` | `<feature name="TalsecPlugin">` + `<param name="android-package" ...>` / `<param name="ios-package" ...>` |
| TypeScript | Every `cordova.exec(cb, err, 'TalsecPlugin', action, args)` call in `www/src/api/methods/` |
| Kotlin | `execute(action, args, callbackContext)` `when` branches in `TalsecPlugin.kt` |
| Swift | `@objc(<action>:)` methods on `TalsecPlugin.swift` |

Any drift between these four surfaces causes silent runtime failures — the callback never fires, with no compile-time error.

Audit method:
1. List every action string in `www/src/api/methods/`.
2. Verify each appears as a `when` branch in Kotlin and as a matching `@objc` method in Swift.
3. Verify `plugin.xml` registers both platforms correctly.

### 5. Threat delivery uses persistent `callbackId` — not a one-shot response

Unlike React Native (event emitter) or Capacitor (named listener channels), Cordova delivers threats and execution state via a persistent `callbackId` stored from the `registerListener` / `registerRaspExecutionStateListener` action.

Hard blocks:
- Sending a `CDVPluginResult` with `keepCallback = false` (or omitting `keepCallback = true`) on the threat or execution state callback — this silently unregisters the listener after the first event.
- On Android: finishing the `CallbackContext` (status `OK` without `keepCallback true`) after the first dispatch.
- Replacing the stored `callbackId` / `callbackContext` on every incoming event instead of storing it once at registration.

Check:
- iOS: `TalsecContext.context.threatCallbackCordova` / `raspExecutionStateCallbackCordova` are set **once** at registration and reused for every dispatch.
- Android: `callbackContext` is stored at registration and `result.setKeepCallback(true)` is set before every `callbackContext.sendPluginResult(result)`.

### 6. `getThreatChannelData` platform asymmetry must be preserved

Unlike React Native and Capacitor, the Cordova channel data is asymmetric across platforms:

| Method | Android returns | iOS returns |
|---|---|---|
| `getThreatChannelData` | **2 strings**: `[threatKey, malwareKey]` | **1 string**: `[threatKey]` |
| `getRaspExecutionStateChannelData` | **1 string**: `[key]` | **1 string**: `[key]` |

Note: there is **no separate "channel name" string** in Cordova — the channel is the `callbackId` itself.

The TypeScript channel files (`www/src/channels/threat.ts`, `www/src/channels/raspExecutionState.ts`) encode this asymmetry via a platform-conditional `dataLength` constant. Verify for every change touching these methods:
- `dataLength` in the TypeScript channel files matches the array length returned by each native platform.
- If Android adds a new key (e.g. a third string in `getThreatChannelData`), iOS must be audited for whether the same key is needed or explicitly absent — and the TypeScript channel file must update `dataLength` conditionally.
- The semantic order and role of each index in the array is the same across Kotlin and Swift.

### 7. `EventIdentifiers` must stay obfuscated — never replace with hardcoded strings

`src/ios/TalsecPlugin.swift` uses `EventIdentifiers` derived at runtime from `RandomGenerator.generateRandomIdentifiers(length: N)`. These identifiers are used as the payload key sent back to TypeScript (e.g. `[EventIdentifiers.threatChannelKey: threat.callbackIdentifier]`).

Hard blocks:
- Replacing a `generatedNumbers[i]` reference with a hardcoded string or integer constant.
- Adding a new identifier slot without expanding `length` and updating all index references consistently.
- Using the same index for two different identifier roles (index collision).

The Kotlin side generates its own independent random identifiers; they are not shared with iOS by design.

### 8. Start action success string is a wire-format constant

TypeScript checks the start success payload explicitly. The string `'started'` returned by the native success callback for the `start` action (Android: `callbackContext.success("started")`, iOS: `CDVPluginResult(status: .ok, messageAs: "started")`) must not be changed without a corresponding TypeScript update — and such a change is a breaking wire-format change requiring a major version bump.

### 9. Platform-specific features must be documented and gated

Not every API works on both platforms. Some checks are Android-only (e.g. malware detection, package introspection), some iOS-only (e.g. jailbreak sub-checks).

Required:
- **JSDoc states the platform**: any type, field, or callback that only works on one platform must say so — e.g. `/** Android only. No-op on iOS. */`
- **`dataLength` asymmetry must be commented**: the conditional `dataLength` in channel files is non-obvious; it must have an inline comment explaining which platform returns which count and why.
- **CHANGELOG calls out the platform**: bullets must say "(Android)" or "(iOS)" when applicable.

Red flags:
- A `cordova.exec` action handler that exists in Kotlin but has no `@objc` counterpart in Swift (or vice versa) without a comment explaining the intentional omission.
- A callback payload key present on one platform but silently absent on the other.
- An enum variant with no native producer on one platform.

### 10. Tests for new public API

Every newly exported type, enum, or function needs at least:
- Construction / instantiation test (defaults, required fields).
- Round-trip serialisation test if the type crosses the JS–native bridge as a callback payload.
- Enum-name stability test if the enum maps to native callback codes.

---

## Significant issues — should fix

### Single responsibility

- A function that parses, validates, defaults, and constructs in one body is doing four things. Split.
- A Kotlin class with `parse*`, `build*`, and `dispatch*` methods is three classes.
- A TypeScript file that mixes `cordova.exec` calls, listener wiring, and type definitions is three modules.

### Deduplication

Flag verbatim or near-verbatim repetition, especially:
- The same `(0 until arr.length()).map { arr.getString(it) }` pattern repeated for every JSON array field. Extract a helper.
- Multiple `runCatching { Enum.valueOf(s) }.getOrDefault(...)` calls. Extract a generic `parseEnumOr(default)` helper.
- Repeated `cordova.exec(null, null, 'TalsecPlugin', action, [])` one-shot calls that could share a helper.

### Argument style for many-parameter constructors

Constructors with **3+ parameters of similar type** should use named arguments. Positional calls are swap-bug magnets.

### Old API still wired alongside the new one

When deprecating an API path, ensure the new path doesn't quietly run both code paths. Either short-circuit the deprecated path or document the precedence explicitly.

### `plugin.xml` completeness

If a new native method is added:
- A new `<action>` entry (or equivalent) in `plugin.xml` is not always required by Cordova, but the service class registration must exist for both platforms.
- Verify any new platform-specific JS or native file is declared under the correct `<platform>` block in `plugin.xml`.

---

## Style & polish — call out, don't block

- **Trailing newlines, formatting churn**: separate from the feature; mention but don't argue.
- **Verbose examples**: example code that explicitly sets parameters to their defaults teaches nothing.
- **Inconsistent terminology**: flag multiple names for the same concept before release.
- **JSDoc consistency**: full sentences, end with a period, match the project's existing style.
- **`@deprecated` discipline**: deprecating a field is fine; leaving the constructor accepting it with no warning is inconsistent.
- **PR description**: an empty PR body for a release PR is a defect of its own.
- **Changelog accuracy**: every bullet in `CHANGELOG.md` should be verifiable from `git diff <base>..HEAD`.
- **npm vs yarn**: this repo uses npm. Any instruction in the README or PR description to run `yarn` is wrong.

---

## Output format

Structure the review as:

```markdown
## Summary

<2–3 sentences: what the PR does, overall verdict>

## Blockers / Major issues

### 1. <short title — one line>

<context, citing file:line; show the offending snippet using a code reference>

<concrete remediation>

### 2. ...

## Significant issues

(same shape, less severe)

## Minor / polish

(numbered list, one to three lines each)

## Recommended action

<numbered, ordered list of what must change before merge>
```

Rules for the report:
- Cite specific files and line numbers for every issue. When showing existing code, use the `startLine:endLine:filepath` reference form so the user can click through.
- Prefer one detailed example over a vague generality; if a pattern repeats, mention it once and list the other locations.
- Distinguish between "this is wrong" and "I'd prefer this." Flag the first as Major, the second as Polish.
- Never assert facts about a closed-source SDK without verifying. If the SDK isn't readable from the repo, phrase findings as "verify whether the SDK provides X; if so, do not duplicate it."
- End with a short, ordered "Recommended action" list — the actual gating items, not a wishlist.
