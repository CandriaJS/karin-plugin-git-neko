import axios from '@candriajs/git-neko-kit/axios'

import { get_md_render } from '@/models/base/common'

/**
 * 渲染markdown
 * @param  markdown markdown文本
 * @returns  渲染后的HTML文本
 */
export async function render_markdown (markdown: string): Promise<string> {
  return (await get_md_render()).render(markdown)
}
/**
 * 获取远程ip地址
 * @returns {Promise<string>} 远程IP
 */
const get_remote_ip = async (): Promise<string> => {
  const urls = [
    'https://blog.cloudflare.com/cdn-cgi/trace',
    'https://developers.cloudflare.com/cdn-cgi/trace',
    'https://hostinger.com/cdn-cgi/trace',
    'https://ahrefs.com/cdn-cgi/trace'
  ]
  try {
    const response = await Promise.any(urls.map(url => axios.get(url, { responseType: 'text' })))
    const traceMap = Object.fromEntries(
      response.data.split('\n')
        .filter((line: string) => line.trim() !== '')
        .map((line: string) => line.split('='))
    )
    return traceMap.ip
  } catch (error) {
    throw new Error(`喵呜~ 获取 IP 所在地区出错: ${(error as Error).message}`)
  }
}

/**
 * 获取远程ip地址
 * @returns remote_url - 远程地址
 */
export async function get_base_url (): Promise<string> {
  const prefix = 'http://'
  const remote_url = `${prefix}${await get_remote_ip()}:${process.env.HTTP_PORT}/git`
  return remote_url
}
