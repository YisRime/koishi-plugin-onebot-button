# koishi-plugin-onebot-button

[![npm](https://img.shields.io/npm/v/koishi-plugin-onebot-button?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-onebot-button)

OneBot 协议扩展插件，提供交互式按钮、Protobuf 数据包操作和长消息功能。

## 关于与鸣谢

本插件代码来自于[Packet-plugin](https://github.com/HDTianRu/Packet-plugin) 和 [astrbot_plugin_buttons](https://github.com/Zhalslar/astrbot_plugin_buttons)，本人仅作适配修改。

- 功能仅限测试，请勿滥用，请于下载之后 24h 之内删除。
- 本插件仅供学习交流，使用此插件产生的一切后果由使用者承担。
- 支持版本：9.1.55~最新版（已知 9.1.75 不支持）

**发包一时爽，封号火葬场！**

## 🌟 功能特性

- 📱 **交互式按钮** - 发送可点击的按钮消息，支持回调和链接
- 📦 **Protobuf 数据包** - 发送和接收原始 protobuf 数据包
- 📄 **长消息支持** - 发送和接收长消息内容
- 🔧 **调试工具** - 获取消息的 protobuf 数据用于调试

## 📖 命令使用

```bash
# 单个回调按钮
packet button 确认-confirm
# 单个链接按钮
packet button 百度~https://baidu.com
# 多个按钮（同行）
packet button 确认-confirm, 取消-cancel
# 多行按钮布局
packet button 菜单-menu, 帮助-help|设置-settings, 退出-exit
# 设置按钮样式
packet button 确认-confirm -s 1
# 发送 PB 元素
packet pb [{"53": {"1": 46, "2": {"1": {"1": [], "2": "test"}}}}]
# 发送原始数据包
packet pb.raw MessageSvc.PbSendMsg {"1": {"1": {"1": 12345}}}
# 获取消息的 PB 数据
packet pb.get 1234567890
# 使用序列号获取
packet pb.get 123 -s
# 发送长消息
packet long {"text": "这是一条长消息内容"}
# 生成 ResID
packet long.id {"text": "长消息内容"}
# 获取长消息内容
packet long.get ABC123DEF456
```

### 按钮消息 (button)

发送交互式按钮消息，支持多种按钮类型。

#### 基本语法

```text
packet button <内容> [-s <样式>]
```

#### 参数说明

- `内容`: 按钮配置字符串
- `-s, --style`: 按钮深浅，0-1（默认为 0）

#### 按钮格式

1. **回调按钮**: `显示文本-回调命令`
2. **链接按钮**: `显示文本~链接地址`
3. **多行按钮**: 使用 `|` 分隔不同行
4. **同行按钮**: 使用 `,` 分隔同行的多个按钮

### Protobuf 操作 (pb)

#### 发送 PB 元素

```text
packet pb <elements>
```

发送 protobuf 元素数据，需要提供 JSON 数组格式的数据。

#### 发送原始 PB 数据

```text
packet pb.raw <cmd> <content>
```

- `cmd`: protobuf 命令名称
- `content`: JSON 格式的数据内容

#### 获取 PB 数据

```text
packet pb.get [messageId] [-s]
```

- `messageId`: 消息 ID（可选，不提供时使用引用消息）
- `-s, --seq`: 使用序列号而非消息 ID

### 长消息 (long)

#### 发送长消息

```text
packet long <content>
```

发送长消息内容，需要提供 JSON 格式的数据。

#### 生成长消息 ResID

```text
packet long.id <content>
```

生成长消息的资源 ID，返回可用于构建长消息元素的 protobuf 数据。

#### 获取长消息内容

```text
packet long.get <resid>
```

通过 ResID 获取长消息的完整 protobuf 数据。

## 🔧 技术细节

### Protobuf 编码

插件内置了完整的 Protobuf 编码解码器，支持：

- 可变长度整数编码 (varint)
- 长度分隔字段编码
- 嵌套对象编码
- 字节数据和字符串编码

### 数据处理

- 自动处理十六进制字符串转换
- 支持 `hex->` 前缀的十六进制数据
- BigInt 数据自动转换为安全整数或字符串
- Buffer 数据自动转换为十六进制表示
