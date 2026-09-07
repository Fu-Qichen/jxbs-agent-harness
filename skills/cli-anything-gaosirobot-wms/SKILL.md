---
name: cli-anything-gaosirobot-wms
description: "Stateful CLI harness for the Gaosi WMS backend. Covers mobile WMS workflows and business APIs over REST, with JSON output and persisted scan drafts."
---

# cli-anything-gaosirobot-wms (v1.2.2)

Use this skill for the Gaosi WMS CLI. The CLI keeps the server, auth tokens, and workflow scan drafts in `~/.cli-anything/gaosirobot-wms/session.json` (override with `CLI_ANYTHING_WMS_SESSION`). One-shot mutations save state automatically; `--dry-run` builds payloads without submitting or persisting.

## Global behavior

- `--json` or `CLI_ANYTHING_JSON=1` returns `{"ok","code","msg","data"}`; exit 0 for success, including backend confirm code 250, otherwise exit 1.
- `--dry-run` suppresses both submission and session writes.
- With no arguments on a TTY, the CLI enters `repl`; `request METHOD PATH` is the escape hatch for an endpoint not wrapped by a command.
- Install once from the bundled wheel and verify with `cli-anything-gaosirobot-wms --version`:

```bash
pip install --no-index --find-links <skill-dir>/wheels --force-reinstall --no-deps \
  cli_anything_gaosirobot_wms-1.1.2-py3-none-any.whl
cli-anything-gaosirobot-wms --version   # must print 1.1.2
```

Always use `--force-reinstall`: pip skips a same-version reinstall, which leaves a stale CLI silently in place. Verify with `--version` after installing.

Python >= 3.10 is required. If an online install is acceptable, omit `--no-index`.

## Server and authentication

```bash
cli-anything-gaosirobot-wms server use custom --url http://<host>:30001
cli-anything-gaosirobot-wms server probe
cli-anything-gaosirobot-wms auth login -u admin
cli-anything-gaosirobot-wms auth whoami
```

`WMS_PASSWORD` supplies the password; otherwise the CLI prompts. Switching environments clears login state, matching the web app.

The CLI's mobile `auth login` uses the existing mobile endpoint contract (`POST /MobileLogin`); the web admin login documented below is `POST /login`. Do not substitute one token flow for the other without testing the target server.

## Frontend API contract

This reference is extracted from the business API files under `D:/JXBS/宁波高斯机器人/gaosirobot-wms-web/src/api` and `src/utils/request.js` (source inspected 2026-09-07). It documents the frontend contract, not an independently verified server OpenAPI schema. For generic backend management modules, only the read-only query endpoints below are included; create, update, delete, status-change, export, and other write/admin operations are intentionally excluded.

- Base URL: `VITE_APP_BASE_API` (`/dev-api` in development, `/api` in production). The CLI server URL is the host before this prefix.
- JSON requests use `Content-Type: application/json;charset=utf-8`; file upload uses multipart.
- Authenticated requests automatically send `Authorization: Bearer <token>`, `userid`, URL-encoded `userName`, and `tenantId`. Login also sends `username` in a header.
- GET arguments are query parameters (`params`). Most POST/PUT mutations use a JSON body (`data`); legacy WMS actions named `Upload*`, `Del*`, `Post*`, and `Inspect` are POST with query parameters. Do not silently move these fields into a body.
- Common response shape is `{ code, msg, data }`. The interceptor treats 401 as an expired session; codes 0, 1, 110, 101, 403, 500, and 429 as errors. List/item schemas are not declared in this frontend repository.

### Authentication endpoints

| Method | Path | Parameters / body | Use |
|---|---|---|---|
| POST | `/login` | body: `username,password,code,uuid,clientId,tenantId` | Web login |
| GET | `/getInfo` | — | Current user, roles, permissions, tenant |
| POST | `/LogOut` | — | Logout |
| GET | `/captchaImage` | — | Captcha image |
| POST | `/phoneLogin` | body: phone-login payload | Mobile login |
| POST | `/register` | body: registration payload | Registration |
| POST | `/unlockscreen` | body: `username,password` | Unlock screen |

### Non-business query-only endpoints

These endpoints are reference data or page queries. Do not infer write operations from the corresponding resource names.

| Module | Method | Path | Main fields |
|---|---|---|---|
| Users | GET | `/system/user/list` | `userName,phonenumber,status,deptId,pageNum,pageSize` |
| Users | GET | `/system/user/{userId}` | path: `userId` |
| Users | GET | `/system/user/profile` | — |
| Roles | GET | `/system/role/list` | `roleName,status,pageNum,pageSize` |
| Roles | GET | `/system/role/{roleId}` | path: `roleId` |
| Menus | GET | `/system/menu/treelist` | query filters |
| Menus | GET | `/system/menu/list/{menuId}` | path: `menuId` |
| Menus | GET | `/system/menu/{menuId}` | path: `menuId` |
| Menus | GET | `/system/Menu/treeSelect` | — |
| Menus | GET | `/system/menu/roleMenuTreeselect/{roleId}` | path: `roleId` |
| Menus | GET | `/getRouters` | query: optional route context |
| Departments | GET | `/system/dept/list` | query filters |
| Departments | GET | `/system/dept/list/exclude/{deptId}` | path: `deptId` |
| Departments | GET | `/system/dept/{deptId}` | path: `deptId` |
| Departments | GET | `/system/dept/treeselect` | — |
| Departments | GET | `/system/dept/roleDeptTreeselect/{roleId}` | path: `roleId` |
| Dictionary types | GET | `/system/dict/type/list` | `dictName,dictType,status,pageNum,pageSize` |
| Dictionary types | GET | `/system/dict/type/{dictId}` | path: `dictId` |
| Dictionary types | GET | `/system/dict/type/optionselect` | — |
| Dictionary data | GET | `/system/dict/data/list` | `dictType,status,pageNum,pageSize` |
| Dictionary data | GET | `/system/dict/data/info/{dictCode}` | path: `dictCode` |
| Dictionary data | GET | `/system/dict/data/type/{dictType}` | path: `dictType` |
| Configuration | GET | `/system/config/list` | `configName,configKey,configType,pageNum,pageSize` |
| Configuration | GET | `/system/config/{configId}` | path: `configId` |
| Configuration | GET | `/system/config/configKey/{configKey}` | path: `configKey` |

## WMS interface reference

All paths are relative to the configured base URL. `query` means GET query parameters; `body` means JSON body; `params` means POST query parameters. Unless stated otherwise, list endpoints accept `pageNum,pageSize` and optional business filters.

### Master data

| Method | Path | Main fields | CLI |
|---|---|---|---|
| GET | `/MyClass/MyMethod/GetWareHouseList` | `cWhCode,cWhName,sort,order,pageNum,pageSize` | `web master warehouses`, `transfer warehouses` |
| GET | `/MyClass/MyMethod/GetInventoryList` | `cInvCode,cInvName,sort,order,pageNum,pageSize` | `web master materials` |
| GET | `/MyClass/MyMethod/GetSupplierList` | `code,ShortName,sort,order,pageNum,pageSize` | `web master suppliers` |
| GET | `/MyClass/MyMethod/GetPositionList` | `cPosName,cWhCode,cStatus,pageNum,pageSize` | `web master bins`, `purchasing bins` |
| GET | `/MyClass/MyMethod/GetPosition` | `cPosCode` | `purchasing bin` |
| GET | `/MyClass/MyMethod/GetPositionTreeList` | `cWhCode,cPosCode,cStatus,cPosType` | `web master bin-tree` |
| POST | `/MyClass/MyMethod/AddPosition` | body: bin form | — |
| POST | `/MyClass/MyMethod/UpdatePosition` | body: bin form | — |
| POST | `/MyClass/MyMethod/DeletePosition` | body: `cPosCode` (comma-separated) | — |

### Manufacturing and production

| Method | Path | Main fields | CLI |
|---|---|---|---|
| GET | `/MyClass/MyMethod/GetMomOrder` | `cInvCode,moCode,beginDate,endDate,pageNum,pageSize` | `web manufacturing list` |
| GET | `/MyClass/MyMethod/GetMomOrderDetail` | `moCode` | `web manufacturing detail`, `transfer mo` |
| GET | `/MyClass/MyMethod/GetWmsCompleteApplyList` | `barCodeUnder,cInvCode,moCode,beginDate,endDate,pageNum,pageSize` | `web completion list` |
| POST | `/MyClass/MyMethod/UploadCompleteApplyU9C` | params: `barCodes` (comma-separated) | `web completion sync` |

### Purchasing and receiving

| Method | Path | Main fields | CLI |
|---|---|---|---|
| GET | `/MyClass/MyMethod/GetWmsArrivalVouch` | `cCode,cVenCode,cVenName,beginDate,endDate,pageNum,pageSize` | `web purchasing grn-list` |
| GET | `/MyClass/MyMethod/GetWmsArrivalVouchs` | `cCode` | `web purchasing grn-detail` |
| GET | `/MyClass/MyMethod/GetWmsArrivalVouchsAll` | `cCode` | — |
| POST | `/MyClass/MyMethod/PostSrmInspect` | params: `cCodes` (comma-separated) | `web purchasing grn-inspect` |
| POST | `/MyClass/MyMethod/DelWmsArrivalVouch` | params: `cCodes` (comma-separated) | `web purchasing grn-delete` |
| GET | `/MyClass/MyMethod/GetCGRKList` | `cCode,cVenName,cWhCode,beginDate,endDate,isPostU9C,sort,sortType,pageNum,pageSize` | `web purchasing inbound-list` |
| GET | `/MyClass/MyMethod/GetCGRKDetail` | `cCode` | `web purchasing inbound-detail` |
| POST | `/MyClass/MyMethod/DelCGRK` | `cCodes` (comma-separated; body or params by caller) | `web purchasing inbound-delete` |
| POST | `/MyClass/MyMethod/UploadCGRKU9C` | params: `cCodes` (comma-separated) | `web purchasing inbound-sync` |
| GET | `/MyClass/MyMethod/GetWmsCGJS` | list filters | `web purchasing rejection-list` |
| GET | `/MyClass/MyMethod/GetWmsCGJSS` | `cCode` | `web purchasing rejection-detail` |
| GET | `/MyClass/MyMethod/GetWmsCGJSSAll` | `cCode` | `web purchasing rejection-all` |
| POST | `/MyClass/MyMethod/DelWmsCGJS` | params: `cCodes` (comma-separated) | `web purchasing rejection-delete` |
| GET | `/MyClass/MyMethod/GetCGTHList` | `cCode,cVenName,cWhCode,isPostU9C,beginDate,endDate,pageNum,pageSize` | `web purchasing return-list` |
| GET | `/MyClass/MyMethod/GetCGTHDetail` | `cCode` | `web purchasing return-detail` |
| GET | `/MyClass/MyMethod/GetCGTHDetailAll` | `cCode` | `web purchasing return-all` |
| POST | `/MyClass/MyMethod/DelCGTH` | params: `cCodes` (comma-separated) | `web purchasing return-delete` |
| POST | `/MyClass/MyMethod/UploadCGTHU9C` | params: `cCodes` (comma-separated) | `web purchasing return-sync` |

### Finished goods, sales, and transfers

| Method | Path | Main fields | CLI |
|---|---|---|---|
| GET | `/MyClass/MyMethod/GetCCPRKList` | `cCode,cWhCode,beginDate,endDate,cStatus,pageNum,pageSize` | `web finished list` |
| GET | `/MyClass/MyMethod/GetCCPRKDetail` | `cCode` | `web finished detail` |
| POST | `/MyClass/MyMethod/DelCGRK` | body: `cCodes` (comma-separated) | `web finished delete` |
| POST | `/MyClass/MyMethod/UploadCCPRKU9C` | params: `cCodes` (comma-separated) | `web finished sync` |
| POST | `/MyClass/MyMethod/PostCCPRKAgv` | params: `cCode` | `web finished agv` |
| GET | `/MyClass/MyMethod/GetXSCKList` | `cCode,cWhCode,PageNum,PageSize` (capitalized paging) | `web sales list` |
| GET | `/MyClass/MyMethod/GetXSCKDetail` | `cCode` | `web sales detail` |
| POST | `/MyClass/MyMethod/UploadXSCKU9C` | params: `cCodes` (comma-separated) | `web sales sync` |
| POST | `/MyClass/MyMethod/PostXSCKAgv` | params: `cCode` | `web sales agv` |
| GET | `/MyClass/MyMethod/GetDBDList` | `cCode,moCode,cWhCodeOut,cWhCodeIn,isPostU9C,beginDate,endDate,pageNum,pageSize` | `web transfer list --type production` |
| GET | `/MyClass/MyMethod/GetDBDDetail` | `cCode` | `web transfer detail --type production` |
| POST | `/MyClass/MyMethod/UploadDBDU9C` | params: `cCodes` (comma-separated) | `web transfer sync --type production` |
| GET | `/MyClass/MyMethod/GetDBDList2` | `cCode,cWhCodeOut,cWhCodeIn,isPostU9C,beginDate,endDate,pageNum,pageSize` | `web transfer list --type warehouse` |
| GET | `/MyClass/MyMethod/GetDBDDetail2` | `cCode` | `web transfer detail --type warehouse` |
| POST | `/MyClass/MyMethod/UploadDBD2U9C` | params: `cCodes` (comma-separated) | `web transfer sync --type warehouse` |

### Inventory

| Method | Path | Main fields | CLI |
|---|---|---|---|
| GET | `/MyClass/MyMethod/GetWmsCurrentStock` | `cWhCode,cPosCode,cInvCode,pageNum,pageSize` | `web report inventory` |
| GET | `/MyClass/MyMethod/GetWmsCurrentStockSum` | `cWhCode,cPosCode,cInvCode,pageNum,pageSize` | `web report summary` |

### Mobile-only workflow endpoints

These endpoints are used by the CLI/mobile workflow but are not declared in the web admin `src/api` files. Keep their legacy names and payload shapes when using `request` or debugging the CLI.

| Method | Path | Use |
|---|---|---|
| POST | `/MobileLogin` | Mobile authentication |
| GET | `/MyClass/MyApi/GetPackageMin` | Package lookup |
| GET | `/MyClass/MyApi/GetPackageMax` | Small packages under a max package |
| GET | `/MyClass/MyApi/GetPackageMin_CGRK` | Purchase inbound package scan |
| GET | `/MyClass/MyApi/GetMaterial_CCPRK` | Finished-goods barcode scan |
| GET | `/MyClass/MyApi/GetPosition_CCPRK` | Recommended finished-goods bin |
| POST | `/MyClass/MyApi/AddCGRK` | Submit purchase inbound |
| POST | `/MyClass/MyApi/AddCCPRK` | Submit finished-goods inbound |
| GET | `/MyClass/MyApi/GetMomOrderDetail` | Production order lookup |
| GET | `/MyClass/MyApi/ScanDBDPackCode` | Production transfer scan |
| POST | `/MyClass/MyApi/AddDBDMom` | Submit production transfer |
| POST | `/MyClass/MyApi/AddDBD` | Submit warehouse transfer |

The CLI may use `/MyClass/MyMethod` instead of `/MyClass/MyApi` for some mobile calls depending on the installed wheel; inspect `--dry-run` output or use the raw `request` command when the server returns 404.

## Existing CLI commands

### Mobile workflows

- `auth login|logout|status|whoami`; `server show|use|probe`; `status`; `repl`.
- `draft show [GROUP]` and `draft clear GROUP` inspect or clear persisted scan drafts.
- `purchasing delivery C_CODE`, `package PACK_CODE`, `package-max PACKAGE_ID`, `bins C_POS_NAME`, `bin C_POS_CODE`.
- `purchasing inbound-scan PACK_CODE [--pos POS]`, `inbound-list|inbound-remove INDEX|inbound-clear`, `inbound-submit [--date D_DATE] [--pos POS] [--user-code CODE] [--user-name NAME]`.
- `finished material BAR_CODE_UNDER [--pos POS]`, `finished list|position`, `finished submit --wh WH [--date D_DATE] [--pos POS]`.
- `transfer mo MO_CODE`, `scan PACK_CODE [--pos-in POS]`, `scan-back PACK_CODE --pos POS`, `scan2 PACK_CODE --wh-out WH --wh-in WH --pos-in POS`, `submit MO_CODE --wh-out WH --wh-in WH`, `submit-warehouse --wh-out WH --wh-in WH`, `warehouses`.
- `returns return-scan|reject-scan PACK_CODE`, `returns return-submit|reject-submit --reason REASON`.
- `sales plans|outbounds`, `sales plan-submit SHIP_PLAN_CODE`, `sales outbound-confirm C_CODE`; `trace PACK_CODE`; `messages list|read MSG_ID MSG_TYPE`.

### Web business commands

`web auth login|logout|status|whoami`; `web completion list|sync`; `web finished list|detail|delete|sync|agv`; `web manufacturing list|detail`; `web master warehouses|materials|suppliers|bins|bin-tree`; `web purchasing grn-*|inbound-*|rejection-*|return-*`; `web report inventory|summary`; `web sales list|detail|sync|agv`; `web transfer list|detail|sync`.

For any command with `-q/--query`, pass filters in one of three forms: repeatable `k=v` items (`-q cWhCode=B -q pageSize=500`), a combined query string (`-q "pageNum=2&pageSize=20"`), or a single JSON object (`-q '{"pageNum":1,"pageSize":100}'`). All `*_list` / report commands auto-paginate: the CLI loops `pageNum` until `data.page.totalNum` rows are collected and emits the full dataset, so a single call returns everything (`pageSize` only controls per-request batch size; requires CLI >= 1.1.2). The raw `request` command is still single-call — against paginated endpoints, loop `pageNum` yourself and check `data.page.totalNum`. For an uncovered endpoint:

```bash
cli-anything-gaosirobot-wms request GET /MyClass/MyMethod/GetPackageMin -q PackCode=PKG001
```

## Safe operating guidance

- Run `server probe` and `auth whoami` before diagnosing an API failure.
- Read `status` / `draft show` before mutating; review the draft before submit.
- Use `--dry-run` to inspect submit payloads. Treat delete, U9C sync, inspection, and AGV notification as irreversible business actions.
- On JSON `code: 401`, log in again. Preserve comma-separated code conventions exactly.
