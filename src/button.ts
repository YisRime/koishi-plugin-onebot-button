import { v4 as uuidv4 } from 'uuid'
import { Session } from 'koishi'
import { ProtobufEncoder } from './protobuf'

/**
 * 按钮信息接口
 */
export interface ButtonInfo {
  label: string
  callback?: string
  link?: string
  clicked_text?: string
}

/**
 * 检查字符串是否为有效的十六进制字符串
 */
function isHexString(s: string): boolean {
  return s.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(s)
}

/**
 * 处理 JSON 数据并在适当的地方将十六进制字符串转换为缓冲区
 */
function processJson(data: any, path: string[] = []): any {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const result: any = {}
    for (const key in data) {
      const numKey = parseInt(key)
      const currentPath = [...path, key]
      const value = data[key]
      const processedValue = processJson(value, currentPath)
      result[numKey] = processedValue
    }
    return result
  } else if (Array.isArray(data)) {
    return data.map((item, i) => processJson(item, [...path, (i + 1).toString()]))
  } else if (typeof data === 'string') {
    if (path.length >= 2 && path.slice(-2).join(',') === '5,2' && isHexString(data)) return Buffer.from(data, 'hex')
    if (data.startsWith('hex->')) {
      const hexPart = data.slice(5)
      if (isHexString(hexPart)) return Buffer.from(hexPart, 'hex')
    }
    return data
  } else {
    return data
  }
}

/**
 * 解析按钮输入字符串为结构化按钮信息
 */
export function parseButtonInput(input: string): ButtonInfo[][] | string {
  const buttonsInfo: ButtonInfo[][] = []
  input = input.replace(/，/g, ',').replace(/～/g, '~')
  for (const line of input.split('|')) {
    const lineButtons: ButtonInfo[] = []
    for (const element of line.split(',')) {
      const trimmed = element.trim()
      if (trimmed.includes('~')) {
        const [label, link] = trimmed.split('~', 2)
        lineButtons.push({ label: label.trim(), link: link.trim() })
      } else if (trimmed.includes('-')) {
        const [label, callback] = trimmed.split('-', 2)
        lineButtons.push({ label: label.trim(), callback: callback.trim() })
      } else {
        return `无效的按钮格式: ${trimmed}`
      }
    }
    if (lineButtons.length > 0) buttonsInfo.push(lineButtons)
  }
  return buttonsInfo
}

/**
 * 向 OneBot 平台发送按钮消息
 */
export async function sendButton(session: Session, buttonsInfo: ButtonInfo[][], encoder: ProtobufEncoder, buttonStyle: string = '1'): Promise<void> {
  const buttonsData_ = buttonsInfo.map(line => ({
    1: line.map(buttonInfo => {
      const { label, callback, link, clicked_text } = buttonInfo
      const style = getButtonStyle(buttonStyle, !!link)
      return {
        1: uuidv4(),
        2: {
          1: label?.trim() || '',
          2: clicked_text?.trim() || label?.trim() || '',
          3: style
        },
        3: {
          1: link ? 0 : 2,
          2: { 1: 2, 2: [], 3: [] },
          4: 'err',
          5: (link || callback || '').trim(),
          7: 0,
          8: callback ? 1 : 0
        }
      }
    })
  }))

  // 构造数据包
  const packet = {
    1: { [session.guildId ? '2' : '1']: { 1: parseInt(session.guildId || session.userId || '0') } },
    2: { 1: 1, 2: 0, 3: 0 },
    3: { 1: { 2: [{ 53: { 1: 46, 2: { 1: { 1: buttonsData_, 2: '1145140000' } }, 3: 1 } }] } },
    4: Math.floor(Math.random() * 0xFFFFFFFF),
    5: Math.floor(Math.random() * 0xFFFFFFFF)
  }

  // 编码并发送
  const encodedData = encoder.encode(processJson(packet))
  const hexString = Array.from(encodedData).map(b => b.toString(16).padStart(2, '0')).join('')
  try {
    await session.onebot._request('send_packet', {
      cmd: 'MessageSvc.PbSendMsg',
      data: hexString
    })
  } catch (error) {}
}

/**
 * 根据配置获取按钮样式
 */
function getButtonStyle(buttonStyle: string, isLink: boolean): number {
  switch (buttonStyle) {
    case '0': return 0 // 全部不加深
    case '2': return Math.random() < 0.5 ? 0 : 1 // 随机加深
    case '3': return isLink ? 1 : 0 // 链接加深
    default: return 1 // 默认加深
  }
}
