type Status =
  | "default" // 默认状态
  | "check" // 正在验证
  | "error" // 验证错误
  | "over" // 失败次数过多
  | "success" // 成功
  | "timeout"; // 超时
