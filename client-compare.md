# 科学上网客户端对比：Clash-for-Windows / Clash-Verge / Shadowrocket / v2rayNG / sing-box

## 一、总体定位

| 工具名称 | 定位 | 是否开源 | 主要内核/依赖                       |
|----------|---------|------------|-------------------------------|
| **Clash-for-Windows** | GUI 代理客户端 | 是 | Clash Premium(停止维护)           |
| **Clash-Verge** | GUI 代理客户端 | 是 | Clash / Mihomo(原名 Clash Meta) |
| **Shadowrocket** | iOS 代理客户端 | 否（闭源付费） | 多协议支持                         |
| **v2rayNG** | Android V2Ray 客户端 | 是 | V2Ray / Xray 内核               |
| **sing-box** | 通用代理平台/核心 | 是 | Sing-box 最新通用内核               |

## 二、协议与核心支持

| 工具 | 支持协议举例 | 规则/分流功能 | 说明 |
|------|----------------|------------------|------|
| **Clash-for-Windows** | SS, SSR, VMess, Trojan 等 | 强（规则引擎） | 强调规则分流与策略组管理 |
| **Clash-Verge** | SS, SSR, VMess, Trojan 等 | 强（规则引擎） | 类似 Clash-for-Windows，UI 更现代 |
| **Shadowrocket** | SS, SSR, VMess, Trojan 等 | 有 | iOS 平台常用客户端 |
| **v2rayNG** | VMess, VLESS, SS, Trojan 等 | 普通 | 主要侧重 V2Ray/Xray 协议支持 |
| **sing-box** | 多协议（VMess/VLESS, Trojan, Hysteria, TUIC 等） | 规则配置 | 核心层，协议更全面 |

## 三、平台支持

| 工具 | Windows | macOS | Linux | Android | iOS |
|------|---------|-------|-------|----------|------|
| **Clash-for-Windows** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Clash-Verge** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Shadowrocket** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **v2rayNG** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **sing-box** | ✅ | ✅ | ✅ | ✅ | ✅ |

## 四、优缺点总结

### Clash-for-Windows
**优点**
- 图形化界面易用性高
- 强大的规则分流、策略组设置
  **缺点**
- 需要一定配置基础
- 更新节奏相对慢

### Clash-Verge
**优点**
- UI 更现代化，主题设置丰富
  **缺点**
- 仍需理解规则配置

### Shadowrocket
**优点**
- iOS 端最成熟的代理客户端之一
  **缺点**
- 付费应用

### v2rayNG
**优点**
- Android 平台支持完备
  **缺点**
- 分流规则不如 Clash 系列灵活

### sing-box
**优点**
- 最新通用核心协议支持最全面
  **缺点**
- CLI 配置不太易用

## 五、适用场景建议

| 场景 | 推荐 |
|------|------|
| 想要最丰富规则与分流控制 | Clash-for-Windows / Clash-Verge |
| iOS 平台且追求稳定性 | Shadowrocket |
| Android 平台且偏好 V2Ray 核心 | v2rayNG |
| 需最广协议支持 & 跨平台内核 | sing-box |

