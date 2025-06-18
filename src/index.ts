import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-adapter-onebot'
import { parseButtonInput, sendButton, sendProtobufElements } from './button'
import { ProtobufEncoder } from './protobuf'

export const name = 'onebot-button'

export const usage = `
<div style="border-radius: 10px; border: 1px solid #ddd; padding: 16px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
  <h2 style="margin-top: 0; color: #4a6ee0;">📌 插件说明</h2>
  <p>📖 <strong>使用文档</strong>：请点击左上角的 <strong>插件主页</strong> 查看插件使用文档</p>
  <p>🔍 <strong>更多插件</strong>：可访问 <a href="https://github.com/YisRime" style="color:#4a6ee0;text-decoration:none;">苡淞的 GitHub</a> 查看本人的所有插件</p>
</div>

<div style="border-radius: 10px; border: 1px solid #ddd; padding: 16px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
  <h2 style="margin-top: 0; color: #e0574a;">❤️ 支持与反馈</h2>
  <p>🌟 喜欢这个插件？请在 <a href="https://github.com/YisRime" style="color:#e0574a;text-decoration:none;">GitHub</a> 上给我一个 Star！</p>
  <p>🐛 遇到问题？请通过 <strong>Issues</strong> 提交反馈，或加入 QQ 群 <a href="https://qm.qq.com/q/PdLMx9Jowq" style="color:#e0574a;text-decoration:none;"><strong>855571375</strong></a> 进行交流</p>
</div>
`
export interface Config {}
export const Config: Schema<Config> = Schema.object({});

/**
 * 主插件函数，注册命令
 * @param ctx - Koishi 上下文
 */
export function apply(ctx: Context) {
  ctx.command('button <input:text>', '发送按钮', { authority: 2 })
    .option('style', '-s <style:string> 按钮样式 (0:不加深, 1:加深, 2:随机, 3:链接加深)', { fallback: '1' })
    .usage('button 确认-confirm // 回调按钮\nbutton 百度~https://baidu.com // 链接按钮\nbutton 菜单-menu, 帮助-help|设置-settings, 退出-exit // 多行按钮')
    .action(async ({ session, options }, input) => {
      // 平台检查
      if (session.bot.platform !== 'onebot') return;
      // 输入验证
      if (!input?.trim()) return '请提供按钮内容\n格式: 标签-回调 或 标签~链接\n多个按钮用逗号分隔\n多行按钮用竖线分隔'
      // 解析按钮输入
      const buttonsInfo = parseButtonInput(input)
      if (typeof buttonsInfo === 'string') return buttonsInfo
      await sendButton(session, buttonsInfo, new ProtobufEncoder(), options.style)
    })

  ctx.command('pb <elements:text>', '发送 protobuf 元素', { authority: 2 })
    .usage('pb [JSON] // 直接发送 protobuf 元素数据')
    .action(async ({ session }, elements) => {
      // 平台检查
      if (session.bot.platform !== 'onebot') return;
      // 输入验证
      if (!elements?.trim()) return '请提供元素数据'
      try {
        const elementsData = JSON.parse(elements)
        if (!Array.isArray(elementsData)) return '元素数据必须是数组格式'
        await sendProtobufElements(session, elementsData, new ProtobufEncoder())
      } catch (error) {
        return `JSON 解析错误: ${error.message}`
      }
    })
}
