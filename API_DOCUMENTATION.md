# API 接口文档

## 基础信息

- 基础 URL: `http://localhost:8000`
- 默认超时: 60 秒
- 响应格式: JSON

## 接口列表

### 1. 健康检查接口

**端点**: `GET /`

#### 描述

用于服务健康检查

#### 响应

```json
{
  "message": "Hello World"
}
```

---

### 2. 个性化问候接口

**端点**: `GET /hello/{name}`

#### 参数

| 参数名 | 类型   | 必填 | 描述   |
| ------ | ------ | ---- | ------ |
| name   | string | 是   | 用户名 |

#### 响应

```json
{
  "message": "Hello {name}"
}
```

---

### 3. 测试用例处理接口

**端点**: `POST /api/process`

#### 请求体

```json
{
  "Test_website": "被测系统名称",
  "module": "被测模块名称",
  "description": "测试场景描述"
}
```

#### 字段说明

| 字段名       | 类型   | 必填 | 描述             | 最大长度 |
| ------------ | ------ | ---- | ---------------- | -------- |
| Test_website | string | 是   | 被测系统名称     | 100      |
| module       | string | 是   | 被测模块名称     | 50       |
| description  | string | 是   | 测试场景详细描述 | 500      |

#### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "processed_data": {
    "testCases": [
      {
        "id": "测试用例ID",
        "feature": "功能点",
        "description": "用例说明",
        "precondition": "前置条件",
        "input": "输入数据",
        "steps": "执行步骤",
        "expected": "预期结果",
        "priority": "优先级",
        "method": "测试方法"
      }
    ]
  }
}
```

#### 错误响应

```json
{
  "code": 400,
  "message": "错误信息",
  "processed_data": null
}
```

---

### 4. 测试脚本生成接口

**端点**: `POST /api/generate-scripts`

#### 请求体

```json
{
  "testing_tools": "测试工具名称",
  "scripting_language": "python",
  "tableFields": [
    {
      "id": "测试用例ID",
      "description": "测试描述",
      "steps": "测试步骤",
      "expected": "预期结果"
    }
  ]
}
```

#### 流式响应

```json
{
  "code": 200,
  "message": "处理中",
  "processed_data": {
    "test_case_id": "测试用例ID",
    "script": "生成的脚本代码",
    "testing_tools": "测试工具名称",
    "scripting_language": "python"
  },
  "remaining": 剩余用例数
}
```

#### 完成响应

```json
{
  "code": 200,
  "message": "所有测试脚本生成完成",
  "processed_data": [
    // 所有生成的脚本数组
  ],
  "remaining": 0
}
```

## 错误码说明

| 状态码 | 描述           |
| ------ | -------------- |
| 200    | 请求成功       |
| 400    | 请求参数错误   |
| 408    | 请求超时       |
| 500    | 服务器内部错误 |

## 示例请求

### 测试用例处理

```bash
curl -X POST "http://localhost:8000/api/process" \
-H "Content-Type: application/json" \
-d '{
  "Test_website": "电商平台系统",
  "module": "订单管理",
  "description": "测试订单创建流程的正确性"
}'
```

### 测试脚本生成

```bash
curl -X POST "http://localhost:8000/api/generate-scripts" \
-H "Content-Type: application/json" \
-d '{
  "testing_tools": "pytest",
  "scripting_language": "python",
  "tableFields": [
    {
      "id": "TC-001",
      "description": "测试登录功能",
      "steps": "1.访问登录页面\n2.输入凭证\n3.点击登录",
      "expected": "1.成功跳转到首页"
    }
  ]
}'
```
