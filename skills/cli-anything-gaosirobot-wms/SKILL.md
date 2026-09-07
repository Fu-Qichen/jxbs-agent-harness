---
name: cli-anything-gaosirobot-wms
description: "Stateful CLI harness for the Gaosi WMS backend. Covers purchasing, transfers, finished-goods inbound, sales, returns, package trace and messages over REST, with JSON output and session drafts."
---

# cli-anything-gaosirobot-wms (v1.0.0)

CLI harness for the **Gaosi WMS** mobile app backend. Stateful: server environment, auth token, and per-workflow scan drafts persist in a session file (`~/.cli-anything/gaosirobot-wms/session.json`, override with `CLI_ANYTHING_WMS_SESSION`). One-shot mutations auto-save; `--dry-run` suppresses persistence and submission.

## Global flags

- `--json` (or `CLI_ANYTHING_JSON=1`) — machine-readable `{"ok", "code", "msg", "data"}` output; exit 0 on success (backend confirm code 250 counts as success), exit 1 on error.
- `--dry-run` — build payloads without submitting or saving.
- REPL: run with no arguments on a TTY, or use the `repl` command.

## Installation (one-time, per machine)

The CLI must be installed before any command can run. If `cli-anything-gaosirobot-wms --version` fails, install from the wheels bundled next to this SKILL.md:

```bash
# online: dependencies resolve automatically
pip install <skill-dir>/wheels/cli_anything_gaosirobot_wms-1.0.0-py3-none-any.whl
# offline: everything is bundled in wheels/
pip install --no-index --find-links <skill-dir>/wheels cli_anything_gaosirobot_wms-1.0.0-py3-none-any.whl
```

Requires Python >= 3.10. After installing, verify with `cli-anything-gaosirobot-wms --version`.

## Authentication

```bash
cli-anything-gaosirobot-wms server use custom --url http://<host>:30001
cli-anything-gaosirobot-wms server probe
cli-anything-gaosirobot-wms auth login -u admin            # WMS_PASSWORD env or prompt
cli-anything-gaosirobot-wms auth whoami

### auth

Authentication (login / logout / whoami).

- `cli-anything-gaosirobot-wms auth login
  Options: `-u, --username USERNAME`; `-p, --password PASSWORD`` — Log in and persist the token (POST /MobileLogin).
- `cli-anything-gaosirobot-wms auth logout` — Log out; clears token and user snapshot.
- `cli-anything-gaosirobot-wms auth status` — Show login state and token summary.
- `cli-anything-gaosirobot-wms auth whoami` — Fetch /getInfo from the server.
### draft

Draft (scan cart) management across workflows.

- `cli-anything-gaosirobot-wms draft clear GROUP` — Clear one draft.
- `cli-anything-gaosirobot-wms draft show [GROUP]` — Show one draft or all drafts.
### finished

Finished-goods inbound (成品入库, AddCCPRK).

- `cli-anything-gaosirobot-wms finished list` — Show the finished-goods draft.
- `cli-anything-gaosirobot-wms finished material BAR_CODE_UNDER
  Options: `--pos POS`` — Scan a finished-goods barcode into the draft (GetMaterial_CCPRK).
- `cli-anything-gaosirobot-wms finished position` — Get the recommended bin (GetPosition_CCPRK).
- `cli-anything-gaosirobot-wms finished submit
  Options: `--wh WH` (required); `--date D_DATE`; `--pos POS`; `--user-code USER_CODE`; `--user-name USER_NAME`` — Submit the finished-goods draft (AddCCPRK).
### messages

System messages (SysUserMsg).

- `cli-anything-gaosirobot-wms messages list
  Options: `--all`; `--types MSG_TYPES`` — List system messages (unread by default).
- `cli-anything-gaosirobot-wms messages read MSG_ID MSG_TYPE` — Mark a message read (POST /SysUserMsg/read/{id}/{type}).
### purchasing

Purchasing: delivery notes, package scans, bins, arrival, inbound.

- `cli-anything-gaosirobot-wms purchasing arrival-submit
  Options: `--data DATA`; `--file FILE`` — Submit an arrival voucher (AddArrivalVouch) from a JSON payload.
- `cli-anything-gaosirobot-wms purchasing bin C_POS_CODE` — Look up one bin (GetPosition).
- `cli-anything-gaosirobot-wms purchasing bins C_POS_NAME` — Search bins by name (GetPositionList).
- `cli-anything-gaosirobot-wms purchasing delivery C_CODE` — Look up an SRM delivery note (GetDeliveryDoc).
- `cli-anything-gaosirobot-wms purchasing inbound-clear` — Clear the inbound draft.
- `cli-anything-gaosirobot-wms purchasing inbound-list` — Show the inbound draft.
- `cli-anything-gaosirobot-wms purchasing inbound-remove INDEX` — Remove one draft item by index.
- `cli-anything-gaosirobot-wms purchasing inbound-scan PACK_CODE
  Options: `--pos POS`` — Scan a package into the inbound draft (GetPackageMin_CGRK).
- `cli-anything-gaosirobot-wms purchasing inbound-submit
  Options: `--date D_DATE`; `--pos POS`; `--user-code USER_CODE`; `--user-name USER_NAME`` — Submit the inbound draft as a document (AddCGRK).
- `cli-anything-gaosirobot-wms purchasing package PACK_CODE` — Scan a package for receiving (GetPackageMin).
- `cli-anything-gaosirobot-wms purchasing package-max PACKAGE_ID` — List small packages under a max package (GetPackageMax).
- `cli-anything-gaosirobot-wms repl` — Interactive REPL mode (also entered when invoked with no arguments).
- `cli-anything-gaosirobot-wms request METHOD PATH
  Options: `--data DATA`; `-q, --query QUERY`` — Raw API escape hatch: request GET /MyClass/MyApi/GetPackageMin -q PackCode=X.
### returns

Purchase return (AddCGTH) and reject (AddCGJS) flows.

- `cli-anything-gaosirobot-wms returns list GROUP` — Show a reject/return draft.
- `cli-anything-gaosirobot-wms returns reject-scan PACK_CODE` — Scan a package into the reject draft (GetPackageMin_CGJS).
- `cli-anything-gaosirobot-wms returns reject-submit
  Options: `--reason REASON` (required); `--memo MEMO`; `--date D_DATE`; `--user-code USER_CODE`; `--user-name USER_NAME`` — Submit the reject draft (AddCGJS).
- `cli-anything-gaosirobot-wms returns return-scan PACK_CODE` — Scan a package into the return draft (GetPackageMin_CGTH).
- `cli-anything-gaosirobot-wms returns return-submit
  Options: `--reason REASON` (required); `--memo MEMO`; `--date D_DATE`; `--user-code USER_CODE`; `--user-name USER_NAME`` — Submit the return draft (AddCGTH).
### sales

Shipping plans and sales outbound.

- `cli-anything-gaosirobot-wms sales outbound-confirm C_CODE
  Options: `--date D_DATE`; `--user-code USER_CODE`; `--user-name USER_NAME`` — Confirm a sales-outbound document (ConfirmXSCK).
- `cli-anything-gaosirobot-wms sales outbounds
  Options: `--code CODE`; `--begin-date BEGIN_DATE`; `--end-date END_DATE`` — List sales-outbound documents (GetWmsXSCKList).
- `cli-anything-gaosirobot-wms sales plan-submit SHIP_PLAN_CODE` — Generate a sales-outbound doc from a shipping plan (AddXSCK).
- `cli-anything-gaosirobot-wms sales plans
  Options: `--code CODE`; `--begin-date BEGIN_DATE`; `--end-date END_DATE`` — List shipping plans (GetU9CShipPlanList).
### server

Server environment management (production / test / custom).

- `cli-anything-gaosirobot-wms server probe
  Options: `--url URL`` — Check server connectivity (mirrors the GUI's save-time probe).
- `cli-anything-gaosirobot-wms server show` — Show the current server configuration.
- `cli-anything-gaosirobot-wms server use ENVIRONMENT
  Options: `--url URL`` — Switch server environment (clears login state, like the GUI).
- `cli-anything-gaosirobot-wms status` — Session summary: server, login, draft counts.
- `cli-anything-gaosirobot-wms trace PACK_CODE` — Package traceability query (GetPackageMinStaus).
### transfer

Transfers: production (AddDBDMom) and warehouse (AddDBD) flows.

- `cli-anything-gaosirobot-wms transfer list GROUP` — Show a transfer draft.
- `cli-anything-gaosirobot-wms transfer mo MO_CODE` — Look up a production order (GetMomOrderDetail).
- `cli-anything-gaosirobot-wms transfer scan PACK_CODE
  Options: `--pos-in POS_IN`` — Scan a package into the production-transfer draft (ScanDBDPackCode).
- `cli-anything-gaosirobot-wms transfer scan-back PACK_CODE
  Options: `--pos POS` (required)` — Undo one scan (ScanDBDPackCodeBack).
- `cli-anything-gaosirobot-wms transfer scan2 PACK_CODE
  Options: `--wh-out WH_OUT` (required); `--wh-in WH_IN` (required); `--pos-in POS_IN` (required)` — Scan a package for a warehouse transfer (ScanDBDPackCode2).
- `cli-anything-gaosirobot-wms transfer submit MO_CODE
  Options: `--wh-out WH_OUT` (required); `--wh-in WH_IN` (required); `--date D_DATE`; `--pos-in POS_IN`; `--user-code USER_CODE`; `--user-name USER_NAME`` — Submit the production-transfer draft (AddDBDMom).
- `cli-anything-gaosirobot-wms transfer submit-warehouse
  Options: `--wh-out WH_OUT` (required); `--wh-in WH_IN` (required); `--date D_DATE`; `--pos-in POS_IN`; `--user-code USER_CODE`; `--user-name USER_NAME`` — Submit the warehouse-transfer draft (AddDBD).
- `cli-anything-gaosirobot-wms transfer warehouses` — List warehouses (GetWareHouseList).

## Workflows

### Purchase inbound (scan → draft → submit)

```bash
cli-anything-gaosirobot-wms purchasing inbound-scan PKG001 --pos P01
cli-anything-gaosirobot-wms purchasing inbound-list
cli-anything-gaosirobot-wms purchasing inbound-submit --date 2026-09-07   # auto-clears draft
```

### Production transfer

```bash
cli-anything-gaosirobot-wms transfer mo MO-0023
cli-anything-gaosirobot-wms transfer scan PKGA --pos-in IN1
cli-anything-gaosirobot-wms transfer submit MO-0023 --wh-out WH01 --wh-in WH02
```

### Agent guidance

- Read state with `status` / `draft show` before mutating; submit only after reviewing the draft.
- Use `--dry-run` on submit commands to inspect the exact payload.
- On `code: 401` in `--json` output, re-run `auth login`.
- Unmapped endpoints: `request GET /MyClass/MyApi/... -q Key=Value`.
