---
active: true
iteration: 3
max_iterations: 500
completion_promise: "DONE"
initial_completion_promise: "DONE"
started_at: "2026-05-02T04:42:41.520Z"
session_id: "ses_219022375ffeG0e1vPA6aXAEcl"
ultrawork: true
strategy: "continue"
message_count_at_start: 7
---
{
  "enableAutoFallback": true,
  "autoFallbackRules": {
    "maxFileCount": 5,
    "maxToolCalls": 4,
    "keywords": ["架构设计","模块拆分","接口设计","重构","跨模块","依赖分析","算法","并发","死锁","内存泄漏","偶现bug","全项目分析","大型重构","方案设计"]
  },
  "agents": {
    "sisyphus": {
      "model": "deepseek-v4-flash",
      "fallbackModel": "deepseek-v4-pro"
    },
    "hephaestus": {
      "model": "deepseek-v4-flash",
      "fallbackModel": "deepseek-v4-pro"
    },
    "oracle": {
      "model": "opencode/big-pickle",
      "fallbackModel": "deepseek-v4-flash"
    },
    "prometheus": {
      "model": "opencode/big-pickle",
      "fallbackModel": "deepseek-v4-flash"
    },
    "librarian": {
      "model": "opencode/big-pickle",
      "fallbackModel": "deepseek-v4-flash"
    },
    "explore": {
      "model": "opencode/big-pickle",
      "fallbackModel": "deepseek-v4-flash"
    },
    "metis": {
      "model": "opencode/big-pickle",
      "fallbackModel": "deepseek-v4-flash"
    },
    "momus": {
      "model": "opencode/big-pickle",
      "fallbackModel": "deepseek-v4-flash"
    },
    "multimodal-looker": {
      "model": "opencode/big-pickle",
      "fallbackModel": "deepseek-v4-flash"
    },
    "frontend-ui-ux-engineer": {
      "model": "opencode/big-pickle",
      "fallbackModel": "deepseek-v4-flash"
    },
    "atlas": {
      "model": "deepseek-v4-flash",
      "fallbackModel": "deepseek-v4-flash"
    }
  }
}  帮我按这个模型正确修改agent配置
