# R-E: 后端改进

## E-1 → 删除后端 genPhonetic 死代码
**模块**: backend:word-api
**需求**: —
**原理**: `genPhonetic()` 函数在 `service/wordbank.go` 中定义但从未被调用（所有音标已硬编码在 `data/words.go` 中）。
**步骤**:
1. 删除 `service/wordbank.go` 中的 `genPhonetic()` 函数及 `phoneticVowels`/`phoneticConsonants` 数组
2. 运行 `go build`
**验证**: `grep -r "genPhonetic" lingo_cube_server/` 无结果，`go build` 通过

## E-2 → 收紧后端 CORS 配置
**模块**: backend:word-api
**需求**: —
**原理**: 当前 `Access-Control-Allow-Origin: "*"` 允许所有来源，生产环境存在安全风险。
**步骤**:
1. 修改 `middleware/cors.go`：根据环境变量或配置决定允许的 origin
   - 生产环境：`https://jojofran.github.io`
   - 开发环境：`http://localhost:3000`
2. 运行 `go build`
**验证**: `go build` 通过，CORS 仅允许指定 origin

## E-3 → 后端词查找 O(1) 优化
**模块**: backend:word-api
**需求**: —
**原理**: `FindWord()` 使用线性扫描 O(n)，词库 220+ 条时应使用 map 实现 O(1) 查找。
**步骤**:
1. 在 `data/words.go` 或 `service/wordbank.go` 中构建 `map[string]*Word`
2. `init()` 中构建 map
3. 修改 `FindWord()` 使用 map 查找
4. 运行 `go build`
**验证**: `go build` 通过，`GET /api/words/:english` 返回正确

## E-4 → 后端单元测试
**模块**: backend:word-api
**需求**: —
**步骤**:
1. 为 `handler/word.go` 编写测试（使用 httptest）
2. 为 `service/wordbank.go` 编写测试
3. 为 `middleware/cors.go` 编写测试
4. 运行 `go test ./...`
**验证**: `go test ./...` 全部通过
